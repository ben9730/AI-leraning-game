# Phase 12: Gamification - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the gamification UI layer on top of the existing shared/ engine. Persistent header bar with streak flame, XP counter, and level indicator. Celebration animations on lesson completion and level-up. Badge display on completion screen with toast notifications for new badges. No new game logic — all computation already exists in shared/gamification/.

</domain>

<decisions>
## Implementation Decisions

### UI Components
- Persistent top bar (GameHeader) visible on HomePage and LessonPage with: streak flame icon + day count, XP counter with animated increment, level badge with progress ring
- GameHeader reads from useProgressStore (xpTotal, streakCount, pendingLevelUp)
- Level derived via getLevel(xpTotal) — never stored

### Celebration Animations
- Pure CSS keyframe animations — no external animation library
- Confetti particle burst on lesson completion (CSS particles with random trajectories)
- Scale-up pulse animation on level-up with pendingLevelUp modal
- Subtle XP float-up animation when XP is awarded (+10 XP text floats up and fades)
- No guilt-based mechanics — all positive framing

### Badge Display
- Badge grid on lesson completion screen showing earned badges
- Toast notification for newly earned badges (appears briefly, auto-dismisses)
- Badges derived from shared/gamification/badges.ts — first lesson, 7-day streak, chapter complete
- Badge icons as inline SVG or emoji (no icon library)

### Claude's Discretion
- Exact animation durations and easing curves
- Badge icon design (SVG vs emoji)
- Toast positioning and timing
- Progress ring implementation (SVG circle with stroke-dasharray)

</decisions>

<code_context>
## Existing Code Insights

### From shared/ (already built)
- shared/src/gamification/engine.ts — calcStreakUpdate(), offsetDate(), StreakResult
- shared/src/gamification/badges.ts — badge derivation logic
- shared/src/gamification/constants.ts — LEVEL_THRESHOLDS, STREAK_MULTIPLIER_TIERS
- shared/src/store/types.ts — UserProgress with xpTotal, streakCount, pendingLevelUp, peakStreak, streakFreezes

### From web/ (already built)
- web/src/store/useProgressStore.ts — addXP(), updateStreak(), clearPendingLevelUp(), all state fields
- web/src/pages/LessonPage.tsx — completion screen (needs GameHeader + celebration integration)
- web/src/pages/HomePage.tsx — needs GameHeader integration
- web/src/App.tsx — router with / and /lesson/:id routes

### Integration Points
- GameHeader wraps around router outlet or sits above it
- LessonPage completion phase triggers confetti + badge check
- pendingLevelUp triggers level-up modal, clearPendingLevelUp() dismisses it
- updateStreak() called on lesson completion (already in store)

</code_context>

<specifics>
## Specific Ideas

- Streak flame icon should be visually prominent (orange/red gradient)
- XP counter should show running total, not per-session
- Level progress ring shows % toward next level threshold

</specifics>

<deferred>
## Deferred Ideas

- Daily goal tracking UI (Phase 13 or later)
- Streak freeze UI management (future)
- Leaderboard (out of scope for v2.0)

</deferred>
