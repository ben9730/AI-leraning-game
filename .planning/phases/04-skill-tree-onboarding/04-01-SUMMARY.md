---
phase: 04-skill-tree-onboarding
plan: "01"
subsystem: skill-tree
tags: [skill-tree, navigation, progress, rtl, tdd]
dependency_graph:
  requires:
    - src/store/useProgressStore.ts
    - src/content/curriculum.ts
    - src/content/loader.ts
    - app/(lesson)/[lessonId].tsx
  provides:
    - src/features/skill-tree/useSkillTreeData.ts
    - src/features/skill-tree/skillTreeUtils.ts
    - src/features/skill-tree/SkillTreeNode.tsx
    - src/features/skill-tree/ChapterHeader.tsx
    - app/(tabs)/skill-tree.tsx
  affects:
    - jest.config.js
    - src/i18n/en/common.json
    - src/i18n/he/common.json
tech_stack:
  added: []
  patterns:
    - TDD with pure function extraction for testability (skillTreeUtils.ts split from hook)
    - Reanimated withRepeat/withSequence for isCurrent node pulse animation
    - ScrollView ref + onLayout y-offset map for scroll-to-current on mount
key_files:
  created:
    - PromptPlay/src/features/skill-tree/useSkillTreeData.ts
    - PromptPlay/src/features/skill-tree/skillTreeUtils.ts
    - PromptPlay/src/features/skill-tree/useSkillTreeData.test.ts
    - PromptPlay/src/features/skill-tree/SkillTreeNode.tsx
    - PromptPlay/src/features/skill-tree/ChapterHeader.tsx
  modified:
    - PromptPlay/app/(tabs)/skill-tree.tsx
    - PromptPlay/jest.config.js
    - PromptPlay/src/i18n/en/common.json
    - PromptPlay/src/i18n/he/common.json
decisions:
  - "Pure functions (getCurrentLessonId, deriveNodeStates) extracted to skillTreeUtils.ts separate from hook — avoids MMKV native module chain in node jest preset"
  - "skill-tree jest project added with node preset and testPathIgnorePatterns on react-native project — pure logic tests don't need RN environment"
metrics:
  duration: "25 minutes"
  completed_date: "2026-03-28"
  tasks_completed: 2
  files_created: 5
  files_modified: 4
---

# Phase 04 Plan 01: Skill Tree Screen Summary

**One-liner:** Visual skill tree with locked/unlocked/complete node states derived from progress store, chapter groupings, scroll-to-current, and lesson navigation.

## What Was Built

The skill tree feature gives users a complete map of their learning journey. Tapping unlocked or completed nodes navigates to the lesson engine. Locked nodes are disabled. The current lesson (first unlocked-but-not-completed) is visually highlighted with a pulsing border and auto-scrolled into view on mount.

## Artifacts Produced

| File | Purpose |
|------|---------|
| `src/features/skill-tree/skillTreeUtils.ts` | Pure functions: `deriveNodeStates`, `getCurrentLessonId` — no store dependency |
| `src/features/skill-tree/useSkillTreeData.ts` | Hook: reads store, iterates chapters, returns `ChapterGroup[]` |
| `src/features/skill-tree/useSkillTreeData.test.ts` | 10 unit tests for both pure functions |
| `src/features/skill-tree/SkillTreeNode.tsx` | Node component: locked/unlocked/complete visuals + Reanimated pulse |
| `src/features/skill-tree/ChapterHeader.tsx` | Chapter header with title + completed/total progress count |
| `app/(tabs)/skill-tree.tsx` | Full screen: ScrollView, progress bar, chapter groups, navigation |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Pure functions extracted to separate file to avoid MMKV in node tests**
- **Found during:** Task 1 TDD GREEN step
- **Issue:** `useSkillTreeData.ts` imports `useProgressStore` which chains into `MMKVAdapter.ts` (native module). The node jest preset cannot load native modules, causing `TS2693: 'MMKV' only refers to a type`.
- **Fix:** Extracted `getCurrentLessonId` and `deriveNodeStates` to `skillTreeUtils.ts` (no store import). Tests import from utils directly. Added `skill-tree` node preset to `jest.config.js` and added `testPathIgnorePatterns` on the `react-native` project to prevent double-running.
- **Files modified:** `skillTreeUtils.ts` (new), `useSkillTreeData.ts` (import from utils), `jest.config.js` (new project + ignore pattern), `useSkillTreeData.test.ts` (import path change)
- **Commit:** cb7378f

## Self-Check: PASSED

- FOUND: PromptPlay/src/features/skill-tree/useSkillTreeData.ts
- FOUND: PromptPlay/src/features/skill-tree/skillTreeUtils.ts
- FOUND: PromptPlay/src/features/skill-tree/SkillTreeNode.tsx
- FOUND: PromptPlay/src/features/skill-tree/ChapterHeader.tsx
- FOUND: PromptPlay/app/(tabs)/skill-tree.tsx
- FOUND commit: cb7378f (Task 1)
- FOUND commit: 93e975a (Task 2)
