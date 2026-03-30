---
gsd_state_version: 1.0
milestone: v2.1
milestone_name: Practical AI & Sandbox
status: planning
stopped_at: null
last_updated: "2026-03-30T00:00:00.000Z"
last_activity: 2026-03-30
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-30)

**Core value:** Make AI skills accessible and fun for anyone — turn "I don't know what to ask AI" into confident, effective AI usage through gamified practice.
**Current focus:** Phase 15 — CodeBlock Foundation + Schema Extension (ready to plan)

## Current Position

Phase: 15 of 18 (CodeBlock Foundation + Schema Extension)
Plan: —
Status: Ready to plan
Last activity: 2026-03-30 — Roadmap created for v2.1

Progress: [█░░░░░░░░░] 10%

## Performance Metrics

**Velocity:**

- Total plans completed: 9 (v2.0 milestone)
- Average duration: 10 min
- Total execution time: ~1.5 hours

**By Phase (v2.0 history):**

| Phase | Total | Avg/Plan |
|-------|-------|----------|
| 07 P02 | 12min | 12min |
| 08 P02 | 4min | 4min |
| 09 P01 | 2min | 2min |
| 11 P01 | 8min | 8min |
| 13 P01-03 | 28min | 9min |
| 14 P01-02 | 30min | 15min |

*Updated after each plan completion*

## Accumulated Context

### Decisions

Recent decisions affecting current work:

- [v2.0 RTL]: CSS logical properties + document.dir — no physical left/right anywhere
- [Phase 08]: CSS logical property convention: ps/pe/ms/me only, never physical pl/pr/ml/mr
- [Phase 09]: import.meta.glob eager:true for synchronous lesson loading
- [Phase 11]: Continue button pattern — exercise cards call onComplete, LessonPage shows Continue
- [Phase 13]: Dual-layout router: OnboardingLayout + RootLayout with TabBar
- [Phase 14]: registerType prompt for vite-plugin-pwa — user-consent update toast
- [v2.1 research]: CodeBlock must have dir="ltr" + unicode-bidi:isolate — build FIRST before any content
- [v2.1 research]: sandboxStore must be isolated from progressStore — never call completeLesson() from sandbox
- [v2.1 research]: All new content schema fields must be optional to avoid breaking existing 20 lessons

### Pending Todos

None yet.

### Blockers/Concerns

- Sandbox evaluator spec (qualitative feedback, no score %) needs concrete design before Phase 18 planning
- Sandbox scenario content (3 templates) must be authored before Phase 18 can complete
- Syntax highlighter decision deferred: use plain pre/code first, add react-syntax-highlighter only if visual gap unacceptable

## Session Continuity

Last session: 2026-03-30
Stopped at: Roadmap created — v2.1 Phases 15-18 defined
Resume file: None
