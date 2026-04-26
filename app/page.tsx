"use client";
// @ts-nocheck

import { useState, useRef, useCallback, useEffect } from "react";

const DARK = {
  bg: "#0A0F1E", surface: "#0D1426", card: "#111827", border: "#1E2D4A",
  blue: "#3B82F6", blueDim: "#3B82F620", blueBright: "#60A5FA",
  text: "#F0F4FF", muted: "#6B7FA3", white: "#FFFFFF",
};

const LIGHT = {
  bg: "#F8F9FC", surface: "#FFFFFF", card: "#FFFFFF", border: "#E5E9F2",
  text: "#0F172A", muted: "#64748B", blue: "#2563EB", blueDim: "#2563EB12",
};

const SIGNAL = {
  green: { dot: "#22C55E", label: "LOW RISK", emoji: "🟢", color: "#16A34A" },
  amber: { dot: "#F59E0B", label: "MEDIUM RISK", emoji: "🟡", color: "#D97706" },
  red: { dot: "#EF4444", label: "HIGH RISK", emoji: "🔴", color: "#DC2626" },
  unknown: { dot: "#94A3B8", label: "UNCLEAR", emoji: "⚪", color: "#64748B" },
};

function getSignal(score, verdict) {
  if (verdict === "Cannot Determine") return SIGNAL.unknown;
  if (score >= 65) return SIGNAL.green;
  if (score >= 40) return SIGNAL.amber;
  return SIGNAL.red;
}

const SCAN_CATEGORIES = [
  { icon: "👜", label: "Bags" }, { icon: "👟", label: "Sneakers" },
  { icon: "⌚", label: "Watches" }, { icon: "📱", label: "Electronics" },
  { icon: "👕", label: "Clothing" }, { icon: "🎮", label: "Other" },
];

const ERROR_MESSAGES = {
  network: "Network error — check your connection and try again.",
  rateLimit: "Too many requests — wait a moment and try again.",
  apiKey: "API key issue — please contact support.",
  parse: "AI returned an unexpected response — please try again.",
  lowConfidence: "Images too unclear — upload clearer photos showing the brand.",
  server: "Server error — please try again.",
  unknown: "Something went wrong — please try again.",
};

const PHOTO_TIPS = {
  Bags: ["Main photo: brand logo", "2nd photo: hardware & zipper", "3rd photo: interior tag or serial number"],
  Sneakers: ["Main photo: side profile", "2nd photo: tongue label", "3rd photo: sole / outsole"],
  Watches: ["Main photo: dial face", "2nd photo: crown and case side", "3rd photo: caseback"],
  Electronics: ["Main photo: model label", "2nd photo: ports / connectors", "3rd photo: serial number"],
  default: ["Main photo: brand logo clearly", "2nd photo: different angle", "3rd photo: tag or serial number"],
};

