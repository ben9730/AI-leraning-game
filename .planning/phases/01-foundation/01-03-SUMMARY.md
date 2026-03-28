---
phase: 01-foundation
plan: 03
subsystem: content
tags: [schema, typescript, content, tdd, bilingual, i18n]
dependency_graph:
  requires: [01-01]
  provides: [content-schema, seed-lesson, curriculum-index, lesson-loader]
  affects: [lesson-engine, exercise-runner, scoring, skill-tree]
tech_stack:
  added: []
  patterns: [discriminated-union-exercises, static-import-map, localized-string, tdd-red-green]
key_files:
  created:
    - src/content/schema.ts
    - src/content/schema.test.ts
    - src/content/lessons/lesson-01-what-is-prompting.json
    - src/content/curriculum.ts
    - src/content/loader.ts
  modified: []
decisions:
  - Static import map in loader.ts (not dynamic require) for Metro bundler static analysis compatibility
  - All 6 exercise types defined now to prevent schema migrations after content is authored
  - validateRubricWeights uses 0.001 float tolerance for weight sum comparison
metrics:
  duration_minutes: 25
  completed_date: "2026-03-28"
  tasks_completed: 2
  files_created: 5
  files_modified: 0
---

# Phase 01 Plan 03: Content Schema Summary

**One-liner:** TypeScript discriminated-union schema for all 6 exercise types with bilingual seed lesson, curriculum index, and static-import-map lesson loader validated end-to-end by 11 TDD tests.

## What Was Built

### Task 1: Content Schema TypeScript Interfaces (TDD)
- `src/content/schema.ts` — single source of truth for all content types
- `src/content/schema.test.ts` — 11 tests covering all interfaces and the validateRubricWeights helper
- TDD flow: RED (0a503c7) → GREEN (f383f2a)

### Task 2: Seed Lesson, Curriculum Index, Lesson Loader
- `src/content/lessons/lesson-01-what-is-prompting.json` — bilingual (EN + HE) lesson with MCQ and PickBetter exercises
- `src/content/curriculum.ts` — Chapter 1 definition and flat curriculum array
- `src/content/loader.ts` — static import map, loadLesson(), getAllLessonIds()
- Commit: f0114a4

## Verification Results

| Check | Result |
|-------|--------|
| `npx jest src/content/` | 11/11 tests pass |
| `npx tsc --noEmit` | Zero errors |
| loadLesson('lesson-01-what-is-prompting') | Returns Lesson with 2 exercises |
| All LocalizedString fields have en + he | Confirmed |
| validateRubricWeights | Correctly validates sum = 1.0 |

## Commits

| Hash | Message |
|------|---------|
| 0a503c7 | test(01-03): add failing tests for content schema interfaces |
| f383f2a | feat(01-03): implement content schema TypeScript interfaces |
| f0114a4 | feat(01-03): add seed lesson, curriculum index, and lesson loader |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED
