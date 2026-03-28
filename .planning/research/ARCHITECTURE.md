# Architecture Patterns

**Domain:** Gamified bilingual mobile learning app (PWA-first)
**Researched:** 2026-03-28
**Confidence:** MEDIUM-HIGH

---

## Recommended Architecture

### Overview: Feature-Sliced + Layered Hybrid

A feature-sliced architecture where each major domain (lesson engine, gamification, content, user state) owns its slice of logic, state, and UI components. Layers enforce data flow direction: UI → Engine → Store → Persistence.

```
src/
  app/           # App shell, routing, providers
  features/
    lesson/      # Lesson engine, reader, progress
    exercise/    # Exercise runner, evaluator, types
    gamification/# XP, streaks, badges, level-up
    skill-tree/  # Map view, lock/unlock logic
    i18n/        # Language switching, RTL manager
  content/       # Static lesson data (JSON), type schemas
  store/         # Global state (Zustand or Redux Toolkit)
  persistence/   # AsyncStorage/IndexedDB adapters
  shared/        # UI primitives, hooks, utilities
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Lesson Engine** | Load lesson by ID, sequence content + exercises, track completion | Content store, Exercise Evaluator, Gamification Engine |
| **Content Renderer** | Display markdown/rich text, handle RTL text direction | i18n context, Lesson Engine |
| **Exercise Runner** | Present exercise UI by type (MCQ, free-text, prompt-builder, drag-drop), collect answer | Exercise Evaluator |
| **Exercise Evaluator** | Score answer against rubric, return feedback + score | Lesson Engine, Gamification Engine |
| **Gamification Engine** | Award XP, update streaks, check level-up, unlock next lessons | User Progress Store |
| **User Progress Store** | Source of truth for XP total, streak, completed lessons, current level | All features (read), Gamification Engine (write) |
| **Skill Tree View** | Render lesson map, show lock/unlock state, handle navigation | User Progress Store |
| **Persistence Layer** | Read/write to IndexedDB (PWA) or AsyncStorage (RN), sync when online | User Progress Store |
| **i18n Manager** | Provide translations, detect/set language, apply RTL flag | All UI components |

---

## Data Flow: Core User Journey

```
User opens app
  → App shell loads User Progress from Persistence
  → Skill Tree renders lessons (locked/unlocked by progress)

User selects lesson
  → Lesson Engine loads lesson JSON by ID
  → Content Renderer displays intro text (RTL-aware)

User reaches exercise
  → Exercise Runner mounts correct component by exercise.type
  → User submits answer

Answer submitted
  → Exercise Evaluator scores against rubric
  → Returns: { score, feedback, passed }

Exercise passed
  → Lesson Engine advances to next step or marks lesson complete
  → Gamification Engine receives: { event: "lesson_complete", lessonId, score }
  → XP calculated: base_xp + streak_multiplier + perfection_bonus
  → Streak updated: if today's date !== last_activity_date → increment/reset
  → Level check: if total_xp >= level_threshold → level_up event
  → User Progress Store updated (single write)
  → Persistence Layer saves to IndexedDB / AsyncStorage

UI updates
  → XP animation, confetti/celebration if level-up
  → Skill Tree unlocks next lesson
  → Streak counter updates
```

**Key rule:** Data flows one direction. UI never writes to the store directly — it dispatches events to engines which update state.

---

## Content Architecture

### Lesson JSON Schema

All lesson content lives as static JSON files bundled with the app. No server round-trips for content.

```typescript
// Lesson schema
interface Lesson {
  id: string                    // e.g. "lesson-01-what-is-prompting"
  order: number                 // Position in skill tree
  prerequisites: string[]       // Lesson IDs that must be complete first
  xpReward: number              // Base XP for completion
  content: {
    title: LocalizedString       // { en: "...", he: "..." }
    body: LocalizedString        // Markdown string per locale
    tip?: LocalizedString        // Optional callout box
  }
  exercises: Exercise[]
}

