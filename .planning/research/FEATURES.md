# Feature Landscape: Web-First PWA Rebuild

**Domain:** Web-first rebuild of PromptPlay (porting existing Expo/RN app to web)
**Researched:** 2026-03-28

---

## Table Stakes

Features that MUST be present for the web app to reach feature parity with the existing Expo app. These are not new features -- they are ports of existing functionality.

| Feature | Why Required | Complexity | Notes |
|---------|-------------|------------|-------|
| Lesson content display (title, body, tip) | Core reading experience | Low | HTML rendering, RTL-aware text |
| 6 exercise types (MCQ, free-text, pick-better, fill-blank, spot-problem, simulated-chat) | Core interaction loop | Medium | Rebuild all 6 RN components as web components |
| Exercise evaluation with feedback | Core learning feedback | Low | Evaluators are portable (pure TS) |
| Lesson flow (intro -> exercises -> completion) | Core lesson loop | Low | `useLessonSession` hook is portable |
| XP system (earn, display, level up) | Gamification core | Low | Engine is portable; need web UI |
| Streak tracking (count, freeze, milestone grants) | Retention mechanic | Low | Engine is portable; need web UI |
| Badge system (5 badges, derived from state) | Achievement display | Low | `deriveBadges` is portable; need badge list UI |
| Skill tree / curriculum map | Navigation + progress visualization | Medium | New web component with node states |
| Lesson completion celebration | Reward signal | Medium | CSS animations replace Reanimated/Lottie |
| Level-up modal | Milestone celebration | Medium | Web modal component |
| Onboarding (goal selection) | First-run experience | Low | Simple form component |
| EN/HE language toggle | Bilingual requirement | Low | i18next + `document.dir` |
| RTL layout support | Hebrew first-class citizen | Medium | CSS logical properties throughout |
| Persistent progress (localStorage) | Progress survives refresh | Low | Zustand persist, simpler than MMKV |
| PWA installability (manifest, service worker) | App-like experience on mobile | Low | Already have manifest.json; vite-plugin-pwa |
| Offline content access | All lessons available offline | Low | Bundled JSON = always available |

---

## Differentiators (Web-Specific Improvements)

Features unique to the web rebuild that improve upon the Expo version.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Instant RTL switching (no reload) | Web's `document.dir` flips layout instantly. RN requires full app reload for RTL change. Better UX. | Low | Built into the web platform |
| URL-based lesson sharing | Users can share `/lesson/lesson-05-intent` links directly. Not possible in Expo. | Low | Comes free with React Router |
| Keyboard accessibility | Web exercises are keyboard-navigable (Tab, Enter, Space). RN exercises require touch. | Medium | Needs proper `tabIndex`, `aria-*`, `onKeyDown` |
| Responsive desktop layout | App works well on desktop browsers too. Expo web is mobile-only. | Medium | Max-width container + responsive breakpoints |
| Faster initial load | No Expo runtime overhead. Vite produces lean bundles. | Low | Architecture choice benefit |
| No install required | Works immediately in any browser. PWA install is optional, not required. | Free | Web platform advantage |
| Browser-native animations | CSS transitions/animations are GPU-accelerated without a bridge. Smoother than RN web. | Low | CSS replaces Reanimated |

---

## Anti-Features

Features to explicitly NOT build in the web rebuild.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Native app store deployment | Web-first milestone. Native is a separate future milestone if needed. | PWA only. Installable via browser. |
| Haptic feedback | Web Vibration API is poorly supported and feels wrong on desktop. | Visual + audio feedback only. Subtle CSS animations on correct/wrong answers. |
| Push notifications | Web push requires notification permission UX + service worker complexity. Not needed for v1 web. | In-app streak reminders when user visits. |
| Server-side rendering | No SEO need. App is behind onboarding. SSR adds complexity. | Pure client-side SPA. |
| Real-time cloud sync | Existing Supabase sync can be added later. Focus on local-first. | localStorage persistence. Cloud sync is a future phase. |
| Complex page transitions | RN's `Stack` navigation transitions don't exist on web. Don't replicate. | Simple fade/slide CSS transitions if desired. |
| Expo-specific features | expo-haptics, expo-splash-screen, expo-updates are RN-only. | Use web equivalents or omit. |

---

## Feature Dependencies

```
Shared TS extraction  ->  Content loader  ->  Lesson content display
                                           ->  Exercise cards  ->  Lesson flow
                                                                ->  Gamification UI
                      ->  Zustand store    ->  Lesson flow     ->  Skill tree
                                           ->  Gamification UI
                      ->  i18n setup       ->  All UI components

Exercise cards require: evaluators (shared), content schema (shared), i18n
Lesson flow requires: exercise cards, useLessonSession (shared), store
Gamification UI requires: store, engine/badges (shared)
Skill tree requires: store, curriculum (shared), lesson content
Onboarding requires: store (setDailyGoal)
PWA requires: everything else done first (polish phase)
```

---

## MVP Recommendation

**Prioritize (Phases 1-5):**
1. Shared code extraction + project scaffold (foundation)
2. State management + i18n + RTL (everything depends on these)
3. Content pipeline (exercises depend on content)
4. All 6 exercise types (core interaction)
5. Lesson flow end-to-end with gamification (core loop)

**Defer to Phase 6-8:**
- Skill tree visualization (users can access lessons via home page first)
- Celebration animations (basic completion screen first, polish later)
- PWA service worker (app works online first, offline second)
- Responsive desktop layout (mobile-first, desktop polish later)

**Cut entirely from this milestone:**
- Native app deployment
- Cloud sync with Supabase
- Push notifications
- New exercise types not already in the existing app

---

## Sources

- Direct analysis of existing PromptPlay codebase (50+ source files)
- [PWA capabilities 2026](https://www.alphabold.com/top-frameworks-and-tools-to-build-progressive-web-apps/) -- MEDIUM confidence
- [Vite PWA setup guide](https://www.chapimaster.com/programming/vite/setup-react-pwa-vite-plugin) -- MEDIUM confidence
