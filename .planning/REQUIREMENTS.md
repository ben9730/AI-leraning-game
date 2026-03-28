# Requirements: PromptPlay

**Defined:** 2026-03-28
**Core Value:** Make AI skills accessible and fun for anyone — turn "I don't know what to ask AI" into confident, effective AI usage through gamified practice.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: Project bootstrapped with Expo (React Native) + TypeScript
- [ ] **FOUND-02**: Zustand store with MMKV persistence for user progress (XP, streaks, completed lessons)
- [x] **FOUND-03**: i18n system with English + Hebrew support using `t('key')` translation function
- [x] **FOUND-04**: RTL layout support using directional CSS properties (`paddingStart/End`, `marginStart/End`) from day one
- [ ] **FOUND-05**: Content schema defined — JSON format for lessons, exercises, and scoring rubrics with `LocalizedString { en, he }` shape
- [x] **FOUND-06**: Expo Router navigation structure (tab-based: Home, Skill Tree, Profile)
- [ ] **FOUND-07**: PersistenceAdapter interface wrapping MMKV for local storage

### Lesson Engine

- [x] **LESS-01**: Lesson loader that fetches lesson by ID from bundled JSON
- [x] **LESS-02**: Lesson flow — content screen → exercise sequence → completion screen
- [x] **LESS-03**: Content renderer displaying lesson text with RTL-aware mixed Hebrew/English support
- [x] **LESS-04**: Lesson completion fires events consumed by gamification engine
- [x] **LESS-05**: Lesson progress tracked — not started / in progress / completed states
- [ ] **LESS-06**: Minimum 5 authored lessons for initial testing (Lesson 1 = 60-second "aha" demo)

### Exercise Engine

- [x] **EXER-01**: Exercise type registry pattern — map of type key → component + evaluator
- [x] **EXER-02**: Multiple choice exercises — concept questions with instant feedback
- [x] **EXER-03**: Pick-the-better-prompt exercises — two-panel comparison with explanation
- [x] **EXER-04**: Rewrite-the-bad-prompt exercises — free text input + rubric scoring
- [ ] **EXER-05**: Simulated AI chat — user writes prompt, sees pre-scripted response, gets scored (core differentiator)
- [x] **EXER-06**: Fill-in-the-blank exercises — complete a partial prompt
- [x] **EXER-07**: Spot-the-problem exercises — identify what's wrong with a prompt
- [ ] **EXER-08**: Scoring rubric system — evaluates Clarity, Specificity, Context, Intent dimensions
- [ ] **EXER-09**: Score feedback with transparent per-criterion breakdown (not just a number)
- [ ] **EXER-10**: Checklist-based scoring for early lessons (1-5), keyword-weighted rubric from lesson 6+

### Gamification

- [ ] **GAME-01**: XP system — base XP per exercise + streak multiplier + perfection bonus
- [ ] **GAME-02**: Daily streak tracking with midnight reset (local timezone)
- [ ] **GAME-03**: Streak freeze — one free freeze earned per 7-day streak milestone
- [ ] **GAME-04**: Level system — XP thresholds define levels, level-up triggers celebration
- [ ] **GAME-05**: 3-5 milestone achievement badges (first lesson, 7-day streak, chapter complete, etc.)
- [ ] **GAME-06**: Celebration animations on lesson completion and level-up (Reanimated + Lottie)
- [ ] **GAME-07**: No hearts/energy gate — unlimited attempts, bonus XP for perfection instead
- [ ] **GAME-08**: Daily goal setting (casual/regular/serious) affecting XP targets
- [ ] **GAME-09**: No guilt-based mechanics — friendly, encouraging tone in all notifications

### Skill Tree

- [ ] **TREE-01**: Visual skill map showing all lessons with lock/unlock/complete states
- [ ] **TREE-02**: Linear progression — each lesson unlocks the next
- [ ] **TREE-03**: Chapter groupings visible on skill tree (5 chapters)
- [ ] **TREE-04**: Tap lesson node to start or review completed lesson
- [ ] **TREE-05**: Current progress indicator showing position in learning path

### Onboarding

- [ ] **ONBR-01**: No signup wall — user starts learning immediately
- [ ] **ONBR-02**: Quick goal selection (casual/regular/serious) on first launch
- [ ] **ONBR-03**: Immediate first lesson experience within 60 seconds of opening app
- [ ] **ONBR-04**: Deferred account creation — prompt after lesson 2-3, not before
- [ ] **ONBR-05**: Supabase auth integration (email + password) for cloud progress sync

### Content

- [ ] **CONT-01**: 20 lessons authored across 4 chapters in English
- [ ] **CONT-02**: Chapter 1: "What Can AI Do?" (5 lessons — discovering AI capabilities)
- [ ] **CONT-03**: Chapter 2: "Your First Good Prompt" (5 lessons — clarity, specificity, context)
- [ ] **CONT-04**: Chapter 3: "Level Up Your Prompts" (5 lessons — roles, examples, constraints, iteration)
- [ ] **CONT-05**: Chapter 4: "Real-World Skills" (5 lessons — writing, research, brainstorming, analysis)
- [ ] **CONT-06**: All 20 lessons translated to Hebrew with native review
- [ ] **CONT-07**: Each lesson includes 2-3 exercises with variety of types
- [ ] **CONT-08**: Tool-agnostic content — teaches principles, not specific tool UIs

