# Phase 13: Skill Tree + Navigation - Research

**Researched:** 2026-03-29
**Domain:** React Router 7 navigation, CSS Grid skill tree, Zustand onboarding flow, profile UI
**Confidence:** HIGH

## Summary

Phase 13 adds the app shell around the existing lesson engine: tab navigation, a visual skill tree, an onboarding gate, and a profile page. All four areas use patterns already established in the codebase — React Router 7 nested routes, Zustand + localStorage, Tailwind v4 logical properties, and i18next. No new dependencies are required.

The biggest integration point is `App.tsx`, which gains a second layout route for onboarding (no header/tabs) and a TabBar component added to RootLayout. The skill tree is a pure CSS Grid rendering of the `chapters` array from `curriculum.ts` using `deriveNodeStates` from `skillTreeUtils.ts` — the utility layer is already complete. The onboarding gate is a route guard driven by a new `hasOnboarded` flag in `useProgressStore`.

**Primary recommendation:** Build in this order — (1) TabBar + routes, (2) SkillTreePage, (3) OnboardingPage + route guard, (4) ProfilePage. Each is independently testable and non-blocking.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Tab Navigation & Layout**
- Bottom tab bar (mobile-style), consistent with Duolingo pattern, thumb-friendly on mobile-first PWA
- Icon + text label for each tab — better accessibility
- GameHeader stays at top, new TabBar component added at bottom — minimal disruption to existing RootLayout
- Clean route structure: `/` (Home), `/tree` (Skill Tree), `/profile` (Profile), keep `/lesson/:id` as overlay route

**Skill Tree Visualization**
- CSS Grid + Tailwind for rendering — lightweight, RTL-friendly with logical properties, no canvas/SVG complexity
- Vertical scroll with chapter sections stacked — each chapter is a labeled section with nodes in a column/path
- CSS borders/pseudo-elements for node connectors — simple vertical connectors between adjacent nodes
- 3 visual node states: locked (gray, muted), unlocked (colored border, pulsing dot), completed (filled, checkmark)

**Onboarding Flow**
- Welcome screen → goal selection → redirect to first lesson — minimal steps, under 60 seconds to first exercise
- 3 preset goal cards: "Learn AI basics", "Improve my prompts", "Explore for fun" — quick tap, personalizes home greeting
- State stored in useProgressStore: `hasOnboarded: boolean`, `learningGoal: string` — reuse existing Zustand store
- Onboarding is mandatory but only 2 taps — doesn't feel like a gate

**Profile Tab**
- Stats cards at top (XP, streak, level, lessons completed) → badge grid below
- Tap badge → tooltip/popover with name + description — lightweight discovery
- Language switcher toggle in profile header area, above stats — prominent for bilingual users
- All stats derived from useProgressStore — XP, streak, level already computed there (Phase 12)

### Claude's Discretion
- Specific tab icons (emoji, SVG inline, or icon set) — choose what fits the existing design language
- Skill tree node size and spacing — optimize for mobile-first viewport
- Onboarding welcome screen visual design — keep minimal and on-brand
- Profile page responsive breakpoints — mobile-first with desktop enhancement

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

## Standard Stack

### Core (all already in project)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Router 7 | 7.x | Tab routes + nested layouts + navigation guards | Already in `App.tsx` with `createBrowserRouter` |
| Zustand 5 | 5.x | Onboarding state (`hasOnboarded`, `learningGoal`) | All stores already use this pattern |
| Tailwind v4 | 4.x | CSS Grid skill tree, tab bar, all layout | Confirmed in `globals.css`, logical properties throughout |
| i18next | current | Tab labels, onboarding copy, profile copy | `useTranslation` used in all existing pages |

### No New Dependencies Required

All functionality is achievable with the current stack. Zero new packages needed.

---

## Architecture Patterns

### Recommended File Structure

```
web/src/
├── components/
│   ├── TabBar.tsx              # NEW — bottom tab bar
│   ├── SkillTreeNode.tsx       # NEW — single node (3 states)
│   ├── ChapterSection.tsx      # NEW — chapter header + node column
│   └── GoalCard.tsx            # NEW — selectable goal card
├── pages/
│   ├── SkillTreePage.tsx       # NEW — /tree route
│   ├── ProfilePage.tsx         # NEW — /profile route
│   └── OnboardingPage.tsx      # NEW — /onboarding route
└── store/
    └── useProgressStore.ts     # MODIFY — add hasOnboarded + learningGoal
```

### Pattern 1: Dual Layout in Router (Onboarding isolation)

`/onboarding` must render without `GameHeader` and `TabBar`. The clean approach is a second top-level layout route in `createBrowserRouter`:

