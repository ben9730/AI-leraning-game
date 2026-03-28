# Plan 10-01 Summary

**Status:** Complete
**Duration:** ~10 min

## What was built
- Exercise type registry mapping 6 type keys to components + evaluators
- FeedbackCard component showing score, pass/fail, per-criterion breakdown
- MCQCard — radio button selection with submit
- PickBetterCard — two-option comparison card
- FreeTextCard — textarea input with submit
- Barrel exports in web/src/exercises/index.ts

## Files created
- web/src/exercises/types.ts
- web/src/exercises/registry.ts
- web/src/exercises/index.ts
- web/src/exercises/components/FeedbackCard.tsx
- web/src/exercises/components/MCQCard.tsx
- web/src/exercises/components/PickBetterCard.tsx
- web/src/exercises/components/FreeTextCard.tsx
- web/src/exercises/registry.test.ts
- web/src/exercises/components/exerciseCards.test.tsx

## Test results
- 15 new tests (5 registry + 10 component)
- 42 total web/ tests passing

## Decisions
- Used Tailwind logical properties throughout
- Evaluators imported from @shared/
- Each card manages own state, calls onComplete with result
