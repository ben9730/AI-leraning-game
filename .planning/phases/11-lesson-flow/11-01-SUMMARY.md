---
phase: 11-lesson-flow
plan: "01"
subsystem: web/lesson-flow
tags: [react-router, lesson-page, dot-stepper, tdd, routing]
dependency_graph:
  requires: [10-01, 10-02, 09-01]
  provides: [lesson-flow-page, dot-stepper, react-router-routing]
  affects: [web/src/App.tsx, web/src/pages/LessonPage.tsx, web/src/components/DotStepper.tsx]
tech_stack:
  added: [react-router@^7]
  patterns: [createBrowserRouter, RouterProvider, state-machine-phases, completionHandledRef-guard]
key_files:
  created:
    - web/src/components/DotStepper.tsx
    - web/src/components/DotStepper.test.tsx
    - web/src/pages/LessonPage.tsx
    - web/src/pages/LessonPage.test.tsx
  modified:
    - web/src/App.tsx
    - web/package.json
decisions:
  - Import from 'react-router' not 'react-router-dom' (merged in v7)
  - No @react-router/dev plugin added to vite.config.ts (library mode only)
  - completionHandledRef guards store actions against StrictMode double-fire
  - Continue button pattern: exercise calls onComplete immediately, LessonPage shows Continue to advance
  - Dots represent ordinal position, not directional flow — no RTL flex-reverse on DotStepper
metrics:
  duration: 8min
  completed_date: "2026-03-29"
  tasks_completed: 2
  files_changed: 6
---

# Phase 11 Plan 01: React Router 7 + DotStepper + LessonPage Summary

React Router 7 installed and wired with createBrowserRouter; DotStepper progress component and full LessonPage intro->exercise->completion state machine built with TDD.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Install React Router 7, wire routing, build DotStepper | be87ce5 | web/package.json, web/src/App.tsx, DotStepper.tsx, DotStepper.test.tsx |
| 2 | Build LessonPage with intro/exercise/completion flow | fedcd19 | LessonPage.tsx, LessonPage.test.tsx |

## What Was Built

### DotStepper (`web/src/components/DotStepper.tsx`)
Progress dot indicator for lesson exercise sequences. Props: `{ total: number; current: number }`. Visual states: completed (green), active (indigo, larger), upcoming (gray). Includes `role="progressbar"` with `aria-valuenow`/`aria-valuemax`. No RTL flex-reverse — dots represent ordinal position.

### App.tsx (`web/src/App.tsx`)
Replaced demo content with React Router 7 `createBrowserRouter` + `RouterProvider`. Routes: `/` (HomePage placeholder) and `/lesson/:id` (LessonPage). Imports from `'react-router'` (v7 merged package).

### LessonPage (`web/src/pages/LessonPage.tsx`)
Full lesson flow with `LessonPhase = 'intro' | 'running' | 'complete'` state machine:

- **Intro:** Shows chapter name, lesson title, tip box, Start button. RTL-safe with `text-start`, `ps-*`/`pe-*`.
- **Running:** DotStepper at top, current exercise rendered via registry, Continue button appears after `onComplete` fires. `key={currentExercise.id}` forces remount between exercises.
- **Complete:** XP earned display (`+N XP`), Next Lesson or Back to Home navigation.

Store actions `completeLesson`, `unlockLesson`, `addXP` fire exactly once via `completionHandledRef`. Invalid lesson IDs redirect to `/` with `replace: true`.

## Decisions Made

1. **react-router v7 import**: Import from `'react-router'` (not `'react-router-dom'` — packages merged in v7).
2. **No @react-router/dev plugin**: Vite config unchanged — library mode only, no framework plugin.
3. **StrictMode guard**: `completionHandledRef = useRef(false)` prevents double-firing store actions in React StrictMode.
4. **Continue button pattern**: Exercise cards call `onComplete` immediately after evaluation (they handle FeedbackCard internally). LessonPage only shows Continue button after `onComplete` — does not auto-advance.
5. **DotStepper RTL**: No `flex-row-reverse` — dots represent ordinal position (1, 2, 3...), not directional flow.

## Test Results

- DotStepper: 6 tests pass
- LessonPage: 8 tests pass
- Full suite: 83/83 tests pass
- TypeScript: no errors (`tsc --noEmit` clean)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data flows wired. HomePage is a labeled placeholder pending Plan 02.

## Self-Check: PASSED