const STORAGE_KEY = "showbrand_history";

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(history) {
  try {
    const toSave = history.map(({ imagePreview, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { }
}

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      resolve({
        base64: dataUrl.split(",")[1],
        mediaType: file.type || "image/jpeg",
        preview: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  });
}

export default function ShowBrand() {
  const [screen, setScreen] = useState("home");
  const [selectedImages, setSelectedImages] = useState([]); // [{base64, mediaType, preview}]
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    const supported = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const validFiles = Array.from(files).slice(0, 3).filter(f =>
      supported.includes(f.type) || f.type === ""
    );
    if (validFiles.length === 0) return;

    const images = await Promise.all(validFiles.map(fileToBase64));
    setSelectedImages(images);
    setScreen("scanning");
    setError(null);
    setErrorType(null);
    setFeedback(null);
    runAnalysis(images);
  }, []);

  const runAnalysis = async (images) => {
    setScanProgress(0);
    const timer = setInterval(() => {
      setScanProgress(p => p >= 88 ? 88 : p + Math.random() * 12);
    }, 400);

    try {
      let response;
      try {
        response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: images.map(({ base64, mediaType }) => ({ base64, mediaType }))
          }),
        });
      } catch { throw { type: "network" }; }

      if (!response.ok) {
        if (response.status === 429) throw { type: "rateLimit" };
        if (response.status === 401 || response.status === 403) throw { type: "apiKey" };
        if (response.status >= 500) throw { type: "server" };
        throw { type: "unknown" };
      }

      clearInterval(timer);
      setScanProgress(100);

      const parsed = await response.json();
      if (parsed.error) throw { type: "server" };
      if (!parsed.confidence || parsed.confidence < 30) throw { type: "lowConfidence" };

      const newEntry = { ...parsed, imagePreview: images[0]?.preview, id: Date.now() };
      setHistory(h => {
        const updated = [newEntry, ...h].slice(0, 20);
        saveHistory(updated);
        return updated;
      });

      setResult(parsed);
      await new Promise(r => setTimeout(r, 500));
      setScreen("result");

    } catch (err) {
      clearInterval(timer);
      const type = err?.type || "unknown";
      setErrorType(type);
      setError(ERROR_MESSAGES[type] || ERROR_MESSAGES.unknown);
      setScreen("home");
    }
  };

  // ── HOME ──
  if (screen === "home") return (
    <div style={{ background: LIGHT.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", fontFamily: "system-ui,-apple-system,sans-serif", color: LIGHT.text, overflowX: "hidden", position: "relative" }}>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }}
        onChange={e => handleFiles(e.target.files)} />

      <div style={{ padding: "52px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>Show<span style={{ color: LIGHT.blue }}>Brand</span></div>
          <div style={{ fontSize: 11, color: LIGHT.muted, fontWeight: 500, marginTop: 2 }}>AI Product Intelligence</div>
        </div>
        {history.length > 0 && (
          <button onClick={() => setScreen("history")} style={{ background: LIGHT.surface, border: `1px solid ${LIGHT.border}`, color: LIGHT.muted, borderRadius: 20, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            🕐 {history.length}
          </button>
        )}
      </div>

      <div style={{ padding: "32px 24px 24px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2, margin: "0 0 10px", letterSpacing: -0.5 }}>
          Identify any product.<br /><span style={{ color: LIGHT.blue }}>Instantly.</span>
        </h2>
        <p style={{ fontSize: 14, color: LIGHT.muted, margin: 0, lineHeight: 1.6 }}>
          Upload up to 3 photos — more angles = higher accuracy.
        </p>
      </div>

      {/* Upload zone */}
      <div style={{ padding: "0 20px 16px" }}>
        <div onClick={() => fileRef.current.click()} style={{ background: LIGHT.surface, border: `2px dashed ${LIGHT.blue}44`, borderRadius: 24, padding: "36px 20px", textAlign: "center", cursor: "pointer", boxShadow: "0 2px 20px #00000008" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📷</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Upload Photos</div>
          <div style={{ fontSize: 13, color: LIGHT.muted, marginBottom: 16 }}>Select up to 3 photos at once</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: LIGHT.blue, color: "#fff", borderRadius: 30, padding: "11px 28px", fontSize: 14, fontWeight: 700, boxShadow: `0 4px 16px ${LIGHT.blue}44` }}>
            Choose Photos
          </div>
        </div>
      </div>

      {/* Multi photo tip */}
      <div style={{ margin: "0 20px 16px", background: LIGHT.blueDim, border: `1px solid ${LIGHT.blue}22`, borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 11, color: LIGHT.blue, fontWeight: 700, marginBottom: 8 }}>📸 BETTER ACCURACY WITH MORE PHOTOS</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["1st", "Brand logo"], ["2nd", "Detail / tag"], ["3rd", "Serial / back"]].map(([num, label]) => (
            <div key={num} style={{ flex: 1, background: LIGHT.surface, borderRadius: 10, padding: "8px 6px", textAlign: "center", border: `1px solid ${LIGHT.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: LIGHT.blue, marginBottom: 2 }}>{num}</div>
              <div style={{ fontSize: 10, color: LIGHT.muted }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ margin: "0 20px 16px", background: errorType === "lowConfidence" ? "#FFFBEB" : "#FEF2F2", border: `1px solid ${errorType === "lowConfidence" ? "#FDE68A" : "#FECACA"}`, borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: errorType === "lowConfidence" ? "#D97706" : "#DC2626", marginBottom: 4 }}>
            {errorType === "lowConfidence" ? "📷 Better photos needed" : "⚠️ Error"}
          </div>
          <div style={{ fontSize: 12, color: LIGHT.text, lineHeight: 1.5 }}>{error}</div>
        </div>
      )}

      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ fontSize: 11, color: LIGHT.muted, fontWeight: 700, letterSpacing: 1.2, marginBottom: 12 }}>RISK SIGNAL</div>
        <div style={{ background: LIGHT.surface, borderRadius: 18, padding: 16, border: `1px solid ${LIGHT.border}`, display: "flex" }}>
          {[SIGNAL.green, SIGNAL.amber, SIGNAL.red].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? `1px solid ${LIGHT.border}` : "none", padding: "0 8px" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.emoji}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: s.color }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ fontSize: 11, color: LIGHT.muted, fontWeight: 700, letterSpacing: 1.2, marginBottom: 12 }}>SUPPORTED</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SCAN_CATEGORIES.map(cat => (
            <div key={cat.label} style={{ background: LIGHT.surface, border: `1px solid ${LIGHT.border}`, borderRadius: 20, padding: "6px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, color: LIGHT.muted, fontWeight: 500 }}>
              <span>{cat.icon}</span> {cat.label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 20px 120px" }}>
        <div style={{ fontSize: 11, color: LIGHT.muted, fontWeight: 700, letterSpacing: 1.2, marginBottom: 12 }}>HOW IT WORKS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[["1", "Upload 1-3 photos", "More angles = higher accuracy"], ["2", "AI analyzes all", "Brand, model & year identified"], ["3", "Get signal", "🟢 🟡 🔴 risk level shown instantly"]].map(([num, title, desc]) => (
            <div key={num} style={{ background: LIGHT.surface, border: `1px solid ${LIGHT.border}`, borderRadius: 14, padding: "14px 16px", display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: LIGHT.blueDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: LIGHT.blue, flexShrink: 0 }}>{num}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
                <div style={{ fontSize: 12, color: LIGHT.muted, marginTop: 1 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating camera button */}
      <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 100 }}>
        <button onClick={() => fileRef.current.click()} style={{ width: 68, height: 68, borderRadius: "50%", background: `linear-gradient(135deg,${LIGHT.blue},#1D4ED8)`, border: "3px solid #ffffff", boxShadow: `0 0 0 4px ${LIGHT.blue}33,0 8px 28px ${LIGHT.blue}66`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.92)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>
          📷
        </button>
      </div>
    </div>
  );

  // ── SCANNING ──
  if (screen === "scanning") {
    const photoCount = selectedImages.length;
    const firstPreview = selectedImages[0]?.preview;

    return (
      <DarkShell>
        <style>{`
          @keyframes scanLine{0%{top:0%;opacity:1}49%{opacity:1}50%{top:96%;opacity:0}51%{top:0%;opacity:0}52%{opacity:1}100%{top:96%}}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
          @keyframes glowPulse{0%,100%{box-shadow:0 0 24px #3B82F644}50%{box-shadow:0 0 48px #3B82F899}}
        `}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "40px 24px" }}>

          {/* Multi photo preview */}
          <div style={{ display: "flex", gap: 8, marginBottom: 32, justifyContent: "center" }}>
            {selectedImages.map((img, i) => (
              <div key={i} style={{ position: "relative", width: photoCount === 1 ? 210 : photoCount === 2 ? 140 : 100, height: photoCount === 1 ? 210 : photoCount === 2 ? 140 : 100, borderRadius: 16, overflow: "hidden", border: `2px solid ${DARK.blue}88`, animation: "glowPulse 2s ease-in-out infinite", animationDelay: `${i * 0.3}s` }}>
                <img src={img.preview} alt={`photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65) saturate(0.7)" }} />
                {i === 0 && <div style={{ position: "absolute", left: 0, right: 0, height: 2, top: 0, background: `linear-gradient(90deg,transparent,${DARK.blue},${DARK.blueBright},${DARK.blue},transparent)`, animation: "scanLine 1.8s linear infinite", boxShadow: `0 0 14px ${DARK.blue}` }} />}
                <div style={{ position: "absolute", bottom: 4, right: 4, background: DARK.blue, borderRadius: 8, padding: "2px 6px", fontSize: 9, fontWeight: 700, color: DARK.white }}>{i + 1}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 20, fontWeight: 900, color: DARK.white, marginBottom: 4 }}>Show<span style={{ color: DARK.blue }}>Brand</span></div>
          <div style={{ fontSize: 11, color: DARK.muted, marginBottom: 4 }}>Analyzing {photoCount} photo{photoCount > 1 ? "s" : ""}...</div>
          <div style={{ fontSize: 11, color: DARK.blue, fontWeight: 700, letterSpacing: 3, marginBottom: 28, animation: "pulse 1.5s ease-in-out infinite" }}>ANALYZING...</div>

          <div style={{ width: "100%", maxWidth: 260, background: DARK.card, borderRadius: 20, height: 4, overflow: "hidden", marginBottom: 28, border: `1px solid ${DARK.border}` }}>
            <div style={{ height: "100%", background: `linear-gradient(90deg,${DARK.blue},${DARK.blueBright})`, borderRadius: 20, width: `${scanProgress}%`, transition: "width 0.4s ease", boxShadow: `0 0 8px ${DARK.blue}` }} />
          </div>

          <div style={{ width: "100%", maxWidth: 260, display: "flex", flexDirection: "column", gap: 12 }}>
            {[[scanProgress > 10, "Recognizing brand & logo"], [scanProgress > 35, "Searching model database"], [scanProgress > 60, "Checking authenticity signals"], [scanProgress > 85, "Estimating market value"]].map(([done, label], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, opacity: done ? 1 : 0.2, transition: "opacity 0.5s" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: done ? DARK.blue : DARK.card, border: `1.5px solid ${done ? DARK.blue : DARK.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: DARK.white, flexShrink: 0, boxShadow: done ? `0 0 10px ${DARK.blue}88` : "none" }}>{done ? "✓" : i + 1}</div>
                <span style={{ fontSize: 13, color: done ? DARK.white : DARK.muted, fontWeight: done ? 600 : 400 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </DarkShell>
    );
  }

  // ── RESULT ──
  if (screen === "result" && result) {
    const sig = getSignal(result.authentic_score, result.authentic_verdict);
    const confidencePct = result.confidence ?? 0;
    const lowConf = confidencePct >= 30 && confidencePct < 65;
    const tips = PHOTO_TIPS[result.category] || PHOTO_TIPS.default;
    const firstPreview = selectedImages[0]?.preview;
    const photosUsed = result.photos_used || selectedImages.length;

    return (
      <DarkShell>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }}
          onChange={e => handleFiles(e.target.files)} />

        <div style={{ position: "relative", height: 270, overflow: "hidden" }}>
          {firstPreview && <img src={firstPreview} alt="result" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.3) saturate(0.6)" }} />}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom,transparent 30%,${DARK.bg} 100%)` }} />
          <button onClick={() => setScreen("home")} style={{ position: "absolute", top: 16, left: 16, background: "#00000088", border: `1px solid ${DARK.border}`, color: DARK.text, borderRadius: 20, padding: "7px 14px", cursor: "pointer", fontSize: 12 }}>← Back</button>

          {/* Photos used badge */}
          <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", background: "#00000088", border: `1px solid ${DARK.border}`, borderRadius: 20, padding: "5px 12px" }}>
            <span style={{ fontSize: 10, color: DARK.muted, fontWeight: 600 }}>📷 {photosUsed} photo{photosUsed > 1 ? "s" : ""} analyzed</span>
          </div>

          <div style={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: 8, background: "#00000088", border: `1px solid ${sig.dot}55`, borderRadius: 20, padding: "7px 14px" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: sig.dot, boxShadow: `0 0 8px ${sig.dot}` }} />
            <span style={{ fontSize: 11, color: sig.dot, fontWeight: 700 }}>{sig.label}</span>
          </div>

          <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
            <div style={{ fontSize: 11, color: DARK.blue, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>{result.brand?.toUpperCase() || "UNKNOWN"}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: DARK.white, lineHeight: 1.1 }}>{result.model || "Unknown Model"}</div>
            {result.year && result.year !== "Unknown" && <div style={{ fontSize: 12, color: DARK.muted, marginTop: 4 }}>{result.year} · {result.category}</div>}
          </div>
        </div>

        {/* Thumbnail strip for multi photos */}
        {selectedImages.length > 1 && (
          <div style={{ display: "flex", gap: 6, padding: "10px 16px 0", overflowX: "auto" }}>
            {selectedImages.map((img, i) => (
              <img key={i} src={img.preview} alt={`${i + 1}`} style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: `1.5px solid ${DARK.border}` }} />
            ))}
          </div>
        )}

        <div style={{ padding: "16px 16px 120px" }}>
          {/* Traffic light */}
          <div style={{ background: DARK.card, border: `1px solid ${sig.dot}44`, borderRadius: 20, padding: 18, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                {[SIGNAL.green, SIGNAL.amber, SIGNAL.red].map((s, i) => (
                  <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: s.dot === sig.dot ? s.dot : s.dot + "33", boxShadow: s.dot === sig.dot ? `0 0 10px ${s.dot}` : "none", transition: "all 0.3s" }} />
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: DARK.muted, fontWeight: 600, marginBottom: 4 }}>AUTHENTICITY SIGNAL</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: sig.dot }}>{sig.emoji} {sig.label}</div>
                <div style={{ fontSize: 12, color: DARK.muted, marginTop: 2 }}>Score: {result.authentic_score}/100</div>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: "50%", border: `3px solid ${sig.dot}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 0 12px ${sig.dot}44` }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: sig.dot }}>{result.authentic_score}</span>
              </div>
            </div>
            <div style={{ fontSize: 10, color: DARK.muted, fontStyle: "italic", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${DARK.border}` }}>
              ⚠️ AI visual assessment only — not professional authentication
            </div>
          </div>

          {/* Confidence */}
          <div style={{ background: DARK.card, borderRadius: 16, padding: 16, border: `1px solid ${DARK.border}`, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: DARK.muted, fontWeight: 600 }}>AI Confidence</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: lowConf ? "#F59E0B" : DARK.blue }}>{confidencePct}%</span>
            </div>
            <div style={{ background: DARK.surface, borderRadius: 20, height: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", background: lowConf ? `linear-gradient(90deg,#F59E0B,#FCD34D)` : `linear-gradient(90deg,${DARK.blue},${DARK.blueBright})`, borderRadius: 20, width: `${confidencePct}%`, boxShadow: `0 0 6px ${lowConf ? "#F59E0B" : DARK.blue}88` }} />
            </div>
          </div>

          {lowConf && (
            <div style={{ background: "#1C1500", border: "1px solid #F59E0B44", borderRadius: 14, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B", marginBottom: 6 }}>📷 Better photos = better result</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                {tips.map((tip, i) => <div key={i} style={{ fontSize: 12, color: DARK.text, display: "flex", gap: 7 }}><span style={{ color: "#F59E0B", flexShrink: 0 }}>→</span>{tip}</div>)}
              </div>
              <button onClick={() => fileRef.current.click()} style={{ width: "100%", background: "#F59E0B22", border: "1px solid #F59E0B55", color: "#F59E0B", borderRadius: 10, padding: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📸 Try Better Photos</button>
            </div>
          )}

          {(result.authentic_reasons || []).length > 0 && (
            <div style={{ background: DARK.card, border: `1px solid ${DARK.border}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: DARK.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>ANALYSIS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {result.authentic_reasons.map((r, i) => <div key={i} style={{ fontSize: 12, color: DARK.text, display: "flex", gap: 8, lineHeight: 1.5 }}><span style={{ color: sig.dot, flexShrink: 0 }}>•</span>{r}</div>)}
              </div>
              {(result.suspicious_points || []).length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${DARK.border}` }}>
                  <div style={{ fontSize: 10, color: "#EF4444", fontWeight: 700, marginBottom: 6 }}>⚠️ RED FLAGS</div>
                  {result.suspicious_points.map((p, i) => <div key={i} style={{ fontSize: 12, color: DARK.muted, display: "flex", gap: 8, lineHeight: 1.5 }}><span style={{ color: "#EF4444", flexShrink: 0 }}>!</span>{p}</div>)}
                </div>
              )}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <InfoCard label="RETAIL" value={result.estimated_retail || "N/A"} color={DARK.text} />
            <InfoCard label="RESELL" value={result.estimated_resell || "N/A"} color={DARK.blueBright} />
          </div>

          {result.condition_hints && (
            <div style={{ background: DARK.card, borderRadius: 14, padding: 14, marginBottom: 12, border: `1px solid ${DARK.border}` }}>
              <div style={{ fontSize: 10, color: DARK.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>CONDITION</div>
              <div style={{ fontSize: 13, color: DARK.text }}>{result.condition_hints}</div>
            </div>
          )}

          {result.tips && (
            <div style={{ background: "#0A1F0A", border: "1px solid #22C55E33", borderRadius: 14, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: "#22C55E", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>💡 SELLING TIP</div>
              <div style={{ fontSize: 13, color: DARK.text, lineHeight: 1.6 }}>{result.tips}</div>
            </div>
          )}

          <div style={{ background: DARK.card, border: `1px solid ${DARK.border}`, borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: DARK.muted, fontWeight: 600, marginBottom: 10, textAlign: "center" }}>Was this result accurate?</div>
            {feedback ? (
              <div style={{ textAlign: "center", fontSize: 13, padding: "6px 0" }}>
                {feedback === "correct" && <span style={{ color: "#22C55E" }}>✅ Thanks for the feedback!</span>}
                {feedback === "wrong" && <span style={{ color: "#EF4444" }}>❌ Thanks — we'll use this to improve.</span>}
                {feedback === "unsure" && <span style={{ color: "#F59E0B" }}>🤔 Got it — noted for review.</span>}
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                {[["correct", "✅ Correct", "#22C55E"], ["wrong", "❌ Wrong", "#EF4444"], ["unsure", "🤔 Unsure", "#F59E0B"]].map(([key, label, color]) => (
                  <button key={key} onClick={() => setFeedback(key)} style={{ flex: 1, background: color + "18", border: `1px solid ${color}44`, color, borderRadius: 10, padding: "9px 4px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{label}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, padding: "12px 16px 28px", background: `linear-gradient(to top,${DARK.bg} 70%,transparent)`, display: "flex", gap: 10 }}>
          <button onClick={() => setScreen("history")} style={{ flex: 1, background: DARK.card, border: `1px solid ${DARK.border}`, color: DARK.text, borderRadius: 14, padding: 14, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🕐 History</button>
          <button onClick={() => fileRef.current.click()} style={{ flex: 2, background: `linear-gradient(135deg,${DARK.blue},#1D4ED8)`, border: "none", color: DARK.white, borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: `0 4px 16px ${DARK.blue}55` }}>📷 Scan Another</button>
        </div>
      </DarkShell>
    );
  }

  // ── HISTORY ──
  if (screen === "history") return (
    <DarkShell>
      <div style={{ padding: "52px 20px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setScreen("home")} style={{ background: DARK.card, border: `1px solid ${DARK.border}`, color: DARK.text, borderRadius: 20, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>←</button>
            <div style={{ fontSize: 18, fontWeight: 800, color: DARK.white }}>Scan History</div>
          </div>
          {history.length > 0 && (
            <button onClick={() => { if (confirm("Clear all history?")) { setHistory([]); localStorage.removeItem(STORAGE_KEY); } }} style={{ background: "#EF444418", border: "1px solid #EF444444", color: "#EF4444", borderRadius: 12, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              Clear
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: DARK.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div>No scans yet</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {history.map(h => {
              const s = getSignal(h.authentic_score, h.authentic_verdict);
              return (
                <div key={h.id} style={{ background: DARK.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${DARK.border}`, display: "flex" }}>
                  {h.imagePreview
                    ? <img src={h.imagePreview} alt="" style={{ width: 72, height: 72, objectFit: "cover", flexShrink: 0 }} />
                    : <div style={{ width: 72, height: 72, background: DARK.surface, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📦</div>
                  }
                  <div style={{ padding: "12px 14px", flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: DARK.blue, fontWeight: 700, letterSpacing: 1 }}>{h.brand?.toUpperCase()}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: DARK.white, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.model}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, boxShadow: `0 0 6px ${s.dot}` }} />
                      <span style={{ fontSize: 10, color: s.dot, fontWeight: 700 }}>{s.label}</span>
                      <span style={{ fontSize: 10, color: DARK.muted }}>· {h.category}</span>
                      {h.photos_used > 1 && <span style={{ fontSize: 10, color: DARK.muted }}>· 📷×{h.photos_used}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DarkShell>
  );

  return null;
}

function DarkShell({ children }) {
  return (
    <div style={{ background: DARK.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", fontFamily: "system-ui,-apple-system,sans-serif", color: DARK.text, overflowX: "hidden", position: "relative" }}>
      {children}
    </div>
  );
}

function InfoCard({ label, value, color }) {
  return (
    <div style={{ background: DARK.card, borderRadius: 14, padding: 14, border: `1px solid ${DARK.border}` }}>
      <div style={{ fontSize: 10, color: DARK.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}