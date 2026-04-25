# 🧠 Pipeline

## Current Pipeline (MVP)

```
┌─────────────────────────────────────────┐
│  STAGE 1: Image Input                   │
│  User selects image file                │
│  → FileReader converts to base64        │
│  → media_type set (currently hardcoded) │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  STAGE 2: AI API Call                   │
│  base64 image + prompt → Claude API     │
│  Prompt requests structured JSON:       │
│  brand, model, category, confidence,    │
│  authentic_score, authentic_verdict,    │
│  authentic_reasons, suspicious_points,  │
│  estimated_retail, estimated_resell,    │
│  year, condition_hints, tips            │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  STAGE 3: Response Parsing              │
│  → Extract text from API response       │
│  → Strip markdown fences                │
│  → JSON.parse() into result object      │
│  → Throw error if parse fails           │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  STAGE 4: Result Display                │
│  → Brand / Model / Year / Category      │
│  → Confidence bar                       │
│  → Authenticity risk verdict            │
│  → Retail + Resell estimate             │
│  → Red flags                            │
│  → Condition + Selling tip              │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  STAGE 5: History                       │
│  → Saved to React state                 │
│  → Max 10 items                         │
│  → Cleared on page refresh              │
└─────────────────────────────────────────┘
```

---

## Known Issues

| Issue | Impact | Fix |
|-------|--------|-----|
| `media_type` hardcoded as `image/jpeg` | PNG/WebP may fail | Use `file.type` |
| "Likely Fake" wording | Legal/trust risk | Use risk-based language |
| No disclaimer | Trust issue | Add disclaimer card |
| No confidence threshold | Shows result even at 10% | Add minimum threshold |
| API key in frontend | Security risk | Move to backend |
| History in React state | Resets on refresh | Add localStorage |

---

## Planned Pipeline (v2)

```
Image Input
  → Image quality check
  → If quality too low → prompt user
  → Send to backend API (not frontend)
  → Backend calls AI model
  → Parse + validate response
  → Apply confidence threshold
  → Return structured result
  → Display with uncertainty labels
  → Save to localStorage / database
```

---

## Tech Stack

| Layer | Current | Planned |
|-------|---------|---------|
| Frontend | React (JSX) | React + Next.js |
| AI | Anthropic Claude (direct) | Via backend API |
| Storage | React state | localStorage → Supabase |
| Backend | None | FastAPI or Next.js routes |
| Auth | None | Supabase Auth |
