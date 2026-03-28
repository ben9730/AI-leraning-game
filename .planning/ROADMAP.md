# Roadmap: PromptPlay

## Overview

Six phases deliver a complete "Duolingo for AI" PWA: Foundation locks in RTL and content schema before any UI is built, Lesson Engine + Exercise types prove the core learning loop, Gamification layers XP and streaks on top of a working engine, Skill Tree and Onboarding complete the retention surface, Full Curriculum authors all 20 lessons in English and Hebrew, and PWA Polish hardens offline and performance for production.

## Phases

- [ ] **Phase 1: Foundation** - Expo scaffold, RTL/i18n infrastructure, content schema, Zustand/MMKV persistence
- [ ] **Phase 2: Lesson Engine + Core Exercises** - Lesson flow, exercise type registry, 5 authored lessons, evaluator
- [x] **Phase 3: Gamification Engine** - XP, streaks, streak freeze, levels, badges, celebrations (completed 2026-03-28)
- [ ] **Phase 4: Skill Tree + Onboarding** - Visual skill map, deferred-signup onboarding, Supabase auth
- [ ] **Phase 5: Full Curriculum** - All 20 lessons authored in EN + HE, all exercise types, graduated scoring
- [ ] **Phase 6: PWA Polish** - Service worker, offline support, iOS constraints, performance audit

## Phase Details

### Phase 1: Foundation
**Goal**: Establish the non-negotiable architectural foundations — RTL layout, i18n, content schema, and state persistence — before any UI or content is authored.
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07
**Success Criteria** (what must be TRUE):
  1. App runs on device with a tab bar (Home, Skill Tree, Profile) and switching tabs works in both English and Hebrew locales
  2. All layout properties use `paddingStart/End` and `marginStart/End` — no directional `left`/`right` CSS — verified by RTL smoke test in Hebrew locale
  3. A lesson JSON file conforming to the `Lesson + LocalizedString` schema loads without error and its content renders correctly
  4. User progress (XP, streak, completed lessons) persists across app restarts via MMKV without hydration flicker
  5. `t('key')` translation function works for both `en` and `he` and the locale can be switched at runtime
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Expo project bootstrap: TypeScript, expo-router tabs, i18next, I18nManager RTL wiring
- [x] 01-02-PLAN.md — Zustand store + MMKV PersistenceAdapter: UserProgress state shape, persist/hydrate
- [x] 01-03-PLAN.md — Content schema: TypeScript interfaces for Lesson, Exercise, LocalizedString, PromptRubric; one seed lesson JSON

### Phase 2: Lesson Engine + Core Exercises
**Goal**: Deliver a working lesson loop — load lesson, sequence exercises, evaluate answers, show completion — with enough authored content to test the engine end-to-end.
**Depends on**: Phase 1
**Requirements**: LESS-01, LESS-02, LESS-03, LESS-04, LESS-05, LESS-06, EXER-01, EXER-02, EXER-03, EXER-04, EXER-06, EXER-07, EXER-08, EXER-09, EXER-10
**Success Criteria** (what must be TRUE):
  1. User can open a lesson, tap through content + exercises, and reach a completion screen that shows XP earned
  2. Multiple choice, pick-the-better-prompt, rewrite-the-bad-prompt, fill-in-the-blank, and spot-the-problem exercise types all render and score correctly
  3. Scoring rubric returns a `{ score, passed, feedback, breakdown }` object with per-criterion detail visible to the user immediately after submission
  4. Lessons 1-5 are fully playable end-to-end with RTL-correct rendering in Hebrew locale
  5. Lesson progress states (not started / in progress / completed) persist correctly after restart
**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md — Lesson engine shell: navigation route, state machine hook, content/completion screens, progress wiring
- [x] 02-02-PLAN.md — Exercise runner + evaluators: type registry, 5 exercise components (MCQ, pick-better, free-text, fill-blank, spot-problem), 5 pure evaluator functions
- [x] 02-03-PLAN.md — Scoring feedback + content: FeedbackCard per-criterion display, lessons 02-05 authored (bilingual), loader/curriculum updated, end-to-end verification

### Phase 3: Gamification Engine
**Goal**: Wrap the lesson loop with XP, streaks, levels, badges, and celebrations so completing a lesson feels rewarding and returning daily has a tangible hook.
**Depends on**: Phase 2
**Requirements**: GAME-01, GAME-02, GAME-03, GAME-04, GAME-05, GAME-06, GAME-07, GAME-08, GAME-09
**Success Criteria** (what must be TRUE):
  1. Completing a lesson awards XP with a Lottie celebration animation and the XP total updates immediately in the store
  2. Daily streak increments on the first lesson each day and resets at midnight local time; streak count displays with a flame icon
  3. Streak freeze is granted after a 7-day streak milestone and can be spent to block a missed-day reset
  4. Reaching an XP level threshold triggers a full-screen level-up celebration (Reanimated + Lottie)
  5. At least 3 achievement badges are earnable (first lesson, 7-day streak, chapter complete) and display in the Profile tab
  6. No hearts, energy gates, or guilt-framing appear anywhere in the app; tone throughout is encouraging
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — XP engine + level system: calcXP pure function, streak multiplier, perfection bonus, level-up detection in store, daily goal XP targets
- [x] 03-02-PLAN.md — Streak + freeze mechanics: calcStreakUpdate pure function, midnight local reset, freeze grant at 7-day milestone, StreakBadge component on home tab
- [x] 03-03-PLAN.md — Badges + celebrations: deriveBadges system, Lottie lesson celebration, full-screen level-up modal, badge grid in Profile tab, tone audit

