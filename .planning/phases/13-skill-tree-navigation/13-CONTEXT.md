# Phase 13: Skill Tree + Navigation - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver tab-based app navigation (Home, Skill Tree, Profile), a visual skill tree showing all 20 lessons across 4 chapters with progress states, an onboarding flow that gets new users to their first exercise within 60 seconds, and a profile tab with badges/stats/language switcher.

</domain>

<decisions>
## Implementation Decisions

### Tab Navigation & Layout
- Bottom tab bar (mobile-style), consistent with Duolingo pattern, thumb-friendly on mobile-first PWA
- Icon + text label for each tab — better accessibility
- GameHeader stays at top, new TabBar component added at bottom — minimal disruption to existing RootLayout
- Clean route structure: `/` (Home), `/tree` (Skill Tree), `/profile` (Profile), keep `/lesson/:id` as overlay route

### Skill Tree Visualization
- CSS Grid + Tailwind for rendering — lightweight, RTL-friendly with logical properties, no canvas/SVG complexity
- Vertical scroll with chapter sections stacked — each chapter is a labeled section with nodes in a column/path
- CSS borders/pseudo-elements for node connectors — simple vertical connectors between adjacent nodes
- 3 visual node states: locked (gray, muted), unlocked (colored border, pulsing dot), completed (filled, checkmark)

### Onboarding Flow
- Welcome screen → goal selection → redirect to first lesson — minimal steps, under 60 seconds to first exercise
- 3 preset goal cards: "Learn AI basics", "Improve my prompts", "Explore for fun" — quick tap, personalizes home greeting
- State stored in useProgressStore: `hasOnboarded: boolean`, `learningGoal: string` — reuse existing Zustand store
- Onboarding is mandatory but only 2 taps — doesn't feel like a gate

### Profile Tab
- Stats cards at top (XP, streak, level, lessons completed) → badge grid below
- Tap badge → tooltip/popover with name + description — lightweight discovery
- Language switcher toggle in profile header area, above stats — prominent for bilingual users
- All stats derived from useProgressStore — XP, streak, level already computed there (Phase 12)

### Claude's Discretion
- Specific tab icons (emoji, SVG inline, or icon set) — choose what fits the existing design language
- Skill tree node size and spacing — optimize for mobile-first viewport
- Onboarding welcome screen visual design — keep minimal and on-brand
- Profile page responsive breakpoints — mobile-first with desktop enhancement

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `web/src/components/GameHeader.tsx` — Top bar with streak/XP/level, stays as-is
- `web/src/components/BadgeGrid.tsx` — Badge display grid from Phase 12, reuse in Profile
- `web/src/components/BadgeToast.tsx` — Badge notification, already integrated
- `web/src/components/LevelUpModal.tsx` — Level up modal, already in RootLayout
- `web/src/components/ProgressRing.tsx` — Circular progress indicator, reuse for profile stats
- `web/src/pages/HomePage.tsx` — Current home page with chapter/lesson list
- `web/src/pages/LessonPage.tsx` — Lesson flow page, untouched
- `web/src/store/useProgressStore.ts` — Zustand store with XP, streak, progress map, badges
- `web/src/hooks/useLanguage.ts` — Language switching hook from Phase 8
- `shared/src/skill-tree/skillTreeUtils.ts` — Skill tree utility functions
- `shared/src/content/curriculum.ts` — Chapters array with lessonIds

### Established Patterns
- React Router 7 with `createBrowserRouter` and `RouterProvider`
- RootLayout with `<Outlet />` for child routes
- Zustand stores with localStorage persistence
- Tailwind CSS logical properties (ps/pe/ms/me) for RTL
- i18next with `useTranslation` hook

### Integration Points
- `web/src/App.tsx` — Router definition, needs new tab routes and TabBar in layout
- `web/src/store/useProgressStore.ts` — Add `hasOnboarded` and `learningGoal` fields
- `shared/src/content/curriculum.ts` — Chapter/lesson data feeds skill tree nodes

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches based on established patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
