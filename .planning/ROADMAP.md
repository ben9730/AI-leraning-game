# Roadmap: PromptPlay

## Milestones

- ✅ **v1.0 MVP** - Phases 1-6 (shipped 2026-03-28)
- 🚧 **v2.0 Web-First Rebuild** - Phases 7-14 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-6) - SHIPPED 2026-03-28</summary>

### Phase 1: Foundation
**Goal**: Establish the non-negotiable architectural foundations — RTL layout, i18n, content schema, and state persistence — before any UI or content is authored.
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Expo project bootstrap: TypeScript, expo-router tabs, i18next, I18nManager RTL wiring
- [x] 01-02-PLAN.md — Zustand store + MMKV PersistenceAdapter: UserProgress state shape, persist/hydrate
- [x] 01-03-PLAN.md — Content schema: TypeScript interfaces for Lesson, Exercise, LocalizedString, PromptRubric; one seed lesson JSON

### Phase 2: Lesson Engine + Core Exercises
**Goal**: Deliver a working lesson loop — load lesson, sequence exercises, evaluate answers, show completion — with enough authored content to test the engine end-to-end.
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Lesson engine shell: navigation route, state machine hook, content/completion screens, progress wiring
- [x] 02-02-PLAN.md — Exercise runner + evaluators: type registry, 5 exercise components (MCQ, pick-better, free-text, fill-blank, spot-problem), 5 pure evaluator functions
- [x] 02-03-PLAN.md — Scoring feedback + content: FeedbackCard per-criterion display, lessons 02-05 authored (bilingual), loader/curriculum updated, end-to-end verification

### Phase 3: Gamification Engine
**Goal**: Wrap the lesson loop with XP, streaks, levels, badges, and celebrations so completing a lesson feels rewarding and returning daily has a tangible hook.
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — XP engine + level system: calcXP pure function, streak multiplier, perfection bonus, level-up detection in store, daily goal XP targets
- [x] 03-02-PLAN.md — Streak + freeze mechanics: calcStreakUpdate pure function, midnight local reset, freeze grant at 7-day milestone, StreakBadge component on home tab
- [x] 03-03-PLAN.md — Badges + celebrations: deriveBadges system, Lottie lesson celebration, full-screen level-up modal, badge grid in Profile tab, tone audit

### Phase 4: Skill Tree + Onboarding
**Goal**: Give users a visible map of their learning journey and a friction-free first-session experience that puts them in an exercise within 60 seconds.
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — Skill tree UI: derived node state hook, SkillTreeNode/ChapterHeader components, full skill-tree.tsx screen with scroll-to-current
- [x] 04-02-PLAN.md — Onboarding flow: route-guard redirect, goal selection screen, deferred AccountPromptModal after lesson 2
- [x] 04-03-PLAN.md — Supabase auth + cloud sync: client singleton, useAuth hook, syncProgress functions, AuthScreen UI, wiring to account prompt

### Phase 5: Full Curriculum
**Goal**: Author all 20 lessons across 4 chapters in English and Hebrew, implement the simulated AI chat exercise type, and graduate the scoring rubric from checklist to weighted keyword scoring.
**Plans**: 3 plans

Plans:
- [x] 05-01-PLAN.md — SimulatedChatCard component + evaluateSimulatedChat evaluator + registry entry for simulated-chat exercise type
- [x] 05-02-PLAN.md — Chapters 1-2 content (lessons 06-10 authored EN+HE), loader/curriculum extended, structural validation tests
- [x] 05-03-PLAN.md — Chapters 3-4 content (lessons 11-20 authored EN+HE), loader/curriculum completed to 20 lessons, full test coverage

### Phase 6: PWA Polish
**Goal**: Harden the app for production with offline lesson access, PWA installability, iOS cache constraints, and animation performance on low-end devices.
**Plans**: 3 plans

Plans:
- [x] 06-01-PLAN.md — Service worker + Workbox: CacheFirst app shell + lesson JSON, StaleWhileRevalidate images, SW registration hook
- [x] 06-02-PLAN.md — PWA installability + iOS constraints: web manifest, PWA icons, InstallBanner (iOS nudge + Android prompt), cache budget audit
- [x] 06-03-PLAN.md — Performance audit: animation profiling (transform/opacity only), responsive layout fixes, regression guard tests

</details>

### v2.0 Web-First Rebuild (In Progress)

**Milestone Goal:** Rebuild PromptPlay as a web-first Vite + React 19 SPA, porting all curriculum and game logic from the Expo/React Native codebase. Pure TypeScript logic (~600 lines) ports directly via a shared/ monorepo package; UI is rebuilt with Tailwind v4 and CSS logical properties for RTL.

