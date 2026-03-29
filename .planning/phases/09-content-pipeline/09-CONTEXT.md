# Phase 9: Content Pipeline - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Create a Vite-native content loader using import.meta.glob to load all 20 lesson JSON files from shared/. Wire up curriculum index with chapter groupings. After this phase, web/ can load any lesson by ID and iterate chapters.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — infrastructure phase.

Key guidance:
- shared/ already has lesson JSONs in shared/src/content/lessons/
- shared/ has schema.ts, curriculum.ts, and a loader (may need web adaptation)
- Vite uses import.meta.glob for dynamic imports — replace Metro's require() pattern
- The loader must return typed Lesson objects matching shared/src/content/schema.ts
- Curriculum index must expose chapters array with lessonIds (same as v1)

</decisions>

<code_context>
## Existing Code Insights

### From shared/
- shared/src/content/schema.ts — Lesson, Exercise, LocalizedString types
- shared/src/content/curriculum.ts — chapters array with lessonIds
- shared/src/content/loader.ts — loadLesson(id) function (uses require(), needs Vite adaptation)
- shared/src/content/lessons/*.json — 20 lesson files

### Integration Points
- web/ imports from @shared/ alias
- Exercise system (Phase 10) will consume lessons from this loader
- Lesson flow (Phase 11) will use curriculum for navigation

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
