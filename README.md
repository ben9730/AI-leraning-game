# PromptPlay

**Learn AI prompting through play.**

A Duolingo-style web app that teaches anyone how to write great prompts for ChatGPT, Claude, Gemini, and any AI tool. Progress through bite-sized lessons, practice with simulated AI interactions, and earn XP, badges, and streaks along the way.

**Live app:** [https://promptplay-web.vercel.app](https://promptplay-web.vercel.app)

---

## How to Use

### 1. Start Learning

Open the app and pick a learning goal:
- **Learn AI basics** - Start from scratch
- **Improve my prompts** - Level up existing skills
- **Explore for fun** - Casual learning

### 2. Complete Lessons

Each lesson follows a simple flow:
1. **Intro** - Read the lesson topic and a quick tip
2. **Exercises** - Practice with 2-3 interactive exercises
3. **Completion** - Earn XP, unlock the next lesson

There are 6 exercise types:
- **Multiple Choice** - Pick the best prompt
- **Pick Better** - Compare two prompts and choose the stronger one
- **Free Text** - Write your own prompt and get scored
- **Fill in the Blank** - Complete a prompt with the missing piece
- **Spot the Problem** - Find what's wrong with a bad prompt
- **Simulated Chat** - Write a prompt and see a simulated AI response

### 3. Track Your Progress

- **XP** - Earn points for every completed lesson
- **Streaks** - Come back daily to build your streak
- **Levels** - Level up as you accumulate XP
- **Badges** - Unlock achievements (first lesson, 7-day streak, chapter complete, and more)
- **Skill Tree** - See your full learning journey across 4 chapters and 20 lessons

### 4. Switch Languages

The app supports **English** and **Hebrew** (with full RTL layout). Toggle the language from:
- The onboarding screen (top-right corner)
- The Profile tab

---

## Curriculum

| Chapter | Topic | Lessons |
|---------|-------|---------|
| 1 | What Can AI Do? | 5 lessons |
| 2 | Your First Good Prompt | 5 lessons |
| 3 | Level Up Your Prompts | 5 lessons |
| 4 | Real-World Skills | 5 lessons |

---

## Tech Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS v4
- **Build:** Vite 6
- **State:** Zustand with localStorage persistence
- **i18n:** i18next (English + Hebrew with RTL)
- **PWA:** Workbox via vite-plugin-pwa (offline support, installable)
- **Hosting:** Vercel

---

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test -w shared

# Build for production
npm run build
```

The project is a monorepo with two packages:
- `shared/` - Portable TypeScript logic (content, gamification, evaluators, store types)
- `web/` - React web app consuming shared logic

---

## License

MIT
