# Milestones

## v2.0 Web-First Rebuild (Shipped: 2026-03-29)

**Phases completed:** 8 phases, 16 plans, 24 tasks

**Key accomplishments:**

- npm workspaces monorepo with Vite 6.4.1 + React 19 + Tailwind v4 web project and @shared path alias to shared/ package
- All portable pure TypeScript modules (content, gamification, evaluators, store types, skill-tree utils, i18n) extracted to shared/ with 128 tests passing via Vitest and ESLint guard blocking react-native/expo imports
- Zustand store with localStorage persistence porting all UserProgress actions from v1, hydration gate in main.tsx, and 9 unit tests
- i18next with EN+HE from shared/ translations, useLanguage hook with instant RTL flip via document.dir, and CSS logical property convention for all Tailwind styling
- Vite-native content loader using import.meta.glob to bridge all 20 shared/ lesson JSONs into web/ with typed loadLesson API and curriculum barrel export
- Status:
- FillBlank, SpotProblem, and SimulatedChat cards with full registry wiring and 69 passing tests across 8 test files
- HomePage with 4 chapter sections, lesson cards showing lock/unlock/complete states, and click-to-navigate for accessible lessons
- Persistent GameHeader with streak flame, XP counter, SVG level ring + CSS keyframe animations for gamification UI
- LevelUpModal, CSS confetti overlay, XP float-up, badge grid with earned/locked states, and auto-dismissing badge toast — all integrated into LessonPage completion
- 1. [Rule 3 - Blocking] .gitignore blocked PWA asset tracking
- 1. [Rule 1 - Bug] UpdateToast used non-existent i18n key `pwa.updateNow`

---
