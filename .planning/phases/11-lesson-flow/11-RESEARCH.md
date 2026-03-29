# Phase 11: Lesson Flow - Research

**Researched:** 2026-03-29
**Domain:** React Router 7 SPA routing, lesson state machine, exercise sequencing, Zustand persistence
**Confidence:** HIGH

## Summary

Phase 11 wires together all previously-built pieces — content loader, exercise registry, and progress store — into a navigable lesson experience. The primary technical challenge is installing and configuring React Router 7 in library/declarative mode (the app currently has no router at all), then building a stateful lesson runner that sequences exercises and triggers store mutations on completion.

The lesson data model is fully defined: `Lesson.exercises[]` is ordered by the `order` field, `Lesson.xpReward` is the source of truth for XP, and `Lesson.prerequisites[]` encodes the unlock graph. The progress store already has `completeLesson()`, `unlockLesson()`, `addXP()`, and `unlockedLessons` pre-seeded with `'lesson-01-what-is-prompting'`. No store changes are needed — just consumption.

The key architectural decision for this phase is using React Router 7 in **declarative mode** (not framework/SSR mode). The existing Vite config has no server-side rendering, and the app is a pure SPA. React Router 7 is NOT currently installed — it must be added as a dependency.

**Primary recommendation:** Install `react-router@^7.13.1`, wrap `main.tsx` with `createBrowserRouter` + `RouterProvider`, add a `/lesson/:id` route, and build `LessonScreen` as the sole new component orchestrating intro → exercise loop → completion.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Full-screen card layout with progress bar/dots at top — mobile-first, Duolingo-style
- Minimal intro screen: lesson title, chapter name, tip text, "Start" button — fast path to first exercise
- One-at-a-time exercise presentation with progress dots (filled/empty circles)
- Auto-advance to next exercise after feedback dismissal
- Completion screen shows XP earned summary + "Next Lesson" button
- Strict sequential unlock: completing lesson N unlocks lesson N+1
- First lesson (lesson-01-what-is-prompting) is pre-unlocked in store (already configured)
- Lesson states: not started / in progress / completed — persisted via useProgressStore
- React Router 7 with /lesson/:id route
- Home page shows chapter/lesson list as entry point
- Browser back returns to home
- No deep navigation yet — Phase 13 adds tab-based navigation

### Claude's Discretion
- Exercise-to-exercise transition animation (if any)
- XP amount per exercise/lesson completion
- Error handling for invalid lesson IDs in URL

### Deferred Ideas (OUT OF SCOPE)
- Tab-based navigation (Phase 13)
- Skill tree visualization (Phase 13)
- Celebration animations on completion (Phase 12)
- Offline lesson access (Phase 14)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LESS-01 | Lesson screen with intro → exercise sequence → completion screen showing XP earned | LessonScreen state machine (intro/running/complete), getExerciseComponent(), Lesson.xpReward |
| LESS-02 | Lesson progress states (not started / in progress / completed) persisted across sessions | useProgressStore: completedLessons[], unlockedLessons[]; Zustand persists to localStorage automatically |
| LESS-03 | Navigation between lessons with sequential unlock logic | React Router 7 /lesson/:id; unlockLesson() called after completeLesson(); curriculum order from getAllLessonIds() |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-router | ^7.13.1 | SPA routing, /lesson/:id, useParams, useNavigate | Locked decision; official React SPA routing library |
| zustand | ^5.0.12 (installed) | Lesson progress persistence | Already installed, store already built |
| react | ^19.0.0 (installed) | UI | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | ^16.3.2 (installed) | Component tests for LessonScreen states | Unit tests for each lesson flow phase state |
| vitest | ^4.1.2 (installed) | Test runner | All tests in this phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-router createBrowserRouter | TanStack Router | TanStack has better TS inference but react-router is the locked decision |
| useState for lesson phase | useReducer | useReducer is cleaner for a 3-state machine but useState works fine for this scope |

