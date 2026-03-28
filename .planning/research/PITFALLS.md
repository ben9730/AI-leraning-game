# Domain Pitfalls: Web-First PWA Rebuild

**Domain:** React Native to web-first PWA migration (gamified educational app)
**Researched:** 2026-03-28

---

## Critical Pitfalls

Mistakes that cause rewrites, broken features, or significant rework.

### Pitfall 1: Importing RN-specific code into shared/

**What goes wrong:** A file in `shared/` imports `react-native`, `expo-*`, or `Platform` -- either directly or transitively. The web build fails at compile time or (worse) at runtime.

**Why it happens:** When extracting portable code, it is easy to miss transitive dependencies. For example, `badges.ts` imports `getLevel` from `store/types.ts` which imports `LEVEL_THRESHOLDS` from `constants.ts` -- that chain is clean. But if someone adds a utility import that pulls in a RN module, the entire chain breaks.

**Consequences:** Build failures in the web app. If the import is dynamic/conditional, it may pass build but crash at runtime.

**Prevention:**
- Lint rule: ban `react-native`, `expo-*`, `@react-navigation/*` imports in `shared/`
- TypeScript config for `shared/` should NOT include `react-native` types
- CI check: `grep -r "from 'react-native'" shared/` must return empty
- Every file in `shared/` must compile with `tsc --noEmit` using a web-only tsconfig

**Detection:** Build errors mentioning missing modules. Runtime errors referencing `Platform`, `StyleSheet`, `View`.

### Pitfall 2: Physical CSS properties breaking RTL

**What goes wrong:** Components use `margin-left`, `padding-right`, `text-align: left`, `left: 0`, `border-top-left-radius` instead of logical equivalents. Hebrew layout is broken -- text and elements don't flip.

**Why it happens:** Developer muscle memory. CSS tutorials default to physical properties. Copy-pasting from Stack Overflow or UI libraries brings physical properties in.

**Consequences:** Every Hebrew-speaking user sees a broken layout. Fixing after the fact means touching every component's styles.

**Prevention:**
- ESLint plugin: `eslint-plugin-no-physical-properties` or custom rule banning `left`, `right` in CSS/Tailwind
- Tailwind convention: use `ps-*`, `pe-*`, `ms-*`, `me-*` ONLY (never `pl-*`, `pr-*`, `ml-*`, `mr-*`)
- Code review checklist item: "Are all directional properties logical?"
- Test every component in RTL mode during development (set `document.dir = 'rtl'` in dev tools)

**Detection:** Visual inspection in Hebrew mode. Automated screenshot comparison (LTR vs RTL) in CI.

### Pitfall 3: Content loader incompatibility between Metro and Vite

**What goes wrong:** The existing `content/loader.ts` uses static `import lesson01 from './lessons/...'` with `as unknown as Lesson` casts -- a pattern required by Metro bundler's static analysis. Copying this file to the web project and expecting it to work with Vite's `import.meta.glob`.

**Why it happens:** Metro and Vite handle JSON imports differently. Metro needs explicit static imports for tree-shaking. Vite supports `import.meta.glob` for bulk imports.

**Consequences:** Either the web build fails (if using Metro patterns), or the content doesn't load (if `import.meta.glob` paths are wrong).

**Prevention:**
- Do NOT copy `loader.ts` to `shared/`. The loader is platform-specific.
- `shared/` contains the lesson JSON files and schema types only
- Each consumer implements its own loader: PromptPlay uses static imports (Metro), web uses `import.meta.glob` (Vite)
- Both loaders conform to the same interface: `loadLesson(id: string): Lesson` + `getAllLessonIds(): string[]`

**Detection:** Empty lesson screens. "Lesson not found" errors. Build warnings about unresolved imports.

### Pitfall 4: Zustand store hydration race condition

**What goes wrong:** Components render before Zustand's persist middleware has rehydrated state from localStorage. User sees default state (0 XP, no completed lessons) briefly, then state snaps to the real values.

**Why it happens:** `createJSONStorage(() => localStorage)` rehydration is synchronous on web (unlike async MMKV on native), but the React render cycle may start before the store is ready if the hydration callback fires late.

**Consequences:** Flash of empty state. Skill tree shows all lessons locked for a frame. XP counter shows 0 then jumps.

**Prevention:**
- Use the existing `_hasHydrated` / `useHasHydrated` pattern from the current store
- Gate the entire app render on `hasHydrated`:
  ```tsx
  function App() {
    const hasHydrated = useHasHydrated()
    if (!hasHydrated) return null // or loading spinner
    return <Router />
  }
  ```
- The existing codebase already does this correctly (line 46-49 of `_layout.tsx`). Port this pattern.

**Detection:** Flash of default state on page load. XP/streak values resetting momentarily.

---

## Moderate Pitfalls

### Pitfall 5: Tailwind class conflicts with RTL

**What goes wrong:** Using Tailwind's standard `pl-4` (padding-left) instead of `ps-4` (padding-inline-start). Or using `text-left` instead of `text-start`. Layout looks correct in English but broken in Hebrew.

