# Phase 11: Lesson Flow - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the lesson screen that takes users through a complete lesson: intro screen with title/tip, one-at-a-time exercise sequence with dot stepper progress, and completion screen showing XP earned. Persist lesson progress (not started / in progress / completed) across sessions. Implement sequential unlock logic where completing lesson N unlocks N+1.

</domain>

<decisions>
## Implementation Decisions

### Lesson Screen Structure
- Full-screen card layout with progress bar/dots at top — mobile-first, Duolingo-style
- Minimal intro screen: lesson title, chapter name, tip text, "Start" button — fast path to first exercise
- One-at-a-time exercise presentation with progress dots (filled/empty circles)
- Auto-advance to next exercise after feedback dismissal

### Completion & Unlock Logic
- Completion screen shows XP earned summary + "Next Lesson" button
- Strict sequential unlock: completing lesson N unlocks lesson N+1
- First lesson (lesson-01-what-is-prompting) is pre-unlocked in store (already configured)
- Lesson states: not started / in progress / completed — persisted via useProgressStore

### Routing & Navigation
- React Router 7 with /lesson/:id route
- Home page shows chapter/lesson list as entry point
- Browser back returns to home
- No deep navigation yet — Phase 13 adds tab-based navigation

### Claude's Discretion
- Exercise-to-exercise transition animation (if any)
- XP amount per exercise/lesson completion
- Error handling for invalid lesson IDs in URL

</decisions>

<code_context>
## Existing Code Insights

### From shared/
- shared/src/content/schema.ts — Lesson, Exercise, Chapter types
- shared/src/content/curriculum.ts — chapters array with lesson groupings
- shared/src/exercise/evaluators/ �� all 6 evaluator functions
- shared/src/store/types.ts — UserProgress type with completedLessons, unlockedLessons
- shared/src/gamification/engine.ts — calcStreakUpdate, shouldGrantFreeze

### From web/ (already built)
- web/src/content/ �� loadLesson(), getAllLessonIds(), chapters barrel export
- web/src/store/useProgressStore.ts — Zustand store with completeLesson(), unlockLesson(), addXP()
- web/src/exercises/ — registry with getExerciseComponent(), all 6 card components, FeedbackCard
- web/src/hooks/useLanguage.ts — language/RTL management
- web/src/i18n/ — i18next setup with EN+HE
- web/src/App.tsx — currently a demo page, no routing

### Integration Points
- loadLesson(id) returns full Lesson object with exercises array
- getExerciseComponent(type) returns { component, evaluator } for any exercise type
- useProgressStore provides completedLessons, unlockedLessons, completeLesson(), unlockLesson(), addXP()
- chapters from content barrel provides curriculum structure for home page listing

</code_context>

<specifics>
## Specific Ideas

- Dot stepper similar to Duolingo lesson progress (small circles, filled = complete)
- "Next Lesson" button on completion screen should be primary CTA
- Home page lesson list should show locked/unlocked/completed visual states

</specifics>

<deferred>
## Deferred Ideas

- Tab-based navigation (Phase 13)
- Skill tree visualization (Phase 13)
- Celebration animations on completion (Phase 12)
- Offline lesson access (Phase 14)

</deferred>
