---
phase: 08-state-i18n-rtl
plan: 02
subsystem: i18n-rtl
tags: [i18next, react-i18next, rtl, css-logical-properties, useLanguage]

# Dependency graph
requires:
  - phase: 08-state-i18n-rtl
    plan: 01
    provides: Zustand progress store with language preference persistence
  - phase: 07-foundation-shared-extraction
    provides: shared EN/HE translation JSON files
provides:
  - i18next initialized with EN+HE translations from shared/
  - useLanguage hook with RTL direction switching
  - CSS logical property convention for all future components
  - LanguageSync component for persisted language restoration on load
affects: [09-lesson-engine, 10-exercise-components, 11-gamification-ui, 13-skill-tree]

# Tech tracking
tech-stack:
  added: [i18next, react-i18next, "@testing-library/react", "@testing-library/jest-dom"]
  patterns: [i18next-react-init, useLanguage-rtl-sync, language-sync-on-hydration, css-logical-properties]

key-files:
  created:
    - web/src/i18n/index.ts
    - web/src/i18n/i18n.test.ts
    - web/src/hooks/useLanguage.ts
    - web/src/hooks/useLanguage.test.ts
    - web/vitest.config.ts
  modified:
    - web/src/main.tsx
    - web/src/App.tsx
    - web/src/styles/globals.css
    - web/package.json
    - package-lock.json

key-decisions:
  - "Used i18next.use(initReactI18next) for seamless React integration via useTranslation hook"
  - "Browser language detection as initial default, overridden by persisted store value via LanguageSync"
  - "LanguageSync component rendered inside HydrationGate ensures persisted language is applied before content renders"
  - "CSS logical property convention documented in globals.css as enforced project standard"
  - "Dedicated vitest.config.ts for web/ with path aliases matching vite.config.ts"

patterns-established:
  - "i18n pattern: import '@/i18n' as side-effect in main.tsx before component imports"
  - "Language switching: useLanguage() hook syncs store + i18next + document.dir in one call"
  - "RTL convention: ONLY ps/pe/ms/me/start/end/text-start/text-end — never physical left/right"
  - "LanguageSync pattern: small component inside HydrationGate that applies persisted language on mount"

requirements-completed: [STATE-02, STATE-03]

# Metrics
duration: 4min
completed: 2026-03-28
---

# Phase 8 Plan 2: i18n + RTL with i18next Summary

**i18next with EN+HE from shared/ translations, useLanguage hook with instant RTL flip via document.dir, and CSS logical property convention for all Tailwind styling**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-28T20:00:26Z
- **Completed:** 2026-03-28T20:04:30Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- i18next initialized with EN+HE translations imported from shared/ JSON files via @shared alias
- useLanguage hook provides toggleLanguage/setLanguage with triple-sync: Zustand store + i18next.changeLanguage + document.documentElement.dir
- LanguageSync component in main.tsx restores persisted language preference on page load (inside HydrationGate, before content renders)
- App.tsx demonstrates useTranslation() for localized text and useLanguage() for language toggle
- CSS logical property convention established in globals.css (ps/pe/ms/me only, never pl/pr/ml/mr)
- Dedicated vitest.config.ts with path aliases (@, @shared) and jsdom environment
- 18 total tests passing: 9 store (Plan 01) + 4 i18n init + 5 useLanguage hook

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure i18next, useLanguage hook, and Vitest** - `dd6001d` (feat, TDD)
2. **Task 2: Wire i18n into app, language toggle, logical properties** - `73a1517` (feat)

## Files Created/Modified
- `web/src/i18n/index.ts` - i18next initialization with EN+HE from shared/, browser language detection, fallback to English
- `web/src/i18n/i18n.test.ts` - 4 tests: default language, EN translation, HE translation, fallback behavior
- `web/src/hooks/useLanguage.ts` - Hook returning currentLanguage, isRTL, toggleLanguage, setLanguage with RTL side-effect
- `web/src/hooks/useLanguage.test.ts` - 5 tests: currentLanguage, toggle RTL, toggle LTR, store+i18next sync, setLanguage
- `web/vitest.config.ts` - Dedicated vitest config with path aliases and jsdom environment
- `web/src/main.tsx` - Added i18n side-effect import, LanguageSync component inside HydrationGate
- `web/src/App.tsx` - Replaced static text with t() translations, added language toggle button, logical property demo
- `web/src/styles/globals.css` - Added CSS logical property convention comment block
- `web/package.json` - Added i18next, react-i18next, @testing-library/react, @testing-library/jest-dom
- `package-lock.json` - Updated with new dependencies

## Decisions Made
- i18next initialized via side-effect import in main.tsx (`import './i18n'`) before any component imports to ensure translations are ready
- Browser language detection (`navigator.language?.startsWith('he')`) used as initial default; overridden by persisted store value via LanguageSync on hydration
- LanguageSync is a separate component (not merged into HydrationGate) for clean separation of concerns
- CSS logical property convention is documented but not enforced via linting (Tailwind v4 logical utilities work automatically with dir="rtl")
- Dedicated vitest.config.ts created to separate test config from build config

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs
- `web/src/App.tsx` - Temporary demo UI with XP counter and language toggle (intentional -- will be replaced by real UI components in phases 9-13)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Any component can now call `useTranslation()` for localized text
- Any component can call `useLanguage()` to switch language with instant RTL flip
- CSS logical property convention established for all future Tailwind styling
- Test infrastructure (vitest + @testing-library/react + jsdom) ready for component testing

## Self-Check: PASSED

- All 8 key files verified present on disk
- Commit dd6001d (Task 1) verified in git log
- Commit 73a1517 (Task 2) verified in git log
- 18/18 tests passing, TypeScript clean, Vite build successful

---
*Phase: 08-state-i18n-rtl*
*Completed: 2026-03-28*
