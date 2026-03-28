---
phase: 02-lesson-engine-core-exercises
plan: "02"
subsystem: exercise-engine
tags: [exercise, evaluators, components, registry, TDD, RTL, haptics]
dependency_graph:
  requires: ["02-01"]
  provides: ["exercise-evaluators", "exercise-components", "exercise-registry", "ExerciseRunner"]
  affects: ["LessonScreen", "lesson-flow"]
tech_stack:
  added: ["expo-haptics"]
  patterns: ["exercise-type-registry", "pure-function-evaluators", "TDD-red-green"]
key_files:
  created:
    - PromptPlay/src/features/exercise/evaluators/evaluateMCQ.ts
    - PromptPlay/src/features/exercise/evaluators/evaluatePickBetter.ts
    - PromptPlay/src/features/exercise/evaluators/evaluateFreeText.ts
    - PromptPlay/src/features/exercise/evaluators/evaluateFillBlank.ts
    - PromptPlay/src/features/exercise/evaluators/evaluateSpotProblem.ts
    - PromptPlay/src/features/exercise/evaluators/index.ts
    - PromptPlay/src/features/exercise/evaluators/__tests__/evaluateMCQ.test.ts
    - PromptPlay/src/features/exercise/evaluators/__tests__/evaluatePickBetter.test.ts
    - PromptPlay/src/features/exercise/evaluators/__tests__/evaluateFreeText.test.ts
    - PromptPlay/src/features/exercise/evaluators/__tests__/evaluateFillBlank.test.ts
    - PromptPlay/src/features/exercise/evaluators/__tests__/evaluateSpotProblem.test.ts
    - PromptPlay/src/features/exercise/components/MCQCard.tsx
    - PromptPlay/src/features/exercise/components/PickBetterCard.tsx
    - PromptPlay/src/features/exercise/components/FreeTextCard.tsx
    - PromptPlay/src/features/exercise/components/FillBlankCard.tsx
    - PromptPlay/src/features/exercise/components/SpotProblemCard.tsx
    - PromptPlay/src/features/exercise/registry.ts
    - PromptPlay/src/features/exercise/__tests__/registry.test.ts
    - PromptPlay/src/features/exercise/ExerciseRunner.tsx
    - PromptPlay/__mocks__/expo-haptics.js
  modified:
    - PromptPlay/src/features/lesson/LessonScreen.tsx
    - PromptPlay/jest.config.js
decisions:
  - "expo-haptics mocked via __mocks__/expo-haptics.js + moduleNameMapper — native module cannot run in Jest node/react-native preset"
  - "SpotProblemCard uses deterministic concatenated order (issues then distractors) rather than shuffle for v1 — avoids test flakiness"
  - "jest.config.js transformIgnorePatterns updated to include expo-haptics for react-native preset"
metrics:
  duration: "~35 minutes"
  completed_date: "2026-03-28"
  tasks_completed: 2
  files_created: 20
  files_modified: 2
  tests_added: 32
  total_tests_passing: 51
---

# Phase 02 Plan 02: Exercise Components, Evaluators, Registry, and ExerciseRunner Summary

**One-liner:** 5 pure-function evaluators (TDD) + 5 RTL-safe exercise cards + registry pattern + ExerciseRunner wired into LessonScreen, replacing the placeholder.

## What Was Built

### Task 1: All 5 Evaluator Functions (TDD)

Pure TypeScript functions, no React, no side effects. Each takes a typed exercise + user answer and returns `EvaluationResult`.

- **evaluateMCQ** — binary 100/0 based on `correctIndex` match, always returns `explanation` as feedback
- **evaluatePickBetter** — binary 100/0 based on `betterOption` match
- **evaluateFreeText** — checklist and weighted-keyword scoring modes, Hebrew-aware normalization (trim-only, no toLowerCase), required-criterion logic, per-criterion breakdown in result
- **evaluateFillBlank** — bidirectional substring match against acceptable answers, lang-aware normalization
- **evaluateSpotProblem** — partial scoring (correctCount/issueCount * 100), distractor penalty (-25 each), floor at 0, passed threshold >= 50

29 tests written test-first (RED then GREEN).

### Task 2: Exercise Components, Registry, ExerciseRunner, LessonScreen

- **MCQCard** — option list, highlight selected, green/red after submit, explanation feedback
- **PickBetterCard** — vertically stacked A/B cards (avoids RTL flex-reversal), badge labels
- **FreeTextCard** — starter prompt quote box, multiline TextInput, per-criterion breakdown bars, model answer reveal
- **FillBlankCard** — template split on `___`, inline TextInput with color-coded border on submit
- **SpotProblemCard** — togglable chips, problematic prompt in amber quote box, green/red/orange chip states post-submit
- **EXERCISE_REGISTRY** — `Partial<Record<Exercise['type'], ComponentType>>` with 5 entries, simulated-chat deferred
- **ExerciseRunner** — single registry lookup, renders progress counter + component, fallback text for unknown types
- **LessonScreen** — placeholder removed, replaced with `<ExerciseRunner key={exercise.id} ...>`

All layouts use `paddingStart/End`, `marginStart/End` — RTL-safe from creation.
Haptic feedback: `Haptics.impactAsync(Light)` on pass, `Haptics.notificationAsync(Error)` on fail.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] expo-haptics not in Jest transformIgnorePatterns**
- **Found during:** Task 2 — registry test failed with `SyntaxError: Cannot use import statement outside a module`
- **Issue:** expo-haptics is a native module with ESM source; react-native Jest preset couldn't transform it
- **Fix:** Added `PromptPlay/__mocks__/expo-haptics.js` manual mock + `moduleNameMapper` entry in jest.config.js pointing `expo-haptics` at the mock
- **Files modified:** `PromptPlay/jest.config.js`, `PromptPlay/__mocks__/expo-haptics.js` (created)
- **Commit:** 0a48b96

## Self-Check: PASSED

Files verified present:
- PromptPlay/src/features/exercise/evaluators/evaluateMCQ.ts — FOUND
- PromptPlay/src/features/exercise/registry.ts — FOUND
- PromptPlay/src/features/exercise/ExerciseRunner.tsx — FOUND
- PromptPlay/src/features/lesson/LessonScreen.tsx — FOUND (placeholder replaced)
- PromptPlay/__mocks__/expo-haptics.js — FOUND

Commits verified:
- 3cee20d — feat(02-02): implement all 5 exercise evaluator pure functions with TDD
- 0a48b96 — feat(02-02): exercise components, registry, ExerciseRunner, LessonScreen wiring

All 51 tests passing: `npx jest --no-coverage` — 8 suites, 51 tests, 0 failures.
