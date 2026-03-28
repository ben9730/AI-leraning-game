---
phase: 03-gamification-engine
plan: "02"
subsystem: gamification
tags: [streak, freeze, engine, ui, i18n, tdd]
dependency_graph:
  requires: ["03-01"]
  provides: ["streak-engine", "streak-badge-ui", "freeze-mechanics"]
  affects: ["home-screen", "progress-store"]
tech_stack:
  added: []
  patterns: ["pure-function engine", "TDD red-green", "RTL-safe layout"]
key_files:
  created:
    - PromptPlay/src/features/gamification/streakDisplay.tsx
  modified:
    - PromptPlay/src/features/gamification/engine.ts
    - PromptPlay/src/features/gamification/engine.test.ts
    - PromptPlay/src/store/useProgressStore.ts
    - PromptPlay/src/i18n/en/common.json
    - PromptPlay/src/i18n/he/common.json
    - PromptPlay/app/(tabs)/index.tsx
decisions:
  - "offsetDate uses new Date(iso + 'T00:00:00') to parse as local midnight — avoids UTC shift when computing yesterday/day-before"
  - "2+ day gap preserves existing freezes (not consumed) — freeze only applies to exactly 1 missed day"
  - "shouldGrantFreeze condition in store is: milestone AND streak advanced (not same-day re-trigger)"
  - "StreakBadge shows shield emoji for freeze indicator in v1 — Lottie animation deferred to 03-03"
metrics:
  duration_minutes: 25
  completed_date: "2026-03-28"
  tasks_completed: 2
  files_changed: 7
---

# Phase 03 Plan 02: Streak Engine and StreakBadge Summary

**One-liner:** Streak engine with local-timezone midnight reset, freeze grant/consumption at 7-day milestones, and StreakBadge UI on home tab — implemented TDD with 56 green tests.

## What Was Built

### Task 1: calcStreakUpdate pure function + store wiring (TDD)

Added to `engine.ts`:
- `StreakResult` interface: `{ newStreakCount, newFreezes, freezeConsumed }`
- `offsetDate(isoDate, days)` — pure date math using local-timezone parsing
- `calcStreakUpdate(lastActivityDate, streakCount, streakFreezes, todayISO)` — handles all 6 cases
- `shouldGrantFreeze(newStreakCount)` — true at positive multiples of 7

Updated `useProgressStore.ts`:
- Replaced stub `updateStreak` with `calcStreakUpdate`-based implementation
- `peakStreak` updated via `Math.max(peakStreak, result.newStreakCount)`
- `streakFreezeUsedEver` set to true when freeze consumed
- Freeze granted at 7-day milestones (only when streak actually advanced)
- Implemented `consumeStreakFreeze` and `grantStreakFreeze` (replaced stubs from 03-01)

TDD: 56 tests pass across `calcXP` and new `calcStreakUpdate`/`shouldGrantFreeze` suites.

### Task 2: StreakBadge component + home screen + i18n

Created `streakDisplay.tsx`:
- `StreakBadge` component reads `streakCount` and `streakFreezes` from store
- Flame emoji + bold count when streak > 0; encouraging "Start your streak!" when 0
- Shield emoji freeze indicator when `streakFreezes > 0`
- `compact` prop for header embedding
- RTL-safe throughout (`paddingStart/End`, `marginStart/End`, `gap`)

Updated i18n (en + he):
- `streak.days`, `streak.start`, `streak.freeze_available`, `streak.freeze_used`, `streak.milestone`
- All text is encouraging — no guilt, no "lose", no "break", no "miss" (GAME-09 compliant)

Updated `app/(tabs)/index.tsx`:
- `StreakBadge` rendered below title on home tab

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

### Files exist
- engine.ts modified: FOUND
- engine.test.ts modified: FOUND
- streakDisplay.tsx created: FOUND
- useProgressStore.ts modified: FOUND
- en/common.json modified: FOUND
- he/common.json modified: FOUND
- index.tsx modified: FOUND

### Commits exist
- fbb9a26: feat(03-02): streak engine with freeze mechanics and store wiring
- fbc7d45: feat(03-02): StreakBadge component and home screen integration

## Self-Check: PASSED
