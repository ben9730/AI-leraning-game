# Phase 1: Foundation — Research

**Researched:** 2026-03-28
**Domain:** Expo React Native project bootstrap, i18n/RTL, Zustand+MMKV persistence, content schema
**Confidence:** HIGH (stack confirmed by prior project research + official docs verification)

---

## Summary

Phase 1 establishes the four non-negotiable architectural foundations before any UI or content is authored: (1) Expo project structure with TypeScript and expo-router tab navigation, (2) RTL layout wiring via I18nManager + i18next from line one, (3) Zustand store with MMKV PersistenceAdapter for offline-first user progress, and (4) the TypeScript content schema with one seed lesson JSON.

All four must be done in this phase because they are retrofit-impossible. RTL layout uses directional CSS properties that must be in every component from creation — not backfilled. The content schema is a data contract that every downstream phase (lesson engine, exercise runner, gamification) depends on; changing it after 20 lessons are authored is a painful rewrite. The Zustand state shape defines what "user progress" means app-wide; it must be stable before gamification or skill tree code can be written.

One known blocker exists: `react-native-mmkv` does not run in Expo Go — it requires a development build (`expo prebuild` + `expo run:android`/`expo run:ios`). The project must decide at bootstrap whether to use dev builds from day one (recommended) or use AsyncStorage temporarily during development. This research recommends dev builds from day one to avoid the refactor cost and because EAS Build is free for solo devs.

**Primary recommendation:** Bootstrap with `create-expo-app --template tabs` (TypeScript), wire i18next + I18nManager immediately, set up Zustand+MMKV persist before writing any screen, define TypeScript content interfaces before writing any JSON.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | Project bootstrapped with Expo (React Native) + TypeScript | Expo SDK 52+, `create-expo-app --template tabs` bootstraps TypeScript + expo-router |
| FOUND-02 | Zustand store with MMKV persistence for user progress (XP, streaks, completed lessons) | Zustand 4.x persist middleware + react-native-mmkv 2.x StateStorage adapter pattern |
| FOUND-03 | i18n system with English + Hebrew support using `t('key')` translation function | i18next + react-i18next + expo-localization; `en.json` / `he.json` key files |
| FOUND-04 | RTL layout support using directional CSS properties from day one | I18nManager.forceRTL() + app reload; `paddingStart/End`, `marginStart/End` everywhere |
| FOUND-05 | Content schema defined — JSON format for lessons, exercises, scoring rubrics with `LocalizedString { en, he }` | TypeScript interfaces: Lesson, Exercise, MCQExercise, FreeTextExercise, PromptRubric, LocalizedString |
| FOUND-06 | Expo Router navigation structure (tab-based: Home, Skill Tree, Profile) | expo-router `app/(tabs)/_layout.tsx` with three tab entries |
| FOUND-07 | PersistenceAdapter interface wrapping MMKV for local storage | Abstract `PersistenceAdapter` interface; MMKV implementation; AsyncStorage fallback for dev if needed |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo | SDK 52+ | App shell, build tooling | Locked project decision |
| react-native | 0.76+ | UI rendering (ships with Expo) | Locked project decision |
| typescript | 5.x | Language | Locked project decision |
| expo-router | 4.x | File-based navigation, tab layout | Locked project decision |
| zustand | 4.x | Global state management | Locked project decision |
| react-native-mmkv | 2.x | Synchronous persistent storage | Locked project decision |
| i18next | 23.x | Translation function `t('key')` | Locked project decision |
| react-i18next | 14.x | React bindings for i18next | Companion to i18next |
| expo-localization | latest | Device locale detection | Official Expo i18n guide |
| expo-updates | latest | `Updates.reloadAsync()` for RTL reload | Required for I18nManager reload |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-native-async-storage/async-storage | 1.x | Fallback storage if dev build unavailable | Only if team chooses AsyncStorage-in-dev approach |
| expo-dev-client | latest | Enables development builds (required for MMKV) | Required from day one if using MMKV in dev |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-native-mmkv | AsyncStorage | AsyncStorage works in Expo Go but is async — causes hydration flicker; 10-30x slower |
| i18next | expo-localization alone | expo-localization only detects locale; i18next provides the `t()` system + pluralization |
| expo-router tabs | React Navigation | expo-router is file-based, simpler for this project; React Navigation requires manual config |

