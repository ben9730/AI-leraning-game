# Phase 7: Foundation + Shared Extraction - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Scaffold the Vite 6 + React 19 + Tailwind v4 web project alongside the existing PromptPlay/ directory. Create a shared/ package containing all portable pure TypeScript logic extracted from PromptPlay/src/. Establish lint rules that prevent react-native imports in shared/.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Use ROADMAP phase goal, success criteria, and research recommendations to guide decisions.

Key research guidance:
- Monorepo with shared/ (pure TS) + web/ (Vite SPA) + PromptPlay/ (existing, untouched)
- shared/ contains: content schema, evaluators, gamification engine, badges, store types, curriculum, lesson JSONs
- web/ is a fresh Vite + React 19 + Tailwind v4 + TypeScript project
- Use pnpm workspaces or npm workspaces for monorepo
- React Router 7 for client-side routing

</decisions>

<code_context>
## Existing Code Insights

### Portable Pure TS (extract to shared/)
- src/content/schema.ts — Lesson, Exercise, LocalizedString types
- src/content/loader.ts — loadLesson function (needs web adaptation)
- src/content/curriculum.ts — chapter/lesson index
- src/content/lessons/*.json — 20 lesson JSON files
- src/features/gamification/engine.ts — calcXP, calcStreakUpdate, shouldGrantFreeze
- src/features/gamification/badges.ts — deriveBadges
- src/features/gamification/constants.ts — XP thresholds, level table
- src/features/exercise/evaluators/*.ts — 6 evaluator functions
- src/store/types.ts — UserProgress type, getLevel()
- src/i18n/en/common.json, src/i18n/he/common.json — translation files

### NOT Portable (stays in PromptPlay/)
- All React Native UI components (View, Text, StyleSheet)
- Expo Router navigation
- react-native-mmkv persistence
- Reanimated + Lottie animations
- Platform-specific code

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Refer to ROADMAP phase description and success criteria.

</specifics>

<deferred>
## Deferred Ideas

None — discuss phase skipped.

</deferred>
