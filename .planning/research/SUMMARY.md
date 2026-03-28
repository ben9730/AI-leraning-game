# Project Research Summary

**Project:** PromptPlay Web (v2.0 Web-First PWA Rebuild)
**Domain:** Gamified educational web app (RN-to-web migration)
**Researched:** 2026-03-28
**Confidence:** HIGH

## Executive Summary

PromptPlay is a Duolingo-style gamified app teaching AI prompting skills, currently built as an Expo/React Native app. The v2.0 milestone is a full web-first rebuild as a Vite + React 19 SPA deployed as a PWA. This is NOT a framework migration -- it is a clean rebuild of UI components while extracting and reusing a large body of portable pure-TypeScript logic (evaluators, gamification engine, content schema, store types). Research across all four dimensions converges on a clear approach: monorepo with a `shared/` package for portable TS, a new `web/` Vite project for the SPA, and the existing `PromptPlay/` directory left untouched.

The recommended stack is Vite 6 + React 19 + TypeScript 5 + Tailwind v4 + Zustand 5 + React Router 7 + vite-plugin-pwa. This stack was chosen because PromptPlay is a client-only app with bundled JSON content -- there is no SEO requirement, no server-side data fetching, and no API routes. Next.js and Remix add complexity with zero benefit. The existing codebase already uses Zustand and i18next, so state management and internationalization port with minimal friction. Tailwind v4's native logical property utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`) make RTL support cleaner than the RN approach.

The primary risks are: (1) RN-specific imports leaking into the shared package and breaking web builds, (2) physical CSS properties breaking Hebrew RTL layout (this is the single most pervasive risk -- every component must use logical properties from day one), and (3) content loader incompatibility between Metro and Vite bundlers requiring platform-specific implementations. All three are preventable with lint rules, conventions, and architecture decisions established in Phase 1.

## Key Findings

### Recommended Stack

The stack prioritizes zero-overhead tooling for a client-only SPA. No SSR framework, no runtime CSS-in-JS, no heavy animation libraries. Every technology is either already used in the existing codebase (Zustand, i18next, TypeScript) or is the standard web replacement for an RN-specific tool (Tailwind replaces StyleSheet, CSS animations replace Reanimated, localStorage replaces MMKV).

**Core technologies:**
- **Vite 6**: Build tool + dev server -- fastest DX for React SPAs, native ESM, `import.meta.glob` for content loading, vite-plugin-pwa for service worker
- **React 19 + TypeScript 5**: Team already knows React from RN; type safety across shared code is critical
- **Tailwind v4**: Utility-first CSS with built-in logical property utilities for RTL; zero-runtime; CSS-first config
- **Zustand 5**: Same store shape, same actions, same persist middleware as existing app; `createJSONStorage(() => localStorage)` replaces MMKV
- **React Router 7**: Client-side routing with dynamic params (`/lesson/:id`), layout routes, navigation guards
- **vite-plugin-pwa**: Zero-config PWA with Workbox service worker for offline caching
- **Vitest + Testing Library + Playwright**: Vite-native testing stack; Playwright already configured in the project

### Expected Features

**Must have (table stakes -- feature parity with existing app):**
- All 6 exercise types (MCQ, free-text, pick-better, fill-blank, spot-problem, simulated-chat)
- Lesson flow (intro -> exercises -> completion) with XP/streak/badge tracking
- EN/HE bilingual support with full RTL layout
- Persistent progress via localStorage
- PWA installability with offline content access
- Skill tree / curriculum map navigation
- Onboarding (goal selection)

**Should have (web-specific improvements over RN version):**
- Instant RTL switching without app reload (web platform advantage)
- URL-based lesson sharing (`/lesson/lesson-05-intent`)
- Keyboard accessibility for all exercises (Tab, Enter, Space)
- Responsive desktop layout (mobile-first with max-width container)

**Defer (cut from this milestone):**
- Native app store deployment
- Cloud sync with Supabase (local-first only)
- Push notifications
- Haptic feedback
- New exercise types not already in the existing app