// Exercise schema
interface Exercise {
  id: string
  type: "mcq" | "free-text" | "prompt-builder" | "drag-drop"
  prompt: LocalizedString
  rubric: Rubric
  // type-specific fields below
}

interface MCQExercise extends Exercise {
  type: "mcq"
  options: LocalizedString[]
  correctIndex: number
  explanation: LocalizedString
}

interface FreeTextExercise extends Exercise {
  type: "free-text"
  simulatedResponse: LocalizedString   // Pre-scripted "AI" response to show
  rubric: PromptRubric
}

interface PromptRubric {
  criteria: Array<{
    key: "clarity" | "specificity" | "context" | "intent"
    weight: number               // Sums to 1.0
    keywords: string[]           // Presence signals good scoring
    required: boolean
  }>
  passingScore: number           // 0-100
}

interface LocalizedString {
  en: string
  he: string
}
```

### File Organization for Content

```
content/
  lessons/
    lesson-01-what-is-prompting.json
    lesson-02-clarity.json
    ...
  curriculum.json    # Ordered list of lesson IDs + metadata for skill tree
  schema.ts          # TypeScript types (source of truth)
```

**Why JSON not MDX/YAML:**
- JSON is natively parseable without build transforms
- Type-safe with TypeScript interfaces
- Easy to iterate on content without code changes
- MDX adds unnecessary build complexity; YAML loses type safety at parse time

---

## State Architecture

### What Lives Where

| State | Storage | Why |
|-------|---------|-----|
| Completed lessons | IndexedDB / AsyncStorage | Persistent, needs offline access |
| XP total + history | IndexedDB / AsyncStorage | Persistent |
| Current streak + last activity date | IndexedDB / AsyncStorage | Persistent |
| Current level | Derived from XP (not stored) | Computed on read |
| Active lesson session | In-memory (Zustand) | Ephemeral, resets on lesson exit |
| Exercise answer (in-progress) | In-memory (React state) | Component-local, not global |
| Language preference | AsyncStorage | Persistent, loaded at boot |
| UI state (modals, animations) | React state / Zustand | Component-level |

### State Shape

```typescript
interface UserProgress {
  userId: string                 // Generated UUID, stored locally
  xpTotal: number
  xpHistory: XPTransaction[]     // { amount, source, timestamp }
  streakCount: number
  lastActivityDate: string       // ISO date string YYYY-MM-DD
  completedLessons: string[]     // Lesson IDs
  unlockedLessons: string[]      // Computed from completedLessons + prerequisites
  language: "en" | "he"
}
```

### State Management Library

**Use Zustand** (not Redux). Reasons:
- Zero boilerplate for a medium-complexity app
- Works identically in React Native and web (PWA)
- Persist middleware handles IndexedDB/AsyncStorage sync
- Simpler mental model for a team building fast

Redux Toolkit is valid if team already knows it, but adds ceremony without benefit at this scale.

---

## Bilingual Architecture (EN + HE)

### i18n Library

**Use i18next + react-i18next.** Standard, well-tested, supports React Native and web equally.

### File Structure

```
i18n/
  en/
    common.json      # Shared UI strings (buttons, labels)
    lessons.json     # Lesson titles/descriptions (if not in content JSON)
    gamification.json# XP messages, level names, streak text
  he/
    common.json
    lessons.json
    gamification.json
  index.ts           # i18next initialization
```

**Note:** Lesson body content (long-form) lives in the lesson JSON files as `LocalizedString` objects, not in i18n files. i18n files handle UI chrome only.

### RTL Strategy

```typescript
// At app boot and on language change:
import { I18nManager } from 'react-native' // or @expo/metro-runtime equivalent
import * as Updates from 'expo-updates'

