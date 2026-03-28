---
phase: 01-foundation
plan: 01
subsystem: ui
tags: [expo, react-native, typescript, expo-router, i18next, rtl, i18n, zustand, mmkv]

requires: []
provides:
  - Expo project scaffold with TypeScript and expo-router tab navigation
  - Three-tab navigation: Home, Skill Tree, Profile
  - i18next initialized with EN and HE translations (common namespace)
  - setLanguage() function with I18nManager.forceRTL and Updates.reloadAsync
  - isRTL() helper based on i18n.language
  - RTL-safe styles throughout (paddingStart/End, marginStart/End only)
  - jest + ts-jest test infrastructure with @/ alias
affects: [02-content-schema, 03-gamification, 04-lesson-engine, 05-exercises, 06-polish]

tech-stack:
  added:
    - expo (React Native framework with expo-router)
    - typescript (strict mode)
    - i18next + react-i18next (translations)
    - expo-localization (device locale detection)
    - expo-updates (reload for RTL flip)
    - expo-dev-client (native dev builds)
    - react-native-mmkv (persistence — wired in 01-02)
    - zustand (state management — wired in 01-02)
    - jest + ts-jest + @testing-library/react-native (test framework)
  patterns:
    - RTL-first: all layout styles use paddingStart/End, marginStart/End
    - i18n side-effect import in root layout before any render
    - setLanguage triggers full app reload for RTL layout flip
    - isRTL() reads i18n.language, never I18nManager.isRTL (known expo bug)

key-files:
  created:
    - PromptPlay/app/(tabs)/_layout.tsx
    - PromptPlay/app/(tabs)/index.tsx
    - PromptPlay/app/(tabs)/skill-tree.tsx
    - PromptPlay/app/(tabs)/profile.tsx
    - PromptPlay/src/i18n/index.ts
    - PromptPlay/src/i18n/en/common.json
    - PromptPlay/src/i18n/he/common.json
    - PromptPlay/jest.config.js
  modified:
    - PromptPlay/app/_layout.tsx

key-decisions:
  - "Use --legacy-peer-deps for @testing-library/react-native due to peer dep conflict with current Expo version"
  - "Do not check I18nManager.isRTL — use i18n.language === 'he' instead (expo/expo#34225 bug)"
  - "setLanguage calls Updates.reloadAsync() for RTL flip — full reload required for I18nManager to take effect"
  - "Device locale detection via Localization.getLocales()[0]?.languageCode for initial language; MMKV persistence deferred to 01-02"

patterns-established:
  - "RTL-first: paddingStart/End and marginStart/End everywhere — never paddingLeft/Right or marginLeft/Right"
  - "i18n side-effect import at top of app/_layout.tsx ensures i18next initialized before first render"
  - "Language toggle lives in Profile tab and calls setLanguage() directly"

requirements-completed: [FOUND-01, FOUND-03, FOUND-04, FOUND-06]

duration: 25min
completed: 2026-03-28
---

# Phase 01 Plan 01: Foundation Scaffold Summary

**Expo app with TypeScript, three-tab expo-router navigation, i18next EN/HE translations, and I18nManager RTL wiring with full-reload language switching**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-28T13:06:38Z
- **Completed:** 2026-03-28T13:31:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Scaffolded Expo project with tabs template, installed all Phase 1 dependencies in one batch
- Three-tab navigation (Home, Skill Tree, Profile) with i18n-ready titles via useTranslation hook
- i18next initialized with EN and HE translations; setLanguage exports handle RTL flip + app reload
- All layout styles RTL-safe from line one: zero instances of paddingLeft/Right or marginLeft/Right
- jest + ts-jest test framework configured with @/ path alias

## Task Commits

1. **Task 1: Scaffold Expo project with TypeScript and tab navigation** - `1e33a52` (feat)
2. **Task 2: Wire i18next with EN/HE translations and RTL language switching** - `6d1e5cc` (feat)

## Files Created/Modified

- `PromptPlay/app/_layout.tsx` - Root layout with i18n side-effect import
- `PromptPlay/app/(tabs)/_layout.tsx` - Tab navigator with 3 screens, i18n titles
- `PromptPlay/app/(tabs)/index.tsx` - Home screen with t('home.title')
- `PromptPlay/app/(tabs)/skill-tree.tsx` - Skill Tree screen with t('skillTree.title')
- `PromptPlay/app/(tabs)/profile.tsx` - Profile screen with language toggle Pressable
- `PromptPlay/src/i18n/index.ts` - i18next init, setLanguage, isRTL exports
- `PromptPlay/src/i18n/en/common.json` - English translations (tabs, home, skillTree, profile, common, language)
- `PromptPlay/src/i18n/he/common.json` - Hebrew translations
- `PromptPlay/jest.config.js` - jest config with ts-jest preset and @/ alias

## Decisions Made

- Used `--legacy-peer-deps` for `@testing-library/react-native` due to peer dependency conflict with current Expo canary version
- `isRTL()` reads `i18n.language === 'he'` rather than `I18nManager.isRTL` to avoid the known Expo bug (expo/expo#34225)
- MMKV language persistence deferred to plan 01-02; initial language detection uses `expo-localization`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used --legacy-peer-deps for test framework install**
- **Found during:** Task 1 (dependency installation)
- **Issue:** `@testing-library/react-native` had a peer dependency conflict with Expo 55 canary version
- **Fix:** Ran install with `--legacy-peer-deps` flag to resolve conflict
- **Files modified:** package.json, package-lock.json
- **Verification:** All packages installed successfully, jest runs with exit 0
- **Committed in:** 1e33a52 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to unblock test framework installation. No functional impact.

## Issues Encountered

- `create-expo-app` scaffolded a git repo inside `PromptPlay/` subdirectory — committed task files to that inner repo as intended since the outer repo is the planning workspace.

## User Setup Required

None - no external service configuration required for this plan.

## Next Phase Readiness

- Expo project scaffold is ready for plan 01-02 (MMKV persistence and Zustand store wiring)
- i18n infrastructure in place — all subsequent plans can use `t('key')` immediately
- RTL foundation established — no retrofitting needed in future phases
- `npx expo prebuild` not yet run (skipped — not needed until native module usage in 01-02)

---
*Phase: 01-foundation*
*Completed: 2026-03-28*
