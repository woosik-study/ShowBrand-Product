# 📋 ShowBrand Product — Changelog

> Update this file every time you push a meaningful product change.

---

## [2026-04-25] — Full Redesign + Traffic Light System

### What changed
- **Home screen** → Light mode (white/gray, clean & modern)
- **Scan/Result screens** → Dark navy (kept)
- **Traffic light risk system** introduced:
  - 🟢 Low Risk (score 65+)
  - 🟡 Medium Risk (score 40–64)
  - 🔴 High Risk (score 0–39)
- Result screen: real traffic light UI with active/inactive dots + score ring
- History screen: signal dot per scan
- Floating camera button on home screen
- Bottom action bar on result screen (History + Scan Another)

### Files changed
- `frontend/ai-identifier.jsx`

### Next
- Priority 4: Backend (move API key to server)
- Priority 5: localStorage history persistence

---

## [2026-04-25] — Error Handling + Feedback Buttons

### What changed
- User feedback buttons: ✅ Correct / ❌ Wrong / 🤔 Unsure
- Low-confidence photo tips card (category-specific)
- Confidence bar color changes to amber when low
- "Upload Better Photo" button when confidence 30–65%

### Files changed
- `frontend/ai-identifier.jsx`

---

## [2026-04-25] — Bug Fixes + Risk Language

### What changed
- Fixed `media_type` hardcoded as `image/jpeg` → now uses `file.type`
- "Likely Fake / Likely Authentic" → "High Risk / Low Risk"
- AI prompt updated to use risk-based verdict language
- Disclaimer added: "AI visual assessment only"
- Error handling: network, rate limit, API key, parse, low confidence
- Confidence threshold: < 30% → blocked, shows "better photo needed"

### Files changed
- `frontend/ai-identifier.jsx`

---

## [2026-04-24] — MVP Complete

### What's working
- Image upload (base64, multi-format)
- Anthropic Claude vision API integration
- Result screen: brand, model, category, confidence, risk, price, condition, tip
- History screen: last 10 scans (session only)
- Dark luxury UI (initial version)

### Known issues at time
- Media type hardcoded as `image/jpeg`
- "Likely Fake/Authentic" wording
- No disclaimer
- History resets on refresh
- API key in frontend

---

<!-- TEMPLATE

## [YYYY-MM-DD] — Title

### What changed
-

### Why
-

### Files changed
-

### Next
-

-->
