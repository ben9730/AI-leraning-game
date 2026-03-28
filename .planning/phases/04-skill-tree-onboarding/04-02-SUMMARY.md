---
phase: 04-skill-tree-onboarding
plan: 02
subsystem: onboarding
tags: [onboarding, routing, modal, i18n, rtl, expo-router]
dependency_graph:
  requires: []
  provides: [onboarding-flow, goal-selection, account-prompt-modal]
  affects: [app/_layout.tsx, lesson-screen]
tech_stack:
  added: []
  patterns: [expo-router-redirect, zustand-getState-post-hydration, modal-transparent-fade]
key_files:
  created:
    - PromptPlay/app/(onboarding)/_layout.tsx
    - PromptPlay/app/(onboarding)/welcome.tsx
    - PromptPlay/src/features/onboarding/GoalSelector.tsx
    - PromptPlay/src/features/onboarding/AccountPromptModal.tsx
  modified:
    - PromptPlay/app/_layout.tsx
    - PromptPlay/src/features/lesson/LessonScreen.tsx
    - PromptPlay/src/i18n/en/common.json
    - PromptPlay/src/i18n/he/common.json
decisions:
  - "useProgressStore.getState().dailyGoal read post-hydration in RootLayout (not hook) to avoid Rules of Hooks violation in conditional branch"
  - "DAILY_GOAL_XP values are 30/60/100 (not 10/20/30 as plan stated) — used actual constants"
  - "accountPromptShown flag prevents showing modal twice in same session"
  - "navigateAfterLesson() helper extracted to avoid duplicating level-up check logic in both skip and sign-up handlers"
metrics:
  duration_minutes: 18
  completed_date: "2026-03-28"
  tasks_completed: 2
  files_changed: 8
requirements: [ONBR-01, ONBR-02, ONBR-03, ONBR-04]
---

# Phase 04 Plan 02: Onboarding Flow + Deferred Account Prompt Summary

**One-liner:** Friction-free onboarding with goal selection routing new users directly to lesson 1, and a skippable account prompt modal deferred until after lesson 2 completion.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Onboarding route group + root layout redirect | 8961978 | _layout.tsx, welcome.tsx, GoalSelector.tsx, _layout.tsx (root), en+he i18n |
| 2 | Deferred account prompt modal after lesson 2 | 4ff64af | AccountPromptModal.tsx, LessonScreen.tsx, en+he i18n |

## What Was Built

**Task 1 — Onboarding Route Group:**
- `app/(onboarding)/_layout.tsx`: Stack navigator with `headerShown: false`
- `app/(onboarding)/welcome.tsx`: Welcome screen with app title/subtitle and GoalSelector
- `src/features/onboarding/GoalSelector.tsx`: Three-option picker (casual/regular/serious) showing real XP targets (30/60/100 XP/day), RTL-aware
- `app/_layout.tsx`: Added `Redirect` import + post-hydration `dailyGoal === null` check redirects new users to `/(onboarding)/welcome`; added `(onboarding)` Stack.Screen entry
- i18n keys added: `onboarding.welcome.*`, `onboarding.goal.*`, `accountPrompt.*` in both en and he

**Task 2 — Deferred Account Prompt:**
- `src/features/onboarding/AccountPromptModal.tsx`: Bottom-sheet style Modal with `transparent` + `animationType="fade"`, encouraging copy (no guilt language), "Create Account" primary + "Maybe Later" secondary buttons
- `LessonScreen.tsx`: Added `showAccountPrompt` + `accountPromptShown` state; `handleFinish` checks `completedLessons.length >= 2 && !accountPromptShown` after all store updates; extracted `navigateAfterLesson()` helper; sign-up handler dismisses modal (real auth wired in 04-03)

## User Flow

```
New user opens app
  → dailyGoal === null → Redirect to /(onboarding)/welcome
  → Select goal (casual/regular/serious)
  → setDailyGoal(goal) + router.replace('/(lesson)/lesson-01-what-is-prompting')
  → [lesson 1 complete] → no prompt
  → [lesson 2 complete] → AccountPromptModal appears
  → Skip → navigate home normally
  → Create Account → dismiss modal (auth TBD in 04-03)

Returning user opens app
  → dailyGoal set → RootLayoutNav renders → (tabs) immediately
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] DAILY_GOAL_XP values corrected**
- **Found during:** Task 1 implementation
- **Issue:** Plan stated XP values as 10/20/30 but actual `DAILY_GOAL_XP` constants are 30/60/100
- **Fix:** Used actual constants from `src/features/gamification/constants.ts`
- **Files modified:** GoalSelector.tsx (uses `DAILY_GOAL_XP[goal]` directly)
- **Commit:** 8961978

**2. [Rule 2 - Missing] navigateAfterLesson helper extracted**
- **Found during:** Task 2
- **Issue:** Level-up check logic would be duplicated in both `handleAccountPromptSkip` and `handleAccountPromptSignUp`
- **Fix:** Extracted `navigateAfterLesson()` helper before `handleFinish`
- **Files modified:** LessonScreen.tsx
- **Commit:** 4ff64af

## Self-Check: PASSED

Files created:
- FOUND: PromptPlay/app/(onboarding)/_layout.tsx
- FOUND: PromptPlay/app/(onboarding)/welcome.tsx
- FOUND: PromptPlay/src/features/onboarding/GoalSelector.tsx
- FOUND: PromptPlay/src/features/onboarding/AccountPromptModal.tsx

Commits verified:
- FOUND: 8961978
- FOUND: 4ff64af
