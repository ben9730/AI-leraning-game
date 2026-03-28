---
phase: 05-full-curriculum
plan: "01"
subsystem: exercise-engine
tags: [simulated-chat, evaluator, component, registry, tdd, rtl]
dependency_graph:
  requires: []
  provides: [simulated-chat-exercise-type]
  affects: [exercise-engine, content-authoring-plans-02-03]
tech_stack:
  added: []
  patterns: [3-state-machine, chat-bubble-ui, tdd-red-green]
key_files:
  created:
    - PromptPlay/src/features/exercise/evaluators/evaluateSimulatedChat.ts
    - PromptPlay/src/features/exercise/evaluators/__tests__/evaluateSimulatedChat.test.ts
    - PromptPlay/src/features/exercise/components/SimulatedChatCard.tsx
  modified:
    - PromptPlay/src/features/exercise/registry.ts
    - PromptPlay/src/features/exercise/__tests__/registry.test.ts
decisions:
  - evaluateSimulatedChat is an exact type-alias of evaluateFreeText algorithm — same normalize + scoring loop, only type parameter differs
  - SimulatedChatCard uses borderTopEndRadius/borderTopStartRadius for chat bubble tails (RTL-safe vs borderTopLeftRadius/Right)
  - 3-state machine (writing/response-revealed/scored) keeps haptic feedback at submit time, score reveal deferred to user tap
metrics:
  duration_minutes: 3
  completed_date: "2026-03-28"
  tasks_completed: 2
  files_created: 3
  files_modified: 2
---

# Phase 05 Plan 01: Simulated Chat Exercise Type Summary

**One-liner:** SimulatedChatCard with 3-state chat UI (writing → response-revealed → scored) and evaluateSimulatedChat scorer using identical rubric algorithm to evaluateFreeText, registered as the 6th exercise type.

## Tasks Completed

| # | Task | Commit | Status |
|---|------|--------|--------|
| 1 | evaluateSimulatedChat evaluator + TDD tests | 2cecf87 | Done |
| 2 | SimulatedChatCard component + registry wiring | 7563ceb | Done |

## What Was Built

### evaluateSimulatedChat
Pure function typed against `SimulatedChatExercise`. Replicates `evaluateFreeText` algorithm exactly — same `normalize()` helper (Hebrew: trim-only, English: trim+toLowerCase), same checklist/weighted-keyword scoring loop, same required-criterion override. 8 tests covering all modes.

### SimulatedChatCard
3-state React Native component:
1. **writing** — prompt instruction, optional systemContext grey box, multiline TextInput, Submit button
2. **response-revealed** — user text in right-aligned purple bubble (`alignSelf: flex-end`, `borderTopEndRadius: 4`), AI response in left-aligned grey bubble (`alignSelf: flex-start`, `borderTopStartRadius: 4`), "See Score" button
3. **scored** — FeedbackCard with result/rubric/modelAnswer, Continue button calls `onComplete(result)`

RTL-safe: all padding uses `paddingStart/paddingEnd`, bubble tail uses `borderTopEndRadius/borderTopStartRadius`.

### Registry
Added `'simulated-chat': SimulatedChatCard` — now 6 exercise types. Registry test updated from 5→6.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `npx jest evaluateSimulatedChat --no-coverage` — 8/8 tests pass
- `npx jest registry --no-coverage` — 3/3 tests pass
- `npx jest --no-coverage` — 213/213 tests pass (no regressions)

## Self-Check: PASSED

- evaluateSimulatedChat.ts: FOUND
- evaluateSimulatedChat.test.ts: FOUND
- SimulatedChatCard.tsx: FOUND
- Commit 2cecf87: FOUND
- Commit 7563ceb: FOUND
