# Phase 12: Gamification - Research

**Researched:** 2026-03-29
**Domain:** React gamification UI — CSS animations, SVG progress ring, toast notifications, badge display
**Confidence:** HIGH

## Summary

Phase 12 is a pure UI layer phase. All gamification computation already exists in `shared/src/gamification/` and all state actions already exist in `web/src/store/useProgressStore.ts`. The work is entirely about wiring those into visible UI: a persistent GameHeader bar, celebration animations on lesson completion, a level-up modal, a badge grid on the completion screen, and toast notifications for new badge unlocks.

The stack decision (pure CSS keyframes, no animation library) is locked. The project already has Tailwind v4 via `@import "tailwindcss"` in `globals.css`, which supports arbitrary `@keyframes` defined directly in CSS. All translation keys for gamification, badges, and streaks are already present in `shared/src/i18n/en/common.json` — no new i18n keys are needed. The router uses React Router v7 with `createBrowserRouter`; `App.tsx` needs a layout wrapper to render GameHeader above the router outlet.

The key architectural decision is where GameHeader lives. Currently `App.tsx` renders `<RouterProvider>` directly with no shared layout. A layout route must be introduced so GameHeader renders on both `/` and `/lesson/:id` without duplication.

**Primary recommendation:** Introduce a `RootLayout` component with GameHeader above a `<Outlet />`, register it as a parent route in `createBrowserRouter`, add CSS keyframes to `globals.css`, then build GameHeader, CelebrationOverlay, LevelUpModal, BadgeGrid, and XPToast as focused components.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Persistent top bar (GameHeader) visible on HomePage and LessonPage with: streak flame icon + day count, XP counter with animated increment, level badge with progress ring
- GameHeader reads from useProgressStore (xpTotal, streakCount, pendingLevelUp)
- Level derived via getLevel(xpTotal) — never stored
- Pure CSS keyframe animations — no external animation library
- Confetti particle burst on lesson completion (CSS particles with random trajectories)
- Scale-up pulse animation on level-up with pendingLevelUp modal
- Subtle XP float-up animation when XP is awarded (+10 XP text floats up and fades)
- No guilt-based mechanics — all positive framing
- Badge grid on lesson completion screen showing earned badges
- Toast notification for newly earned badges (appears briefly, auto-dismisses)
- Badges derived from shared/gamification/badges.ts — first lesson, 7-day streak, chapter complete
- Badge icons as inline SVG or emoji (no icon library)

### Claude's Discretion
- Exact animation durations and easing curves
- Badge icon design (SVG vs emoji)
- Toast positioning and timing
- Progress ring implementation (SVG circle with stroke-dasharray)

### Deferred Ideas (OUT OF SCOPE)
- Daily goal tracking UI (Phase 13 or later)
- Streak freeze UI management (future)
- Leaderboard (out of scope for v2.0)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GAME-01 | XP engine, streak tracking, streak freeze, level-up detection (ported from shared/ pure TS) | Engine fully built in shared/; store actions (addXP, updateStreak, clearPendingLevelUp) all exist in useProgressStore. Wire-up only, no new logic. |
| GAME-02 | Badge system — first lesson, 7-day streak, chapter complete (ported from shared/) | deriveBadges() in shared/gamification/badges.ts; 5 badge definitions exist. Completion screen calls deriveBadges with store state; diff against previous badges to detect newly earned. |
| GAME-03 | Celebration animations using CSS transitions (replacing Lottie + Reanimated) | Pure @keyframes in globals.css: confetti burst, scale-up pulse, float-up XP text. Tailwind v4 supports arbitrary keyframe definitions in the CSS layer. |
| GAME-04 | Streak display with flame icon, XP counter, level indicator visible in UI | GameHeader component reads xpTotal, streakCount from useProgressStore; getLevel(xpTotal) for level; SVG circle with stroke-dasharray for progress ring. Needs RootLayout wrapper in App.tsx. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.0.0 | Component rendering | Already installed |
| Tailwind v4 | 4.0.0 | Utility classes + @keyframes host | Already installed, `@import "tailwindcss"` in globals.css |
| Zustand | 5.0.12 | Store reads (no new actions needed) | Already installed, all actions exist |
| react-i18next | 17.0.1 | `useTranslation` for gamification keys | Already installed, all gamification keys exist in common.json |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Router v7 | 7.13.2 | Layout route / Outlet pattern | RootLayout wrapper in createBrowserRouter |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pure CSS @keyframes | framer-motion / react-spring | Locked decision — no external animation library |
| Emoji badge icons | SVG icon library | Emoji is simpler, no dependency; CONTEXT.md says SVG or emoji |
| SVG stroke-dasharray ring | Canvas / third-party | SVG is zero-dependency and RTL-safe |

