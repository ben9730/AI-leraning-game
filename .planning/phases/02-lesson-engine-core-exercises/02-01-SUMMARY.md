---
phase: 02-lesson-engine-core-exercises
plan: 01
subsystem: lesson-engine
tags: [lesson-flow, state-machine, navigation, rtl, tdd, expo-router]
dependency_graph:
  requires:
    - 01-03 (schema.ts, loader.ts, useProgressStore, i18n)
  provides:
    - useLessonSession hook (intro->exercise->complete state machine)
    - LessonScreen, LessonContentScreen, LessonCompletionScreen
    - EvaluationResult interface contract
    - app/(lesson)/[lessonId] Expo Router route
    - Home screen Start Learning entry point
  affects:
    - 02-02 (ExerciseRunner slots into LessonScreen exercise placeholder)
    - 02-03 (evaluators return EvaluationResult)
tech_stack:
  added:
    - react-test-renderer@19.2.0 (peer dep for @testing-library/react-native)
    - babel.config.js with babel-preset-expo (enables react-native Jest preset)
  patterns:
    - Dual-project Jest config: node project for content tests, react-native project for hook/component tests
    - useRef for score accumulation across renders (avoids stale closure in functional setState)
    - key={exercise.id} on exercise placeholder to force unmount/remount between exercises
    - borderStartWidth/borderStartColor for RTL-safe tip box border
key_files:
  created:
    - PromptPlay/src/features/exercise/types.ts
    - PromptPlay/src/features/lesson/useLessonSession.ts
    - PromptPlay/src/features/lesson/__tests__/useLessonSession.test.ts
    - PromptPlay/src/features/lesson/LessonContentScreen.tsx
    - PromptPlay/src/features/lesson/LessonCompletionScreen.tsx
    - PromptPlay/src/features/lesson/LessonScreen.tsx
    - PromptPlay/app/(lesson)/_layout.tsx
    - PromptPlay/app/(lesson)/[lessonId].tsx
    - PromptPlay/babel.config.js
  modified:
    - PromptPlay/app/_layout.tsx (added (lesson) Stack.Screen)
    - PromptPlay/app/(tabs)/index.tsx (added Start Learning card)
    - PromptPlay/src/i18n/en/common.json (added lesson.* and home.start_lesson keys)
    - PromptPlay/src/i18n/he/common.json (added lesson.* and home.start_lesson keys)
    - PromptPlay/jest.config.js (dual-project setup for node + react-native)
decisions:
  - "Use useRef for score accumulation in useLessonSession — avoids stale closure bug in setState callback when reading accumulated scores"
  - "Dual-project Jest config: node preset for content tests, react-native preset for hook/component tests — avoids fighting ts-jest with RN setup files"
  - "babel.config.js with babel-preset-expo added to enable react-native Jest preset to transform node_modules"
  - "Exercise placeholder uses key={exercise.id} to guarantee React unmount/remount between exercises — critical for Plan 02 exercise state reset"
metrics:
  duration_minutes: 27
  completed_date: "2026-03-28"
  tasks_completed: 2
  files_created: 9
  files_modified: 5
---

# Phase 02 Plan 01: Lesson Engine Shell Summary

**One-liner:** Lesson flow state machine (intro->exercise->complete) with RTL-safe screens, Expo Router (lesson) group, and persisted XP/completion wiring via Zustand store.

## Tasks Completed

| # | Name | Commit | Status |
|---|------|--------|--------|
| 1 | EvaluationResult type + useLessonSession hook with TDD tests | fe4c58c | Done |
| 2 | Lesson screens + navigation route + home screen link | 236b4c5 | Done |

## What Was Built

### EvaluationResult Interface (`src/features/exercise/types.ts`)
Contract all exercise evaluators must return in Plan 02/03: `score` (0-100), `passed`, `feedback` (LocalizedString), optional `breakdown` for rubric-based types.