**Phase Numbering:**
- Integer phases (7, 8, 9...): Planned milestone work
- Decimal phases (7.1, 7.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 7: Foundation + Shared Extraction** - Vite 6 + React 19 scaffold, monorepo with shared/ package, portable TS extraction, lint guardrails
- [x] **Phase 8: State + i18n + RTL** - Zustand with localStorage persistence, i18next EN+HE, RTL via CSS logical properties (completed 2026-03-28)
- [x] **Phase 9: Content Pipeline** - Vite content loader for 20 lesson JSONs, curriculum index with chapter groupings (completed 2026-03-28)
- [x] **Phase 10: Exercise System** - Exercise type registry, 6 web exercise components, evaluator wiring with scoring UI (completed 2026-03-29)
- [x] **Phase 11: Lesson Flow** - Lesson screen with intro/exercise/completion sequence, progress persistence, sequential unlock (completed 2026-03-29)
- [x] **Phase 12: Gamification** - XP/streak/badge engine from shared/, celebration animations in CSS, streak + level UI (completed 2026-03-29)
- [ ] **Phase 13: Skill Tree + Navigation** - Tab navigation, skill tree visualization, onboarding flow, profile tab
- [ ] **Phase 14: PWA + Web Polish** - Service worker + offline, install banner, responsive layout, SEO meta tags

## Phase Details

### Phase 7: Foundation + Shared Extraction
**Goal**: Establish the web project scaffold and extract all portable TypeScript logic into a shared package that both the existing RN app and new web app can consume
**Depends on**: Nothing (first phase of v2.0)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04
**Success Criteria** (what must be TRUE):
  1. Running `npm run dev` in the web/ directory starts a Vite dev server that renders a React 19 page with Tailwind v4 styling
  2. The shared/ package exports all pure TS modules (evaluators, gamification engine, content schema, store types) and they import cleanly in the web project with zero react-native dependencies
  3. An ESLint rule in shared/ fails the build if any file imports from react-native or expo-* packages
  4. TypeScript path aliases (@shared/) resolve correctly in tsconfig, vite.config, and vitest.config
**Plans**: 2 plans

Plans:
- [x] 07-01-PLAN.md — Monorepo root + shared/ skeleton + Vite 6 + React 19 + Tailwind v4 web project scaffold
- [x] 07-02-PLAN.md — Extract portable TS to shared/, copy tests, configure Vitest, ESLint no-RN-import rule

### Phase 8: State + i18n + RTL
**Goal**: Users can switch between English and Hebrew with instant RTL layout flip and have their progress persist across browser sessions
**Depends on**: Phase 7
**Requirements**: STATE-01, STATE-02, STATE-03
**Success Criteria** (what must be TRUE):
  1. User progress (XP, streak, completed lessons) persists in localStorage and survives browser restart without hydration flicker
  2. User can toggle between English and Hebrew and the entire UI re-renders in the selected language without a page reload
  3. When Hebrew is selected, document direction is RTL and all layout uses CSS logical properties (padding-inline-start, margin-inline-end) with no physical left/right breaking
**Plans**: 2 plans

Plans:
- [x] 08-01-PLAN.md — Zustand store with localStorage persistence, hydration gate in main.tsx
- [x] 08-02-PLAN.md — i18next setup with EN+HE from shared/, useLanguage hook with RTL, Tailwind logical properties

### Phase 9: Content Pipeline
**Goal**: All 20 lesson JSON files load correctly through a Vite-native content loader and are organized into chapters for curriculum navigation
**Depends on**: Phase 7
**Requirements**: CONT-01, CONT-02
**Success Criteria** (what must be TRUE):
  1. All 20 lesson JSON files load via Vite import.meta.glob and render lesson content (title, body, tip) correctly in both EN and HE
  2. Curriculum index returns 4 chapters with correct lesson groupings, and lesson order matches the existing v1 sequence
**Plans**: 1 plan

Plans:
- [x] 09-01-PLAN.md — Vite content loader (import.meta.glob), curriculum re-export, content pipeline tests

### Phase 10: Exercise System
**Goal**: Users can interact with all 6 exercise types in the browser with keyboard accessibility and receive immediate scored feedback
**Depends on**: Phase 8, Phase 9
**Requirements**: EXER-01, EXER-02, EXER-03
**Success Criteria** (what must be TRUE):
  1. The exercise type registry maps each of the 6 type keys (mcq, pick-better, free-text, fill-blank, spot-problem, simulated-chat) to a React component and a shared/ evaluator
  2. All 6 exercise components render correctly, accept user input via mouse and keyboard (Tab/Enter/Space), and submit for evaluation
  3. After submission, a feedback UI displays score, pass/fail, and per-criterion breakdown from the evaluator
  4. All exercise components render correctly in RTL mode (Hebrew)
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 10-01-PLAN.md — Exercise registry + FeedbackCard + MCQCard + PickBetterCard + FreeTextCard components
- [x] 10-02-PLAN.md — FillBlankCard + SpotProblemCard + SimulatedChatCard + full integration tests

### Phase 11: Lesson Flow
**Goal**: Users can play through a complete lesson from intro to exercises to completion screen, with progress saved and sequential lesson unlocking
**Depends on**: Phase 10
**Requirements**: LESS-01, LESS-02, LESS-03
**Success Criteria** (what must be TRUE):
  1. User can open a lesson, view the intro content, complete 2-3 exercises in sequence, and reach a completion screen showing XP earned
  2. Lesson progress states (not started / in progress / completed) persist across browser sessions via the Zustand store
  3. Lessons unlock sequentially -- a user cannot access lesson N+1 until lesson N is completed, and completed lessons show a review option
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 11-01-PLAN.md — React Router 7 setup, DotStepper component, LessonPage with intro/exercise/completion flow
- [x] 11-02-PLAN.md — HomePage with chapter/lesson listing, lock state UI, end-to-end verification

### Phase 12: Gamification
**Goal**: Completing lessons feels rewarding with XP, streaks, levels, and badges, and returning daily has a visible hook
**Depends on**: Phase 11
**Requirements**: GAME-01, GAME-02, GAME-03, GAME-04
**Success Criteria** (what must be TRUE):
  1. Completing a lesson awards XP with a CSS celebration animation and the XP total updates immediately in the UI
  2. Daily streak increments on the first lesson completion each day, resets correctly at midnight local time, and streak freeze works as in v1
  3. Reaching a level-up XP threshold triggers a full-screen celebration modal with CSS/Motion animation
  4. Badges (first lesson, 7-day streak, chapter complete) are earnable and display in the profile view
  5. Streak flame icon, XP counter, and level indicator are visible on the main screen at all times
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 12-01-PLAN.md — RootLayout + GameHeader (streak flame, XP counter, level ring) + CSS keyframes + updateStreak wiring
- [x] 12-02-PLAN.md — LevelUpModal + CelebrationOverlay + BadgeGrid + BadgeToast + LessonPage completion integration

### Phase 13: Skill Tree + Navigation
**Goal**: Users can navigate the app via tabs, see their full learning journey on a visual skill tree, and new users reach their first exercise within 60 seconds
**Depends on**: Phase 12
**Requirements**: TREE-01, TREE-02, TREE-03, TREE-04
**Success Criteria** (what must be TRUE):
  1. Tab-based navigation (Home, Skill Tree, Profile) works with browser back/forward and direct URL access
  2. Skill tree renders all 20 lesson nodes across 4 chapters with correct locked/unlocked/complete visual states derived from real progress
  3. A brand-new user completes the onboarding goal selection and reaches the first interactive exercise within 60 seconds
  4. Profile tab displays earned badges, XP stats, streak info, and a working language switcher
**Plans**: TBD
**UI hint**: yes

### Phase 14: PWA + Web Polish
**Goal**: The app works offline for previously visited lessons, is installable as a PWA, looks good on all screen sizes, and has proper meta tags for sharing
**Depends on**: Phase 13
**Requirements**: PWA-01, PWA-02, PWA-03, PWA-04
**Success Criteria** (what must be TRUE):
  1. Previously visited lessons load and are playable with no network connection via a Workbox service worker
  2. Install banner appears on Android (auto-prompt) and iOS (in-app nudge) and the app can be added to the home screen
  3. Layout is mobile-first with a desktop-enhanced view (wider content area, optional sidebar) that works from 320px to 1440px+
  4. Pages have correct SEO meta tags and Open Graph cards so sharing a lesson URL shows a rich preview
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:** 7 -> 8 -> 9 -> 10 -> 11 -> 12 -> 13 -> 14
(Phases 9 and 8 can run in parallel; Phase 10 depends on both)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 3/3 | Complete | 2026-03-28 |
| 2. Lesson Engine | v1.0 | 3/3 | Complete | 2026-03-28 |
| 3. Gamification | v1.0 | 3/3 | Complete | 2026-03-28 |
| 4. Skill Tree | v1.0 | 3/3 | Complete | 2026-03-28 |
| 5. Full Curriculum | v1.0 | 3/3 | Complete | 2026-03-28 |
| 6. PWA Polish | v1.0 | 3/3 | Complete | 2026-03-28 |
| 7. Foundation + Shared Extraction | v2.0 | 2/2 | Complete | 2026-03-28 |
| 8. State + i18n + RTL | v2.0 | 2/2 | Complete   | 2026-03-28 |
| 9. Content Pipeline | v2.0 | 1/1 | Complete   | 2026-03-28 |
| 10. Exercise System | v2.0 | 2/2 | Complete    | 2026-03-29 |
| 11. Lesson Flow | v2.0 | 2/2 | Complete    | 2026-03-29 |
| 12. Gamification | v2.0 | 2/2 | Complete    | 2026-03-29 |
| 13. Skill Tree + Navigation | v2.0 | 0/0 | Not started | - |
| 14. PWA + Web Polish | v2.0 | 0/0 | Not started | - |