### Architecture Approach

The architecture is a monorepo with three directories: `PromptPlay/` (existing, untouched), `shared/` (extracted pure TS with zero framework dependencies), and `web/` (new Vite React SPA). The `shared/` package contains ~600 lines of directly portable code across content schema, gamification engine, exercise evaluators, and store types. The web app follows a feature-sliced structure with clear boundaries: exercise system, lesson flow, gamification UI, skill tree, PWA, and onboarding -- each as a self-contained feature directory under `web/src/features/`.

**Major components:**
1. **shared/** -- Pure TS logic: content schema/curriculum, 6 evaluator functions, gamification engine (XP, streaks, badges), store types
2. **web/src/store/** -- Zustand with localStorage persistence, hydration gate pattern
3. **web/src/features/exercise/** -- Exercise registry pattern (type key -> component + evaluator), 6 web exercise card components
4. **web/src/features/lesson/** -- Lesson flow orchestration using portable `useLessonSession` hook
5. **web/src/features/gamification/** -- XP display, streak UI, badge list, celebration animations (CSS)
6. **web/src/features/skill-tree/** -- Visual curriculum map with node states derived from store + shared curriculum data
7. **web/src/ui/** -- Design system primitives (Button, Card, Modal, ProgressBar, Layout shell)

### Critical Pitfalls

1. **RN imports leaking into shared/** -- A single transitive `react-native` import breaks the web build. Prevent with lint rules banning RN imports in `shared/`, separate tsconfig without RN types, and CI grep checks.
2. **Physical CSS properties breaking RTL** -- This is the most pervasive risk. Every `margin-left`, `padding-right`, `text-align: left` must be a logical property instead. Prevent with strict Tailwind conventions (`ps-*` never `pl-*`), ESLint rules, and testing every component in RTL mode.
3. **Content loader incompatibility** -- Metro and Vite handle JSON imports differently. Do NOT put the loader in `shared/`. Each platform implements its own loader (`import.meta.glob` for web, static imports for RN) conforming to the same interface.
4. **Zustand hydration race condition** -- Components render before localStorage rehydration completes, causing a flash of empty state. Prevent with the existing `_hasHydrated` / hydration gate pattern (already proven in the RN codebase).
5. **Path alias resolution in monorepo** -- `@shared/` must be defined in THREE places (tsconfig, vite.config, vitest.config) or builds/tests fail silently. Validate alias resolution in CI before writing extensive code.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation + Shared Extraction
**Rationale:** Everything depends on the monorepo structure and shared code being correctly extracted. This must be first.
**Delivers:** Vite project scaffold, `shared/` package with all portable TS (~15 files), TypeScript path aliases, Tailwind v4 with logical property conventions, React Router shell with placeholder routes.
**Addresses:** Project scaffold, shared code extraction (FEATURES: offline content access foundation)
**Avoids:** Pitfall 1 (RN imports in shared) -- establish lint rules and CI checks here; Pitfall 9 (path alias resolution) -- validate in all three configs

### Phase 2: State Management + i18n + RTL
**Rationale:** Every UI component depends on the store and i18n. These are horizontal concerns that must exist before any feature work.
**Delivers:** Zustand store (web version) with localStorage persistence, hydration gate in main.tsx, i18next initialization with browser-native language detection, RTL support via `document.dir` + CSS logical properties, language toggle.
**Addresses:** FEATURES: EN/HE language toggle, RTL layout support, persistent progress
**Avoids:** Pitfall 4 (hydration race -- gate app render on `_hasHydrated`), Pitfall 2 (RTL conventions established early as project standard)

### Phase 3: Content Pipeline
**Rationale:** Exercises render content. Content loading must work before exercise components can be built.
**Delivers:** Vite-compatible content loader using `import.meta.glob`, verification that all 20 lesson JSONs load correctly, lesson content rendering (title, body, tip) with RTL-aware text.
**Addresses:** FEATURES: Lesson content display, offline content access
**Avoids:** Pitfall 3 (loader incompatibility) -- web-specific loader, shared interface only

### Phase 4: Exercise System
**Rationale:** The 6 exercise types are the core interaction. They depend on content (Phase 3) and i18n (Phase 2).
**Delivers:** Exercise registry (web version), ExerciseRunner component, all 6 exercise card components rebuilt as web components with keyboard accessibility, evaluators wired from shared.
**Addresses:** FEATURES: All 6 exercise types, exercise evaluation with feedback, keyboard accessibility
**Avoids:** Pitfall 2/5 (RTL in every component), Pitfall 6 (accessibility from day one -- `role`, `tabIndex`, `aria-live`)

### Phase 5: Lesson Flow + Gamification
**Rationale:** Lesson flow sequences exercises (Phase 4) and fires gamification events on completion. This completes the core loop.
**Delivers:** Full lesson loop (intro -> exercises -> completion), XP/streak/badge store integration, lesson unlock logic (prerequisites), celebration UI with CSS animations, level-up modal, XP/streak display on home page, badge list.
**Addresses:** FEATURES: Lesson flow, XP system, streak tracking, badge system, lesson completion celebration, level-up modal
**Avoids:** Pitfall 7 (LocalizedString reactivity) -- use `useLocale` hook consistently

### Phase 6: Skill Tree + Navigation + Onboarding
**Rationale:** With the core loop working, users need navigation to discover and access lessons. Skill tree requires both content data and progress state.
**Delivers:** Skill tree visualization with node states (locked/unlocked/completed), chapter headers, bottom tab navigation, onboarding flow (goal selection), route guards (redirect to onboarding if needed).
**Addresses:** FEATURES: Skill tree, onboarding, URL-based lesson sharing (comes free with React Router)

### Phase 7: Accessibility + Responsive Design
**Rationale:** With all features built, audit and polish for keyboard navigation consistency and desktop layout.
**Delivers:** Full keyboard navigation audit, ARIA attribute review, responsive desktop layout with max-width container, focus management after exercise submission.
**Addresses:** FEATURES: Keyboard accessibility (audit), responsive desktop layout

### Phase 8: PWA + Performance + Polish
**Rationale:** PWA is a polish phase -- the app must work fully online before adding offline/install capabilities.
**Delivers:** Service worker via vite-plugin-pwa with Workbox, web app manifest, install banner component, offline support verification, performance optimization (lighthouse audit), iOS-specific meta tags.
**Addresses:** FEATURES: PWA installability, offline content access (full verification)
**Avoids:** Pitfall 8 (stale cache -- use `registerType: 'autoUpdate'`), Pitfall 10 (missing meta tags), Pitfall 12 (animation performance on low-end devices)

### Phase Ordering Rationale

- **Dependency chain:** shared extraction -> state/i18n -> content -> exercises -> lesson flow -> navigation -> polish. Each phase consumes what the previous phase built.
- **Risk front-loading:** The three critical pitfalls (RN imports, RTL, content loader) are all addressed in Phases 1-3. By Phase 4, the foundation is proven.
- **Core loop priority:** Phases 1-5 deliver a working lesson from start to finish. A user can complete a lesson, earn XP, and see their streak update. Everything after Phase 5 is navigation and polish.
- **Portable code reuse:** ~600 lines of pure TS port directly. The exercise evaluators, gamification engine, and store types are the most valuable shared code and are consumed starting in Phase 4.
- **Gamification with lesson flow:** Research shows gamification UI and lesson flow are tightly coupled (gamification fires on lesson completion). Combining them in Phase 5 avoids a half-working state.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Exercise System):** 6 distinct component rebuilds with different interaction patterns (radio selection, free text input, drag-and-drop for fill-blank, chat simulation). Each needs per-component accessibility planning. Recommend `/gsd:research-phase 4`.
- **Phase 6 (Skill Tree):** Most complex UI component. The RN version uses specific layout calculations. Web implementation approach (CSS Grid? SVG? Canvas?) needs investigation. Recommend `/gsd:research-phase 6`.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Vite + React scaffold is extremely well-documented. Shared extraction is mechanical file copying + import verification.
- **Phase 2 (State + i18n):** Zustand persist and i18next have official docs with exact patterns needed. Existing store shape provides the blueprint.
- **Phase 3 (Content Pipeline):** `import.meta.glob` is well-documented in Vite docs. Single function implementation.
- **Phase 8 (PWA):** vite-plugin-pwa has zero-config defaults. Existing manifest.json and service worker patterns already exist in the codebase.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified via official docs. Vite, Zustand, React Router, Tailwind v4 are mature. Several already in use. |
| Features | HIGH | Feature list is a direct port of existing functionality verified by reading 50+ source files. No speculative features. |
| Architecture | HIGH | Monorepo structure and portable code tiers verified by checking every import chain in the existing codebase. |
| Pitfalls | HIGH | All pitfalls derived from actual patterns in the existing codebase or well-documented web platform behaviors. |

**Overall confidence:** HIGH

### Gaps to Address

- **Skill tree visualization approach:** The RN skill tree uses specific layout primitives. The web implementation strategy (CSS Grid, SVG path connections, or pure CSS) needs to be decided during Phase 6 planning. Research-phase recommended.
- **Framer Motion necessity:** CSS animations cover 90% of needs per research. The decision to include Framer Motion (~15KB) should be made during Phase 5 based on whether CSS keyframes are sufficient for level-up and lesson-complete celebrations.
- **Supabase cloud sync timing:** Explicitly deferred from this milestone, but the Zustand store shape should remain compatible with future cloud sync. No architectural changes needed -- just avoid designs that would conflict.
- **Testing strategy depth:** Vitest + Testing Library + Playwright are chosen, but the testing pyramid (unit vs integration vs E2E ratio) and specific coverage targets need definition during phase planning.
- **Desktop layout breakpoints:** The app is mobile-first with a max-width container for desktop. Specific breakpoint values and layout adjustments need design-level decisions during Phase 7.

## Sources

### Primary (HIGH confidence)
- **Direct codebase analysis** -- All 50+ source files in PromptPlay/src/ read and analyzed for portability
- [Tailwind CSS v4 docs](https://tailwindcss.com/) -- Logical properties, CSS-first config
- [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) -- Service worker generation, manifest
- [Zustand persist middleware](https://zustand.docs.pmnd.rs/reference/middlewares/persist) -- localStorage persistence pattern
- [React Router v7](https://reactrouter.com/) -- Declarative routing, layout routes
- [CSS logical properties MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values) -- RTL support
- [Vite import.meta.glob](https://vitejs.dev/guide/features.html#glob-import) -- Bulk JSON imports

### Secondary (MEDIUM confidence)
- [Vite vs Next.js 2025](https://strapi.io/blog/vite-vs-nextjs-2025-developer-framework-comparison) -- Framework comparison rationale
- [RTL implementation in Tailwind + React](https://madrus4u.vercel.app/blog/rtl-implementation-guide) -- RTL patterns
- [Tailwind CSS vs CSS Modules 2025](https://medium.com/@salmanmuhammed827/tailwind-css-vs-css-modules-in-2025-which-should-you-choose-7edfe9a75254) -- Styling approach
- [PWA capabilities 2026](https://www.alphabold.com/top-frameworks-and-tools-to-build-progressive-web-apps/) -- PWA features
- [React Router v7 with Vite](https://blog.logrocket.com/file-based-routing-react-router-v7/) -- File-based routing
- [vite-plugin-pwa strategies](https://vite-pwa-org.netlify.app/) -- Service worker caching

### Tertiary (LOW confidence)
- [Zustand + Vite + PWA boilerplate](https://github.com/ascii-16/react-query-zustand-ts-vite-boilerplate) -- Reference only, not validated

---
*Research completed: 2026-03-28*
*Ready for roadmap: yes*
