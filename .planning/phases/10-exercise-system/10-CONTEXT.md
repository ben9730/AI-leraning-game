# Phase 10: Exercise System - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning
**Mode:** Auto-generated (discuss skipped — v1 patterns well-established)

<domain>
## Phase Boundary

Build 6 web exercise components (MCQ, pick-better, free-text, fill-blank, spot-problem, simulated-chat) with the exercise type registry pattern. Wire evaluators from shared/. Display scoring feedback after submission.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion. Follow v1 component patterns adapted for web:

- Exercise type registry: map of type key → { component, evaluator } (same pattern as v1)
- Each exercise card: renders question → accepts user input → calls evaluator → shows feedback
- Use Tailwind for styling (logical properties for RTL)
- Use React state for answer tracking (no zustand needed per-exercise)
- Evaluators imported from @shared/ — pure functions, already tested
- Keyboard accessibility: Enter to submit, Tab navigation between options
- Mobile-first responsive: cards should work on 320px+ viewports

### Component Patterns
- MCQCard: radio buttons, single selection, submit
- PickBetterCard: two options side by side, tap to choose
- FreeTextCard: textarea input, submit button
- FillBlankCard: inline text input within sentence
- SpotProblemCard: list of statements, select the problematic ones
- SimulatedChatCard: show AI response to user prompt, score against rubric

</decisions>

<code_context>
## Existing Code Insights

### From shared/
- shared/src/exercise/evaluators/ — 6 evaluator functions (MCQ, pick-better, free-text, fill-blank, spot-problem, simulated-chat)
- shared/src/content/schema.ts — Exercise type definitions with discriminated union

### From web/ (already built)
- web/src/content/ — loader and curriculum (Phase 9)
- web/src/store/ — progress store (Phase 8)
- web/src/i18n/ — translations (Phase 8)
- Tailwind v4 configured with logical properties

### Integration Points
- Lesson flow (Phase 11) will render exercises using the registry
- Each exercise gets an Exercise object and calls back with the result

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond matching v1 exercise behavior.

</specifics>

<deferred>
## Deferred Ideas

- Animation on correct/incorrect answer (Phase 12 gamification)
- Exercise difficulty progression (future milestone)

</deferred>
