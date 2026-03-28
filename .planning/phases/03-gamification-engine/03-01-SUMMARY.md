---
phase: 03-gamification-engine
plan: 01
subsystem: gamification
tags: [xp, levels, streaks, store, i18n]
dependency_graph:
  requires: []
  provides: [calcXP, XPResult, pendingLevelUp, peakStreak, getLevel, gamification-i18n]
  affects: [useProgressStore, LessonScreen, LessonCompletionScreen]
tech_stack:
  added: []
  patterns: [pure-function-engine, level-derivation, zustand-level-up-detection]
key_files:
  created:
    - PromptPlay/src/features/gamification/engine.ts
    - PromptPlay/src/features/gamification/constants.ts
    - PromptPlay/src/features/gamification/engine.test.ts
    - PromptPlay/src/features/gamification/constants.test.ts
  modified:
    - PromptPlay/src/store/types.ts
    - PromptPlay/src/store/useProgressStore.ts
    - PromptPlay/src/features/lesson/LessonScreen.tsx
    - PromptPlay/src/features/lesson/LessonCompletionScreen.tsx
    - PromptPlay/src/i18n/en/common.json
    - PromptPlay/src/i18n/he/common.json
    - PromptPlay/jest.config.js
decisions:
  - "Level is always derived from xpTotal via getLevel() — never stored in state"
  - "getLevel() refactored to import LEVEL_THRESHOLDS from constants.ts for single source of truth"
  - "todayISO() uses toLocaleDateString('en-CA') for local timezone correctness instead of UTC slice"
  - "consumeStreakFreeze/grantStreakFreeze added as stubs now to prevent type errors; implemented in plan 03-02"
  - "xpBreakdown passed to LessonCompletionScreen as optional prop — rendered in plan 03-03 celebration UI"
  - "updateStreak also updates peakStreak to track highest-ever streak for badge derivation"
metrics:
  duration: ~25min
  completed_date: 2026-03-28
  tasks_completed: 2
  files_changed: 11
---

# Phase 03 Plan 01: XP Engine and Store Wiring Summary

XP calculation engine with streak multiplier tiers and perfection bonus, wired into Zustand store with level-up detection and level-derived-from-XP pattern.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | XP engine pure functions, constants, tests | (prior session) | engine.ts, constants.ts, *.test.ts, jest.config.js |
| 2 | Wire XP engine to store and LessonScreen | 9cbbc18 | types.ts, useProgressStore.ts, LessonScreen.tsx, LessonCompletionScreen.tsx, i18n |

## What Was Built

**Task 1 (prior):** Pure `calcXP(lessonBaseXP, streakCount, isPerfect)` function with four streak multiplier tiers (1.0/1.1/1.2/1.5 at 0/3/7/14 days), 50% perfection bonus, and full Jest test coverage. Constants file with `LEVEL_THRESHOLDS`, `DAILY_GOAL_XP`, `BASE_LESSON_XP`.

**Task 2:** Extended `UserProgress` type with `pendingLevelUp`, `peakStreak`, `streakFreezeUsedEver` and three new actions. Updated `addXP` to detect level transitions and set `pendingLevelUp`. Fixed `todayISO()` to use local timezone. Updated `updateStreak` to also track `peakStreak`. Wired `calcXP` into `LessonScreen.handleFinish` — lesson completion now computes XP with streak and perfection factors. Added `xpBreakdown` optional prop to `LessonCompletionScreen`. Added gamification i18n keys (English and Hebrew) with encouraging tone only.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing functionality] peakStreak tracking in updateStreak**
- **Found during:** Task 2
- **Issue:** Plan specified `peakStreak` field and backfill in `onRehydrateStorage`, but did not mention updating `peakStreak` on each `updateStreak` call
- **Fix:** Added `peakStreak: Math.max(peakStreak, newStreak)` inside `updateStreak` so the field stays current, not just backfilled at hydration
- **Files modified:** PromptPlay/src/store/useProgressStore.ts
- **Commit:** 9cbbc18

**2. [Rule 1 - Bug] LessonScreen computed xpResult only in handleFinish**
- **Found during:** Task 2
- **Issue:** Plan's pseudocode placed `calcXP` inside `handleFinish`, but `LessonCompletionScreen` needs `xpBreakdown` at render time (before finish is pressed), not only after
- **Fix:** Added a second `calcXP` call at render-time in the `phase === 'complete'` branch to compute `xpResult` for passing as `xpBreakdown` prop; `handleFinish` still computes its own at call time via `useProgressStore.getState()`
- **Files modified:** PromptPlay/src/features/lesson/LessonScreen.tsx
- **Commit:** 9cbbc18

## Self-Check: PASSED

- FOUND: PromptPlay/src/store/types.ts
- FOUND: PromptPlay/src/store/useProgressStore.ts
- FOUND: PromptPlay/src/features/lesson/LessonScreen.tsx
- FOUND: PromptPlay/src/i18n/en/common.json
- FOUND: .planning/phases/03-gamification-engine/03-01-SUMMARY.md
- FOUND commit 9cbbc18
