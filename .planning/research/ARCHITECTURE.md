# Architecture Patterns: Web-First PWA Rebuild

**Domain:** Web-first PWA rebuild of PromptPlay (gamified AI prompting course)
**Researched:** 2026-03-28
**Confidence:** HIGH (based on direct codebase analysis + verified web ecosystem research)

---

## Recommended Architecture

### High-Level: Vite React SPA with Shared Core Package

The web app is a **Vite + React 19 + TypeScript SPA** deployed as a PWA. No server-side rendering -- all content is bundled JSON, there is no SEO requirement (app behind onboarding, not a content site), and existing pure-TS logic ports directly into a client-side React app.

The project uses a **monorepo structure**: a new `web/` directory alongside the existing `PromptPlay/` directory, with portable logic extracted into `shared/`.

```
code-learning-game/
  PromptPlay/              # Existing Expo/RN app (untouched)
  shared/                  # Extracted pure TS (zero framework deps)
    src/
      content/
        schema.ts          # Types: Lesson, Exercise, LocalizedString, etc.
        curriculum.ts      # Chapter[] + curriculum ordering
        loader.ts          # Platform-agnostic interface (impl per consumer)
        lessons/           # 20 lesson JSON files (moved here)
      gamification/
        engine.ts          # calcXP, calcStreakUpdate, shouldGrantFreeze
        badges.ts          # deriveBadges, BADGE_DEFINITIONS
        constants.ts       # LEVEL_THRESHOLDS, XP values, streak tiers
      exercise/
        evaluators/        # 6 evaluator functions (pure TS)
        types.ts           # EvaluationResult interface
      store/
        types.ts           # UserProgress, XPTransaction, getLevel()
      i18n/
        en/common.json     # English UI strings
        he/common.json     # Hebrew UI strings
  web/                     # New Vite React SPA
    index.html
    vite.config.ts
    tsconfig.json
    tailwind.config.ts
    public/
      manifest.json
      service-worker.js
      icons/
    src/
      main.tsx             # Entry: React root + i18n init + store hydration gate
      App.tsx              # BrowserRouter + Routes + Layout shell
      routes/              # Page components
        Home.tsx           # Dashboard (today's lesson, streak, XP)
        SkillTree.tsx      # Curriculum map
        Lesson.tsx         # Dynamic: /lesson/:lessonId
        Profile.tsx        # Stats, badges, settings
        Onboarding.tsx     # Goal selection + first lesson funnel
      features/
        exercise/
          ExerciseRunner.tsx
          registry.ts      # Web exercise registry (type -> component)
          components/      # 6 web exercise cards (MCQ, FreeText, etc.)
        lesson/
          LessonScreen.tsx
          LessonContent.tsx
          LessonCompletion.tsx
          useLessonSession.ts  # Portable hook (import from shared or copy)
        gamification/
          StreakDisplay.tsx
          LessonCelebration.tsx
          LevelUpModal.tsx
          BadgeList.tsx
        skill-tree/
          SkillTreeNode.tsx
          ChapterHeader.tsx
          useSkillTreeData.ts
        pwa/
          InstallBanner.tsx
          useInstallPrompt.ts
          useServiceWorker.ts
        onboarding/
          GoalSelector.tsx
      store/
        useProgressStore.ts   # Zustand + persist(localStorage)
      i18n/
        index.ts              # react-i18next init (browser-native)
      ui/                     # Design system primitives
        Button.tsx
        Card.tsx
        Modal.tsx
        ProgressBar.tsx
        Layout.tsx            # App shell: nav bar, content area, RTL dir
      lib/
        supabase.ts
      styles/
        globals.css           # CSS custom properties (design tokens)
      hooks/
        useLocale.ts
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `shared/` | Pure TS logic: content schema, loaders, evaluators, gamification math, types | Imported by `web/` (and optionally `PromptPlay/`) |
| `web/src/store/` | Zustand state: progress, XP, streaks, unlocks, language | All features read/write via hooks |
| `web/src/features/exercise/` | Exercise rendering + evaluation orchestration | Imports evaluators from `shared/`, updates store on completion |
| `web/src/features/lesson/` | Lesson flow: intro -> exercises -> completion | Uses `useLessonSession` (portable), drives ExerciseRunner |
| `web/src/features/gamification/` | XP display, streak UI, badges, celebrations | Reads store, imports `deriveBadges`/`calcXP` from `shared/` |
| `web/src/features/skill-tree/` | Visual curriculum map with node states | Reads store + `shared/content/curriculum` |
| `web/src/features/pwa/` | Install banner, service worker registration | Browser APIs only |
| `web/src/routes/` | Page-level composition (compose features into pages) | Composes features, handles route params |
| `web/src/ui/` | Design system primitives (Button, Card, Modal, etc.) | Used by all features |
| `web/src/i18n/` | i18next init + RTL direction management | Provides `useTranslation`, sets `dir` on `<html>` |

---

## Data Flow: Core User Journey

```
User opens app
  -> main.tsx renders App with hydration gate (wait for store rehydration)
  -> React Router renders current route
  -> SkillTree reads store.completedLessons + shared/curriculum -> renders node states