```typescript
// web/src/App.tsx
const router = createBrowserRouter([
  {
    element: <OnboardingLayout />,   // bare — no header/tabs
    children: [
      { path: '/onboarding', element: <OnboardingPage /> },
    ],
  },
  {
    element: <RootLayout />,         // GameHeader + TabBar + Outlet
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/tree', element: <SkillTreePage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/lesson/:id', element: <LessonPage /> },
    ],
  },
])
```

`OnboardingLayout` is just `<Outlet />` — a pass-through with no chrome.

### Pattern 2: Route Guard via loader or component redirect

React Router 7 supports `loader` functions for data/redirect logic, but for a simple Zustand flag the cleanest approach is a redirect inside the RootLayout render (or a dedicated wrapper component):

```typescript
// Inside RootLayout component, before returning JSX:
const hasOnboarded = useProgressStore(s => s.hasOnboarded)
const _hasHydrated = useProgressStore(s => s._hasHydrated)

if (_hasHydrated && !hasOnboarded) {
  return <Navigate to="/onboarding" replace />
}
```

Key detail: gate on `_hasHydrated` first. Without the hydration check, the guard fires before localStorage is read and always redirects new sessions on first render.

### Pattern 3: CSS Grid Skill Tree

Each `ChapterSection` renders a single-column grid with vertical connectors between nodes. No canvas, no SVG, no library.

```tsx
// ChapterSection.tsx — simplified structure
<div className="flex flex-col items-center gap-0">
  <h2 className="chapter header...">Chapter Title</h2>
  {chapter.lessonIds.map((id, idx) => (
    <div key={id} className="flex flex-col items-center">
      <SkillTreeNode lessonId={id} state={nodeStates[id]} />
      {idx < chapter.lessonIds.length - 1 && (
        <div className="w-0.5 h-6 bg-gray-200" />  {/* connector */}
      )}
    </div>
  ))}
</div>
```

Connector color rule: use `bg-green-300` when the node below is `complete`, otherwise `bg-gray-200`.

### Pattern 4: TabBar with React Router NavLink

`NavLink` from `react-router` provides the `isActive` boolean automatically:

```tsx
import { NavLink } from 'react-router'

<NavLink to="/" end>
  {({ isActive }) => (
    <div className={`flex flex-col items-center pt-2 pb-1 ${isActive ? 'border-t-2 border-indigo-600' : 'border-t-2 border-transparent opacity-50'}`}>
      <span className="text-2xl">🏠</span>
      <span className="text-[10px]">{t('tabs.home')}</span>
    </div>
  )}
</NavLink>
```

The `end` prop on the `/` NavLink prevents it from matching `/tree` and `/profile`.

### Pattern 5: Zustand store extension for onboarding

Add two fields to `useProgressStore` following the existing pattern:

```typescript
// In the store default state:
hasOnboarded: false,
learningGoal: null as string | null,

// Actions:
setOnboarded: (goal: string) => set({ hasOnboarded: true, learningGoal: goal }),
```

Both fields must be included in `partialize` for persistence. They are already excluded from the function-only exclusion list by default, so just verify the destructuring in `partialize` does not accidentally exclude them.

### Anti-Patterns to Avoid

- **Redirecting before hydration:** Always check `_hasHydrated` before reading `hasOnboarded`. Premature reads return `false` (the default) and send every user to onboarding on every load.
- **`paddingLeft`/`paddingRight` in new components:** Project uses Tailwind v4 logical properties (`ps-*`/`pe-*`) throughout. New components must follow this — no `pl-*`/`pr-*`.
- **Node connector as absolute-positioned element:** Use a simple `div` with fixed height in the flex column flow, not `position: absolute`. Absolute connectors break with RTL and variable node counts.
- **`NavLink` without `end` on `/`:** Without `end`, the home tab is always active because every path starts with `/`.
- **Rendering TabBar inside `<main>`:** TabBar is `fixed bottom-0 inset-x-0` and must be a sibling of `<main>`, not inside it. `<main>` needs `pb-14` to prevent content from hiding behind the fixed bar.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Active tab detection | Manual `useLocation` + string comparison | `NavLink` `isActive` prop | React Router 7 handles nested match edge cases |
| Node state derivation | Inline logic in SkillTreePage | `deriveNodeStates()` from `skillTreeUtils.ts` | Already exists, unit-tested |
| Language toggle | Manual i18next.changeLanguage call | `useLanguage()` hook | Already handles dir attribute + store sync |
| Badge display | Custom badge component | `BadgeGrid` from Phase 12 | Already built and i18n-ready |

---

## Integration Points

### `web/src/App.tsx` (modify)
- Add `OnboardingLayout` as a second root route
- Add `/tree`, `/profile`, `/onboarding` child routes
- Add `<TabBar />` to `RootLayout` below `<main>`
- Add `pb-14` to `<main>` so content clears the fixed TabBar