**Installation (only new dependency):**
```bash
cd web && npm install react-router@^7.13.1
```

**Version verified:** react-router 7.13.1 — latest as of 2026-03-29 per npm.

---

## Architecture Patterns

### Recommended Project Structure
```
web/src/
├── pages/
│   ├── HomePage.tsx          # Chapter/lesson list, locked/unlocked/complete states
│   └── LessonPage.tsx        # Full lesson flow (intro → exercises → completion)
├── components/
│   └── DotStepper.tsx        # Reusable progress dots component
├── App.tsx                   # Replaced: now just RouterProvider wrapper
└── main.tsx                  # Unchanged: HydrationGate + LanguageSync stay here
```

### Pattern 1: React Router 7 Declarative Mode (Library Mode)
**What:** Use `createBrowserRouter` + `RouterProvider` without SSR. This is the "data" or "declarative" mode — not the framework mode that requires a Vite plugin.
**When to use:** Any Vite SPA without SSR — this project's exact case.

```typescript
// web/src/App.tsx — replace demo content with router
import { createBrowserRouter, RouterProvider } from 'react-router'
import { HomePage } from './pages/HomePage'
import { LessonPage } from './pages/LessonPage'

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/lesson/:id', element: <LessonPage /> },
])

export function App() {
  return <RouterProvider router={router} />
}
```

### Pattern 2: LessonScreen State Machine
**What:** A single component with a `phase` enum: `'intro' | 'running' | 'complete'`. No external state machine library needed.
**When to use:** Linear, non-branching flows with clear phase transitions.

```typescript
// web/src/pages/LessonPage.tsx
type LessonPhase = 'intro' | 'running' | 'complete'

export function LessonPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<LessonPhase>('intro')
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)

  const lesson = useMemo(() => {
    try { return loadLesson(id!) }
    catch { return null }
  }, [id])

  // On exercise complete: advance index or enter complete phase
  const handleExerciseComplete = (result: ExerciseResult) => {
    const xp = result.passed ? Math.floor(lesson!.xpReward / lesson!.exercises.length) : 0
    setXpEarned(prev => prev + xp)
    if (exerciseIndex + 1 < lesson!.exercises.length) {
      setExerciseIndex(i => i + 1)
    } else {
      // All exercises done — trigger store updates then show completion
      completeLesson(lesson!.id)
      unlockNextLesson(lesson!)
      addXP(xpEarned + xp, 'lesson_complete')
      setPhase('complete')
    }
  }
  // ...
}
```

### Pattern 3: Sequential Unlock via curriculum order
**What:** Use `getAllLessonIds()` to find the lesson at `order + 1` and call `unlockLesson()`.
**When to use:** After every lesson completion.

```typescript
function unlockNextLesson(lesson: Lesson) {
  const allIds = getAllLessonIds() // sorted by order
  const idx = allIds.indexOf(lesson.id)
  if (idx !== -1 && idx + 1 < allIds.length) {
    unlockLesson(allIds[idx + 1])
  }
}
```

### Pattern 4: DotStepper Component
**What:** A row of small circles — filled/colored for completed, outlined for upcoming, current highlighted.
**When to use:** Top of the lesson screen to show exercise progress.

```typescript
// web/src/components/DotStepper.tsx
interface DotStepperProps {
  total: number
  current: number  // 0-indexed current exercise
}
// Renders: ● ● ○ ○ ○  (filled = done, circle = upcoming, current = accent color)
```

### Pattern 5: Home Page Lesson List
**What:** Map `chapters` array, for each chapter map `lessonIds`, derive lock/complete state from store, render lesson cards.
**When to use:** `/` route — entry point before routing exists in Phase 13.

```typescript
const completedLessons = useProgressStore(s => s.completedLessons)
const unlockedLessons = useProgressStore(s => s.unlockedLessons)

function getLessonState(id: string): 'locked' | 'unlocked' | 'completed' {
  if (completedLessons.includes(id)) return 'completed'
  if (unlockedLessons.includes(id)) return 'unlocked'
  return 'locked'
}
```

