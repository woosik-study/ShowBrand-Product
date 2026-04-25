# 🏷️ ShowBrand

> AI-powered product identification and authenticity risk analysis.
> Upload a photo — instantly know the brand, model, value, and visual risk signals.

---

## What is ShowBrand?

ShowBrand lets users photograph any fashion or luxury item and receive instant AI analysis:

- 🔍 Brand & model identification
- 📊 AI confidence score
- 🛡️ Authenticity risk assessment
- 💰 Retail & resale price estimate
- 📸 Condition assessment
- 💡 Selling tips

> ⚠️ ShowBrand provides AI-based visual risk assessment only.
> It is not a professional authentication service.

---

## Demo

> Screenshots / demo video coming soon.

---

## Current Features

| Feature | Status |
|---------|--------|
| Image upload | ✅ Done |
| AI brand & model identification | ✅ Done |
| Confidence score | ✅ Done |
| Authenticity risk verdict | ✅ Done |
| Price estimate (retail + resell) | ✅ Done |
| Condition & selling tip | ✅ Done |
| Scan history (session) | ✅ Done |
| Media type fix (PNG/WebP) | 🔲 In progress |
| Risk-based wording | 🔲 In progress |
| Legal disclaimer UI | 🔲 In progress |
| Backend / API security | 🔲 Planned |
| Persistent history (localStorage) | 🔲 Planned |
| User feedback (correct / wrong) | 🔲 Planned |
| Mobile PWA | 🔲 Planned |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (JSX) |
| AI | Anthropic Claude (Vision API) |
| Styling | Inline CSS with design tokens |
| Storage (current) | React state (session only) |
| Storage (planned) | localStorage → Supabase |
| Backend (planned) | FastAPI or Next.js API routes |

---

## Folder Structure

```
showbrand/
├── README.md
├── frontend/
│   └── ai-identifier.jsx       # Main React component (MVP)
├── backend/                    # Planned — API routes, env handling
├── assets/
│   └── screenshots/            # UI screenshots
└── logs/
    └── CHANGELOG.md            # Product development log
```

---

## Roadmap

### MVP 1 — Current
- Upload image → AI identifies brand/model/category → show result

### MVP 2 — Next
- Fix media type handling
- Risk-based authenticity wording
- Disclaimer UI
- User feedback buttons

### MVP 3
- Backend API (hide API key)
- Persistent scan history
- Image quality indicator

### MVP 4
- Marketplace price integration
- Multi-photo authentication flow
- Mobile PWA or app

---

## Development Log

See [`logs/CHANGELOG.md`](logs/CHANGELOG.md) for full update history.

---

## License

Private project — Woosik Kim, 2026.