### useLessonSession Hook (`src/features/lesson/useLessonSession.ts`)
State machine managing lesson flow:
- `LessonStep` discriminated union: `intro | exercise{index} | complete{totalScore}`
- `advance(score?)` transitions: intro→exercise[0]→...→exercise[n-1]→complete
- Score accumulation via `useRef` (avoids stale closure); `totalScore = Math.round(avg)`
- Returns `currentExercise`, `exerciseCount`, `exerciseIndex` (-1 when not in exercise phase)
- 8 tests covering all transitions, score accumulation, and accessors — all green

### LessonContentScreen (`src/features/lesson/LessonContentScreen.tsx`)
Renders lesson title, body, tip box with `borderStartWidth/borderStartColor` (RTL-safe). All padding uses `Start/End`. `textAlign` and `writingDirection` driven by `isRTL()`.

### LessonCompletionScreen (`src/features/lesson/LessonCompletionScreen.tsx`)
Score percentage + XP earned display. Calls `onFinish` which fires `completeLesson` + `addXP` + `unlockLesson` then navigates home.

### LessonScreen (`src/features/lesson/LessonScreen.tsx`)
Orchestrator: `loadLesson(lessonId)` → `useLessonSession` → renders intro/exercise/completion sub-views. Exercise placeholder uses `key={currentExercise?.id}` for Plan 02 compatibility.

### Navigation Route (`app/(lesson)/[lessonId].tsx` + `app/(lesson)/_layout.tsx`)
Tab-free Stack group. `useLocalSearchParams` extracts `lessonId`. Error state with back button if lessonId missing. Registered in root `_layout.tsx`.

### Home Screen (`app/(tabs)/index.tsx`)
Prominent card-style "Start Learning" button → `router.push('/(lesson)/lesson-01-what-is-prompting')`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] react-test-renderer@19.2.0 missing peer dependency**
- **Found during:** Task 1 (first jest run)
- **Issue:** `@testing-library/react-native` requires `react-test-renderer@19.2.0` as peer dep
- **Fix:** `npm install -D react-test-renderer@19.2.0 --legacy-peer-deps`
- **Commit:** fe4c58c

**2. [Rule 3 - Blocking] Jest config incompatible with React Native modules**
- **Found during:** Task 1 (second jest run after peer dep install)
- **Issue:** Existing ts-jest/node config could not transform `@testing-library/react-native` (ESM syntax error, then `ReactNativePublicAPI not defined`)
- **Fix:** Added `babel.config.js` with `babel-preset-expo`; switched to dual-project jest config (node preset for content tests, react-native preset for feature tests)
- **Files modified:** `PromptPlay/jest.config.js`, `PromptPlay/babel.config.js` (new)
- **Commit:** fe4c58c

### Out of Scope (Deferred)

Pre-existing `MMKVAdapter.ts` TS2693 error (`MMKV used as value`) — this is the known MMKV + Expo Go conflict documented in STATE.md blockers. Not introduced by this plan; logged to deferred-items.

## Verification Results

- TypeScript: clean on all new files (pre-existing MMKVAdapter error excluded — out of scope)
- useLessonSession tests: 8/8 pass
- Content tests: 11/11 pass
- Total: 19/19 tests green

## Self-Check: PASSED

Files verified:
- `PromptPlay/src/features/exercise/types.ts` — FOUND
- `PromptPlay/src/features/lesson/useLessonSession.ts` — FOUND
- `PromptPlay/src/features/lesson/__tests__/useLessonSession.test.ts` — FOUND
- `PromptPlay/src/features/lesson/LessonContentScreen.tsx` — FOUND
- `PromptPlay/src/features/lesson/LessonCompletionScreen.tsx` — FOUND
- `PromptPlay/src/features/lesson/LessonScreen.tsx` — FOUND
- `PromptPlay/app/(lesson)/_layout.tsx` — FOUND
- `PromptPlay/app/(lesson)/[lessonId].tsx` — FOUND

Commits verified:
- fe4c58c — FOUND
- 236b4c5 — FOUND