### Anti-Patterns to Avoid
- **Physical left/right in CSS:** Use `ps-*`, `pe-*`, `ms-*`, `me-*` (Tailwind logical properties). Never `pl-`, `pr-`, `ml-`, `mr-`.
- **React Router framework mode:** Do NOT add `@react-router/dev` plugin to vite.config.ts — that enables SSR/framework mode. Library mode needs no vite plugin.
- **Calling addXP inside exercise loop:** Accumulate XP locally and call `addXP` once on completion, not per-exercise, to avoid partial XP on back-navigation.
- **Blocking render on hydration:** The existing `HydrationGate` in `main.tsx` already handles this — `LessonPage` should not add its own loading gate.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL param parsing | Custom URL parser | `useParams()` from react-router | Handles encoding, type coercion |
| Programmatic navigation | `window.location.href =` | `useNavigate()` from react-router | Preserves React state, history stack |
| Lesson order sorting | Custom sort | `getAllLessonIds()` (already sorts by `order`) | Already implemented, tested |
| Exercise evaluation | Custom eval logic | `getExerciseComponent(type).evaluator` | All 6 evaluators built in Phase 10 |
| Progress persistence | Manual localStorage | `useProgressStore` (Zustand + persist) | Already wired, auto-persists |

---

## Common Pitfalls

### Pitfall 1: React Router Framework Mode vs Library Mode
**What goes wrong:** Adding `@react-router/dev` vite plugin and using file-based routing — this is the full framework mode (formerly Remix) and requires a completely different setup.
**Why it happens:** React Router 7 docs cover both modes, and framework mode is the primary marketing focus.
**How to avoid:** Use `createBrowserRouter` + `RouterProvider` import from `'react-router'` (not `'react-router-dom'` — in v7 they merged into a single package). No vite plugin needed.
**Warning signs:** If you see `@react-router/dev` in devDependencies or `routes.ts` file-based routing, you're in framework mode.

### Pitfall 2: XP Double-Counting on Re-render
**What goes wrong:** `addXP` called on every render of the completion screen instead of once.
**Why it happens:** Side effects in render body or `useEffect` without proper dependency array.
**How to avoid:** Call `addXP`, `completeLesson`, `unlockLesson` in the `handleExerciseComplete` callback (event handler), not in `useEffect`. If using `useEffect`, gate with a ref flag.

### Pitfall 3: loadLesson() Throwing on Invalid ID
**What goes wrong:** User navigates to `/lesson/bad-id`, `loadLesson()` throws, React unmounts with unhandled error.
**Why it happens:** `loadLesson` throws `Error('Lesson not found: ...')` by design.
**How to avoid:** Wrap in try/catch in `useMemo`, redirect to `/` on null result. This is Claude's discretion territory — a simple `useNavigate()` redirect is sufficient.

### Pitfall 4: Progress Dots RTL Mirroring
**What goes wrong:** Dot stepper renders left-to-right in RTL Hebrew mode, visually reversed.
**Why it happens:** Using `flex-row` without considering document direction.
**How to avoid:** Dot stepper is a visual indicator without directional semantic meaning — keep `flex-row` consistent regardless of RTL. Do NOT use `flex-row-reverse` based on `isRTL`. The dots represent ordinal position, not directional flow.

### Pitfall 5: FeedbackCard Auto-Advance Timing
**What goes wrong:** Auto-advance fires before user reads feedback.
**Why it happens:** `onComplete` called immediately after evaluation without feedback display.
**How to avoid:** The existing `FeedbackCard` component handles showing feedback. `onComplete` on the exercise card should fire only after the user dismisses feedback (via a "Continue" button in `FeedbackCard`), not immediately after answer submission. Check the existing `ExerciseComponentProps.onComplete` contract — it should fire post-feedback.