**Installation:**
```bash
# Bootstrap (creates TypeScript + expo-router tabs template)
npx create-expo-app PromptPlay --template tabs

# State + storage
npx expo install zustand react-native-mmkv

# i18n
npm install i18next react-i18next
npx expo install expo-localization expo-updates

# Dev build support (required for MMKV)
npx expo install expo-dev-client

# Prebuild native dirs
npx expo prebuild
```

---

## Architecture Patterns

### Recommended Project Structure

```
app/
  _layout.tsx              # Root layout — i18n provider, store hydration
  (tabs)/
    _layout.tsx            # Tab bar config: Home, Skill Tree, Profile
    index.tsx              # Home tab
    skill-tree.tsx         # Skill Tree tab
    profile.tsx            # Profile tab
src/
  store/
    useProgressStore.ts    # Zustand store with MMKV persist
    types.ts               # UserProgress interface
  i18n/
    index.ts               # i18next init, language change + RTL wiring
    en/
      common.json          # UI chrome strings
      gamification.json    # XP, streak, level text
    he/
      common.json
      gamification.json
  persistence/
    PersistenceAdapter.ts  # Abstract interface
    MMKVAdapter.ts         # MMKV implementation
  content/
    schema.ts              # TypeScript interfaces (source of truth)
    lessons/
      lesson-01-what-is-prompting.json
    curriculum.json        # Ordered lesson index for skill tree
  shared/
    hooks/                 # useTranslation wrapper, useProgress
    components/            # RTL-safe UI primitives
```

### Pattern 1: Zustand + MMKV Persist

**What:** Create a MMKV StateStorage adapter, pass it to Zustand's `persist` middleware via `createJSONStorage`.
**When to use:** For all global user state that must survive app close.

```typescript
// Source: https://github.com/mrousavy/react-native-mmkv/blob/main/docs/WRAPPER_ZUSTAND_PERSIST_MIDDLEWARE.md
import { MMKV } from 'react-native-mmkv'
import { StateStorage, persist, createJSONStorage } from 'zustand/middleware'

const storage = new MMKV()

const zustandMMKVStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.delete(name),
}

export const useProgressStore = create<UserProgress>()(
  persist(
    (set, get) => ({
      xpTotal: 0,
      streakCount: 0,
      lastActivityDate: '',
      completedLessons: [],
      unlockedLessons: ['lesson-01-what-is-prompting'],
      language: 'en',
      // actions...
    }),
    {
      name: 'user-progress',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
)
```

### Pattern 2: i18next Init + RTL Wiring

**What:** Initialize i18next with EN/HE resources; on language change, call `I18nManager.forceRTL()` then `Updates.reloadAsync()`.
**When to use:** App boot and language toggle.

```typescript
// Source: https://reactnative.dev/docs/i18nmanager
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { I18nManager } from 'react-native'
import * as Updates from 'expo-updates'
import * as Localization from 'expo-localization'

import enCommon from './en/common.json'
import heCommon from './he/common.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    he: { common: heCommon },
  },
  lng: Localization.locale.startsWith('he') ? 'he' : 'en',
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export const setLanguage = async (lang: 'en' | 'he') => {
  await i18n.changeLanguage(lang)
  const shouldBeRTL = lang === 'he'
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL)
    I18nManager.forceRTL(shouldBeRTL)
    await Updates.reloadAsync()   // Full app reload required — RTL is not hot-swappable
  }
}
```

### Pattern 3: Expo Router Tabs Layout

**What:** Three tabs (Home, Skill Tree, Profile) using `app/(tabs)/_layout.tsx`.
**When to use:** Tab navigation scaffold at bootstrap.

```typescript
// Source: https://docs.expo.dev/router/advanced/tabs/
import { Tabs } from 'expo-router'

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="skill-tree" options={{ title: 'Skill Tree' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  )
}
```

### Pattern 4: Content Schema (TypeScript Interfaces)

**What:** Define all content types in `src/content/schema.ts` as the single source of truth. All lesson JSON is validated against these types at build time via TypeScript import.