const setLanguage = async (lang: 'en' | 'he') => {
  await i18n.changeLanguage(lang)
  const shouldBeRTL = lang === 'he'
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL)
    await Updates.reloadAsync() // Required: RTL needs app reload
  }
  await AsyncStorage.setItem('language', lang)
}
```

**RTL Rules for all UI components:**
- Use `marginStart/marginEnd` never `marginLeft/marginRight`
- Use `paddingStart/paddingEnd` never `paddingLeft/paddingRight`
- Text alignment: `textAlign: 'auto'` or direction-aware (not hardcoded `left`)
- Icons with directionality (arrows, chevrons) must be manually mirrored
- Test every screen in both directions — simulator RTL has known edge cases, test on device

### Content Direction

Lesson body text inherits language direction from i18n context. Hebrew content in `LocalizedString.he` fields will render RTL automatically when the Hebrew locale is active.

---

## Offline-First Architecture

### Strategy: Cache-First for Content, Sync-on-Online for Progress

```
Content (lessons JSON): Bundle with app → always available offline
User Progress:          Write locally first → sync to cloud when online (v2 cloud sync)
UI Assets:              Service worker caches static assets on install
```

### PWA Implementation (v1)

Using Workbox (via `vite-plugin-pwa` or CRA's built-in):

```
Cache Strategy by Resource Type:
  App shell (HTML/JS/CSS) → CacheFirst (versioned, update on deploy)
  Lesson JSON content     → CacheFirst (bundled, no network needed)
  Images / icons          → StaleWhileRevalidate
  User progress           → NetworkFirst with IndexedDB fallback
```

### Data Persistence

- **IndexedDB** (PWA) via `idb` or Dexie.js — structured storage for progress
- **AsyncStorage** (React Native) — key-value, fine for this data size
- Both wrapped behind a `PersistenceAdapter` interface so the store layer is platform-agnostic

```typescript
interface PersistenceAdapter {
  get(key: string): Promise<unknown>
  set(key: string, value: unknown): Promise<void>
  clear(): Promise<void>
}
```

---

## Exercise Engine

### Type Registry Pattern

Register exercise renderers by type key. The Exercise Runner looks up the renderer, passes props — no switch statements scattered through the codebase.

```typescript
// Exercise type registry
const EXERCISE_REGISTRY: Record<ExerciseType, ExerciseComponent> = {
  'mcq':            MCQExercise,
  'free-text':      FreeTextExercise,
  'prompt-builder': PromptBuilderExercise,
  'drag-drop':      DragDropExercise,
}

// Exercise Runner
const ExerciseRunner = ({ exercise, onComplete }) => {
  const Component = EXERCISE_REGISTRY[exercise.type]
  return <Component exercise={exercise} onSubmit={onComplete} />
}
```

Adding a new exercise type = create component + register it. Zero changes to the runner.

### Evaluator Pattern

Each exercise type has a corresponding evaluator function. Evaluators are pure functions (testable in isolation).

```typescript
type Evaluator<T extends Exercise> = (
  exercise: T,
  answer: unknown
) => EvaluationResult

interface EvaluationResult {
  score: number        // 0-100
  passed: boolean
  feedback: LocalizedString
  breakdown?: Record<string, number>  // Per-criterion scores for rubric display
}