### `web/src/store/useProgressStore.ts` (modify)
- Add `hasOnboarded: boolean` (default: `false`)
- Add `learningGoal: string | null` (default: `null`)
- Add `setOnboarded(goal: string)` action
- Verify `partialize` includes both new fields (they will by default since they're not functions)

### `shared/src/i18n/en/` and `he/` (modify)
New translation keys required (from UI-SPEC copywriting contract):
- `tabs.home`, `tabs.skillTree`, `tabs.profile`
- `onboarding.welcome.subtitle`
- `onboarding.goal.heading`, `onboarding.goal.learnBasics`, `onboarding.goal.improvePrompts`, `onboarding.goal.exploreForFun`
- `skillTree.title`, `skillTree.progress`
- `profile.title`
- `language.switchToHebrew`, `language.switchToEnglish`

---

## Common Pitfalls

### Pitfall 1: Hydration guard missing on onboarding redirect
**What goes wrong:** Every user sees the onboarding screen on every page load, even after completing it.
**Why it happens:** `hasOnboarded` defaults to `false`. If the redirect check runs before Zustand re-hydrates from localStorage, it reads the default and redirects.
**How to avoid:** Gate the redirect on `_hasHydrated === true`. Show a loading state (or `null`) until hydrated.
**Warning signs:** Onboarding screen flashes briefly on every load.

### Pitfall 2: `NavLink` home tab always active
**What goes wrong:** The Home tab indicator is always visible, even on `/tree` and `/profile`.
**Why it happens:** `NavLink to="/"` matches every path without the `end` prop.
**How to avoid:** Use `<NavLink to="/" end>`.
**Warning signs:** All three tabs appear active simultaneously.

### Pitfall 3: Content hidden behind fixed TabBar
**What goes wrong:** Bottom content on SkillTreePage and ProfilePage is cut off on mobile.
**Why it happens:** `TabBar` is `fixed bottom-0`, so it overlaps the scroll container.
**How to avoid:** Add `pb-14` (or `pb-[56px]`) to the `<main>` element in RootLayout.
**Warning signs:** Last lesson node or last badge row is partially obscured.

### Pitfall 4: LessonPage shows TabBar
**What goes wrong:** The tab bar appears during lesson flow, cluttering the focused experience.
**Why it happens:** LessonPage is a child of RootLayout which renders TabBar.
**How to avoid:** The LessonPage uses a full-screen overlay approach — the TabBar visibility should be suppressed. Either hide TabBar via route match (`useMatch('/lesson/:id')`) or position the lesson page to cover the tab bar (`fixed inset-0 z-50`). The current `LessonPage` likely already uses a full-screen layout; verify and document the chosen approach.
**Warning signs:** TabBar visible during exercise flow.

### Pitfall 5: RTL connector line direction
**What goes wrong:** Node connectors appear on the wrong side in Hebrew mode.
**Why it happens:** Using `border-l-2` instead of `border-s-2`.
**How to avoid:** All border-based connectors use logical properties: `border-s-2`, `border-e-2`. The center vertical connector uses `w-0.5` flex child with no directional concern.
**Warning signs:** Connector line jumps from center to left/right when switching language.

---

## Code Examples

### Skill tree node (3 states)

```tsx
// web/src/components/SkillTreeNode.tsx
import { useNavigate } from 'react-router'
import type { NodeState } from '@shared/skill-tree/skillTreeUtils'

const stateStyles: Record<NodeState, string> = {
  locked: 'bg-gray-300 opacity-60 cursor-not-allowed',
  unlocked: 'bg-white border-2 border-indigo-600 cursor-pointer hover:border-indigo-700 hover:shadow-md',
  complete: 'bg-green-500 cursor-pointer hover:bg-green-600',
}

const stateIcon: Record<NodeState, string> = {
  locked: '🔒',
  unlocked: '',   // shows lesson order number
  complete: '✓',
}

interface Props {
  lessonId: string
  state: NodeState
  orderNumber: number
  lessonTitle: string
}

export function SkillTreeNode({ lessonId, state, orderNumber, lessonTitle }: Props) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (state !== 'locked') navigate(`/lesson/${lessonId}`)
  }

  return (
    <div className="relative">
      <button
        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${stateStyles[state]}`}
        onClick={handleClick}
        disabled={state === 'locked'}
        aria-label={`${lessonTitle} — ${state}`}
        aria-disabled={state === 'locked'}
      >
        {state === 'unlocked' ? (
          <span className="text-indigo-600">{orderNumber}</span>
        ) : (
          <span className={state === 'complete' ? 'text-white' : ''}>{stateIcon[state]}</span>
        )}
      </button>
      {state === 'unlocked' && (
        <span className="absolute -top-1 -end-1 w-3 h-3 bg-indigo-600 rounded-full animate-pulse" />
      )}
    </div>
  )
}
```

### Route guard in RootLayout

```tsx
// web/src/App.tsx — RootLayout
import { Navigate, Outlet } from 'react-router'
import { useProgressStore, useHasHydrated } from './store/useProgressStore'

