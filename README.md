# CalTracker - Calorie & Macro Tracker PWA

A free, offline-capable Progressive Web App for tracking daily calories, macros, supplements, and exercise — integrated with your work shift schedule.

## Features

- **Dynamic Macro Calculation** — All goals auto-recalculate when you update your weight
  - Maintenance calories = weight × 24
  - Target = Maintenance - 500 (deficit)
  - Protein = weight × 1.8
  - Fat = weight × 0.7
  - Fiber = target_cal / 1000 × 14
  - Carbs = (target_cal - protein×4 - fat×9) / 4

- **Food Logging** — Search 100+ Indian foods, enter weight from weighing machine
- **Shift-Based Meal Plans** — Auto-adjusts meal timing based on your work shift
- **Dinner Cutoff** — Reminders to finish dinner by 6:30 PM
- **Exercise Tracking** — Log walks (2hr daily) and gym (4 days/week)
- **Supplement Tracking** — Omega-3, Magnesium, Vitamin C, Creatine
- **Water Tracking** — 10 glasses/day goal
- **Notifications** — Meal reminders, supplement alerts, water reminders
- **Weight History** — Track progress over time with chart
- **Data Export/Import** — Backup your data as JSON
- **Works Offline** — Full PWA with service worker caching

## How to Install on Android (Free!)

### Method 1: Direct Hosting (Recommended)

1. **Host the files** — Use any free static hosting:
   - **GitHub Pages** (free): Push to GitHub, enable Pages
   - **Netlify** (free): Drag & drop the folder
   - **Vercel** (free): Connect your repo

2. **Open in Chrome on your Android phone**

3. **Install as App:**
   - Chrome will show "Add to Home Screen" banner
   - OR tap the 3-dot menu → "Install app" / "Add to Home screen"
   - The app will appear on your home screen like a native app!

### Method 2: Local Testing

```bash
# From the calorie-tracker directory:
cd /Users/ds/Documents/Personal/calorie-tracker

# Option A: Python (built-in on Mac)
python3 -m http.server 8080

# Option B: Node.js
npx serve .

# Then open http://localhost:8080 in your browser
```

### Method 3: Deploy to GitHub Pages (Recommended for Mobile)

```bash
cd /Users/ds/Documents/Personal/calorie-tracker
git init
git add .
git commit -m "Initial calorie tracker PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/calorie-tracker.git
git push -u origin main
```
Then enable GitHub Pages in repo Settings → Pages → Source: main branch.

## How to Add New Monthly Roster

Edit `shift-data.js` and add new entries to `SHIFT_ROSTER` object:

```javascript
'2026-07-01': { morning: 'PersonName', evening: 'PersonName', general: ['Name1', 'Name2'] },
```

The app checks if "Dinesh S" appears in morning/evening/general shift to determine your schedule.

## Current Profile (at 94 kg)

| Metric | Value | Formula |
|--------|-------|---------|
| Maintenance | 2256 kcal | 94 × 24 |
| Target (deficit) | 1756 kcal | 2256 - 500 |
| Protein | 169.2g | 94 × 1.8 |
| Fat | 65.8g | 94 × 0.7 |
| Carbs | 121.5g | (1756 - 676.8 - 592.2) / 4 |
| Fiber | 24.6g | 1756/1000 × 14 |

When you update your weight to say 90kg, everything recalculates automatically.

## Tech Stack

- Pure HTML/CSS/JavaScript (no frameworks, no build tools)
- Service Worker for offline caching
- LocalStorage for data persistence
- Web Notifications API for reminders
- Installable PWA (works like native Android app)