**Installation:** No new packages required. Everything is already in `web/package.json`.

## Architecture Patterns

### Recommended Project Structure
```
web/src/
├── components/
│   ├── GameHeader.tsx         # persistent top bar (streak + XP + level ring)
│   ├── LevelUpModal.tsx       # fullscreen modal on pendingLevelUp
│   ├── BadgeGrid.tsx          # grid of Badge cards for completion screen
│   ├── XPFloatUp.tsx          # "+N XP" float-up animation overlay
│   └── BadgeToast.tsx         # auto-dismiss toast for new badge
├── pages/
│   ├── LessonPage.tsx         # add CelebrationOverlay + BadgeGrid + XPFloatUp
│   └── HomePage.tsx           # no changes needed (GameHeader from layout)
├── styles/
│   └── globals.css            # add @keyframes here
└── App.tsx                    # add RootLayout with Outlet
```

### Pattern 1: Layout Route (RootLayout)
**What:** A parent route component that renders `<GameHeader />` above `<Outlet />` so all child routes share the header.
**When to use:** Any time a UI element must appear on multiple routes without repeating it in each page component.
**Example:**
```tsx
// web/src/App.tsx
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router'
import { GameHeader } from './components/GameHeader'

function RootLayout() {
  return (
    <div className="flex flex-col min-h-dvh">
      <GameHeader />
      <Outlet />
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/lesson/:id', element: <LessonPage /> },
    ],
  },
])
```

### Pattern 2: SVG Progress Ring (stroke-dasharray)
**What:** An SVG circle where `stroke-dasharray` encodes fill percentage. Zero dependencies, RTL-safe.
**When to use:** Level progress indicator in GameHeader.
**Example:**
```tsx
// Circumference = 2 * π * r
// fill = (xpInCurrentLevel / xpToNextLevel) * circumference
function ProgressRing({ fill }: { fill: number }) {
  const r = 16
  const circ = 2 * Math.PI * r
  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      {/* track */}
      <circle cx="20" cy="20" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
      {/* fill — rotate -90deg so fill starts at top */}
      <circle
        cx="20" cy="20" r={r}
        fill="none"
        stroke="#6366f1"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${fill * circ} ${circ}`}
        transform="rotate(-90 20 20)"
      />
    </svg>
  )
}
```

### Pattern 3: CSS @keyframes in globals.css (Tailwind v4)
**What:** Define animation keyframes directly in the global CSS file. Reference them with Tailwind's `animate-[name]` arbitrary value syntax or custom CSS classes.
**When to use:** Confetti burst, XP float-up, scale-up pulse.
**Example:**
```css
/* web/src/styles/globals.css */
@import "tailwindcss";

@keyframes float-up {
  0%   { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-48px); }
}

@keyframes scale-pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}

@keyframes confetti-fall {
  0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
  100% { opacity: 0; transform: translateY(200px) rotate(720deg); }
}
```

Then in React:
```tsx
// Inline style or Tailwind arbitrary value
<div style={{ animation: 'float-up 0.8s ease-out forwards' }}>+{xp} XP</div>
```

### Pattern 4: Badge "newly earned" diffing
**What:** Compare badge state before and after lesson completion to detect newly earned badges for the toast.
**When to use:** LessonPage completion handler.
**Example:**
```tsx
// In LessonPage handleContinue, after calling completeLesson() + addXP():
const prevBadges = deriveBadges(completedLessons, peakStreak, xpTotal, streakFreezeUsedEver)
completeLesson(lesson.id)
addXP(lesson.xpReward, 'lesson_complete')
// Re-read state (Zustand state is synchronous after set())
const newState = useProgressStore.getState()
const newBadges = deriveBadges(newState.completedLessons, newState.peakStreak, newState.xpTotal, newState.streakFreezeUsedEver)
const newlyEarned = newBadges.filter((b, i) => b.earned && !prevBadges[i].earned)
```
Note: This diffing must happen in a callback (not during render). Use `useProgressStore.getState()` to read store state synchronously after mutations.

### Pattern 5: Confetti particles (pure CSS)
**What:** Render N absolutely-positioned `<div>` elements with randomised inline styles (color, left offset, animation-delay, animation-duration). Each plays `confetti-fall` keyframe.
**When to use:** Lesson completion overlay.
**Example:**
```tsx
const COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6']
const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  color: COLORS[i % COLORS.length],
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 0.5}s`,
  duration: `${0.8 + Math.random() * 0.6}s`,
}))

// Rendered inside a fixed, pointer-events-none overlay
particles.map(p => (
  <div key={p.id} style={{
    position: 'absolute',
    left: p.left, top: 0,
    width: 8, height: 8,
    borderRadius: 2,
    backgroundColor: p.color,
    animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
  }} />
))
```
Important: Randomise particle positions once (useMemo or useState initial value), not on every render.