// Free-text evaluator: keyword matching against rubric
const evaluateFreeText: Evaluator<FreeTextExercise> = (exercise, answer) => {
  const text = (answer as string).toLowerCase()
  let score = 0
  const breakdown: Record<string, number> = {}

  for (const criterion of exercise.rubric.criteria) {
    const hit = criterion.keywords.some(kw => text.includes(kw))
    const criterionScore = hit ? criterion.weight * 100 : 0
    breakdown[criterion.key] = criterionScore
    score += criterionScore
  }

  return {
    score,
    passed: score >= exercise.rubric.passingScore,
    feedback: score >= exercise.rubric.passingScore
      ? exercise.positiveFeeback
      : exercise.improvementFeedback,
    breakdown,
  }
}
```

**Note on free-text scoring:** Keyword matching is intentionally simple for v1. It handles the "simulated AI" requirement without NLP overhead. The rubric keywords are hand-tuned per exercise.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing Derived State
**What:** Storing `currentLevel` in the database when it can be computed from `xpTotal`.
**Why bad:** State desync bugs, extra writes, harder to change level formulas.
**Instead:** Derive level from XP on every read with a pure `getLevel(xp: number)` function.

### Anti-Pattern 2: Hardcoding RTL in Components
**What:** Adding `if (language === 'he') { style.marginLeft = 0; style.marginRight = 8 }`
**Why bad:** Brittle, misses cases, doesn't scale to future languages.
**Instead:** Use `marginStart/marginEnd` always. Let the RTL flag handle direction.

### Anti-Pattern 3: Content in Code
**What:** Writing lesson text as JSX/template literals in components.
**Why bad:** Translators can't edit it, content changes require code deploys, no schema validation.
**Instead:** All content in JSON files with `LocalizedString` shape. Validated by TypeScript types.

### Anti-Pattern 4: Monolithic Progress Update
**What:** One giant function that updates XP, checks streak, checks level, unlocks lessons, saves to DB.
**Why bad:** Untestable, hard to extend, mutation soup.
**Instead:** Compose: `calculateXP()` → `updateStreak()` → `checkLevelUp()` → `computeUnlocks()` → single `save()`.

### Anti-Pattern 5: RTL as an Afterthought
**What:** Building all UI in LTR, then adding RTL conditionals later.
**Why bad:** Requires touching every component, layout bugs are subtle and everywhere.
**Instead:** Use directional properties from day one. Test RTL on every new screen as it's built.

---

## Build Order Implications

1. **Persistence layer first** — everything else depends on being able to save/load progress
2. **Content schema + first lesson** — defines the data contract all other layers use
3. **Lesson Engine + Content Renderer** — core loop before gamification
4. **Exercise Runner + 1-2 exercise types** — validate the type registry pattern early
5. **Evaluator for free-text** — the most complex type; smoke-test scoring logic
6. **Gamification Engine** — add XP/streaks once core lesson flow works
7. **Skill Tree View** — needs progress data and lesson metadata to render meaningfully
8. **i18n + RTL** — wire in early but validate on each screen as it ships
9. **PWA/offline hardening** — add service worker config last, after content is stable

---

## Scalability Considerations

| Concern | V1 (1 path, ~25 lessons) | V2 (multiple paths) | V3 (10K+ users) |
|---------|--------------------------|---------------------|-----------------|
| Content storage | Bundled JSON | Bundled JSON, path-split | CDN-hosted, lazy-loaded per path |
| Progress storage | IndexedDB (local) | Local + cloud sync (Supabase) | Cloud-primary with offline cache |
| Lesson unlock logic | Client-side | Client-side | Server-side validation (anti-cheat) |
| Exercise evaluation | Client-side keyword match | Client-side | Client-side (no change needed) |
| Streaks | Client-side clock | Server-verified timestamps | Server-authoritative |

---

## Sources

- [React Native Architecture Overview](https://reactnative.dev/architecture/overview) — HIGH confidence
- [React Native I18nManager](https://reactnative.dev/docs/i18nmanager) — HIGH confidence
- [Implementing RTL in React Native Expo](https://geekyants.com/blog/implementing-rtl-right-to-left-in-react-native-expo---a-step-by-step-guide) — MEDIUM confidence
- [Offline-First React Apps 2025](https://emirbalic.com/building-offline-first-react-apps-in-2025-pwa-rsc-service-workers/) — MEDIUM confidence
- [Software Architecture for Gamification](https://hackernoon.com/a-software-architecture-for-the-gamification-of-se-environments) — MEDIUM confidence
- [Building React Native App for 20+ Languages](https://dev.to/pocket_linguist/building-a-react-native-app-for-20-languages-lessons-in-i18n-378d) — MEDIUM confidence
