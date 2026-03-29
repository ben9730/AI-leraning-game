---
phase: 13-skill-tree-navigation
plan: "03"
subsystem: profile
tags: [profile, badges, gamification, i18n, rtl, zustand, tooltip]
dependency_graph:
  requires: [13-01]
  provides: [profile-page, badge-tooltip, language-switcher]
  affects:
    - web/src/pages/ProfilePage.tsx
    - web/src/components/BadgeGrid.tsx
    - shared/src/i18n/en/common.json
    - shared/src/i18n/he/common.json
tech_stack:
  added: []
  patterns:
    - useState-toggle for tooltip active state
    - Fixed backdrop div for outside-click dismiss
    - useMemo for badge derivation
    - Zustand selector per field for fine-grained reactivity
key_files:
  created: []
  modified:
    - web/src/pages/ProfilePage.tsx
    - web/src/components/BadgeGrid.tsx
    - shared/src/i18n/en/common.json
    - shared/src/i18n/he/common.json
decisions:
  - "Tooltip dismiss via fixed backdrop div (z-0 beneath tooltip z-10) — no external library needed"
  - "Badge tooltip uses text-start for RTL-safe text alignment"
  - "Stat card labels use dedicated i18n keys (profile.xp, profile.streak, profile.lessonsCompleted) not inline text"
  - "fillRatio clamps gracefully: if nextThreshold equals prevThreshold, fill=1 (max level)"
metrics:
  duration: 8min
  completed_date: "2026-03-29"
  tasks_completed: 2
  files_changed: 4
---

# Phase 13 Plan 03: Profile Page — Stats, Badges, Language Switcher Summary

ProfilePage with XP/streak/level/lessons stat cards, BadgeGrid tooltip interaction, and language switcher — all derived from the Zustand store with full EN/HE RTL support.

## What Was Built

### Task 1: BadgeGrid tooltip interaction

- Added `useState<string | null>` for `activeBadge` — stores the ID of the tapped badge
- Converted each badge `<div>` to a `<button type="button">` with toggle `onClick` (tap same badge to dismiss)
- Added absolute-positioned tooltip popover below each badge button showing `titleKey` + `descriptionKey` via `t()`
- Added fixed-inset backdrop `<div>` (z-0) rendered when any badge is active — clicking it clears `activeBadge`
- Tooltip uses `text-start` for RTL-safe alignment; `z-10` keeps it above backdrop

### Task 2: Full ProfilePage implementation

- Replaced the `<div>Profile</div>` placeholder with complete implementation
- Reads 5 Zustand selectors: `xpTotal`, `streakCount`, `completedLessons`, `peakStreak`, `streakFreezeUsedEver`
- Derives `level` via `getLevel(xpTotal)` and `fillRatio` from `LEVEL_THRESHOLDS` for ProgressRing
- `badges` array via `useMemo(() => deriveBadges(...), [...deps])` — never stored, always computed
- 2x2 stats grid: XP card, Streak card, Level card (ProgressRing size=56), Lessons Completed card
- Language switcher button at top using `useLanguage().toggleLanguage` — shows `language.switchToHebrew` or `language.switchToEnglish` contextually
- Added 4 new i18n keys to both EN and HE: `profile.badges`, `profile.xp`, `profile.streak`, `profile.lessonsCompleted`
- No physical left/right CSS — uses `text-center`, `text-start` (logical), flex column alignment

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all stat values are live from Zustand store; all badge states derived from real progress data.

## Self-Check: PASSED
