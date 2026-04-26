# 📋 ShowBrand Product — Changelog

> Update this file every time you push a meaningful product change.

---

## [2026-04-25] — Multi-Photo Upload (up to 3 photos)

### What changed
- Users can now select up to 3 photos at once for analysis
- All photos sent to AI simultaneously for higher accuracy
- Home screen: "1st: logo / 2nd: detail / 3rd: serial" guide card
- Scanning screen: all selected photos shown side by side
- Result screen: thumbnail strip + "📷 2 photos analyzed" badge
- History screen: shows how many photos were used (📷×2)
- Backend route updated to accept array of images

### Files changed
- `app/page.tsx`
- `app/api/analyze/route.js`

---

## [2026-04-25] — localStorage History Persistence

### What changed
- Scan history now persists across page refreshes
- History saved to localStorage on every new scan (max 20 items)
- History loaded from localStorage on app mount
- Image previews excluded from storage (too large) — shows 📦 placeholder
- "Clear" button added to history screen with confirmation dialog

### Files changed
- `app/page.tsx`

---

## [2026-04-25] — Next.js Backend + API Key Security

### What changed
- Migrated from Vite to Next.js (create-next-app)
- API call moved from frontend → backend (`app/api/analyze/route.js`)
- Anthropic API key now stored in `.env.local` (never exposed to browser)
- Frontend sends image to `/api/analyze`, backend calls Anthropic
- Model name corrected: `claude-sonnet-4-5`

### Files changed
- `app/api/analyze/route.js` (new)
- `app/page.tsx`

---

## [2026-04-25] — Full Redesign + Traffic Light System

### What changed
- **Home screen** → Light mode (white/gray, clean & modern)
- **Scan/Result screens** → Dark navy
- Traffic light risk system:
  - 🟢 Low Risk (score 65+)
  - 🟡 Medium Risk (score 40–64)
  - 🔴 High Risk (score 0–39)
- Result screen: real traffic light UI with active/inactive dots + score ring
- History screen: signal dot per scan
- Floating camera button on home screen
- Bottom action bar on result screen

### Files changed
- `app/page.tsx`

---

## [2026-04-25] — Error Handling + Feedback Buttons

### What changed
- User feedback buttons: ✅ Correct / ❌ Wrong / 🤔 Unsure
- Low-confidence photo tips card (category-specific)
- Confidence bar color changes to amber when low (30–65%)
- "Upload Better Photo" button when confidence is low
- Error types: network, rate limit, API key, parse, low confidence, server

### Files changed
- `app/page.tsx`

---

## [2026-04-25] — Bug Fixes + Risk Language

### What changed
- Fixed `media_type` hardcoded as `image/jpeg` → now uses `file.type`
- "Likely Fake / Likely Authentic" → "High Risk / Low Risk"
- AI prompt updated to use risk-based verdict language
- Disclaimer added: "AI visual assessment only"
- Confidence threshold: < 30% → blocked with "better photo needed"

### Files changed
- `app/page.tsx`

---

## [2026-04-24] — MVP Complete

### What's working
- Image upload (base64, multi-format)
- Anthropic Claude vision API integration
- Result screen: brand, model, category, confidence, risk, price, condition, tip
- History screen: last 10 scans (session only)
- Dark luxury UI (initial version)

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