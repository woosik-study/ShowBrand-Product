# 📋 ShowBrand — Product Changelog

> Update this file every time you push a meaningful product change.
> Format: `[YYYY-MM-DD] — Title`

---

## [2026-04-24] — MVP Complete

### What's working
- Image upload → base64 conversion
- Anthropic Claude vision API integration
- Structured JSON result parsing
- Result screen: brand, model, category, confidence, authenticity risk, price, condition, tip
- History screen: last 10 scans (session only)
- Dark luxury UI (black + gold)

### Known issues
- [ ] Media type hardcoded as `image/jpeg` — breaks with PNG/WebP
- [ ] "Likely Fake / Likely Authentic" wording — needs risk-based language
- [ ] No disclaimer on result screen
- [ ] History resets on page refresh
- [ ] API key exposed in frontend

### Next
- Fix media type
- Update wording
- Add disclaimer card

---

<!-- TEMPLATE — copy for each push

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