```typescript
// src/content/schema.ts — source of truth for all content types
export interface LocalizedString {
  en: string
  he: string
}

export interface PromptRubric {
  criteria: Array<{
    key: 'clarity' | 'specificity' | 'context' | 'intent'
    weight: number          // All weights sum to 1.0
    keywords: string[]      // Keyword presence → criterion met
    required: boolean
  }>
  passingScore: number      // 0–100
}

export interface Exercise {
  id: string
  type: 'mcq' | 'free-text' | 'pick-better' | 'fill-blank' | 'spot-problem'
  prompt: LocalizedString
}

export interface MCQExercise extends Exercise {
  type: 'mcq'
  options: LocalizedString[]
  correctIndex: number
  explanation: LocalizedString
}

export interface FreeTextExercise extends Exercise {
  type: 'free-text'
  simulatedResponse?: LocalizedString   // Pre-scripted "AI" reply to show
  rubric: PromptRubric
  positiveFeeback: LocalizedString
  improvementFeedback: LocalizedString
}

export interface Lesson {
  id: string
  order: number
  prerequisites: string[]
  xpReward: number
  content: {
    title: LocalizedString
    body: LocalizedString
    tip?: LocalizedString
  }
  exercises: (MCQExercise | FreeTextExercise | Exercise)[]
}
```

### Pattern 5: PersistenceAdapter Interface

**What:** Abstract interface so Zustand store is platform-agnostic. MMKV implementation for RN builds; could be swapped for AsyncStorage during dev if needed.

```typescript
// src/persistence/PersistenceAdapter.ts
export interface PersistenceAdapter {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
  clear(): void
}

// src/persistence/MMKVAdapter.ts
import { MMKV } from 'react-native-mmkv'
export class MMKVAdapter implements PersistenceAdapter {
  private storage = new MMKV()
  get = (key: string) => this.storage.getString(key) ?? null
  set = (key: string, value: string) => this.storage.set(key, value)
  remove = (key: string) => this.storage.delete(key)
  clear = () => this.storage.clearAll()
}
```

### Anti-Patterns to Avoid

- **Using `paddingLeft`/`paddingRight` in any style:** Breaks RTL. Use `paddingStart`/`paddingEnd` always. Set an ESLint rule to catch violations.
- **Storing `currentLevel` in state:** Derive it from `xpTotal` on every read via a pure `getLevel(xp)` function. Storing it causes desync bugs.
- **Hardcoding UI text as string literals in JSX:** All UI strings go through `t('key')`. Hardcoded strings cannot be translated.
- **Writing lesson content into i18n files:** Lesson body text lives in `content/lessons/*.json` as `LocalizedString`. i18n files are for UI chrome only (buttons, labels, error messages).
- **Calling `I18nManager.forceRTL()` without `Updates.reloadAsync()`:** RTL requires a full app reload to take effect. The call is not complete without the reload.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Persistent key-value storage | Custom file I/O or SQLite wrapper | react-native-mmkv | MMKV handles serialization, encryption, cross-platform edge cases, C++ native speed |
| Locale detection | Platform.OS conditionals | expo-localization | Handles locale string normalization, region variants, Expo SDK lifecycle |
| Translation function | Custom `translate(key, lang)` map lookup | i18next + react-i18next | Handles pluralization, interpolation, fallback chains, namespace splitting |
| RTL reload | Custom bridge module | I18nManager.forceRTL + Updates.reloadAsync | I18nManager is the official RN API; Updates.reloadAsync is the official Expo API |
| JSON schema validation | Runtime type-checking code | TypeScript interfaces + import | Compile-time validation; zero runtime cost |

**Key insight:** Every item in this table has known edge cases (locale region variants, pluralization, RTL Android/iOS differences) that are fully handled by the listed libraries. Custom implementations discover these edge cases in production.

---

## Common Pitfalls

### Pitfall 1: MMKV Fails in Expo Go
**What goes wrong:** `npx expo start` opens Expo Go → import of `react-native-mmkv` crashes with "Native module not found."
**Why it happens:** MMKV is a native C++ module that must be compiled into the app binary. Expo Go is a pre-built binary that cannot include custom native modules.
**How to avoid:** Run `npx expo prebuild` then `npx expo run:android` / `npx expo run:ios` from day one. Never attempt to run this project in Expo Go after MMKV is installed.
**Warning signs:** Any "Native module not found" or "NativeModule is null" error at runtime.