### Anti-Patterns to Avoid
- **Storing currentLevel in Zustand:** CONTEXT.md and `types.ts` both say "NEVER store currentLevel — always derive from xpTotal" using `getLevel()`.
- **Left/right CSS properties:** All positioning must use CSS logical properties (`inset-inline-start`, Tailwind `ps-*`/`pe-*`/`start-*`/`end-*`) for RTL support.
- **Calling deriveBadges during render in LessonPage for diffing:** The diff must happen in the completion callback, not a render-time comparison (causes incorrect diffs on StrictMode double-invoke).
- **Re-randomising confetti positions on re-render:** Causes visual jitter. Initialise with `useState(() => generateParticles())` or `useMemo`.
- **Toast auto-dismiss via setInterval:** Use `setTimeout` inside a `useEffect` with cleanup to auto-dismiss after ~3 seconds.
- **Adding `updateStreak()` call inside LessonPage:** `updateStreak()` is already called in the store's `completeLesson` flow — verify before adding a second call. (Actually: `updateStreak` is a separate action. It must be called explicitly on lesson completion alongside `completeLesson` + `addXP`.)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XP / streak / level computation | Custom math | `calcXP`, `calcStreakUpdate`, `getLevel` from shared/ | Already built, tested, pure TS |
| Badge derivation | Custom badge check logic | `deriveBadges()` from shared/gamification/badges.ts | Already built, handles all 5 badge types |
| i18n strings | Hardcoded English | `useTranslation` with existing keys in common.json | All gamification/streak/badge keys already exist |
| Animation library | framer-motion, react-spring | CSS @keyframes | Locked decision; CSS is sufficient for these simple animations |

**Key insight:** This phase is entirely UI wiring. The business logic is done. Every calculation has a tested pure function in shared/.

## Common Pitfalls

### Pitfall 1: GameHeader causes layout shift in LessonPage
**What goes wrong:** LessonPage uses `min-h-dvh` for its own full-screen layout. With a GameHeader of ~56px above it, the content is pushed down and "complete" screen doesn't fill the viewport.
**Why it happens:** Both elements claim full viewport height.
**How to avoid:** Change LessonPage (and HomePage) to use `flex-1` rather than `min-h-dvh` when inside the RootLayout flex column. Or set GameHeader height explicitly and adjust page padding.
**Warning signs:** Vertical scrollbar appearing on completion screen.

### Pitfall 2: pendingLevelUp modal shown on every re-render
**What goes wrong:** LevelUpModal triggers repeatedly because `pendingLevelUp` is read in render but `clearPendingLevelUp()` is not called until modal dismiss.
**Why it happens:** StrictMode double-render or re-hydration re-triggers the show condition.
**How to avoid:** Show LevelUpModal only when `pendingLevelUp !== null`. Clear it via the modal's dismiss/confirm button handler. Never auto-clear in `useEffect` on mount.

### Pitfall 3: Badge toast fires for badges earned in previous sessions
**What goes wrong:** On page load, `deriveBadges` returns already-earned badges and the toast shows them.
**Why it happens:** No diff baseline — code compares current badges against nothing.
**How to avoid:** The diff must only occur at the moment of `handleContinue` when all exercises are done. Store the pre-completion badge state as a local variable immediately before calling store actions.

### Pitfall 4: XP float-up animation shows wrong amount
**What goes wrong:** The floating "+N XP" shows the base XP not the computed total (with streak multiplier).
**Why it happens:** `lesson.xpReward` is the base; the actual XP added by `addXP` after `calcXP` may differ.
**How to avoid:** Read `xpTotal` difference from store before/after `addXP`, or store the XP amount as local state when the lesson completes.

### Pitfall 5: Confetti positions differ between renders (hydration flicker)
**What goes wrong:** Particles jump positions after initial render.
**Why it happens:** `Math.random()` called during render produces different values each time.
**How to avoid:** Initialise particle array once with `useState(() => generateParticles())`.

### Pitfall 6: RTL breaks flame icon alignment
**What goes wrong:** Streak flame and day count swap positions under Hebrew RTL.
**Why it happens:** Using `flex-row` without controlling item order explicitly.
**How to avoid:** The flame icon + count is a semantic unit — wrap them together in a single flex container using `gap-*` (which is direction-neutral) rather than margin-start/end between them.

## Code Examples

### getLevel usage
```typescript
// Source: shared/src/store/types.ts
import { getLevel } from '@shared/store/types'
import { LEVEL_THRESHOLDS } from '@shared/gamification/constants'

const level = getLevel(xpTotal)   // returns 1-8 (LEVEL_THRESHOLDS has 8 entries)
const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
const prevThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
const fillRatio = (xpTotal - prevThreshold) / (nextThreshold - prevThreshold)
```

