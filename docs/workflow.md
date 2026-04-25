# 🔄 Workflow

## User Flow

```
1. Open ShowBrand
        ↓
2. Home Screen
   - Upload zone (tap to select photo)
   - Supported categories:
     Bags · Sneakers · Watches · Electronics · Clothing · Other
        ↓
3. Select a product photo
        ↓
4. Scanning Screen
   - Progress bar animates
   - Steps displayed:
     "Recognizing brand logo..."
     "Checking authenticity markers..."
     "Estimating market value..."
        ↓
5. Result Screen
   ┌─────────────────────────┐
   │ BRAND NAME              │
   │ Model · Year · Category │
   ├─────────────────────────┤
   │ AI Confidence     87%   │
   ├─────────────────────────┤
   │ Retail Price    $1,200  │
   │ Resell Value    $980    │
   ├─────────────────────────┤
   │ Authenticity Risk       │
   │ Score + Verdict         │
   │ Reasons listed          │
   │ Red flags (if any)      │
   ├─────────────────────────┤
   │ Condition Assessment    │
   │ Selling Tip             │
   └─────────────────────────┘
        ↓
6. User Actions
   - 📸 Scan Another
   - 🕐 View History
```

---

## Screen Map

| Screen | Trigger | Key Elements |
|--------|---------|-------------|
| Home | App launch | Upload zone, category grid |
| Scanning | File selected | Progress bar, step labels |
| Result | Analysis complete | Full analysis card |
| History | Tap "History" | Last 10 scans with thumbnail |

---

## UX Principles

- **Luxury feel** — dark background, gold accents
- **Mobile-first** — max width 430px
- **Fast feedback** — animation during API call
- **Transparent uncertainty** — confidence % always shown

---

## Planned UX Improvements

| Current | Planned |
|---------|---------|
| "Likely Fake" | "High Authenticity Risk" |
| "Likely Authentic" | "Low Authenticity Risk" |
| No disclaimer | "AI Visual Assessment Only" card |
| No quality check | Image quality indicator |
| No feedback | ✅ Correct / ❌ Wrong / 🤔 Unsure buttons |
| No suggestion | "Upload a better photo" prompt |
