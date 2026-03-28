# Phase 8: State + i18n + RTL - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Wire Zustand store with localStorage persistence in web/, integrate i18next with EN+HE translations from shared/, and implement RTL support via document.dir + CSS logical properties. After this phase, the web app persists user progress across sessions and can switch between English and Hebrew with instant RTL flip.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — infrastructure phase with established patterns from v1.0.

Key guidance from research:
- Zustand store uses the same UserProgress shape from shared/src/store/types.ts
- localStorage adapter replaces MMKV — simpler than v1 (no Platform.OS checks needed on web)
- i18next setup same as v1 but without expo-localization (use navigator.language for detection)
- RTL: set document.documentElement.dir = 'rtl' when Hebrew selected — CSS logical properties handle the rest
- No I18nManager (that's RN-specific) — no page reload needed for RTL switch on web
- Tailwind v4 has native logical property utilities (ps-*, pe-*, ms-*, me-*)

</decisions>

<code_context>
## Existing Code Insights

### Reusable from shared/
- shared/src/store/types.ts — UserProgress interface, getLevel(), XPTransaction
- shared/src/i18n/en/common.json — English translations
- shared/src/i18n/he/common.json — Hebrew translations
- shared/src/gamification/constants.ts — XP thresholds, level table

### Patterns from v1 to follow
- Zustand persist middleware with createJSONStorage
- partialize to exclude runtime-only fields
- onRehydrateStorage callback for hydration gating

### Integration Points
- web/src/ needs store provider or direct zustand usage
- All future UI components will use the store and i18n hooks

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
