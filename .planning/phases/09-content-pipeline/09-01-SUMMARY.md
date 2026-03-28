---
phase: 09-content-pipeline
plan: 01
subsystem: content
tags: [vite, import-meta-glob, json, content-loader, curriculum, vitest]

# Dependency graph
requires:
  - phase: 07-foundation
    provides: shared/ content schema, curriculum index, lesson JSON files
provides:
  - Vite-native content loader (loadLesson, getAllLessonIds)
  - Barrel export for all content types and curriculum data
  - Content pipeline test suite covering all 20 lessons
affects: [10-exercise-components, 11-lesson-engine, 13-skill-tree]

# Tech tracking
tech-stack:
  added: []
  patterns: [import.meta.glob eager loading for bundled JSON content]

key-files:
  created:
    - web/src/content/loader.ts
    - web/src/content/index.ts
    - web/src/content/loader.test.ts
  modified: []

key-decisions:
  - "Used import.meta.glob with eager:true for synchronous lesson loading (matches v1 Metro behavior)"
  - "Glob path relative to loader file (../../../shared/src/content/lessons/*.json) rather than @shared alias"
  - "Sorted getAllLessonIds by lesson.order field to match curriculum sequence"

patterns-established:
  - "Content access pattern: import { loadLesson, chapters } from '@/content' for all web/ components"
  - "Glob-based content loading: use import.meta.glob for bundled JSON assets in Vite"

requirements-completed: [CONT-01, CONT-02]

# Metrics
duration: 2min
completed: 2026-03-28
---

# Phase 9 Plan 1: Content Loader Summary

**Vite-native content loader using import.meta.glob to bridge all 20 shared/ lesson JSONs into web/ with typed loadLesson API and curriculum barrel export**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-28T20:12:38Z
- **Completed:** 2026-03-28T20:14:52Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Vite-native content loader replaces Metro's static import map with a single import.meta.glob pattern
- Barrel index.ts provides single import point for all content: loader functions, curriculum data, and types
- Comprehensive test suite validates all 20 lessons load with correct bilingual content and curriculum structure

## Task Commits

Each task was committed atomically:

1. **Task 1: Vite content loader and barrel export** - `9559dcd` (feat)
2. **Task 2: Content pipeline tests** - `6510f7c` (test)

## Files Created/Modified
- `web/src/content/loader.ts` - Vite-native content loader using import.meta.glob with eager loading
- `web/src/content/index.ts` - Barrel re-export of loader, curriculum, and types from @shared
- `web/src/content/loader.test.ts` - 9 tests covering all 20 lessons, curriculum structure, and error handling

## Decisions Made
- Used `import.meta.glob` with `eager: true` for synchronous lesson access, matching the v1 Metro loader's synchronous behavior
- Used relative path (`../../../shared/src/content/lessons/*.json`) for the glob pattern since `@shared` alias is not supported inside `import.meta.glob` string literals
- Sorted `getAllLessonIds()` by `lesson.order` field rather than alphabetically, ensuring curriculum sequence match

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed glob relative path depth**
- **Found during:** Task 1 (Vite content loader)
- **Issue:** Initial glob path used `../../shared/...` (2 levels up) but loader.ts is 3 levels deep (`web/src/content/`), so glob matched zero files
- **Fix:** Changed to `../../../shared/src/content/lessons/*.json` (3 levels up)
- **Files modified:** web/src/content/loader.ts
- **Verification:** All 9 tests pass, all 20 lessons load correctly
- **Committed in:** 9559dcd (part of Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Path depth fix was necessary for glob to find lesson files. No scope creep.

## Issues Encountered
- Tests must run from `web/` directory (not project root) due to vitest.config.ts `include` pattern scoped to `src/**/*.test.{ts,tsx}`. This is expected monorepo behavior.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all data is wired from shared/ lesson JSONs via import.meta.glob.

## Next Phase Readiness
- Content pipeline complete: any web/ component can now `import { loadLesson, chapters } from '@/content'`
- Ready for Phase 10 (exercise components) which will consume lesson exercises via this loader
- Ready for Phase 11 (lesson engine) which will use loadLesson for lesson rendering

## Self-Check: PASSED

- [x] web/src/content/loader.ts - FOUND
- [x] web/src/content/index.ts - FOUND
- [x] web/src/content/loader.test.ts - FOUND
- [x] .planning/phases/09-content-pipeline/09-01-SUMMARY.md - FOUND
- [x] Commit 9559dcd - FOUND
- [x] Commit 6510f7c - FOUND

---
*Phase: 09-content-pipeline*
*Completed: 2026-03-28*