**Prevention:**
- Project convention document: "Always use logical Tailwind classes"
- Mapping reference:
  - `pl-*` -> `ps-*`, `pr-*` -> `pe-*`
  - `ml-*` -> `ms-*`, `mr-*` -> `me-*`
  - `text-left` -> `text-start`, `text-right` -> `text-end`
  - `left-*` -> `start-*`, `right-*` -> `end-*`
  - `rounded-tl-*` -> `rounded-ss-*`, `rounded-tr-*` -> `rounded-se-*`
- Configure Tailwind to warn on physical utility usage if possible

### Pitfall 6: Missing accessibility in exercise components

**What goes wrong:** Exercise cards are mouse/touch-only. Keyboard users cannot Tab through options, press Enter to submit, or use Space to select. Screen readers cannot announce exercise prompts or feedback.

**Prevention:**
- Every interactive element must be a `<button>` or have `role="button"` + `tabIndex={0}` + `onKeyDown`
- MCQ options: use `role="radiogroup"` + `role="radio"` (existing code uses `accessibilityRole="radio"` -- port this)
- Feedback text: use `aria-live="polite"` for score/feedback announcements
- Focus management: after submission, move focus to feedback area

### Pitfall 7: LocalizedString content not using i18n for language selection

**What goes wrong:** Exercise components hardcode `exercise.prompt.en` or use a local `lang` variable instead of reading the current language from the i18n context. Language changes don't propagate to lesson content.

**Why it happens:** The existing RN code uses `const lang = i18n.language as 'en' | 'he'` locally in each component (see MCQCard line 16). This works but is fragile -- if the language changes mid-lesson, components won't re-render.

**Prevention:**
- Create a `useLocale` hook that returns the current language from i18next
- Create a `localize(str: LocalizedString): string` utility that reads the current language
- Use this consistently across all components that render `LocalizedString` content

### Pitfall 8: Service worker caching stale lesson content

**What goes wrong:** After a content update (new lessons or fixed exercises), the service worker serves cached old content. Users see outdated lessons until the cache expires or they manually clear it.

**Prevention:**
- Use `vite-plugin-pwa` with `registerType: 'autoUpdate'` -- automatically activates new service workers
- Lesson JSON is bundled into the JS (via `import.meta.glob`), so it updates with the app bundle -- no separate cache concern
- Add a visible "Update available" banner when a new service worker is detected (port the existing `useServiceWorker` hook)

### Pitfall 9: Path alias resolution in monorepo

**What goes wrong:** `@shared/` path alias works in VS Code but fails in Vite build, or works in build but fails in Vitest.

**Prevention:**
- Define aliases in THREE places: `tsconfig.json` (for VS Code), `vite.config.ts` (for build), and `vitest.config.ts` (for tests)
- Or use `vitest` config that extends `vite.config.ts` (Vitest inherits Vite aliases)
- Test the alias resolution in CI before writing extensive code

---

## Minor Pitfalls

### Pitfall 10: Missing web-specific meta tags

**What goes wrong:** The PWA doesn't show the correct theme color, status bar style, or app name on iOS Safari's "Add to Home Screen."

**Prevention:**
- Ensure `index.html` includes: `<meta name="theme-color">`, `<meta name="apple-mobile-web-app-capable">`, `<link rel="apple-touch-icon">`, `<meta name="viewport">` with `viewport-fit=cover`
- Test "Add to Home Screen" on a real iOS device

### Pitfall 11: localStorage quota exceeded

**What goes wrong:** XP history (`xpHistory: XPTransaction[]`) grows unbounded over time. After hundreds of lessons, the serialized store exceeds localStorage's 5MB limit.

**Prevention:**
- Cap `xpHistory` to the most recent 100 transactions in the store's persist config
- Or exclude `xpHistory` from persistence entirely (derive from other state if needed)
- Monitor serialized state size in development

### Pitfall 12: CSS animation performance on low-end devices

**What goes wrong:** Celebration animations (confetti, XP pop, level-up) cause frame drops on budget Android phones.

**Prevention:**
- Use CSS `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left` (trigger layout reflow)
- Use `will-change: transform` sparingly on animated elements
- Test on a throttled CPU (Chrome DevTools Performance panel)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Shared extraction (Phase 1) | RN imports leak into shared/ (Pitfall 1) | Lint + separate tsconfig |
| State + i18n (Phase 2) | Hydration race (Pitfall 4) | Hydration gate pattern |
| Content pipeline (Phase 3) | Loader incompatibility (Pitfall 3) | Platform-specific loaders |
| Exercise system (Phase 4) | RTL broken (Pitfall 2, 5) | Logical properties only |
| Exercise system (Phase 4) | Missing a11y (Pitfall 6) | Keyboard + ARIA from day one |
| Lesson flow (Phase 5) | LocalizedString not reactive (Pitfall 7) | useLocale hook |
| PWA polish (Phase 8) | Stale cache (Pitfall 8) | autoUpdate + update banner |

---

## Sources

- Direct codebase analysis of existing PromptPlay patterns
- [CSS logical properties MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values) -- HIGH confidence
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/reference/middlewares/persist) -- HIGH confidence
- [Vite import.meta.glob docs](https://vitejs.dev/guide/features.html#glob-import) -- HIGH confidence
- [RTL implementation in Tailwind + React](https://madrus4u.vercel.app/blog/rtl-implementation-guide) -- MEDIUM confidence
- [vite-plugin-pwa service worker strategies](https://vite-pwa-org.netlify.app/) -- MEDIUM confidence
