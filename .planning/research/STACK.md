# Technology Stack

**Project:** PromptPlay — Duolingo-style AI literacy learning app
**Researched:** 2026-03-28
**Overall confidence:** MEDIUM-HIGH (web-verified, official docs cross-checked)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Expo (React Native) | SDK 52+ | Mobile-first app shell | Fastest path from zero to working app for solo dev. Web dev with React skills can ship in days, not weeks. Built-in PWA support hits the "no native deployment for v1" requirement. RTL support via I18nManager. |
| React Native | 0.76+ | UI rendering | Ships with Expo. New Architecture (Fabric) enabled by default in RN 0.76+. |
| TypeScript | 5.x | Language | Type safety prevents category of bugs in game logic (XP, streaks, scoring). Non-negotiable for a data-model-heavy app. |

**Why not Flutter:** Flutter is better for graphics-intensive games. For a content-driven learning app where the team already knows JavaScript, Expo wins on DX, time-to-market, and ecosystem (NPM has more ready-made components). Flutter's Dart is a learning tax for a solo JS developer.

**Why not Next.js/PWA-only:** Mobile-first means native feel matters. PWA has no native navigation gestures, limited haptics, no native streak notifications. Expo can publish as PWA AND native — best of both.

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zustand | 4.x | Global app state (XP, streaks, lesson progress, user settings) | 2KB vs Redux's 20KB. No providers, no boilerplate. Hook-based API fits React Native naturally. Fine-grained updates minimize re-renders — critical for animated gamification UI. |
| MMKV (react-native-mmkv) | 2.x | Persistent state storage | Synchronous reads (vs AsyncStorage's async), 10-30x faster, no hydration flicker on app launch. Zustand + MMKV middleware = offline-first state persistence with zero extra effort. |

**Pattern:** Zustand store for in-memory state, MMKV as the persistence adapter. One `persist` middleware call covers all offline persistence.

**Note:** MMKV requires a bare/development build in Expo (not Expo Go). This is fine for a proper project — use `npx expo run:android` / `run:ios` locally, or EAS Build for distribution.

### Backend / Auth / Database

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Supabase | Cloud / self-host | Auth, user progress storage, content admin | Postgres-backed, open-source, predictable $25/mo pricing (no Firebase bill surprises). SQL makes querying progress/analytics easy. Row Level Security (RLS) handles user data isolation. Supabase has matured to production-ready in 2025. |
| Supabase Auth | — | User authentication | Email/password + OAuth (Google, Apple) out of the box. JWT-based, works with React Native SDK. |
| Supabase Storage | — | User avatars / optional assets | If profile images are needed later. |

**Why not Firebase:** Firebase Firestore is excellent for real-time sync. PromptPlay doesn't need real-time sync (no multiplayer, no live leaderboards in v1). Supabase's SQL is a better fit for relational lesson/progress data, and the pricing is more predictable at indie scale.

**Schema outline (Supabase):**
- `users` — profile, XP total, current level, streak data
- `lesson_progress` — user_id, lesson_id, status (locked/available/complete), best_score, completed_at
- `exercise_attempts` — user_id, exercise_id, submitted_prompt, score, timestamp

### Content Management

| Approach | When | Why |
|----------|------|-----|
| **JSON files bundled in-app (v1)** | 20-30 lessons, no runtime editing needed | Lessons ship with the app binary. Zero CMS cost. Fully offline. Easiest to version-control alongside code. No API call needed to render a lesson. |
| Sanity.io (defer to v2+) | When content editors need a UI, or lessons exceed 50+ | Git-based JSON is fine for a developer-managed content set. Add CMS only when non-developers need to author content. |

**JSON lesson schema (recommended structure):**
```json
{
  "id": "lesson-01-what-is-prompting",
  "titleKey": "lesson01.title",
  "order": 1,
  "xpReward": 10,
  "exercises": [
    {
      "id": "ex-01-01",
      "type": "prompt_challenge",
      "instructionKey": "lesson01.ex01.instruction",
      "modelPrompt": "Write a clear, specific request...",
      "scoringRubric": { "clarity": 30, "specificity": 40, "context": 30 }
    }
  ]
}
```

Translations (EN/HE) stored in separate `i18n/en.json` and `i18n/he.json` files keyed to `titleKey` references. This separates content structure from language — clean for RTL.

### Animations & Gamification

| Library | Purpose | Why |
|---------|---------|-----|
| react-native-reanimated | Core animations (XP bars, progress fills, bounce effects) | Runs on UI thread — no JS bridge jank. Used by Shopify and Expo internally. Standard for any animation-heavy RN app in 2025. The `withSpring` and `withTiming` APIs cover 95% of gamification micro-animations. |
| lottie-react-native | Celebratory animations (level-up burst, streak flame, completion star) | Lottie files are small, designer-friendly vector animations. LottieFiles marketplace has free gamification-themed animations (fire, stars, XP pop). Much higher quality than hand-coded CSS animations. |
| Moti | Declarative entrance/exit animations | Built on Reanimated. Cleaner API for simple show/hide/slide transitions. Reduces boilerplate for common patterns. |

**Gamification pattern (custom, not a library):**
XP system, streak tracking, and level gating are custom Zustand store logic — not a library. Libraries like `react-native-game-engine` are for physics-based games, not progression systems. Keep it simple: XP = number, streak = date diff from last login, level = XP threshold table.

**Haptic feedback:** `expo-haptics` for satisfying tap feedback on correct answers. One-line integration, no native config needed.

### i18n / RTL

| Library | Purpose | Why |
|---------|---------|-----|
| i18next + react-i18next | Translation strings | Most widely used, battle-tested, supports pluralization and interpolation. Works identically in web and React Native. |
| expo-localization | Device locale detection | Detect system language on first launch to auto-set EN/HE. |
| React Native I18nManager | RTL layout flipping | Native module — when Hebrew is active, call `I18nManager.forceRTL(true)` + `Updates.reloadAsync()`. The entire layout flips (flex direction, text alignment, icon mirroring). |

**Critical RTL implementation rules:**
- Never use `paddingLeft`/`paddingRight` — use `paddingStart`/`paddingEnd`
- Never use `marginLeft`/`marginRight` — use `marginStart`/`marginEnd`
- Never use `alignItems: 'flex-start'` where start should be language-aware — use `flex-start` but verify direction
- Test Hebrew on a physical device. RTL rendering in simulators has edge cases.
- Custom icons (chevrons, arrows) need manual mirroring via `scaleX: -1` transform when RTL is active
- Language toggle must trigger a full app reload — this is a React Native constraint, not optional

**Translation workflow:** Keep `i18n/en.json` as source of truth. Hebrew strings in `i18n/he.json`. Use i18next's `t('key')` throughout — never hardcode UI strings.

### Infrastructure & Build

| Technology | Purpose | Why |
|------------|---------|-----|
| EAS Build (Expo Application Services) | Cloud builds for iOS/Android | No Mac required for iOS builds. Free tier sufficient for solo dev. Produces .ipa/.apk for TestFlight/Play Console. |
| EAS Submit | App store submission | Automates the store submission workflow. |
| GitHub Actions (optional) | CI for web build | Run `expo export` for PWA on push to main. Deploy to Vercel or Netlify. |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Expo (React Native) | Flutter | Dart learning curve, slower for JS devs, less NPM ecosystem |
| Framework | Expo (React Native) | Next.js PWA | No native feel, no haptics, limited offline, no app store path |
| State | Zustand | Redux Toolkit | 10x more boilerplate, overkill for solo dev scope |
| State | Zustand | React Context | Fine for simple state, but causes too many re-renders for animated gamification UI |
| Storage | MMKV | AsyncStorage | AsyncStorage is async (causes hydration flicker), slower by 10-30x |
| Backend | Supabase | Firebase | Firestore overkill for non-real-time app; unpredictable pricing; vendor lock-in |
| Backend | Supabase | Custom Node/Postgres | Too much infra to maintain for solo dev MVP |
| CMS | Bundled JSON | Sanity / Contentful | No content editors exist yet; adds cost + complexity for v1 |
| Animations | Reanimated + Lottie | React Native Animated API | Legacy API; runs on JS thread; lower performance |

---

## Installation (Core)

```bash
# Bootstrap
npx create-expo-app PromptPlay --template blank-typescript

# State & storage
npx expo install zustand react-native-mmkv

# Backend
npx expo install @supabase/supabase-js

# i18n
npm install i18next react-i18next
npx expo install expo-localization

# Animations
npx expo install react-native-reanimated
npx expo install lottie-react-native
npm install moti

# Gamification UX
npx expo install expo-haptics

# Navigation
npx expo install expo-router
```

**Note on MMKV:** Requires a development build (not Expo Go). Run `npx expo prebuild` then `npx expo run:android` or use EAS Build.

---

## Build Order Implications

1. **Set up i18n + RTL first** — retrofitting RTL onto an existing layout is painful. Wire up i18next, I18nManager, and `Start`/`End` padding conventions before writing a single screen.
2. **Zustand + MMKV store before any UI** — define the user state shape (XP, streak, lesson progress) first. Every screen depends on it.
3. **Supabase auth + sync second** — the local store works offline; Supabase syncs when online. This order means the app functions even without internet.
4. **Lesson JSON schema before content** — define the schema once, then fill it. Changing schema after 30 lessons are written is painful.
5. **Animations last** — add Reanimated/Lottie polish after core flows work. Animations are a UX layer, not a foundation.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Framework (Expo) | HIGH | Official docs, multiple 2025 sources, Stack Overflow survey data |
| State (Zustand + MMKV) | HIGH | Multiple verified sources, production usage confirmed |
| Backend (Supabase) | MEDIUM-HIGH | Well-documented, production-ready per 2025 sources; Firebase remains viable alternative |
| Content (JSON files) | HIGH | Obvious correct choice for v1 scope; no contradictory evidence |
| Animations (Reanimated + Lottie) | HIGH | Official Expo docs, Shopify/Expo internal usage confirmed |
| i18n/RTL | MEDIUM | React Native I18nManager approach is documented; RTL edge cases require physical device testing |
| Offline support | HIGH | MMKV + Zustand persist = offline-first with minimal effort |

---

## Open Questions / Flags for Phase Research

- **RTL testing infrastructure:** How to automate RTL regression tests in Expo? Needs phase-specific research when building the i18n system.
- **MMKV + Expo Go conflict:** During early development, Expo Go cannot run MMKV. Decision needed: use Expo Go with AsyncStorage during dev, switch to MMKV in production build? Or start with dev builds from day one?
- **Supabase RLS policy design:** Row Level Security for lesson progress needs careful design. Flag for backend phase.
- **Lottie asset sourcing:** LottieFiles has free gamification animations, but licensing (free vs premium) needs review before shipping.

---

## Sources

- [Expo vs Flutter — The New Stack (2025)](https://thenewstack.io/expo-vs-flutter-how-to-choose-the-right-mobile-framework/)
- [Flutter vs React Native 2026 — Pagepro](https://pagepro.co/blog/react-native-vs-flutter-which-is-better-for-cross-platform-app/)
- [Supabase vs Firebase 2025 — Iced Tea Labs](https://icedtealabs.com/indie-hacker/2025-12-30-firebase_vs_supabase_a_developers_honest_comparison/)
- [Supabase vs Firebase — Bytebase](https://www.bytebase.com/blog/supabase-vs-firebase/)
- [Zustand vs Redux — Better Stack](https://betterstack.com/community/guides/scaling-nodejs/zustand-vs-redux/)
- [State Management 2025 — DEV Community](https://dev.to/themachinepulse/do-you-need-state-management-in-2025-react-context-vs-zustand-vs-jotai-redux-1ho)
- [Expo Offline-First with MMKV + Zustand — Medium](https://medium.com/@nithinpatelmlm/expo-react-native-easy-offline-first-setup-in-expo-using-mmkv-and-zustand-react-native-mmkv-and-68f662c6bc3f)
- [React Native RTL i18n 2025 — Medium](https://medium.com/@devanshtiwari365/how-to-build-a-multi-language-app-with-i18n-in-react-native-2025-edition-24318950dd8c)
- [React Native I18nManager — Official Docs](https://reactnative.dev/docs/i18nmanager)
- [React Native Reanimated — Official Docs](https://docs.swmansion.com/react-native-reanimated/)
- [Lottie React Native — npm](https://www.npmjs.com/package/lottie-react-native)
- [Expo Animation Guide — Official Docs](https://docs.expo.dev/develop/user-interface/animation/)
- [Gamified Mobile Experiences with RN 2025 — Medium](https://medium.com/@TheblogStacker/building-gamified-mobile-experiences-with-react-native-in-2025-a1f5371685f4)
