# PockEd - Micro-Learning Sprints

> Turn your downtime into productive study sessions with micro-learning sprints.

A student-focused web app that helps college students transform short breaks between classes into focused flashcard study sessions using spaced repetition.

## ✨ Features

### 📅 Schedule Manager
- **Add/Edit/Delete** your daily schedule (classes, breaks, study blocks)
- Color-coded by type: **Class** (blue) vs **Free Time** (green)
- Auto-sorts chronologically
- Empty state guidance for first-time users

### 🃏 Flashcard Decks
- Create unlimited decks with custom colors
- Add cards manually (front/back)
- **AI Note Ingestion** (mock) - paste lecture notes → generates flashcards
- Card count badges, inline descriptions

### ⚡ Micro-Sprint Engine
- **Full-screen distraction-free mode**
- 3-rating SM-2 spaced repetition: **Hard / Good / Easy**
- Live countdown timer (15/30/45/60 min presets)
- Progress bar + cards remaining
- Smooth card flip animation (Framer Motion)
- Completion summary with XP earned

### 📊 Stats Dashboard
- Current/longest streak
- Total XP, sprints completed, cards reviewed
- Study time heatmap (last 7 days)
- Recent session history with ratings breakdown
- Deck mastery progress

### 💾 Data Persistence
- All data in **localStorage** (Zustand + persist middleware)
- Survives browser refresh/close
- No account required, fully offline-capable

### 🌙 Dark Mode
- System preference detection
- CSS variable theming
- Clean indigo/green/amber color palette

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm (or pnpm/yarn)

### Install & Run
```bash
# Navigate to project
cd pocked

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **http://localhost:3000** → redirects to `/dashboard`

### Build for Production
```bash
npm run build
npm start
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand + persist middleware |
| Animations | Framer Motion |
| Icons | Lucide React |
| Date Utils | date-fns |
| Package Manager | npm |

---

## 📁 Project Structure

```
pocked/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── icon-192.svg           # PWA icons
│   └── icon-512.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout, fonts, metadata
│   │   ├── page.tsx           # Redirects to /dashboard
│   │   ├── globals.css        # Tailwind v4 + CSS variables
│   │   ├── dashboard/page.tsx # Main dashboard
│   │   ├── decks/page.tsx     # Deck manager + AI ingestion
│   │   ├── sprint/page.tsx    # Full-screen sprint view
│   │   └── stats/page.tsx     # Analytics dashboard
│   ├── components/
│   │   ├── ui/                # Button, Input, Card, Modal
│   │   ├── layout/            # Navigation, Layout wrapper
│   │   ├── dashboard/         # Schedule, free blocks, deck cards
│   │   ├── decks/             # Deck CRUD + AI modal
│   │   ├── sprint/            # Flashcard, Timer, SprintView
│   │   └── stats/             # Stats charts & heatmap
│   ├── context/
│   │   └── SprintTimerContext.tsx  # Timer countdown state
│   ├── lib/
│   │   ├── store.ts           # Zustand store (350+ lines)
│   │   ├── utils.ts           # Time formatting, XP calc, free blocks
│   │   └── cn.ts              # clsx + tailwind-merge helper
│   └── types/
│       └── index.ts           # TypeScript interfaces
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🎯 How to Use

### 1. Set Up Your Schedule
1. Go to **Dashboard**
2. Click **"Add Schedule"**
3. Enter: Title, Start/End time, Type (Class/Free), Color
4. Repeat for all classes, breaks, labs
5. Free blocks automatically become available for sprints

### 2. Create a Deck
1. Go to **Decks** tab
2. Click **"New Deck"**
3. Name it, add description, pick a color
4. Click **"Add Card"** to manually create flashcards

### 3. (Optional) Generate Cards with AI
1. In Decks, click **✨ sparkles** on any deck
2. Paste lecture notes/text
3. Click **"Generate Flashcards"**
4. Review generated cards → **"Add to Deck"**

### 4. Start a Sprint
1. On Dashboard, find a **green Free Time** block
2. Click **"Study"** → picks first deck
3. Or click a deck card → choose duration (15/30/45/60 min)
4. Sprint view opens full-screen

### 5. During Sprint
- **Click card** or press **Space** to flip
- Rate: **Hard** (red) / **Good** (yellow) / **Easy** (green)
- Timer counts down, progress bar fills
- Auto-advances or click **"Next"**

### 6. Review Stats
- **Stats** tab shows streaks, XP, heatmap, session history
- Track which decks need review

---

## ⌨ Keyboard Shortcuts (Sprint Mode)

| Key | Action |
|-----|--------|
| `Space` / `Enter` | Flip card |
| `1` | Rate: Hard |
| `2` | Rate: Good |
| `3` | Rate: Easy |
| `←` / `→` | Previous / Next card |
| `Esc` | Pause/End sprint |

---

## 🔧 Development

### Environment Variables
None required - fully client-side with localStorage.

### Adding Features
- **New UI**: Add to `src/components/ui/`
- **New Page**: Create folder in `src/app/`
- **State Changes**: Edit `src/lib/store.ts`
- **Types**: Update `src/types/index.ts`

### Code Quality
```bash
npm run lint      # ESLint
npm run build     # TypeScript + production build
```

---

## 📱 PWA Support

- Installable on mobile/desktop
- Offline-capable (static assets cached)
- `manifest.json` configured for standalone display

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `ENOENT package.json` | `cd pocked` first |
| Port 3000 in use | `taskkill /PID <pid> /F` |
| ChunkLoadError | `rm -rf .next && npm run dev` |
| Icons not loading | Manifest now uses SVGs (fixed) |
| Data not persisting | Check localStorage in DevTools → Application |

---

## 📄 License

MIT - Feel free to use for learning or extend for your own projects.

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Make changes
4. Submit PR

---

**Built for students, by students.** 🎓

*Happy sprinting!* ⚡