### Reading store in GameHeader
```tsx
// Minimal selector pattern — avoids re-renders on unrelated state changes
const xpTotal = useProgressStore(s => s.xpTotal)
const streakCount = useProgressStore(s => s.streakCount)
const pendingLevelUp = useProgressStore(s => s.pendingLevelUp)
```

### i18n keys already available (no additions needed)
```
gamification.level          → "Level {{level}}"
gamification.level_up       → "Level Up!"
gamification.level_up_message → "You reached Level {{level}}!"
streak.days                 → "{{count}} day streak"
streak.start                → "Start your streak!"
badge.first_lesson.title    → "First Steps"
badge.streak_7.title        → "On Fire"
badge.chapter_1.title       → "Chapter Champion"
badge.level_3.title         → "Rising Star"
badge.resilient.title       → "Resilient"
badge.earned                → "Earned!"
badge.locked                → "Keep going to earn this badge"
lesson.xp_earned            → "+{{xp}} XP"
```

### Tailwind v4 @layer for animation utilities
```css
/* globals.css — define animations here, reference via style prop or @layer utilities */
@layer utilities {
  .animate-float-up {
    animation: float-up 0.8s ease-out forwards;
  }
  .animate-scale-pulse {
    animation: scale-pulse 0.4s ease-in-out;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Lottie + Reanimated (React Native) | Pure CSS @keyframes | v2.0 pivot | No external dependency; browser-native |
| Store currentLevel | Derive via getLevel(xpTotal) | Architecture decision | Single source of truth, no sync bugs |
| Badges stored in state | Badges always derived fresh | Architecture decision | No stale badge state possible |

## Open Questions

1. **updateStreak() call timing**
   - What we know: `updateStreak()` exists in useProgressStore but is NOT called inside `completeLesson()` — they are separate actions.
   - What's unclear: Whether `updateStreak()` should be called at lesson completion time or somewhere else (e.g., on app load).
   - Recommendation: Call `updateStreak()` alongside `completeLesson()` and `addXP()` in `LessonPage.handleContinue`. This matches the intended pattern — one activity per day updates the streak.

2. **GameHeader height and LessonPage layout**
   - What we know: LessonPage currently uses `min-h-dvh` for full-screen phases.
   - What's unclear: Whether the design intends GameHeader to overlay lessons or sit above them.
   - Recommendation: GameHeader sits above lesson content (not overlay). Change page root containers from `min-h-dvh` to `flex-1` when inside RootLayout.

## Environment Availability

Step 2.6: SKIPPED — Phase is pure code/config changes. No external tools, services, or CLIs required beyond what is already installed in web/package.json.

## Sources

### Primary (HIGH confidence)
- Direct source read: `shared/src/gamification/engine.ts` — calcStreakUpdate, calcXP, StreakResult, XPResult APIs
- Direct source read: `shared/src/gamification/badges.ts` — deriveBadges, BADGE_DEFINITIONS, Badge interface
- Direct source read: `shared/src/gamification/constants.ts` — LEVEL_THRESHOLDS [0,100,250,500,1000,2000,3500,5000], STREAK_MULTIPLIER_TIERS
- Direct source read: `shared/src/store/types.ts` — UserProgress interface, getLevel function
- Direct source read: `web/src/store/useProgressStore.ts` — all store actions and state shape
- Direct source read: `web/src/pages/LessonPage.tsx` — current completion flow, integration points
- Direct source read: `web/src/pages/HomePage.tsx` — current structure
- Direct source read: `web/src/App.tsx` — router structure (no layout route yet)
- Direct source read: `web/src/styles/globals.css` — Tailwind v4 setup, RTL convention
- Direct source read: `shared/src/i18n/en/common.json` — all existing gamification/badge/streak translation keys
- Direct source read: `web/package.json` — installed dependencies (no new deps needed)
- Direct source read: `.planning/phases/12-gamification/12-CONTEXT.md` — locked decisions
- Direct source read: `.planning/config.json` — nyquist_validation: false

### Secondary (MEDIUM confidence)
- React Router v7 Layout Routes pattern — Outlet in parent route element is standard React Router pattern, consistent with react-router v7.13.2 installed
- SVG stroke-dasharray progress ring — well-established SVG pattern, no library needed

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — read directly from package.json and source files
- Architecture: HIGH — all integration points verified from source; RootLayout is standard React Router pattern
- Pitfalls: HIGH — derived from reading actual code (StrictMode ref guard already in LessonPage, existing layout patterns)
- i18n keys: HIGH — read directly from common.json; all keys exist

**Research date:** 2026-03-29
**Valid until:** 2026-04-28 (stable stack — Tailwind v4 / React 19 / React Router v7 unlikely to change in 30 days)