### Phase 4: Skill Tree + Onboarding
**Goal**: Give users a visible map of their learning journey and a friction-free first-session experience that puts them in an exercise within 60 seconds.
**Depends on**: Phase 3
**Requirements**: TREE-01, TREE-02, TREE-03, TREE-04, TREE-05, ONBR-01, ONBR-02, ONBR-03, ONBR-04, ONBR-05
**Success Criteria** (what must be TRUE):
  1. The Skill Tree tab renders all lesson nodes with correct locked/unlocked/complete visual states based on real progress data
  2. Tapping a lesson node navigates into that lesson (or shows a review prompt for completed lessons)
  3. Chapter groupings (4 chapters, 20 lessons) are visually distinct on the skill tree
  4. A new user can reach the first interactive exercise within 60 seconds of opening the app without creating an account
  5. Account creation prompt appears after lesson 2 or 3 completion — not before — and is skippable
  6. Supabase email/password auth saves progress to the cloud and restores it on a different device after login
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — Skill tree UI: derived node state hook, SkillTreeNode/ChapterHeader components, full skill-tree.tsx screen with scroll-to-current
- [x] 04-02-PLAN.md — Onboarding flow: route-guard redirect, goal selection screen, deferred AccountPromptModal after lesson 2
- [ ] 04-03-PLAN.md — Supabase auth + cloud sync: client singleton, useAuth hook, syncProgress functions, AuthScreen UI, wiring to account prompt

### Phase 5: Full Curriculum
**Goal**: Author all 20 lessons across 4 chapters in English and Hebrew, implement the simulated AI chat exercise type, and graduate the scoring rubric from checklist to weighted keyword scoring.
**Depends on**: Phase 4
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08, EXER-05
**Success Criteria** (what must be TRUE):
  1. All 20 lessons are playable end-to-end in the English locale with 2-3 exercises each and correct chapter grouping
  2. The simulated AI chat exercise renders a pre-scripted AI response to the user's prompt and scores it against a rubric
  3. From lesson 6 onward, scoring uses the weighted keyword rubric with partial credit; lessons 1-5 use the binary checklist
  4. All 20 lessons are fully translated to Hebrew and render correctly in RTL layout on a physical device
  5. Every lesson teaches a tool-agnostic principle with no reference to specific AI tool UIs
**Plans**: 3 plans

Plans:
- [ ] 05-01: Simulated AI chat exercise type — prompt input, pre-scripted response rendering, rubric scoring
- [ ] 05-02: Chapters 1-2 content (lessons 1-10) — EN + HE authored and RTL-tested
- [ ] 05-03: Chapters 3-4 content (lessons 11-20) — EN + HE authored, native Hebrew review, AI-term glossary

### Phase 6: PWA Polish
**Goal**: Harden the app for production with offline lesson access, PWA installability, iOS cache constraints, and animation performance on low-end devices.
**Depends on**: Phase 5
**Requirements**: PWA-01, PWA-02, PWA-03, PWA-04, PWA-05
**Success Criteria** (what must be TRUE):
  1. Previously visited lessons are accessible offline — the app shell and lesson JSON load without a network connection
  2. The app can be installed to the home screen on Android (auto-prompt) and iOS (in-app install nudge visible)
  3. Total PWA cache stays under 50MB to comply with iOS Safari's cache eviction limit
  4. Celebration animations (level-up, lesson completion) run at 60fps on a 2GB RAM Android device
  5. All lesson content and UI is readable and usable on mobile viewports without horizontal scrolling
**Plans**: 3 plans

Plans:
- [ ] 06-01: Service worker (Workbox) — CacheFirst app shell + lesson JSON, StaleWhileRevalidate images
- [ ] 06-02: PWA installability + iOS constraints — manifest, install nudge UI, cache budget audit
- [ ] 06-03: Performance audit — animation profiling on low-end Android, responsive layout fixes

## Progress

**Execution Order:** 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/3 | In Progress|  |
| 2. Lesson Engine + Core Exercises | 0/3 | Not started | - |
| 3. Gamification Engine | 3/3 | Complete   | 2026-03-28 |
| 4. Skill Tree + Onboarding | 2/3 | In Progress|  |
| 5. Full Curriculum | 0/3 | Not started | - |
| 6. PWA Polish | 0/3 | Not started | - |
