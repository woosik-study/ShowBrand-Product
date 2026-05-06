# 🏷️ ShowBrand

> AI-powered product identification and authenticity risk analysis.

**Live:** [show-brand-product.vercel.app](https://show-brand-product-joiwx43ke-woosik-studys-projects.vercel.app/)

---

## What is ShowBrand?

ShowBrand lets users photograph any fashion or luxury item and receive instant AI analysis:

- 🔍 Brand & model identification
- 📊 AI confidence score
- 🟢🟡🔴 Traffic light authenticity risk signal
- 💰 Retail & resale price estimate
- 📸 Multi-photo upload (up to 3 photos)
- 💾 Persistent scan history

> ⚠️ ShowBrand provides AI-based visual risk assessment only.
> Not a professional authentication service.

---

## Feature History

| Version | Feature |
|---------|---------|
| v0.1 | MVP — single photo upload, AI analysis, result screen |
| v0.2 | Bug fixes — media type, error handling, risk-based language |
| v0.3 | Traffic light system 🟢🟡🔴, light home + dark result UI |
| v0.4 | Next.js backend — API key secured in server |
| v0.5 | localStorage history persistence (max 20 scans) |
| v0.6 | Multi-photo upload (up to 3 photos simultaneously) |
| v0.7 | Vercel deployment + PWA (installable on mobile) |

---

## User Workflow

```
1. Open ShowBrand (web or installed PWA)
        ↓
2. Home Screen (Light mode)
   - Upload zone
   - Risk signal legend 🟢🟡🔴
   - Supported categories
        ↓
3. Select 1–3 product photos
        ↓
4. Scanning Screen (Dark mode)
   - Photos displayed side by side
   - Progress bar + step indicators
        ↓
5. Result Screen (Dark mode)
   - Brand / Model / Year / Category
   - Traffic light signal
   - AI Confidence %
   - Retail + Resell price
   - Analysis reasons
   - Red flags (if any)
   - Condition assessment
   - Selling tip
   - User feedback buttons
        ↓
6. History (persistent across sessions)
```

---

## Technical Pipeline

```
[User] Selects 1–3 photos
        ↓
[Frontend] Converts images to base64
        ↓
[Frontend] POST /api/analyze → { images: [{base64, mediaType}] }
        ↓
[Backend] app/api/analyze/route.js
   → Reads ANTHROPIC_API_KEY from environment
   → Sends all images + prompt to Claude API
   → Parses JSON response
   → Returns structured result
        ↓
[Frontend] Displays result
   → Traffic light signal
   → Confidence bar
   → Analysis cards
   → Saves to localStorage
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Next.js App Router) |
| Backend | Next.js API Routes |
| AI Model | Anthropic Claude (Vision) |
| Styling | Inline CSS with design tokens |
| Storage | localStorage (client-side) |
| Deployment | Vercel |

---

## Project Structure

```
ShowBrand-Product/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.js      ← Backend API route
│   ├── page.tsx               ← Main app (all screens)
│   ├── layout.tsx             ← PWA metadata
│   └── globals.css
├── public/
│   ├── manifest.json          ← PWA manifest
│   ├── icon-192.png           ← PWA icon
│   └── icon-512.png           ← PWA icon
├── docs/
│   ├── workflow.md            ← User workflow detail
│   ├── pipeline.md            ← Technical pipeline detail
│   └── TODO.md                ← Current to-do list
├── logs/
│   └── CHANGELOG.md           ← Development log
├── next.config.ts
├── package.json
└── README.md
```

---

## Related

- **Research repo:** [ShowBrand-Research](https://github.com/woosik-study/ShowBrand-Rsearch)
- **Research title:** Reliability and Uncertainty in AI-Driven Product Recognition Systems
- **Faculty mentor:** Prof. Pengtao Xie (ECE, UCSD)
