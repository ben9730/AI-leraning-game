---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 02-lesson-engine-core-exercises-02-PLAN.md
last_updated: "2026-03-28T14:45:00.000Z"
last_activity: 2026-03-28
progress:
  total_phases: 6
  completed_phases: 1
  total_plans: 6
  completed_plans: 5
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-28)

**Core value:** Make AI skills accessible and fun for anyone — turn "I don't know what to ask AI" into confident, effective AI usage through gamified practice.
**Current focus:** Phase 02 — Lesson Engine + Core Exercises

## Current Position

Phase: 02 (Lesson Engine + Core Exercises) — EXECUTING
Plan: 3 of 3
Status: Ready to execute
Last activity: 2026-03-28

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| — | — | — | — |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01-foundation P01 | 25 | 2 tasks | 9 files |
| Phase 02-lesson-engine-core-exercises P01 | 27 | 2 tasks | 14 files |
| Phase 02-lesson-engine-core-exercises P02 | 35 | 2 tasks | 22 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: RTL + content schema are Phase 1 non-negotiables — must be done before any UI or content work
- Roadmap: EXER-05 (simulated AI chat) deferred to Phase 5 — engine must be proven before authoring the core differentiator
- Roadmap: Notifications (NOTF-01/02/03) are v2 scope — not in v1 roadmap
- [Phase 01-foundation]: Use --legacy-peer-deps for @testing-library/react-native due to peer dep conflict with Expo 55 canary
- [Phase 01-foundation]: isRTL() reads i18n.language not I18nManager.isRTL to avoid expo/expo#34225 bug
- [Phase 01-foundation]: setLanguage calls Updates.reloadAsync for RTL flip — full reload required for I18nManager to take effect
- [Phase 02-lesson-engine-core-exercises]: useRef for score accumulation in useLessonSession avoids stale closure bug in setState callback
- [Phase 02-lesson-engine-core-exercises]: Dual-project Jest config: node preset for content tests, react-native preset for hook tests — avoids fighting ts-jest with RN setup files
- [Phase 02-lesson-engine-core-exercises]: babel.config.js with babel-preset-expo added to enable react-native Jest preset to transform node_modules
- [Phase 02-lesson-engine-core-exercises]: expo-haptics mocked via __mocks__/expo-haptics.js + moduleNameMapper — native module cannot run in Jest
- [Phase 02-lesson-engine-core-exercises]: SpotProblemCard uses deterministic order (issues then distractors) for v1 — avoids test flakiness from shuffle

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 1: MMKV + Expo Go conflict needs a decision — AsyncStorage for dev or dev builds from day one (see research SUMMARY.md)
- Phase 1: RTL testing automation in Expo is unresolved — investigate during Phase 1 planning
- Phase 4: Supabase RLS policy design for multi-table lesson progress needs careful review before Phase 4 planning
- Phase 5: Hebrew native review process and AI-term glossary must be established before Phase 5 begins

## Session Continuity

Last session: 2026-03-28T14:45:00.000Z
Stopped at: Completed 02-lesson-engine-core-exercises-02-PLAN.md
Resume file: None