User selects lesson (clicks unlocked node)
  -> Navigate to /lesson/:lessonId
  -> Lesson route loads lesson via shared/content/loader
  -> LessonScreen renders intro content (RTL-aware)

User reaches exercise
  -> useLessonSession advances step to { phase: 'exercise', index: 0 }
  -> ExerciseRunner looks up EXERCISE_REGISTRY[exercise.type]
  -> Renders correct card component (e.g., MCQCard)

User submits answer
  -> Card component calls evaluator function (from shared/exercise/evaluators/)
  -> Evaluator returns EvaluationResult { score, passed, feedback }
  -> Card shows feedback, then calls onComplete(result)

Exercise complete
  -> useLessonSession advances to next exercise or { phase: 'complete' }

Lesson complete
  -> LessonCompletion fires: store.addXP(), store.completeLesson(), store.updateStreak()
  -> Zustand persist middleware auto-saves to localStorage
  -> Derived state (badges via deriveBadges, level via getLevel) recomputes
  -> Celebration UI renders (XP animation, optional level-up modal)
  -> Unlock next lesson(s) based on prerequisites

UI updates
  -> SkillTree re-renders with new node states
  -> Home dashboard shows updated streak/XP
```

**Key rule:** UI never writes to shared logic directly. UI calls store actions, store actions call shared pure functions, results flow back through React state.

---

## Portable Code Strategy

### Tier 1: Direct Copy (zero changes needed)

These files have ZERO framework dependencies -- pure TypeScript only:

| File | Lines | Why Portable |
|------|-------|-------------|
| `content/schema.ts` | 179 | Pure types + `validateRubricWeights()` function |
| `content/curriculum.ts` | 54 | Pure data: `Chapter[]` array + `curriculum` string[] |
| `content/lessons/*.json` | ~20 files | Static JSON data |
| `gamification/engine.ts` | 112 | Pure functions: `calcStreakUpdate`, `calcXP`, `shouldGrantFreeze`, `offsetDate` |
| `gamification/badges.ts` | 94 | Pure function: `deriveBadges` + `BADGE_DEFINITIONS` array |
| `gamification/constants.ts` | 22 | Pure constants: `LEVEL_THRESHOLDS`, `BASE_LESSON_XP`, `STREAK_MULTIPLIER_TIERS` |
| `exercise/evaluators/*.ts` | 6 files | Pure evaluator functions (no UI deps) |
| `exercise/types.ts` | 9 | Pure type: `EvaluationResult` |
| `store/types.ts` | 40 | Pure types + `getLevel()` derived function |
| `i18n/en/common.json` | - | Static translation strings |
| `i18n/he/common.json` | - | Static translation strings |
| `features/lesson/useLessonSession.ts` | 49 | Pure React hooks only (`useState`, `useRef`) -- no RN deps |
| `features/skill-tree/skillTreeUtils.ts` | 44 | Pure functions: `deriveNodeStates`, `getCurrentLessonId` |

### Tier 2: Light Adaptation (minor changes)

| File | What Changes | Effort |
|------|-------------|--------|
| `content/loader.ts` | Replace 20 static `import` + `require()` calls with `import.meta.glob` (Vite) | Small: ~15 lines |
| `store/useProgressStore.ts` | Remove `Platform.OS` check (line 39), remove MMKV import, use `createJSONStorage(() => localStorage)` | Small: ~5 line changes |
| `i18n/index.ts` | Remove `expo-localization` + `I18nManager` + `reloadApp()`; use `navigator.language` + `document.documentElement.dir` | Medium: rewrite ~20 lines |
| `features/skill-tree/useSkillTreeData.ts` | Check for RN-specific imports; hook logic itself is likely portable | Tiny: verify and fix imports |

### Tier 3: Full Rebuild (new web components)

| Component | RN Dependency | Web Replacement |
|-----------|--------------|----------------|
| MCQCard, FreeTextCard, FillBlankCard, PickBetterCard, SpotProblemCard, SimulatedChatCard | `View`, `Text`, `Pressable`, `StyleSheet`, `expo-haptics` | HTML/CSS + Tailwind, `<button>`, optional Web Vibration API |
| ExerciseRunner | `View`, `Text`, `StyleSheet` | HTML `<div>` + Tailwind |
| SkillTreeNode, ChapterHeader | RN layout primitives | HTML/CSS with Tailwind |
| LessonScreen, LessonContentScreen, LessonCompletionScreen | RN layout + Expo Router navigation | React Router `useParams` + HTML/CSS |
| StreakDisplay, LessonCelebration, LevelUpModal | Reanimated + Lottie animations | CSS animations + optional Lottie-web |
| App shell / navigation | Expo Router (`Stack`, `Tabs`) | React Router `<Routes>` + bottom tab bar component |
| GoalSelector, AccountPromptModal | RN `Modal`, `Pressable` | HTML `<dialog>` or custom modal |
| InstallBanner | `Platform.OS` guard | Direct browser API (remove guard) |

---

## Patterns to Follow

### Pattern 1: Exercise Type Registry (preserved)

The existing registry pattern carries over unchanged. Only the component implementations change from RN to web.

```typescript
// web/src/features/exercise/registry.ts
import type { Exercise } from '@shared/content/schema'
import type { EvaluationResult } from '@shared/exercise/types'
import { MCQCard } from './components/MCQCard'
import { FreeTextCard } from './components/FreeTextCard'
import { PickBetterCard } from './components/PickBetterCard'
import { FillBlankCard } from './components/FillBlankCard'
import { SpotProblemCard } from './components/SpotProblemCard'
import { SimulatedChatCard } from './components/SimulatedChatCard'

export type ExerciseComponentProps = {
  exercise: Exercise
  onComplete: (result: EvaluationResult) => void
}

export const EXERCISE_REGISTRY: Partial<
  Record<Exercise['type'], React.ComponentType<ExerciseComponentProps>>
> = {
  mcq: MCQCard,
  'free-text': FreeTextCard,
  'pick-better': PickBetterCard,
  'fill-blank': FillBlankCard,
  'spot-problem': SpotProblemCard,
  'simulated-chat': SimulatedChatCard,
}
```

**Extension contract:** Adding a new exercise type = (1) add evaluator to `shared/exercise/evaluators/`, (2) add component to `web/src/features/exercise/components/`, (3) register in `registry.ts`. Zero other files change.

### Pattern 2: Zustand Store with localStorage Persistence

Simplified from the existing store: no MMKV branching, no Platform.OS checks, no Expo dependencies.

```typescript
// web/src/store/useProgressStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { UserProgress, XPTransaction, getLevel } from '@shared/store/types'
import { calcStreakUpdate, shouldGrantFreeze } from '@shared/gamification/engine'

const todayISO = (): string => new Date().toLocaleDateString('en-CA')

type ProgressStore = UserProgress & {
  _hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      setHasHydrated: (v: boolean) => set({ _hasHydrated: v }),

      // Same initial state as existing (minus Platform.OS check)
      userId: crypto.randomUUID(),
      xpTotal: 0,
      xpHistory: [] as XPTransaction[],
      streakCount: 0,
      lastActivityDate: '',
      completedLessons: [] as string[],
      unlockedLessons: ['lesson-01-what-is-prompting'] as string[],
      language: 'en' as const,
      dailyGoal: null,  // Always null on web -- onboarding sets it
      streakFreezes: 0,
      peakStreak: 0,
      pendingLevelUp: null,
      streakFreezeUsedEver: false,

      // Actions: identical to existing store
      addXP: (amount, source) => { /* same implementation */ },
      completeLesson: (lessonId) => { /* same */ },
      unlockLesson: (lessonId) => { /* same */ },
      setLanguage: (lang) => set({ language: lang }),
      setDailyGoal: (goal) => set({ dailyGoal: goal }),
      updateStreak: () => { /* same calcStreakUpdate logic */ },
      clearPendingLevelUp: () => set({ pendingLevelUp: null }),
      consumeStreakFreeze: () => { /* same */ },
      grantStreakFreeze: () => { /* same */ },
    }),
    {
      name: 'user-progress',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { _hasHydrated, setHasHydrated, ...persisted } = state
        return persisted
      },
      onRehydrateStorage: () => (state) => {
        if (state && state.peakStreak === undefined) {
          state.peakStreak = state.streakCount
        }
        useProgressStore.getState().setHasHydrated(true)
      },
    }
  )
)