### Pitfall 2: I18nManager.isRTL Returns False in Expo CNG
**What goes wrong:** `I18nManager.isRTL` reads as `false` even after `forceRTL(true)`, but the layout visually flips correctly. This causes guard logic (`if (I18nManager.isRTL !== shouldBeRTL)`) to malfunction.
**Why it happens:** Known Expo bug in Continuous Native Generation projects (expo/expo#34225). The native flag is set correctly but the JS-side property read is stale.
**How to avoid:** Store language preference in MMKV/AsyncStorage and use that as the RTL source of truth, not `I18nManager.isRTL`. Derive RTL state from `language === 'he'`, not from the I18nManager read.
**Warning signs:** RTL toggling fires on every app launch instead of only on language change.

### Pitfall 3: RTL Only Tested in Simulator
**What goes wrong:** Simulator RTL looks correct, but physical Android/iOS device shows icon mirroring errors, text alignment bugs, or flex-direction inconsistencies.
**Why it happens:** Simulators render RTL with known edge case gaps vs. native rendering engine.
**How to avoid:** Test every new screen in Hebrew locale on a physical device as it is built. Don't defer RTL device testing to a final QA pass.
**Warning signs:** Arrow icons point wrong direction, nested flex containers misalign.

### Pitfall 4: Content Schema Changes After Content Is Authored
**What goes wrong:** Phase 2 or 3 reveals the schema needs a new field (e.g., a new exercise type, a `difficulty` property). All existing JSON files must be updated.
**Why it happens:** Schema designed too narrowly in Phase 1, without consulting all downstream exercise types.
**How to avoid:** Design the schema with all planned exercise types in mind (mcq, free-text, pick-better, fill-blank, spot-problem) even if only one is implemented in Phase 2. Use optional fields (`?`) for phase-2+ properties. The seed lesson JSON in Phase 1 should exercise all schema fields.
**Warning signs:** Exercise types from REQUIREMENTS.md don't map cleanly to the schema.

### Pitfall 5: Tabs Not Matching Navigation Plan
**What goes wrong:** Tab names created in Phase 1 don't match the navigation structure needed in Phase 4 (Skill Tree, Onboarding). Renaming tabs later breaks expo-router file-based routes.
**Why it happens:** File names in `app/(tabs)/` are the route names in expo-router. Renaming them is a refactor.
**How to avoid:** Name tab files exactly as the final navigation requires: `index.tsx` (Home), `skill-tree.tsx` (Skill Tree), `profile.tsx` (Profile).

---

## Code Examples

### UserProgress State Shape

```typescript
// src/store/types.ts
export interface XPTransaction {
  amount: number
  source: 'lesson_complete' | 'exercise_pass' | 'streak_bonus' | 'perfection_bonus'
  timestamp: number   // Unix ms
}

export interface UserProgress {
  userId: string            // UUID generated locally on first launch
  xpTotal: number
  xpHistory: XPTransaction[]
  streakCount: number
  lastActivityDate: string  // ISO date YYYY-MM-DD, local timezone
  completedLessons: string[] // Lesson IDs
  unlockedLessons: string[]  // Computed + cached; never source of truth
  language: 'en' | 'he'
  dailyGoal: 'casual' | 'regular' | 'serious' | null  // Set during onboarding
}

// Current level is NEVER stored — always derived:
export const getLevel = (xp: number): number => {
  // Example thresholds — tune during gamification phase
  const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5000]
  return thresholds.filter(t => xp >= t).length
}
```

### Seed Lesson JSON (validates schema end-to-end)

```json
{
  "id": "lesson-01-what-is-prompting",
  "order": 1,
  "prerequisites": [],
  "xpReward": 10,
  "content": {
    "title": { "en": "What Is Prompting?", "he": "מה זה פרומפטינג?" },
    "body": {
      "en": "A prompt is the message you send to an AI. The quality of your prompt directly affects the quality of the answer you get back.",
      "he": "פרומפט הוא ההודעה שאתה שולח לבינה מלאכותית. איכות הפרומפט שלך משפיעה ישירות על איכות התשובה שתקבל."
    },
    "tip": {
      "en": "Works the same in ChatGPT, Claude, or Gemini.",
      "he": "עובד אותו הדבר ב-ChatGPT, Claude או Gemini."
    }
  },
  "exercises": [
    {
      "id": "lesson-01-ex-01",
      "type": "mcq",
      "prompt": {
        "en": "What is a prompt?",
        "he": "מה זה פרומפט?"
      },
      "options": [
        { "en": "A message you send to an AI", "he": "הודעה שאתה שולח לבינה מלאכותית" },
        { "en": "A type of computer program", "he": "סוג של תוכנת מחשב" },
        { "en": "A keyboard shortcut", "he": "קיצור מקלדת" }
      ],
      "correctIndex": 0,
      "explanation": {
        "en": "Correct! A prompt is simply the message or instruction you give to an AI.",
        "he": "נכון! פרומפט הוא פשוט ההודעה או ההוראה שאתה נותן לבינה מלאכותית."
      }
    }
  ]
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AsyncStorage for RN persistence | react-native-mmkv | 2021+ | Synchronous reads, no hydration flicker, 10-30x faster |
| React Navigation manual config | expo-router file-based | SDK 50 (2023) | Navigation = file structure; zero config |
| react-native-i18n (unmaintained) | i18next + react-i18next | 2020+ | Battle-tested, web/RN parity, active maintenance |
| Custom tabs with React Navigation | expo-router (tabs) group | SDK 50 (2023) | `app/(tabs)/` group is now the standard pattern |
| I18nManager reload via RNRestart | Updates.reloadAsync() | Expo SDK 46+ | No extra native dep; uses official Expo reload API |

**Deprecated/outdated:**
- `react-native-i18n`: Unmaintained since 2019 — use i18next
- `@react-native-community/async-storage`: Replaced by `@react-native-async-storage/async-storage` (scoped package)
- `react-native-restart` for RTL reload: Use `expo-updates` `Updates.reloadAsync()` instead in Expo projects
- Expo Router v2 `_layout.tsx` patterns: SDK 52 uses Expo Router v4; group syntax `(tabs)` unchanged but some navigator options differ

---

## Open Questions

1. **MMKV dev workflow decision**
   - What we know: MMKV requires a development build; Expo Go will crash
   - What's unclear: Whether the team wants to use `AsyncStorage` during early dev and switch to MMKV before first build, or commit to dev builds from day one
   - Recommendation: **Dev builds from day one.** `npx expo run:android` works on Windows with Android Studio. Avoids writing code against AsyncStorage that must be replaced. EAS Build is free for solo devs. Decision should be made and documented in plan 01-02 before execution begins.

2. **I18nManager.isRTL bug in Expo CNG (expo/expo#34225)**
   - What we know: `isRTL` property may return `false` even when RTL layout is active, in Expo projects using Continuous Native Generation
   - What's unclear: Whether this is fixed in SDK 52 or still present; bug was filed against SDK 51
   - Recommendation: Do not rely on `I18nManager.isRTL` as a guard. Use stored language preference (`language === 'he'`) as the sole RTL source of truth. Verify on a physical device during plan 01-01 execution.

3. **RTL testing automation**
   - What we know: No automated tool exists to catch RTL regressions in Expo CI as of 2025
   - What's unclear: Whether Detox or Maestro can drive a Hebrew locale test on the emulator
   - Recommendation: Establish a manual RTL checklist (physical device, Hebrew locale) per plan. Defer automated RTL CI to Phase 6 if Maestro proves feasible.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — Wave 0 must install Jest + testing-library |
| Config file | `jest.config.js` — Wave 0 |
| Quick run command | `npx jest --testPathPattern=store --passWithNoTests` |
| Full suite command | `npx jest --passWithNoTests` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-02 | Zustand store initializes with correct default state | unit | `npx jest src/store/useProgressStore.test.ts -x` | Wave 0 |
| FOUND-02 | MMKV persist: state survives simulated re-hydration | unit | `npx jest src/store/useProgressStore.test.ts -x` | Wave 0 |
| FOUND-03 | `t('key')` returns English string for `en` locale | unit | `npx jest src/i18n/i18n.test.ts -x` | Wave 0 |
| FOUND-03 | `t('key')` returns Hebrew string for `he` locale | unit | `npx jest src/i18n/i18n.test.ts -x` | Wave 0 |
| FOUND-04 | `setLanguage('he')` sets `I18nManager.forceRTL(true)` | unit | `npx jest src/i18n/i18n.test.ts -x` | Wave 0 |
| FOUND-05 | Seed lesson JSON is valid against TypeScript schema | unit | `npx jest src/content/schema.test.ts -x` | Wave 0 |
| FOUND-05 | `LocalizedString` has both `en` and `he` fields | unit | `npx jest src/content/schema.test.ts -x` | Wave 0 |
| FOUND-07 | `MMKVAdapter` implements all `PersistenceAdapter` methods | unit | `npx jest src/persistence/MMKVAdapter.test.ts -x` | Wave 0 |
| FOUND-01, FOUND-06 | App launches, tabs render (Home/Skill Tree/Profile) | smoke | Manual — expo-router integration testing not automated in Wave 0 | manual-only |

**Note:** FOUND-01 (project bootstrap) and FOUND-06 (tab navigation) are verified by building and running the app. No unit tests are appropriate for file structure or navigation scaffold — smoke test via `npx expo start` and visual confirmation.

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern="store|i18n|content|persistence" --passWithNoTests`
- **Per wave merge:** `npx jest --passWithNoTests`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/store/useProgressStore.test.ts` — covers FOUND-02
- [ ] `src/i18n/i18n.test.ts` — covers FOUND-03, FOUND-04
- [ ] `src/content/schema.test.ts` — covers FOUND-05
- [ ] `src/persistence/MMKVAdapter.test.ts` — covers FOUND-07
- [ ] `jest.config.js` + `package.json` test script — framework install
- [ ] Framework install: `npm install --save-dev jest @types/jest ts-jest @testing-library/react-native`

---

## Sources

### Primary (HIGH confidence)
- [React Native I18nManager — Official Docs](https://reactnative.dev/docs/i18nmanager) — forceRTL API, allowRTL
- [Expo Router Tabs — Official Docs](https://docs.expo.dev/router/advanced/tabs/) — tab layout file structure, SDK 52 patterns
- [react-native-mmkv Zustand wrapper — Official GitHub](https://github.com/mrousavy/react-native-mmkv/blob/main/docs/WRAPPER_ZUSTAND_PERSIST_MIDDLEWARE.md) — StateStorage adapter pattern
- Project STACK.md and ARCHITECTURE.md — prior research already verified against official sources (2026-03-28)

### Secondary (MEDIUM confidence)
- [expo/expo issue #34225](https://github.com/expo/expo/issues/34225) — I18nManager.isRTL bug in Expo CNG; affects guard logic
- [Implementing RTL in React Native Expo — GeekyAnts](https://geekyants.com/en-us/blog/implementing-rtl-right-to-left-in-react-native-expo---a-step-by-step-guide) — Step-by-step RTL guide, confirmed against official docs
- [Expo Offline-First with MMKV + Zustand — Medium](https://medium.com/@nithinpatelmlm/expo-react-native-easy-offline-first-setup-in-expo-using-mmkv-and-zustand-react-native-mmkv-and-68f662c6bc3f) — Zustand+MMKV integration pattern

### Tertiary (LOW confidence — use for orientation only)
- [zustand-mmkv-storage npm package](https://www.npmjs.com/package/zustand-mmkv-storage) — Third-party adapter; the official MMKV Zustand docs pattern (StateStorage interface) is preferred over this package

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries locked by project decision; versions confirmed in prior research
- Architecture patterns: HIGH — code patterns drawn from official docs and project ARCHITECTURE.md
- Pitfalls: HIGH — MMKV/Expo Go conflict is documented fact; RTL/isRTL bug is a filed GitHub issue; other pitfalls from prior research
- Validation architecture: MEDIUM — no test infrastructure exists yet; test file paths are planned, not verified

**Research date:** 2026-03-28
**Valid until:** 2026-06-28 (90 days — Expo SDK releases quarterly; check if SDK 53 drops before executing)