---

## Code Examples

### Router Setup in App.tsx
```typescript
// Source: React Router 7 official docs — declarative/data mode
import { createBrowserRouter, RouterProvider } from 'react-router'
import { HomePage } from './pages/HomePage'
import { LessonPage } from './pages/LessonPage'

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/lesson/:id', element: <LessonPage /> },
])

export function App() {
  return <RouterProvider router={router} />
}
```

### useParams in LessonPage
```typescript
// Source: https://reactrouter.com/api/hooks/useParams
import { useParams, useNavigate } from 'react-router'

export function LessonPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  // id is the :id segment from /lesson/:id
}
```

### Deriving Next Lesson ID
```typescript
// Uses existing getAllLessonIds() which returns IDs sorted by lesson.order
import { getAllLessonIds } from '@/content'

function getNextLessonId(currentId: string): string | null {
  const ids = getAllLessonIds()
  const idx = ids.indexOf(currentId)
  return idx !== -1 && idx + 1 < ids.length ? ids[idx + 1] : null
}
```

### Lesson State Derivation
```typescript
// Derives UI state from store — no new store fields needed
const completedLessons = useProgressStore(s => s.completedLessons)
const unlockedLessons = useProgressStore(s => s.unlockedLessons)

type LessonState = 'locked' | 'not-started' | 'completed'

function getLessonUIState(id: string): LessonState {
  if (completedLessons.includes(id)) return 'completed'
  if (unlockedLessons.includes(id)) return 'not-started'
  return 'locked'
}
```

---

## Environment Availability

Step 2.6: No external tools or services beyond npm packages are required. React Router 7 is a pure npm install. All other dependencies (Vitest, Testing Library, Tailwind) are already installed.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| react-router | /lesson/:id routing, useParams | NOT INSTALLED | — | None — must install |
| vitest | Tests | ✓ | ^4.1.2 | — |
| @testing-library/react | Component tests | ✓ | ^16.3.2 | — |
| node/npm | Package install | ✓ | (project baseline) | — |

**Missing dependencies with no fallback:**
- `react-router` — must be installed as first task of Wave 0 / Task 1

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 + @testing-library/react 16.3.2 |
| Config file | web/vite.config.ts (test.environment: jsdom) |
| Quick run command | `cd web && npx vitest run --reporter=verbose` |
| Full suite command | `cd web && npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LESS-01 | LessonPage renders intro screen with title, tip, Start button | unit | `npx vitest run src/pages/LessonPage.test.tsx` | ❌ Wave 0 |
| LESS-01 | Clicking Start transitions to exercise phase, shows first exercise | unit | `npx vitest run src/pages/LessonPage.test.tsx` | ❌ Wave 0 |
| LESS-01 | After all exercises, completion screen shows XP earned | unit | `npx vitest run src/pages/LessonPage.test.tsx` | ❌ Wave 0 |
| LESS-02 | completeLesson() called on lesson completion; store persists to localStorage | unit | `npx vitest run src/pages/LessonPage.test.tsx` | ❌ Wave 0 |
| LESS-02 | Refreshing page (store rehydration) preserves completed state | unit | `npx vitest run src/store/useProgressStore.test.ts` | ✅ exists |
| LESS-03 | Completing lesson N calls unlockLesson(N+1) | unit | `npx vitest run src/pages/LessonPage.test.tsx` | ❌ Wave 0 |
| LESS-03 | HomePage shows locked state for lesson N+1 before N is complete | unit | `npx vitest run src/pages/HomePage.test.tsx` | ❌ Wave 0 |
| LESS-03 | "Next Lesson" button on completion navigates to /lesson/:nextId | unit | `npx vitest run src/pages/LessonPage.test.tsx` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `cd web && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd web && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `web/src/pages/LessonPage.test.tsx` — covers LESS-01, LESS-02, LESS-03
- [ ] `web/src/pages/HomePage.test.tsx` — covers LESS-03 (locked state rendering)
- [ ] `web/src/components/DotStepper.test.tsx` — unit test for stepper visual states

