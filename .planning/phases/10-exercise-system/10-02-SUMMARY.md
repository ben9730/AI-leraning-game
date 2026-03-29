---
phase: 10-exercise-system
plan: 02
subsystem: ui
tags: [react, vitest, testing-library, fill-blank, spot-problem, simulated-chat, exercise-components]

# Dependency graph
requires:
  - phase: 10-exercise-system/01
    provides: Exercise registry, types, FeedbackCard, MCQCard, PickBetterCard, FreeTextCard
provides:
  - FillBlankCard component with inline input at blank position
  - SpotProblemCard component with checkbox-based issue selection
  - SimulatedChatCard component with pre-scripted AI chat flow
  - Complete exercise registry with all 6 types wired
  - Integration tests covering all exercise types end-to-end
affects: [lesson-flow, gamification]

# Tech tracking
tech-stack:
  added: ["@testing-library/jest-dom"]
  patterns: [vitest-setup-with-jest-dom-matchers, global-expect-extension]

key-files:
  created:
    - web/src/exercises/components/FillBlankCard.tsx
    - web/src/exercises/components/SpotProblemCard.tsx
    - web/src/exercises/components/SimulatedChatCard.tsx
    - web/src/exercises/components/__tests__/exerciseCards2.test.tsx
    - web/src/exercises/components/__tests__/integration.test.tsx
    - web/src/test/setup.ts
  modified:
    - web/src/exercises/registry.tsx
    - web/vitest.config.ts

key-decisions:
  - "Used explicit expect.extend(matchers) pattern for vitest jest-dom integration"
  - "vitest.config.ts is the authoritative test config (overrides vite.config.ts test section)"

patterns-established:
  - "Test setup: web/src/test/setup.ts extends expect with jest-dom matchers for all test files"
  - "Test imports: use globals (no explicit expect import from vitest) so jest-dom matchers work"

requirements-completed: [EXER-01, EXER-02, EXER-03]

# Metrics
duration: 15min
completed: 2026-03-29
---

# Phase 10 Plan 02: Remaining Exercise Components Summary

**FillBlank, SpotProblem, and SimulatedChat cards with full registry wiring and 69 passing tests across 8 test files**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-28T20:00:00Z
- **Completed:** 2026-03-29T10:09:00Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Built FillBlankCard with inline text input at blank position, Enter-key submit
- Built SpotProblemCard with checkbox-based issue/distractor selection
- Built SimulatedChatCard with pre-scripted multi-turn AI chat simulation
- Wired all 6 exercise types into registry replacing placeholders
- Fixed test infrastructure: jest-dom matchers, vitest setup, fixture schema alignment
- All 69 tests pass across 8 test files

## Task Commits

Each task was committed atomically:

1. **Task 1: Failing tests for FillBlank, SpotProblem, SimulatedChat** - `ed85167` (test)
2. **Task 2: FillBlankCard, SpotProblemCard, SimulatedChatCard + tests** - `f473450` (feat)
3. **Task 3: Registry wiring, test setup fixes, fixture corrections** - `34b2d24` (fix)

## Files Created/Modified
- `web/src/exercises/components/FillBlankCard.tsx` - Inline input exercise with blank detection
- `web/src/exercises/components/SpotProblemCard.tsx` - Checkbox-based issue identification
- `web/src/exercises/components/SimulatedChatCard.tsx` - Pre-scripted AI chat simulation
- `web/src/exercises/components/__tests__/exerciseCards2.test.tsx` - Tests for 3 new cards
- `web/src/exercises/components/__tests__/integration.test.tsx` - Cross-type integration tests
- `web/src/exercises/registry.tsx` - All 6 types wired with real imports
- `web/src/test/setup.ts` - Vitest setup extending expect with jest-dom matchers
- `web/vitest.config.ts` - Added setupFiles reference

## Decisions Made
- Used `expect.extend(matchers)` from `@testing-library/jest-dom/matchers` instead of `import '@testing-library/jest-dom/vitest'` — more reliable with vitest 4.x globals
- Fixed PickBetterExercise integration test fixture: `promptA/B` → `optionA/B` to match schema
- Removed explicit `expect` imports from test files to use global expect with jest-dom matchers

## Deviations from Plan

### Auto-fixed Issues

**1. Missing @testing-library/jest-dom dependency**
- **Found during:** Test verification
- **Issue:** Test files used jest-dom matchers (toBeInTheDocument, toBeDisabled) but package was not installed
- **Fix:** Installed @testing-library/jest-dom, created setup.ts, configured vitest.config.ts
- **Verification:** All 69 tests pass

**2. vitest.config.ts overriding vite.config.ts test section**
- **Found during:** Test verification
- **Issue:** vitest.config.ts had `setupFiles: []` which overrode vite.config.ts setup
- **Fix:** Added `setupFiles: ['./src/test/setup.ts']` to vitest.config.ts
- **Verification:** Setup file now loads correctly

**3. PickBetterExercise fixture schema mismatch**
- **Found during:** Integration test run
- **Issue:** Fixture used `promptA/promptB` but schema defines `optionA/optionB`
- **Fix:** Renamed fixture properties to match schema
- **Verification:** pick-better integration test passes

---

**Total deviations:** 3 auto-fixed (1 missing dependency, 1 config override, 1 fixture mismatch)
**Impact on plan:** All fixes necessary for test correctness. No scope creep.

## Issues Encountered
- Worktree executor agent failed to persist changes — work completed inline by orchestrator

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all 6 exercise types fully implemented.

## Next Phase Readiness
- All 6 exercise components render, accept input, evaluate, and show feedback
- Exercise registry fully wired — `getExerciseComponent(type)` returns component + evaluator
- Ready for Phase 11 (Lesson Flow) to build lesson screen with exercise sequencing

## Self-Check: PASSED

- [x] All 6 exercise types in registry with components and evaluators
- [x] FillBlankCard, SpotProblemCard, SimulatedChatCard implemented
- [x] Integration tests verify all types render and evaluate
- [x] 69/69 tests pass across 8 test files
- [x] Test infrastructure (jest-dom, setup file) properly configured

---
*Phase: 10-exercise-system*
*Completed: 2026-03-29*
