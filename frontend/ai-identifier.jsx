import { useState, useRef, useCallback } from "react";

// ── DESIGN TOKENS ──────────────────────────────────────────
const C = {
  bg:       "#08080A",
  surface:  "#101013",
  card:     "#18181D",
  border:   "#252530",
  accent:   "#C8A96E",   // warm gold — luxury feel
  accentDim:"#C8A96E33",
  green:    "#4ADE80",
  greenDim: "#4ADE8022",
  red:      "#F87171",
  redDim:   "#F8717122",
  amber:    "#FBBF24",
  text:     "#F2EFE8",
  muted:    "#7A7A8C",
  scan:     "#C8A96E",
};

const SCAN_CATEGORIES = [
  { icon: "👜", label: "Bags & Luxury" },
  { icon: "👟", label: "Sneakers" },
  { icon: "⌚", label: "Watches" },
  { icon: "📱", label: "Electronics" },
  { icon: "👕", label: "Clothing & Fashion" },
  { icon: "🎮", label: "Other" },
];

// ── MAIN APP ───────────────────────────────────────────────
export default function ShowBrand() {
  const [screen, setScreen] = useState("home"); // home | scanning | result | history
  const [image, setImage] = useState(null);       // base64 string
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  // ── FILE PICK ──
  const handleFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64 = dataUrl.split(",")[1];
      setImage(base64);
      setImagePreview(dataUrl);
      setScreen("scanning");
      runAnalysis(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  // ── AI ANALYSIS ──
  const runAnalysis = async (base64) => {
    setAnalyzing(true);
    setError(null);
    setScanProgress(0);

    // animate progress bar
    const timer = setInterval(() => {
      setScanProgress(p => (p >= 88 ? 88 : p + Math.random() * 12));
    }, 400);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/jpeg", data: base64 }
              },
              {
                type: "text",
                text: `You are an expert authenticator and product identifier specializing in luxury goods, sneakers, watches, electronics, and fashion.

Analyze this image and respond ONLY with a JSON object (no markdown, no backticks):

{
  "brand": "brand name or Unknown",
  "model": "specific model name or Unknown",
  "category": "one of: Bags, Sneakers, Watches, Electronics, Clothing, Other",
  "confidence": number 0-100,
  "authentic_score": number 0-100,
  "authentic_verdict": "Likely Authentic or Likely Fake or Cannot Determine",
  "authentic_reasons": ["reason1", "reason2", "reason3"],
  "suspicious_points": ["point1"] or [],
  "estimated_retail": "retail price range in USD",
  "estimated_resell": "resell price range in USD",
  "year": "approximate year/era or Unknown",
  "condition_hints": "brief condition assessment from image",
  "tips": "one practical tip for selling this item"
}

If the image is unclear or not a product, still return valid JSON with Unknown values and explain in authentic_reasons.`
              }
            ]
          }]
        })
      });

      clearInterval(timer);
      setScanProgress(100);

      const data = await response.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";

      let parsed;
      try {
        // strip possible markdown fences
        const clean = raw.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch {
        throw new Error("Failed to parse AI response. Please try again.");
      }

      setResult(parsed);
      setHistory(h => [{ ...parsed, imagePreview, id: Date.now() }, ...h.slice(0, 9)]);

      await new Promise(r => setTimeout(r, 600));
      setScreen("result");

    } catch (err) {
      clearInterval(timer);
      setError(err.message || "An error occurred during analysis. Please try again.");
      setScreen("home");
    } finally {
      setAnalyzing(false);
    }
  };

  // ────────────────────────────────────────────────────────
  // SCREENS
  // ────────────────────────────────────────────────────────

  // ── HOME ──
  if (screen === "home") return (
    <Shell>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => handleFile(e.target.files[0])} />

      {/* Header */}
      <div style={{ padding: "44px 24px 0", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentDim, border: `1px solid ${C.accent}44`, borderRadius: 30, padding: "6px 16px", marginBottom: 24 }}>
          <span style={{ fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: 2 }}>AI POWERED</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.1, margin: "0 0 6px", letterSpacing: -2 }}>
          <span style={{ color: C.accent }}>Show</span>Brand
        </h1>
        <p style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: "0 0 10px" }}>
          Identify any item. Spot fakes instantly.
        </p>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>
          Got something lying around you can't identify?<br />Snap a photo — AI will find the brand and model.
        </p>
      </div>

      {/* Upload Zone */}
      <div style={{ padding: "28px 24px" }}>
        <div
          onClick={() => fileRef.current.click()}
          style={{
            background: `linear-gradient(145deg, ${C.card} 0%, #1E1A14 100%)`,
            border: `1.5px dashed ${C.accent}66`,
            borderRadius: 24,
            padding: "48px 20px",
            textAlign: "center",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Corner accents */}
          {["topLeft","topRight","bottomLeft","bottomRight"].map((pos) => (
            <div key={pos} style={{
              position: "absolute",
              width: 20, height: 20,
              borderColor: C.accent,
              borderStyle: "solid",
              borderWidth: pos.includes("top") ? "2px 0 0" : "0 0 2px",
              ...(pos.includes("Left") ? { left: 16, borderLeftWidth: 2, borderRightWidth: 0 } : { right: 16, borderRightWidth: 2, borderLeftWidth: 0 }),
              ...(pos.includes("top") ? { top: 16 } : { bottom: 16 }),
            }} />
          ))}

          <div style={{ fontSize: 52, marginBottom: 14 }}>📸</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Upload a Photo</div>
          <div style={{ fontSize: 13, color: C.muted }}>Bags, sneakers, watches, electronics & more</div>
          <div style={{ marginTop: 20, display: "inline-block", background: C.accent, color: "#000", borderRadius: 30, padding: "11px 28px", fontSize: 14, fontWeight: 800 }}>
            📷 Choose Photo
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ padding: "0 24px 20px" }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, fontWeight: 600, letterSpacing: 1 }}>SUPPORTED CATEGORIES</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SCAN_CATEGORIES.map(cat => (
            <div key={cat.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "7px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              <span>{cat.icon}</span>
              <span style={{ color: C.muted }}>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: "0 24px 16px" }}>
        <div style={{ background: C.card, borderRadius: 18, padding: 20, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: C.accent }}>HOW IT WORKS</div>
          {[
            ["01", "📸", "Upload a Photo", "Show the logo, tag, or full item clearly for best results"],
            ["02", "🤖", "AI Analysis", "Brand, model name, and year are identified automatically"],
            ["03", "✅", "Authenticity Check", "Fake detection points are flagged for you"],
          ].map(([num, icon, title, desc]) => (
            <div key={num} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History Button */}
      {history.length > 0 && (
        <div style={{ padding: "0 24px 32px" }}>
          <button onClick={() => setScreen("history")} style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, color: C.text, borderRadius: 14, padding: 16, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span>🕐</span> Scan History ({history.length})
          </button>
        </div>
      )}

      {error && (
        <div style={{ margin: "0 24px 24px", background: C.redDim, border: `1px solid ${C.red}44`, borderRadius: 14, padding: 16, color: C.red, fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}
    </Shell>
  );

  // ── SCANNING ──
  if (screen === "scanning") return (
    <Shell>
      <div style={{ padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", justifyContent: "center" }}>

        {/* Image Preview */}
        {imagePreview && (
          <div style={{ width: 200, height: 200, borderRadius: 24, overflow: "hidden", marginBottom: 32, border: `2px solid ${C.accent}66`, position: "relative" }}>
            <img src={imagePreview} alt="scan" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {/* Scan line animation */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
              animation: "scanLine 1.5s ease-in-out infinite",
              boxShadow: `0 0 12px ${C.accent}`,
            }} />
          </div>
        )}

        <style>{`
          @keyframes scanLine {
            0% { top: 0%; }
            50% { top: 98%; }
            100% { top: 0%; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>
          <span style={{ color: C.accent }}>Show</span>Brand
        </div>
        <div style={{ fontSize: 13, color: C.accent, fontWeight: 700, letterSpacing: 2, marginBottom: 12, animation: "pulse 1.5s ease-in-out infinite" }}>
          ANALYZING...
        </div>

        {/* Progress Bar */}
        <div style={{ width: "100%", maxWidth: 280, background: C.card, borderRadius: 20, height: 6, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.accent}, #E8C87A)`, borderRadius: 20, width: `${scanProgress}%`, transition: "width 0.4s ease" }} />
        </div>

        {/* Steps */}
        {[
          [scanProgress > 10, "Recognizing brand logo"],
          [scanProgress > 35, "Searching model database"],
          [scanProgress > 60, "Checking authenticity markers"],
          [scanProgress > 85, "Looking up resell market price"],
        ].map(([done, label], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, opacity: done ? 1 : 0.3, transition: "opacity 0.5s" }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, background: done ? C.green : C.card, border: `1px solid ${done ? C.green : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
              {done ? "✓" : ""}
            </div>
            <span style={{ fontSize: 13, color: done ? C.text : C.muted }}>{label}</span>
          </div>
        ))}
      </div>
    </Shell>
  );

  // ── RESULT ──
  if (screen === "result" && result) {
    const isAuthentic = result.authentic_score >= 65;
    const isSuspicious = result.authentic_score < 40;
    const verdictColor = isSuspicious ? C.red : isAuthentic ? C.green : C.amber;
    const verdictBg = isSuspicious ? C.redDim : isAuthentic ? C.greenDim : "#FBBF2422";
    const confidencePct = result.confidence ?? 0;

    return (
      <Shell>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={e => handleFile(e.target.files[0])} />

        <div style={{ padding: "0 0 40px" }}>
          {/* Image + Verdict Header */}
          <div style={{ position: "relative", height: 260, overflow: "hidden" }}>
            {imagePreview && (
              <img src={imagePreview} alt="result" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45)" }} />
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 20%, #08080A 100%)" }} />

            {/* Back */}
            <button onClick={() => setScreen("home")} style={{ position: "absolute", top: 16, left: 16, background: "#00000066", border: "none", color: C.text, borderRadius: 20, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>
              ← Scan Again
            </button>

            {/* Verdict badge */}
            <div style={{ position: "absolute", top: 16, right: 16, background: verdictBg, border: `1px solid ${verdictColor}66`, borderRadius: 20, padding: "6px 14px" }}>
              <span style={{ fontSize: 12, color: verdictColor, fontWeight: 700 }}>
                {isSuspicious ? "⚠️ Likely Fake" : isAuthentic ? "✅ Likely Authentic" : "🔍 Cannot Determine"}
              </span>
            </div>

            {/* Brand + Model */}
            <div style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
              <div style={{ fontSize: 12, color: C.accent, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
                {result.brand?.toUpperCase() || "UNKNOWN BRAND"}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.15, letterSpacing: -0.5 }}>
                {result.model || "Unknown Model"}
              </div>
              {result.year && result.year !== "Unknown" && (
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                  {result.year} · {result.category}
                </div>
              )}
            </div>
          </div>

          {/* AI Confidence */}
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{ background: C.card, borderRadius: 18, padding: 18, border: `1px solid ${C.border}`, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>AI Confidence</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: C.accent }}>{confidencePct}%</span>
              </div>
              <div style={{ background: C.surface, borderRadius: 20, height: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.accent}, #E8C87A)`, borderRadius: 20, width: `${confidencePct}%` }} />
              </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <InfoCard label="Retail Price" value={result.estimated_retail || "N/A"} color={C.text} />
              <InfoCard label="Resell Value" value={result.estimated_resell || "N/A"} color={C.accent} />
            </div>

            {/* Authenticity */}
            <div style={{ background: verdictBg, border: `1px solid ${verdictColor}44`, borderRadius: 18, padding: 18, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Authenticity Result</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: verdictColor }}>{result.authentic_score}/100</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: verdictColor, marginBottom: 10 }}>
                {result.authentic_verdict}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {(result.authentic_reasons || []).map((r, i) => (
                  <div key={i} style={{ fontSize: 12, color: C.text, display: "flex", gap: 8, lineHeight: 1.5 }}>
                    <span style={{ color: verdictColor, flexShrink: 0 }}>•</span> {r}
                  </div>
                ))}
              </div>

              {(result.suspicious_points || []).length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, color: C.red, fontWeight: 700, marginBottom: 6 }}>⚠️ Red Flags</div>
                  {result.suspicious_points.map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: C.muted, display: "flex", gap: 8, lineHeight: 1.5 }}>
                      <span style={{ color: C.red, flexShrink: 0 }}>!</span> {p}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Condition + Tip */}
            {result.condition_hints && (
              <div style={{ background: C.card, borderRadius: 14, padding: 16, marginBottom: 14, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Condition Assessment</div>
                <div style={{ fontSize: 14 }}>{result.condition_hints}</div>
              </div>
            )}

            {result.tips && (
              <div style={{ background: "#1A1F1A", border: `1px solid ${C.green}33`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: C.green, fontWeight: 700, marginBottom: 4 }}>💡 Selling Tip</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{result.tips}</div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => fileRef.current.click()} style={{ flex: 1, background: C.accent, border: "none", color: "#000", borderRadius: 14, padding: 16, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
                📸 Scan Another
              </button>
              <button onClick={() => setScreen("history")} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, color: C.text, borderRadius: 14, padding: 16, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                🕐 History
              </button>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  // ── HISTORY ──
  if (screen === "history") return (
    <Shell>
      <div style={{ padding: "50px 20px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <button onClick={() => setScreen("home")} style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text, borderRadius: 20, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>←</button>
          <div style={{ fontSize: 20, fontWeight: 800 }}>분석 기록</div>
        </div>
        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>아직 분석 기록이 없어요</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {history.map(h => {
              const ok = h.authentic_score >= 65;
              const bad = h.authentic_score < 40;
              const col = bad ? C.red : ok ? C.green : C.amber;
              return (
                <div key={h.id} style={{ background: C.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, display: "flex" }}>
                  {h.imagePreview && (
                    <img src={h.imagePreview} alt="" style={{ width: 80, height: 80, objectFit: "cover", flexShrink: 0 }} />
                  )}
                  <div style={{ padding: "12px 16px", flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: C.accent, fontWeight: 700 }}>{h.brand}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.model}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 11, color: col, background: col + "22", borderRadius: 10, padding: "2px 8px" }}>{h.authentic_verdict}</span>
                      <span style={{ fontSize: 11, color: C.muted }}>{h.category}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );

  return null;
}

// ── HELPER COMPONENTS ──────────────────────────────────────
function Shell({ children }) {
  return (
    <div style={{
      background: C.bg,
      minHeight: "100vh",
      maxWidth: 430,
      margin: "0 auto",
      fontFamily: "'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
      color: C.text,
      overflowX: "hidden",
      position: "relative",
    }}>
      {children}
    </div>
  );
}

function InfoCard({ label, value, color }) {
  return (
    <div style={{ background: C.card, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}
