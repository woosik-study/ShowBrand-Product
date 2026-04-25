# ✅ ShowBrand Product — TODO

> Update this file as tasks are completed.
> Format: `- [x] Done` / `- [ ] Not done`

---

## 🔴 Priority 1 — Bug Fixes (Do First)

- [ ] Fix `media_type` hardcoded as `image/jpeg` → use `file.type`
- [ ] Add fallback for unsupported file types (HEIC, GIF, etc.)
- [ ] Add error handling for malformed JSON from AI
- [ ] Add loading state for slow API responses
- [ ] Add `.gitignore` (`.DS_Store`, `node_modules`, `.env`)

---

## 🟡 Priority 2 — Trust & Language

- [ ] Replace `"Likely Fake"` → `"High Authenticity Risk"`
- [ ] Replace `"Likely Authentic"` → `"Low Authenticity Risk"`
- [ ] Replace `"Cannot Determine"` → `"Unable to Assess"`
- [ ] Add disclaimer card: `"AI Visual Assessment Only — Not professional authentication"`
- [ ] Add `"Why this result?"` explanation section
- [ ] Add confidence threshold: if confidence < 30% → show `"Unable to identify"`

---

## 🟠 Priority 3 — UX Improvements

- [ ] Add image quality indicator (Clear / Medium / Poor)
- [ ] Add `"Upload a better photo"` suggestion when confidence is low
- [ ] Add user feedback buttons: ✅ Correct / ❌ Wrong / 🤔 Unsure
- [ ] Add logo visibility indicator
- [ ] Improve scanning animation steps

---

## 🔵 Priority 4 — Storage & Backend

- [ ] Add `localStorage` for history persistence across sessions
- [ ] Move AI API call from frontend → backend
- [ ] Hide API key in `.env` file
- [ ] Create `/api/analyze` endpoint
- [ ] Set up backend project structure (FastAPI or Next.js)

---

## 🟢 Priority 5 — Features

- [ ] Multi-photo upload (logo + detail + serial number)
- [ ] Marketplace price comparison links
- [ ] Share result as image
- [ ] PWA support (mobile install)
- [ ] Dark/light mode toggle
- [ ] Demo mode with sample images

---

## ✅ Completed

- [x] MVP React component built (`ai-identifier.jsx`)
- [x] Anthropic Claude vision API integrated
- [x] Result screen: brand, model, category, confidence, price, condition, tip
- [x] History screen (session, max 10)
- [x] Dark luxury UI (black + gold)
- [x] GitHub repo created (`ShowBrand-Product`)
- [x] README, CHANGELOG, docs folder set up
- [x] `.gitignore` added

---

## 📅 Target Timeline

| Priority | Target |
|----------|--------|
| 🔴 Bug fixes | Week 1 |
| 🟡 Trust & language | Week 1 |
| 🟠 UX improvements | Week 2 |
| 🔵 Backend | Week 3-4 |
| 🟢 Features | Week 5+ |