### Polish & PWA

- [ ] **PWA-01**: Service worker for offline lesson access (Workbox)
- [ ] **PWA-02**: App installable as PWA on mobile devices
- [ ] **PWA-03**: Responsive layout optimized for mobile viewports
- [ ] **PWA-04**: Animation performance tested on low-end Android devices
- [ ] **PWA-05**: iOS PWA constraints handled (50MB cache limit, no auto-install prompt)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Social & Competition

- **SOCL-01**: Leaderboards — weekly XP rankings among friends
- **SOCL-02**: Share achievement badges on social media
- **SOCL-03**: Friend system — add friends, see their progress

### Advanced Content

- **ADVN-01**: Chapter 5: "AI Power User" (6 lessons — chaining, multi-step, advanced techniques)
- **ADVN-02**: Multiple learning paths (writing, coding, business, creative)
- **ADVN-03**: Daily challenge — new prompt challenge every day
- **ADVN-04**: User-submitted prompt challenges

### Notifications

- **NOTF-01**: Push notifications for streak reminders (opt-in, friendly tone)
- **NOTF-02**: Weekly progress summary notification
- **NOTF-03**: Streak-about-to-break reminder

### Monetization

- **MNTZ-01**: Freemium model with premium tier
- **MNTZ-02**: Premium: ad-free, extra streak freezes, bonus lessons
- **MNTZ-03**: In-app purchase integration

### Native App

- **NATV-01**: iOS App Store deployment
- **NATV-02**: Android Play Store deployment

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Live AI API calls | Zero marginal cost — all interactions pre-built/simulated |
| Hearts/energy gate | #1 user revolt trigger in learning apps — unlimited attempts instead |
| Guilt-based notifications | Research shows loss-framing causes stress and churn |
| Video lessons | Production overhead; text + interactive exercises sufficient for v1 |
| Real-time multiplayer | High complexity, not needed to validate core learning experience |
| OAuth/social login | Email/password sufficient for v1 |
| Admin dashboard | Content managed via JSON files in codebase for v1 |
| Analytics/tracking | Defer until user base established |
| Multiple languages beyond EN+HE | Defer to v2+ after validating bilingual approach |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Pending |
| FOUND-06 | Phase 1 | Complete |
| FOUND-07 | Phase 1 | Pending |
| LESS-01 | Phase 2 | Complete |
| LESS-02 | Phase 2 | Complete |
| LESS-03 | Phase 2 | Complete |
| LESS-04 | Phase 2 | Complete |
| LESS-05 | Phase 2 | Complete |
| LESS-06 | Phase 2 | Pending |
| EXER-01 | Phase 2 | Complete |
| EXER-02 | Phase 2 | Complete |
| EXER-03 | Phase 2 | Complete |
| EXER-04 | Phase 2 | Complete |
| EXER-05 | Phase 5 | Pending |
| EXER-06 | Phase 2 | Complete |
| EXER-07 | Phase 2 | Complete |
| EXER-08 | Phase 2 | Pending |
| EXER-09 | Phase 2 | Pending |
| EXER-10 | Phase 2 | Pending |
| GAME-01 | Phase 3 | Pending |
| GAME-02 | Phase 3 | Pending |
| GAME-03 | Phase 3 | Pending |
| GAME-04 | Phase 3 | Pending |
| GAME-05 | Phase 3 | Pending |
| GAME-06 | Phase 3 | Pending |
| GAME-07 | Phase 3 | Pending |
| GAME-08 | Phase 3 | Pending |
| GAME-09 | Phase 3 | Pending |
| TREE-01 | Phase 4 | Pending |
| TREE-02 | Phase 4 | Pending |
| TREE-03 | Phase 4 | Pending |
| TREE-04 | Phase 4 | Pending |
| TREE-05 | Phase 4 | Pending |
| ONBR-01 | Phase 4 | Pending |
| ONBR-02 | Phase 4 | Pending |
| ONBR-03 | Phase 4 | Pending |
| ONBR-04 | Phase 4 | Pending |
| ONBR-05 | Phase 4 | Pending |
| CONT-01 | Phase 5 | Pending |
| CONT-02 | Phase 5 | Pending |
| CONT-03 | Phase 5 | Pending |
| CONT-04 | Phase 5 | Pending |
| CONT-05 | Phase 5 | Pending |
| CONT-06 | Phase 5 | Pending |
| CONT-07 | Phase 5 | Pending |
| CONT-08 | Phase 5 | Pending |
| PWA-01 | Phase 6 | Pending |
| PWA-02 | Phase 6 | Pending |
| PWA-03 | Phase 6 | Pending |
| PWA-04 | Phase 6 | Pending |
| PWA-05 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 52 total
- Mapped to phases: 52
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after roadmap creation — all 52 requirements mapped*
