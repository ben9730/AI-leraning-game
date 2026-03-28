# Deferred Items — Phase 06 PWA Polish

## Out-of-scope failures discovered during 06-02 execution

### responsive-layout.test.ts (6 failures)

**Found during:** Task 2 verification
**File:** `PromptPlay/src/features/pwa/__tests__/responsive-layout.test.ts`
**Issue:** Tests check for hardcoded widths in files that do not yet exist (e.g. responsive layout components). `existsSync` returns false for each file, causing 6 test failures.
**Root cause:** Pre-existing test suite added by plan 06-01 that anticipates files to be created in a later plan.
**Action required:** Create the missing responsive layout component files referenced in this test suite (belongs to plan 06-03 or later).
**Not fixed:** Out of scope for 06-02 — these failures pre-date this plan's changes.