export const useHasHydrated = () => useProgressStore(s => s._hasHydrated)
```

### Pattern 3: RTL via CSS Logical Properties + dir Attribute

Replace React Native's `I18nManager.forceRTL()` with the web-native approach.

**i18n initialization:**
```typescript
// web/src/i18n/index.ts
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import enCommon from '@shared/i18n/en/common.json'
import heCommon from '@shared/i18n/he/common.json'

const detectedLang = navigator.language?.startsWith('he') ? 'he' : 'en'

i18next.use(initReactI18next).init({
  resources: { en: { common: enCommon }, he: { common: heCommon } },
  lng: detectedLang,
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export function setLanguage(lang: 'en' | 'he'): void {
  i18next.changeLanguage(lang)
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
  document.documentElement.lang = lang
}

// Set initial direction on load
document.documentElement.dir = detectedLang === 'he' ? 'rtl' : 'ltr'
document.documentElement.lang = detectedLang

export default i18next
```

**CSS convention -- mandatory for all components:**
```css
/* ALWAYS use logical properties -- NEVER physical (left/right) */
.card {
  padding-inline-start: 1rem;     /* replaces paddingStart in RN */
  padding-inline-end: 1rem;       /* replaces paddingEnd in RN */
  margin-block-start: 0.5rem;
  text-align: start;              /* NOT text-align: left */
}
```

**Tailwind v4 RTL:** Tailwind v4 supports logical properties natively. Use `ps-4` (padding-inline-start) and `pe-4` (padding-inline-end) instead of `pl-4`/`pr-4`. Use `ms-4`/`me-4` instead of `ml-4`/`mr-4`.

### Pattern 4: Content Loading via Vite import.meta.glob

Replace Metro's static `require()` imports with Vite's glob import.

```typescript
// shared/content/loader.ts (web-compatible version)
import type { Lesson } from './schema'

// Vite resolves at build time -- all 20 JSONs become part of the bundle
const lessonModules = import.meta.glob<{ default: Lesson }>(
  './lessons/*.json',
  { eager: true }
)

const lessons: Record<string, Lesson> = {}
for (const [path, mod] of Object.entries(lessonModules)) {
  const id = path.replace('./lessons/', '').replace('.json', '')
  lessons[id] = mod.default
}

export function loadLesson(id: string): Lesson {
  const lesson = lessons[id]
  if (!lesson) throw new Error(`Lesson not found: ${id}`)
  return lesson
}

export function getAllLessonIds(): string[] {
  return Object.keys(lessons)
}
```

**Note:** `import.meta.glob` is Vite-specific. If both PromptPlay and web need to consume `shared/`, the loader should be split: `shared/content/loader.ts` defines the interface, `web/src/content/webLoader.ts` implements it with `import.meta.glob`, and PromptPlay keeps its existing static imports.

### Pattern 5: React Router Route Structure

Map existing Expo Router file-based routes to React Router declarative routes:

```typescript
// web/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { Layout } from './ui/Layout'
import { Home } from './routes/Home'
import { SkillTree } from './routes/SkillTree'
import { Lesson } from './routes/Lesson'
import { Profile } from './routes/Profile'
import { Onboarding } from './routes/Onboarding'
import { useProgressStore } from './store/useProgressStore'

export function App() {
  const dailyGoal = useProgressStore(s => s.dailyGoal)

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect to onboarding if dailyGoal not set */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<Layout />}>
          <Route index element={dailyGoal ? <Home /> : <Navigate to="/onboarding" />} />
          <Route path="skill-tree" element={<SkillTree />} />
          <Route path="lesson/:lessonId" element={<Lesson />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

**Route mapping from Expo Router:**

| Expo Router Path | React Router Path | Component | Notes |
|-----------------|------------------|-----------|-------|
| `app/(tabs)/index.tsx` | `/` | Home | Dashboard with streak, XP, continue button |
| `app/(tabs)/skill-tree.tsx` | `/skill-tree` | SkillTree | Full curriculum map |
| `app/(tabs)/profile.tsx` | `/profile` | Profile | Stats, badges, language toggle |
| `app/(lesson)/[lessonId].tsx` | `/lesson/:lessonId` | Lesson | Dynamic route, full-screen (no tab bar) |
| `app/(onboarding)/welcome.tsx` | `/onboarding` | Onboarding | Goal selection, first-time flow |

### Pattern 6: Mobile-First Responsive Layout

The app targets mobile browsers primarily (PWA installed on phone). Layout should be mobile-first with a max-width container for desktop.

```typescript
// web/src/ui/Layout.tsx
import { Outlet, NavLink } from 'react-router'

export function Layout() {
  return (
    <div className="min-h-dvh flex flex-col bg-white mx-auto max-w-lg">
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom tab bar (mobile pattern) */}
      <nav className="flex border-t border-gray-200 bg-white">
        <NavLink to="/" className={navLinkClass}>Home</NavLink>
        <NavLink to="/skill-tree" className={navLinkClass}>Learn</NavLink>
        <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
      </nav>
    </div>
  )
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Importing from PromptPlay/ directly
**What:** Importing shared logic directly from `PromptPlay/src/` in the web app.
**Why bad:** Creates tight coupling; RN-specific imports leak in; path aliases diverge; changes in one app break the other.
**Instead:** Extract shared code into `shared/` package. Both apps import from there via TypeScript path aliases (`@shared/`).

### Anti-Pattern 2: Using physical CSS properties
**What:** Writing `margin-left`, `padding-right`, `text-align: left`, `float: left`.
**Why bad:** Breaks RTL layout. Requires manual overrides for Hebrew.
**Instead:** Logical properties exclusively: `margin-inline-start`, `padding-inline-end`, `text-align: start`. In Tailwind: `ms-*`, `me-*`, `ps-*`, `pe-*`.

### Anti-Pattern 3: Replicating StyleSheet.create
**What:** Creating JS objects for styles to mirror the RN pattern.
**Why bad:** Unnecessary abstraction on the web. RN's StyleSheet exists because the native bridge needs serializable style objects. Web has native CSS.
**Instead:** Tailwind utility classes for rapid development. CSS custom properties for design tokens shared across components.

### Anti-Pattern 4: Platform.OS checks in web-only code
**What:** Using `if (Platform.OS === 'web')` guards in the web codebase.
**Why bad:** This is a web-only app. There is no other platform. Dead code.
**Instead:** Use browser APIs directly. The `shared/` package must be platform-agnostic (no browser APIs, no RN APIs).

### Anti-Pattern 5: Over-abstracting persistence
**What:** Building a `PersistenceAdapter` interface with multiple implementations for the web app.
**Why bad:** Web only uses `localStorage`. The adapter pattern existed in PromptPlay because of MMKV (native) vs localStorage (web) branching. On web-only, it adds indirection for zero benefit.
**Instead:** Use Zustand's built-in `createJSONStorage(() => localStorage)` directly.

### Anti-Pattern 6: Storing exercise state in global store
**What:** Putting the currently selected answer, submission state, or feedback into Zustand.
**Why bad:** Exercise state is ephemeral -- it resets on each exercise. Global store causes unnecessary re-renders and state leaks.
**Instead:** Use local React `useState` within each exercise card component (as the existing codebase correctly does).

---

## Scalability Considerations

| Concern | Current (20 lessons) | At 100 lessons | At 500 lessons |
|---------|---------------------|----------------|----------------|
| Bundle size | All lessons bundled (~200KB JSON) | ~1MB, still acceptable | Must lazy-load per chapter |
| Content loading | `import.meta.glob` eager | Switch to lazy glob (`eager: false`) | Code-split by chapter |
| State (localStorage) | ~5KB | ~20KB (more completedLessons) | ~50KB, still well within 5MB limit |
| Skill tree rendering | Render all nodes | Paginate by chapter | Virtual scroll required |
| i18n bundles | 2 locales, ~10KB each | Same | Same (UI strings stable) |

**Recommendation:** Start with eager imports. The current 20 lessons produce ~200KB of bundled JSON. Lazy loading is a premature optimization until content exceeds 50 lessons.

---

## Integration Points (Shared <-> Web)

| Integration Point | Shared Module | Web Consumer | Direction |
|-------------------|--------------|-------------|-----------|
| Exercise evaluation | `shared/exercise/evaluators/*` | Exercise card components | Card calls evaluator, gets EvaluationResult |
| Content loading | `shared/content/` (schema, curriculum) | Lesson route, skill tree, home | Web loader wraps shared data |
| XP calculation | `shared/gamification/engine.calcXP` | Store `addXP` action | Store calls calcXP for total |
| Streak logic | `shared/gamification/engine.calcStreakUpdate` | Store `updateStreak` action | Store calls engine, updates state |
| Badge derivation | `shared/gamification/badges.deriveBadges` | Profile page, badge list | Computed from store state on render |
| Skill tree state | `shared/content/curriculum` + `skillTreeUtils` | Skill tree feature | Combines curriculum data + progress |
| Level derivation | `shared/store/types.getLevel` | XP display, level-up check | Pure function, called anywhere |
| Type safety | `shared/content/schema` types | All exercise + lesson components | Types imported throughout |

---

## Build Order (Dependency-Aware)

Each phase builds on the one before it. Dependencies flow downward.

### Phase 1: Foundation
- Vite + React + TypeScript project scaffold
- Extract `shared/` from PromptPlay (copy portable files)
- TypeScript path aliases (`@shared/`, `@/`)
- Tailwind v4 setup with logical property conventions
- React Router shell with placeholder routes
- **Output:** App renders, routes work, shared/ compiles

### Phase 2: State + i18n
- Zustand store (web version) with localStorage persistence
- Hydration gate in main.tsx
- i18n init with react-i18next (browser-native)
- RTL support via `document.dir` + CSS logical properties
- Language toggle
- **Output:** State persists across refreshes, RTL flips correctly

### Phase 3: Content Pipeline
- Vite-compatible content loader (`import.meta.glob`)
- Verify all 20 lesson JSONs load correctly
- Lesson content rendering (title, body, tip)
- **Output:** Can navigate to `/lesson/:id` and see content

### Phase 4: Exercise System
- Exercise registry (web version)
- ExerciseRunner component
- All 6 exercise card components (web versions)
- Wire evaluators from shared/
- **Output:** Can complete exercises and see feedback

### Phase 5: Lesson Flow
- useLessonSession hook (copy from shared)
- LessonScreen: intro -> exercises -> completion flow
- Store integration: addXP, completeLesson, updateStreak on completion
- Lesson unlock logic (prerequisites)
- **Output:** Full lesson loop works end-to-end

### Phase 6: Gamification UI
- XP/streak display on home page
- Badges list (derived from store state)
- Lesson celebration screen
- Level-up modal
- CSS animations for celebrations
- **Output:** Gamification visuals match existing app

### Phase 7: Skill Tree + Navigation
- Skill tree visualization with node states
- Chapter headers
- Bottom tab navigation
- Onboarding flow (goal selection)
- Route guards (redirect to onboarding if needed)
- **Output:** Full navigation working

### Phase 8: PWA + Polish
- Service worker (vite-plugin-pwa)
- Web app manifest
- Install banner
- Offline support
- Responsive design audit
- Performance optimization
- **Output:** Installable PWA

**Rationale:** This order ensures each phase has its dependencies satisfied. Content pipeline before exercises (exercises render content). Exercises before lesson flow (lesson flow sequences exercises). Lesson flow before gamification UI (gamification fires on lesson completion). State and i18n early because everything depends on them.

---

## Sources

- **Codebase analysis:** Direct reading of all 50+ source files in PromptPlay/src/
- [Vite vs Next.js 2025 comparison](https://strapi.io/blog/vite-vs-nextjs-2025-developer-framework-comparison) -- MEDIUM confidence
- [vite-plugin-pwa (zero-config PWA)](https://github.com/vite-pwa/vite-plugin-pwa) -- HIGH confidence
- [CSS logical properties for RTL](https://madrus4u.vercel.app/blog/rtl-implementation-guide) -- MEDIUM confidence
- [React Router v7 with Vite](https://blog.logrocket.com/file-based-routing-react-router-v7/) -- MEDIUM confidence
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/reference/middlewares/persist) -- HIGH confidence
- [Tailwind CSS v4](https://tailwindcss.com/) -- HIGH confidence
- [Zustand + Vite + PWA boilerplate](https://github.com/ascii-16/react-query-zustand-ts-vite-boilerplate) -- LOW confidence (reference only)
