# Requirements: PromptPlay v2.0 Web-First Rebuild

**Defined:** 2026-03-28
**Core Value:** Make AI skills accessible and fun for anyone — turn "I don't know what to ask AI" into confident, effective AI usage through gamified practice.

## Foundation (FOUND)
- [ ] **FOUND-01**: Vite 6 + React 19 + Tailwind v4 project scaffold with TypeScript
- [ ] **FOUND-02**: Monorepo structure with shared/ package for portable TS logic
- [ ] **FOUND-03**: Extract all pure TS code (evaluators, gamification, content schema, store types) to shared/
- [ ] **FOUND-04**: Lint rules preventing react-native imports in shared/

## State & i18n (STATE)
- [ ] **STATE-01**: Zustand store with localStorage persistence adapter (same UserProgress shape as v1)
- [ ] **STATE-02**: i18next with EN + HE translations (port existing common.json files)
- [ ] **STATE-03**: RTL support via document.dir + CSS logical properties (instant language switch, no page reload)

## Content Pipeline (CONT)
- [ ] **CONT-01**: Content loader using Vite import.meta.glob for all 20 lesson JSON files
- [ ] **CONT-02**: Curriculum index and chapter groupings (4 chapters, 20 lessons)

## Exercise System (EXER)
- [ ] **EXER-01**: Exercise type registry pattern (map of type key to React component + evaluator)
- [ ] **EXER-02**: 6 web exercise components (MCQ, pick-better, free-text, fill-blank, spot-problem, simulated-chat)
- [ ] **EXER-03**: All evaluators wired with scoring feedback UI (score, passed, per-criterion breakdown)

## Lesson Flow (LESS)
- [ ] **LESS-01**: Lesson screen with intro → exercise sequence → completion screen showing XP earned
- [ ] **LESS-02**: Lesson progress states (not started / in progress / completed) persisted across sessions
- [ ] **LESS-03**: Navigation between lessons with sequential unlock logic

## Gamification (GAME)
- [ ] **GAME-01**: XP engine, streak tracking, streak freeze, level-up detection (ported from shared/ pure TS)
- [ ] **GAME-02**: Badge system — first lesson, 7-day streak, chapter complete (ported from shared/)
- [ ] **GAME-03**: Celebration animations using CSS transitions / Motion (replacing Lottie + Reanimated)
- [ ] **GAME-04**: Streak display with flame icon, XP counter, level indicator visible in UI

## Skill Tree & Navigation (TREE)
- [ ] **TREE-01**: Tab-based navigation (Home, Skill Tree, Profile)
- [ ] **TREE-02**: Skill tree visualization with locked/unlocked/complete visual states per lesson
- [ ] **TREE-03**: Onboarding flow: goal selection, reach first exercise within 60 seconds
- [ ] **TREE-04**: Profile tab showing badges, stats, language switcher

## PWA & Web Polish (PWA)
- [ ] **PWA-01**: Service worker with Workbox for offline lesson access (previously visited lessons)
- [ ] **PWA-02**: Web manifest + install banner (Android auto-prompt, iOS in-app nudge)
- [ ] **PWA-03**: Responsive layout — mobile-first with desktop-enhanced sidebar/wider content
- [ ] **PWA-04**: SEO meta tags + Open Graph cards for lesson/page sharing

## Future (v2.1+)
- Supabase auth + cloud sync (deferred — local-only for v2.0)
- Capacitor / TWA mobile wrapper (deferred — web-first validation)
- Push notifications (requires backend infrastructure)
- Leaderboards / social features
- Multiple learning paths / tracks

## Out of Scope
- Real AI API integration — simulated exercises only (same as v1)
- Video content
- Monetization system
- Native app store deployment (v2.0 is web/PWA only)

## Traceability

| Requirement | Phase | Plan |
|-------------|-------|------|
| FOUND-01..04 | TBD | TBD |
| STATE-01..03 | TBD | TBD |
| CONT-01..02 | TBD | TBD |
| EXER-01..03 | TBD | TBD |
| LESS-01..03 | TBD | TBD |
| GAME-01..04 | TBD | TBD |
| TREE-01..04 | TBD | TBD |
| PWA-01..04 | TBD | TBD |
