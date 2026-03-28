---
phase: 07-foundation-shared-extraction
plan: 02
subsystem: shared-extraction
tags: [typescript, vitest, eslint, content, gamification, evaluators, monorepo]

# Dependency graph
requires:
  - "npm workspaces monorepo with web/ and shared/ packages (07-01)"
provides:
  - "All portable pure TS modules extracted to shared/ with barrel exports"
  - "128 unit tests passing via Vitest in shared/"
  - "ESLint no-restricted-imports rule blocking react-native/expo in shared/"
  - "@shared/ imports proven working in web/ (TypeScript + Vite build)"
affects: [07-03, 08, 09, 10, 11, 12, 13, 14]

# Tech tracking
tech-stack:
  added: [vitest 3, eslint 9, typescript-eslint 8]
  patterns: [eslint-flat-config, vitest-globals, no-restricted-imports-guard, esm-test-imports]

key-files:
  created:
    - shared/src/content/schema.ts
    - shared/src/content/curriculum.ts
    - shared/src/content/loader.ts
    - shared/src/content/lessons/*.json (20 files)
    - shared/src/gamification/engine.ts
    - shared/src/gamification/badges.ts
    - shared/src/gamification/constants.ts
    - shared/src/exercise/evaluators/evaluateMCQ.ts
    - shared/src/exercise/evaluators/evaluatePickBetter.ts
    - shared/src/exercise/evaluators/evaluateFreeText.ts
    - shared/src/exercise/evaluators/evaluateFillBlank.ts
    - shared/src/exercise/evaluators/evaluateSpotProblem.ts
    - shared/src/exercise/evaluators/evaluateSimulatedChat.ts
    - shared/src/exercise/evaluators/index.ts
    - shared/src/exercise/types.ts
    - shared/src/store/types.ts
    - shared/src/skill-tree/skillTreeUtils.ts
    - shared/src/i18n/en/common.json
    - shared/src/i18n/he/common.json
    - shared/src/content/__tests__/lesson-structure.test.ts
    - shared/src/content/schema.test.ts
    - shared/src/exercise/evaluators/__tests__/evaluateMCQ.test.ts
    - shared/src/exercise/evaluators/__tests__/evaluatePickBetter.test.ts
    - shared/src/exercise/evaluators/__tests__/evaluateFreeText.test.ts
    - shared/src/exercise/evaluators/__tests__/evaluateFillBlank.test.ts
    - shared/src/exercise/evaluators/__tests__/evaluateSpotProblem.test.ts
    - shared/src/exercise/evaluators/__tests__/evaluateSimulatedChat.test.ts
    - shared/src/gamification/engine.test.ts
    - shared/src/gamification/badges.test.ts
    - shared/src/gamification/constants.test.ts
    - shared/vitest.config.ts
    - shared/eslint.config.mjs
  modified:
    - shared/src/index.ts
    - shared/package.json
    - shared/tsconfig.json
    - web/src/App.tsx
    - web/tsconfig.app.json
    - package-lock.json
    - .gitignore

key-decisions:
  - "Define NodeState type inline in skillTreeUtils.ts rather than importing from useSkillTreeData (React Native hook dependency)"
  - "ESLint flat config (eslint.config.mjs) over legacy .eslintrc.cjs for ESLint v9 compatibility"
  - "Replace require() with ESM import in schema.test.ts for Vitest ESM compatibility"
  - "Exclude test files from web/tsconfig.app.json to avoid vitest global type errors in web/ compilation"

requirements-completed: [FOUND-03, FOUND-04]

# Metrics
duration: 12min
completed: 2026-03-28
---

# Phase 7 Plan 2: Extract Portable TS to shared/ Summary

**All portable pure TypeScript modules (content, gamification, evaluators, store types, skill-tree utils, i18n) extracted to shared/ with 128 tests passing via Vitest and ESLint guard blocking react-native/expo imports**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-28T19:28:34Z
- **Completed:** 2026-03-28T19:40:11Z
- **Tasks:** 2
- **Files modified:** 58

## Accomplishments

- Copied all portable pure TS from PromptPlay/src/ to shared/src/ (schema, curriculum, loader, 20 lesson JSONs, 6 evaluators, gamification engine/badges/constants, store types, skill-tree utils, i18n JSON files)
- Fixed all import paths from @/ aliases to relative imports within shared/
- Added evaluateSimulatedChat to evaluators barrel export (was missing from original)
- Defined NodeState type inline to remove React Native hook dependency
- Configured Vitest with 11 test suites (128 tests) all passing
- Created ESLint flat config with no-restricted-imports rule that blocks react-native/expo imports
- Verified: tsc --noEmit clean, vite build succeeds, lint clean, all tests pass
- PromptPlay/ directory completely untouched

## Task Commits

Each task was committed atomically:

1. **Task 1: Copy portable TS modules to shared/ and fix imports** - `e7705e8` (feat)
2. **Task 2: Copy tests, configure Vitest, and add ESLint no-RN-import rule** - `f917142` (test)

## Files Created/Modified

### Source Modules (Task 1)
- `shared/src/content/schema.ts` - Content types (Lesson, Exercise, LocalizedString, etc.)
- `shared/src/content/curriculum.ts` - Chapter definitions and curriculum ordering
- `shared/src/content/loader.ts` - Lesson loader with static JSON imports
- `shared/src/content/lessons/*.json` - All 20 lesson JSON files
- `shared/src/gamification/engine.ts` - calcXP, calcStreakUpdate, shouldGrantFreeze
- `shared/src/gamification/badges.ts` - deriveBadges, BADGE_DEFINITIONS
- `shared/src/gamification/constants.ts` - LEVEL_THRESHOLDS, streak multiplier tiers
- `shared/src/exercise/evaluators/*.ts` - 6 evaluator functions + barrel index
- `shared/src/exercise/types.ts` - EvaluationResult interface
- `shared/src/store/types.ts` - UserProgress, XPTransaction, getLevel
- `shared/src/skill-tree/skillTreeUtils.ts` - deriveNodeStates, getCurrentLessonId, NodeState
- `shared/src/i18n/{en,he}/common.json` - Translation files
- `shared/src/index.ts` - Comprehensive barrel export for all modules
- `web/src/App.tsx` - Updated with @shared type import proving alias works

### Test + Config (Task 2)
- `shared/vitest.config.ts` - Vitest configuration with globals and node environment
- `shared/eslint.config.mjs` - ESLint v9 flat config with no-restricted-imports guard
- `shared/src/content/__tests__/lesson-structure.test.ts` - 23 structural validation tests
- `shared/src/content/schema.test.ts` - 11 schema type and validation tests
- `shared/src/exercise/evaluators/__tests__/*.test.ts` - 37 evaluator tests (6 files)
- `shared/src/gamification/engine.test.ts` - 28 XP/streak calculation tests
- `shared/src/gamification/badges.test.ts` - 12 badge derivation tests
- `shared/src/gamification/constants.test.ts` - 17 constant value tests

## Decisions Made

- NodeState type defined inline in skillTreeUtils.ts to avoid importing from useSkillTreeData (which has React Native store dependencies)
- ESLint flat config (eslint.config.mjs) chosen for ESLint v9 compatibility
- schema.test.ts `require('./loader')` replaced with ESM `import` for Vitest compatibility
- Test files excluded from web/tsconfig.app.json to avoid vitest global type conflicts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed schema.test.ts CommonJS require in ESM context**
- **Found during:** Task 2
- **Issue:** `require('./loader')` in schema.test.ts fails under Vitest ESM -- "Cannot find module './loader'"
- **Fix:** Replaced with top-level `import { loadLesson } from './loader'`
- **Files modified:** shared/src/content/schema.test.ts
- **Commit:** f917142

**2. [Rule 1 - Bug] Fixed unused variable/import lint errors in test files**
- **Found during:** Task 2
- **Issue:** Several test files imported unused types (Badge, PromptRubric, RubricCriterion, etc.)
- **Fix:** Removed unused imports, prefixed unused destructured vars with underscore
- **Files modified:** shared/src/content/schema.test.ts, shared/src/exercise/evaluators/__tests__/evaluateFreeText.test.ts, shared/src/gamification/badges.test.ts, shared/src/content/__tests__/lesson-structure.test.ts
- **Commit:** f917142

**3. [Rule 3 - Blocking] Excluded test files from web/tsconfig.app.json**
- **Found during:** Task 2 verification
- **Issue:** web/tsconfig.app.json includes `../shared/src` which picked up test files lacking vitest global types
- **Fix:** Added exclude pattern for `*.test.ts` and `__tests__/` in web/tsconfig.app.json
- **Files modified:** web/tsconfig.app.json
- **Commit:** f917142

**4. [Rule 3 - Blocking] Added .gitignore entries for untracked screenshots**
- **Found during:** Task 1 staging
- **Issue:** Pre-existing screenshots (*.png) and .playwright-mcp/ directory cluttered git status
- **Fix:** Added `*.png` and `.playwright-mcp/` to root .gitignore
- **Files modified:** .gitignore
- **Commit:** e7705e8

---

**Total deviations:** 4 auto-fixed (2 bugs, 2 blocking)
**Impact on plan:** All fixes were essential for clean tests, lint, and compilation. No scope creep.

## Known Stubs

None -- all modules are fully functional copies with working tests.

## Issues Encountered

None

## User Setup Required

None - all dependencies installed via npm workspaces.

## Verification Results

| Check | Result |
|-------|--------|
| `npm test -w shared` | 11 test files, 128 tests PASS |
| `npm run lint -w shared` | 0 errors |
| `npx tsc --noEmit -p web/tsconfig.app.json` | Clean |
| `cd web && npx vite build` | 29 modules, build succeeds |
| `grep react-native shared/src/` | No matches |
| `git diff PromptPlay/` | No modifications (pre-existing CRLF only) |
| ESLint catches RN import | Verified: adds `import { View } from 'react-native'` -> lint error |

## Next Phase Readiness

- shared/ package fully populated with all portable TS code
- All 128 tests passing -- safe to refactor or extend
- @shared alias verified working in web/ (TypeScript + Vite build)
- ESLint guard prevents accidental react-native dependency leaks
- Ready for phase 07-03 (if exists) or phase 08

## Self-Check: PASSED

- All 18 key source/config files verified present on disk
- 20 lesson JSON files verified present
- 6 evaluator test files verified present
- Commit e7705e8 (Task 1) verified in git log
- Commit f917142 (Task 2) verified in git log
