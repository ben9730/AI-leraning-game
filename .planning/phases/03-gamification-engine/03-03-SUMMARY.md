---
phase: 03-gamification-engine
plan: 03
subsystem: gamification-celebrations
tags: [badges, lottie, celebrations, level-up, profile, i18n, tdd]
dependency_graph:
  requires: [03-01, 03-02]
  provides: [deriveBadges, LessonCelebration, LevelUpModal, badge-profile-grid]
  affects: [LessonScreen, LessonCompletionScreen, profile-tab]
tech_stack:
  added: [lottie-react-native]
  patterns: [derived-state-badges, celebration-overlay, level-up-modal-flow, tone-guard-test]
key_files:
  created:
    - PromptPlay/src/features/gamification/badges.ts
    - PromptPlay/src/features/gamification/badges.test.ts
    - PromptPlay/src/features/gamification/tone.test.ts
    - PromptPlay/src/features/gamification/celebrations/LessonCelebration.tsx
    - PromptPlay/src/features/gamification/celebrations/LevelUpModal.tsx
    - PromptPlay/assets/lottie/celebration.json
    - PromptPlay/assets/lottie/level-up.json
    - PromptPlay/__mocks__/lottie-react-native.js
  modified:
    - PromptPlay/src/features/lesson/LessonCompletionScreen.tsx
    - PromptPlay/src/features/lesson/LessonScreen.tsx
    - PromptPlay/app/(tabs)/profile.tsx
    - PromptPlay/src/i18n/en/common.json
    - PromptPlay/src/i18n/he/common.json
    - PromptPlay/jest.config.js
decisions:
  - Lottie placeholder JSON files used for v1 — real confetti/level-up animations to be swapped before release
  - pointerEvents moved to wrapper View (not LottieView prop) — LottieView type does not accept pointerEvents directly
  - Level-up flow is post-Continue (not mid-completion) — user taps Continue on completion screen, then sees level-up modal
  - tone.test.ts scopes only gamification/streak/badge/level keys — exercise.failed is excluded (instructional, not punitive)
metrics:
  duration: ~35 min
  completed_date: "2026-03-28"
  tasks_completed: 2
  tasks_total: 3
  files_created: 8
  files_modified: 6
  tests_added: 64
  checkpoint_pending: true
---

# Phase 03 Plan 03: Celebrations, Badges, and Profile Summary

One-liner: 5 derived badges, Lottie celebration on lesson completion, full-screen level-up modal with haptics, and badge grid in Profile tab — wired into the complete lesson flow.

## What Was Built

### Task 1: Badge Derivation System (TDD)

`deriveBadges(completedLessons, peakStreak, xpTotal, streakFreezeUsedEver): Badge[]` — pure function, never stored.

5 badges defined in `BADGE_DEFINITIONS`:
- `first_lesson` — earned when completedLessons.length >= 1
- `streak_7` — earned when peakStreak >= 7 (uses peak, not current)
- `chapter_1_complete` — earned when all 5 CHAPTER_1_LESSON_IDS are completed
- `level_3` — earned when getLevel(xpTotal) >= 3
- `resilient` — earned when streakFreezeUsedEver is true

Tone guard test (`tone.test.ts`) scans gamification/streak/badge/level i18n keys for guilt-framing words (lose, lost, miss, fail, die, break, punish, shame, guilt). All 64 tests green.

### Task 2: Celebrations and Wiring

**LessonCelebration.tsx** — absolute-positioned Lottie overlay, `pointerEvents="none"` on wrapper View so user can tap Continue underneath. Fires `Haptics.notificationAsync(Success)` on mount.

**LevelUpModal.tsx** — full-screen Modal with semi-transparent backdrop, Lottie animation, level number, "Continue" button. Fires `Haptics.impactAsync(Heavy)` on mount. RTL-safe with `paddingStart/End` and dynamic textAlign.

**LessonCompletionScreen** — added `LessonCelebration` overlay (plays once on mount), XP breakdown display (base, streak bonus if >1x, perfection bonus if >0).

**LessonScreen** — level-up flow: `handleFinish` checks `pendingLevelUp` after store updates; if set, shows `LevelUpModal` rather than navigating home. `handleLevelUpDismiss` calls `clearPendingLevelUp()` then navigates home — prevents re-fire on next app open.

**profile.tsx** — badge grid (2-column wrap), stats row (Level / XP / Streak), daily goal display, language toggle. Earned badges full color, unearned dimmed (opacity 0.65) with grey status pill.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] pointerEvents not valid on LottieView prop**
- Found during: Task 2 TypeScript check
- Issue: `pointerEvents` is not in LottieView's prop types — TypeScript error TS2322
- Fix: Wrapped LottieView in a `<View style={overlay} pointerEvents="none">` container
- Files modified: LessonCelebration.tsx
- Commit: 07cf6f3

### Out of Scope (Pre-existing)

- `MMKVAdapter.ts` TS2693 error (`MMKV only refers to a type`) — pre-existing, unrelated to this plan. Logged for deferred fix.

## Checkpoint: Human Verification Pending

Task 3 is a `checkpoint:human-verify` — the following visual checks require running the app:

1. Complete a lesson → Lottie confetti animation plays on completion screen
2. XP breakdown shows base XP (and streak bonus if streak > 2)
3. Complete enough lessons to cross level threshold → full-screen level-up modal appears after tapping Continue
4. Haptic feedback fires on level-up; tapping Continue dismisses and navigates home; re-opening app does NOT re-show modal
5. Profile tab shows badge grid with 5 badges; "First Steps" earned after first lesson
6. No guilt-framing text anywhere in gamification copy
7. Hebrew locale renders correctly with RTL layout

**Resume signal:** Type "approved" or describe any issues found.

## Self-Check

Files exist:
- PromptPlay/src/features/gamification/badges.ts — FOUND
- PromptPlay/src/features/gamification/badges.test.ts — FOUND
- PromptPlay/src/features/gamification/tone.test.ts — FOUND
- PromptPlay/src/features/gamification/celebrations/LessonCelebration.tsx — FOUND
- PromptPlay/src/features/gamification/celebrations/LevelUpModal.tsx — FOUND
- PromptPlay/assets/lottie/celebration.json — FOUND
- PromptPlay/assets/lottie/level-up.json — FOUND

Commits:
- f727731 feat(03-03): badge derivation system and tone audit test
- 07cf6f3 feat(03-03): celebration animations, level-up modal, profile badges, and wiring

Tests: 195 passed, 16 suites (0 failures, 0 regressions)
TypeScript: 0 new errors (pre-existing MMKVAdapter error excluded)

## Self-Check: PASSED
