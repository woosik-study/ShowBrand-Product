# 🧠 ShowBrand — Technical Pipeline

## Architecture Overview

```
Browser (Frontend)
    ↓ POST /api/analyze
Next.js API Route (Backend)
    ↓ HTTPS
Anthropic Claude API
    ↓ JSON response
Next.js API Route
    ↓ structured result
Browser (Frontend)
    ↓ localStorage
Client Storage
```

---

## Stage 1: Image Input (Frontend)

```javascript
// User selects 1–3 files
const images = await Promise.all(files.map(fileToBase64));
// Each image: { base64, mediaType, preview }
```

**Supported formats:** JPEG, PNG, WebP, GIF
**Max photos:** 3
**Fallback:** Unknown types default to `image/jpeg`

---

## Stage 2: API Call (Frontend → Backend)

```javascript
POST /api/analyze
Content-Type: application/json

{
  images: [
    { base64: "...", mediaType: "image/jpeg" },
    { base64: "...", mediaType: "image/png" }
  ]
}
```

---

## Stage 3: AI Processing (Backend)

```javascript
// app/api/analyze/route.js
// API key read from environment (never exposed to browser)
const apiKey = process.env.ANTHROPIC_API_KEY;

// All images sent in single request
const content = [
  ...images.map(img => ({ type: "image", source: { type: "base64", ...img } })),
  { type: "text", text: PROMPT }
];
```

**Model:** `claude-sonnet-4-5`
**Max tokens:** 1000
**Strategy:** All photos sent simultaneously for cross-image analysis

---

## Stage 4: Response Parsing (Backend)

```javascript
const raw = data.content?.find(b => b.type === "text")?.text || "";
const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
return NextResponse.json(parsed);
```

**Output schema:**
```json
{
  "brand": "string",
  "model": "string",
  "category": "Bags|Sneakers|Watches|Electronics|Clothing|Other",
  "confidence": 0-100,
  "authentic_score": 0-100,
  "authentic_verdict": "Low Risk|Medium Risk|High Risk|Cannot Determine",
  "authentic_reasons": ["string"],
  "suspicious_points": ["string"],
  "estimated_retail": "string",
  "estimated_resell": "string",
  "year": "string",
  "condition_hints": "string",
  "tips": "string",
  "photos_used": 1-3
}
```

---

## Stage 5: Result Display (Frontend)

**Confidence threshold:** < 30% → blocked, "better photo needed"
**Low confidence:** 30–65% → amber bar + photo tips shown
**High confidence:** 65%+ → blue bar

**Traffic light mapping:**
- `authentic_score` 65+ → 🟢 LOW RISK
- `authentic_score` 40–64 → 🟡 MEDIUM RISK
- `authentic_score` 0–39 → 🔴 HIGH RISK
- `verdict === "Cannot Determine"` → ⚪ UNCLEAR

---

## Stage 6: Storage (Frontend)

```javascript
// Save to localStorage (image previews excluded for size)
const toSave = history.map(({ imagePreview, ...rest }) => rest);
localStorage.setItem("showbrand_history", JSON.stringify(toSave));
// Max 20 entries
```

---

## Error Handling

| Error Type | Trigger | User Message |
|------------|---------|-------------|
| `network` | fetch() throws | "Check your connection" |
| `rateLimit` | HTTP 429 | "Wait a moment" |
| `apiKey` | HTTP 401/403 | "Contact support" |
| `server` | HTTP 500+ | "Server error" |
| `parse` | JSON.parse fails | "Unexpected response" |
| `lowConfidence` | confidence < 30 | "Upload clearer photo" |

---

## Known Limitations

1. **No image authenticity check** — Cannot detect AI-generated or internet-sourced images
2. **Single API dependency** — All reliability depends on Claude API
3. **No persistent image storage** — Previews lost on refresh
4. **No user accounts** — History is device-local only
5. **Visual assessment only** — Cannot verify serial numbers, receipts, or physical properties