*(Note: `useProgressStore.test.ts` already exists and covers persistence — no gap there)*

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `react-router-dom` separate package | Single `react-router` package | v7.0 (Nov 2024) | Import from `'react-router'` not `'react-router-dom'` |
| `<BrowserRouter>` wrapper | `createBrowserRouter` + `RouterProvider` | v6.4+ | Data API unlocked; declarative mode recommended |
| `Switch` component | `Routes` / route array in createBrowserRouter | v6+ | Breaking change from v5 |

**Deprecated/outdated:**
- `react-router-dom`: In v7, merged into `react-router`. Do not install `react-router-dom` separately.
- `<BrowserRouter>` wrapping: Still works in declarative mode but `createBrowserRouter` is the recommended approach in v7.

---

## Open Questions

1. **FeedbackCard auto-advance contract**
   - What we know: `ExerciseComponentProps` has `onComplete(result)` callback; `FeedbackCard` exists
   - What's unclear: Whether `FeedbackCard` is shown by the exercise card (internal) or by `LessonPage` (external), and whether `onComplete` fires after feedback dismissal or immediately after answer evaluation
   - Recommendation: Read `FeedbackCard.tsx` and one exercise card (e.g. `MCQCard.tsx`) before implementing `LessonPage` to understand the feedback rendering contract

2. **XP per exercise vs per lesson**
   - What we know: `Lesson.xpReward` is defined; Claude's discretion on XP amount per exercise
   - What's unclear: Whether to award XP per-exercise (partial) or lump-sum on completion
   - Recommendation: Award lump-sum `lesson.xpReward` XP on lesson completion only (simpler, avoids partial XP bugs, consistent with store's `addXP` source `'lesson_complete'`)

---

## Sources

### Primary (HIGH confidence)
- `web/src/store/useProgressStore.ts` — store API verified directly
- `web/src/exercises/registry.tsx` — `getExerciseComponent()` API verified directly
- `web/src/content/loader.ts` — `loadLesson()`, `getAllLessonIds()` verified directly
- `shared/src/content/schema.ts` — `Lesson`, `Exercise` types verified directly
- `shared/src/content/curriculum.ts` — chapter structure, 20 lessons, 4 chapters verified
- `web/package.json` — confirmed react-router NOT installed; all other deps confirmed

### Secondary (MEDIUM confidence)
- [React Router npm](https://www.npmjs.com/package/react-router) — version 7.13.1 confirmed current
- [React Router useParams docs](https://reactrouter.com/api/hooks/useParams) — hook API
- [React Router modes](https://reactrouter.com/start/modes) — declarative vs framework mode distinction

### Tertiary (LOW confidence)
- [LogRocket React Router v7 guide](https://blog.logrocket.com/react-router-v7-guide/) — createBrowserRouter pattern (cross-referenced with official docs)

---

## Project Constraints (from CLAUDE.md)

- RTL-first: Use CSS logical properties (`ps/pe/ms/me`) — never `pl/pr/ml/mr` or physical `left/right`
- Mixed Hebrew/English text requires explicit direction wrapping
- No guilt-based gamification mechanics (no punishment, no loss-framing in lesson completion)
- Simulated AI only — no live API calls in exercises
- Exercise type registry pattern — confirmed built in Phase 10
- Content as bundled JSON — no API calls for lessons (confirmed: `loadLesson()` uses `import.meta.glob`)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — react-router version verified from npm; all other deps directly confirmed in package.json
- Architecture: HIGH — all integration points verified from source files
- Pitfalls: MEDIUM — router mode pitfall verified from official docs overview; others from codebase analysis

**Research date:** 2026-03-29
**Valid until:** 2026-04-28 (react-router releases frequently but v7 API is stable)