function RootLayout() {
  const hasOnboarded = useProgressStore(s => s.hasOnboarded)
  const hasHydrated = useHasHydrated()
  const pendingLevelUp = useProgressStore(s => s.pendingLevelUp)
  const clearPendingLevelUp = useProgressStore(s => s.clearPendingLevelUp)

  if (!hasHydrated) return null  // wait for localStorage read

  if (!hasOnboarded) return <Navigate to="/onboarding" replace />

  return (
    <div className="flex flex-col min-h-dvh">
      <GameHeader />
      <main className="flex-1 flex flex-col pb-14">
        <Outlet />
      </main>
      <TabBar />
      {pendingLevelUp !== null && (
        <LevelUpModal level={pendingLevelUp} onDismiss={clearPendingLevelUp} />
      )}
    </div>
  )
}
```

### Skill tree page consuming shared utilities

```tsx
// web/src/pages/SkillTreePage.tsx
import { chapters } from '@shared/content/curriculum'
import { deriveNodeStates, getCurrentLessonId } from '@shared/skill-tree/skillTreeUtils'
import { useProgressStore } from '@/store/useProgressStore'

export function SkillTreePage() {
  const completedLessons = useProgressStore(s => s.completedLessons)
  const unlockedLessons = useProgressStore(s => s.unlockedLessons)

  const allLessonIds = chapters.flatMap(ch => ch.lessonIds)
  const nodeStates = deriveNodeStates(allLessonIds, completedLessons, unlockedLessons)
  const currentLessonId = getCurrentLessonId(chapters, completedLessons, unlockedLessons)

  return (
    <div className="flex flex-col items-center py-6 px-4 gap-8 overflow-y-auto">
      {chapters.map(chapter => (
        <ChapterSection
          key={chapter.id}
          chapter={chapter}
          nodeStates={nodeStates}
          currentLessonId={currentLessonId}
        />
      ))}
    </div>
  )
}
```

---

## Open Questions

1. **LessonPage + TabBar overlap**
   - What we know: `LessonPage` renders within `RootLayout` which will now include `TabBar`
   - What's unclear: Whether the existing `LessonPage` uses `position: fixed` / `inset-0` overlay styling that would naturally cover the TabBar
   - Recommendation: Check `LessonPage.tsx` during implementation. If it doesn't cover the TabBar, add `fixed inset-0 z-50 bg-white` to the lesson page wrapper.

2. **`lesson/:id` route exclusion from tabs**
   - What we know: Active `NavLink` highlights based on path match
   - What's unclear: Whether being on `/lesson/lesson-01` causes the Home tab to appear active (since `/` is a parent)
   - Recommendation: Use `end` on the Home NavLink and verify behavior. NavLink `end` should prevent this.

---

## Environment Availability

Step 2.6: SKIPPED — phase is purely code/config changes; no external services, databases, or CLI tools beyond the existing Vite + Node dev environment.

---

## Validation Architecture

Step skipped — `workflow.nyquist_validation` is explicitly `false` in `.planning/config.json`.

---

## Sources

### Primary (HIGH confidence)
- Codebase: `web/src/App.tsx` — existing router structure, RootLayout pattern
- Codebase: `web/src/store/useProgressStore.ts` — Zustand persist pattern, `_hasHydrated` flag
- Codebase: `shared/src/skill-tree/skillTreeUtils.ts` — `deriveNodeStates`, `getCurrentLessonId` already implemented
- Codebase: `shared/src/content/curriculum.ts` — 4 chapters, 20 lessons confirmed
- Codebase: `web/src/hooks/useLanguage.ts` — language toggle pattern
- Codebase: `web/src/components/BadgeGrid.tsx` — badge display, reusable as-is
- `.planning/phases/13-skill-tree-navigation/13-CONTEXT.md` — locked decisions
- `.planning/phases/13-skill-tree-navigation/13-UI-SPEC.md` — component inventory, visual spec

### Secondary (MEDIUM confidence)
- React Router 7 `NavLink` `end` prop behavior — standard documented behavior, consistent with v6
- Zustand hydration guard pattern — established community pattern for SSR/persistence timing

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project, no new dependencies
- Architecture: HIGH — patterns derived directly from existing codebase code
- Pitfalls: HIGH — derived from concrete code interactions, not general knowledge

**Research date:** 2026-03-29
**Valid until:** 2026-04-28 (stable stack, 30-day window)
