# 🔄 ShowBrand — User Workflow

## Overview

```
Home → Select Photos → Scanning → Result → History
```

---

## Screen 1: Home (Light Mode)

**Trigger:** App launch

**Elements:**
- ShowBrand logo + "AI Product Intelligence"
- Hero text: "Identify any product. Instantly."
- Upload zone (tap to select 1–3 photos)
- Multi-photo guide: 1st logo / 2nd detail / 3rd serial
- Risk signal legend: 🟢 Low / 🟡 Medium / 🔴 High
- Supported categories: Bags, Sneakers, Watches, Electronics, Clothing, Other
- How it works: 3-step guide
- Floating camera button (bottom center)
- History button (top right, shown if history exists)

---

## Screen 2: Scanning (Dark Mode)

**Trigger:** Photos selected

**Elements:**
- Selected photos displayed side by side (1–3)
- Scan line animation on first photo
- "Analyzing X photos..." label
- Progress bar (0 → 100%)
- Step indicators:
  1. Recognizing brand & logo
  2. Searching model database
  3. Checking authenticity signals
  4. Estimating market value

---

## Screen 3: Result (Dark Mode)

**Trigger:** AI analysis complete

**Elements:**
- Hero image (first photo, darkened)
- Brand name + model + year + category
- Traffic light badge (top right)
- Photo thumbnail strip (if 2+ photos)
- "X photos analyzed" badge
- Authenticity Signal card (traffic light + score ring)
- AI Confidence bar
- Low-confidence photo tips (if confidence 30–65%)
- Analysis reasons
- Red flags (if any)
- Retail + Resell price cards
- Condition assessment
- Selling tip
- User feedback: ✅ Correct / ❌ Wrong / 🤔 Unsure
- Bottom bar: History + Scan Another

---

## Screen 4: History (Dark Mode)

**Trigger:** Tap "History"

**Elements:**
- List of past scans (max 20, persisted in localStorage)
- Each item: thumbnail + brand + model + signal dot + category
- Photos used indicator (📷×2 if multi-photo)
- Clear button (with confirmation)

---

## Risk Signal System

| Signal | Score | Meaning |
|--------|-------|---------|
| 🟢 LOW RISK | 65–100 | Visual indicators consistent with authentic product |
| 🟡 MEDIUM RISK | 40–64 | Some uncertainty — professional check recommended |
| 🔴 HIGH RISK | 0–39 | Visual red flags detected |
| ⚪ UNCLEAR | — | Cannot determine from available photos |

---

## UX Principles

- **Home = light** — welcoming, clean, easy to scan
- **Scan/Result = dark** — focused, technical, premium feel
- **Always show uncertainty** — confidence % never hidden
- **Risk not verdict** — "High Risk" not "Fake"
- **Disclaimer always visible** — "AI visual assessment only"
