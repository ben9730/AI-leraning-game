---
phase: 13-skill-tree-navigation
plan: "01"
subsystem: navigation
tags: [tab-navigation, onboarding, router, zustand, i18n]
dependency_graph:
  requires: []
  provides: [tab-bar, onboarding-gate, router-structure]
  affects: [web/src/App.tsx, web/src/store/useProgressStore.ts]
tech_stack:
  added: []
  patterns: [dual-layout-router, onboarding-guard, NavLink-active-state]
key_files:
  created:
    - web/src/components/TabBar.tsx
    - web/src/components/GoalCard.tsx
    - web/src/pages/OnboardingPage.tsx
    - web/src/pages/SkillTreePage.tsx
    - web/src/pages/ProfilePage.tsx
  modified:
    - shared/src/store/types.ts
    - web/src/store/useProgressStore.ts
    - web/src/App.tsx
    - shared/src/i18n/en/common.json
    - shared/src/i18n/he/common.json
decisions:
  - "Dual-layout router: OnboardingLayout (no TabBar) + RootLayout (with TabBar + guard)"
  - "hasOnboarded + learningGoal persisted in Zustand; setOnboarded excluded from partialize"
  - "NavLink end prop on Home tab prevents false active match on /tree and /profile"
  - "Goal cards use contextual labels (Learn AI basics / Improve my prompts / Explore for fun) per CONTEXT.md, not the generic casual/regular/serious"
metrics:
  duration: 12min
  completed_date: "2026-03-29"
  tasks_completed: 2
  files_changed: 9
---

# Phase 13 Plan 01: Tab Navigation + Onboarding Gate Summary

Bottom tab navigation with Home/Skill Tree/Profile and an onboarding gate that redirects new users to a two-step welcome + goal-selection flow before entering the main app.

## What Was Built

### Task 1: Store extension, TabBar, router restructure

- Extended `UserProgress` interface with `hasOnboarded: boolean`, `learningGoal: string | null`, and `setOnboarded(goal)` action
- Added defaults and `setOnboarded` to `useProgressStore`; excluded action from `partialize` so data fields persist
- Created `TabBar` with three `NavLink` tabs — Home (with `end` prop), Skill Tree, Profile — using indigo top border for active state
- Created placeholder `SkillTreePage` and `ProfilePage` components
- Restructured `App.tsx` with dual-layout router: `OnboardingLayout` (bare outlet, no TabBar) and `RootLayout` (hydration + onboarding guard + TabBar + LevelUpModal)

### Task 2: OnboardingPage, GoalCard, i18n

- Added `learnBasics`, `improvePrompts`, `exploreForFun` keys to both EN and HE common.json
- Created `GoalCard` — accessible radio-button card with `role="radio"`, `aria-checked`, selected/default border styles
- Created `OnboardingPage` — two-step flow: step 1 welcome screen, step 2 radiogroup with 3 GoalCards; confirm calls `setOnboarded` and navigates to `/` with replace

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- `web/src/pages/SkillTreePage.tsx` — renders `<div>Skill Tree</div>`. Intentional placeholder; full implementation in Plan 02.
- `web/src/pages/ProfilePage.tsx` — renders `<div>Profile</div>`. Intentional placeholder; full implementation in Plan 03.

## Self-Check: PASSED

All created files exist on disk. Both task commits verified:
- `614dcf4` feat(13-01): extend store, add TabBar, restructure router with onboarding guard
- `8147191` feat(13-01): build OnboardingPage with GoalCard and i18n updates
