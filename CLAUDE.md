# PromptPlay

Duolingo-style gamified mobile app teaching AI prompting skills.

## Stack

- **Framework**: Expo (React Native) + TypeScript
- **State**: Zustand + MMKV persistence
- **Backend**: Supabase (auth + cloud sync)
- **Content**: Bundled JSON files with `LocalizedString { en, he }` shape
- **Animations**: Reanimated + Lottie
- **i18n**: Custom `t('key')` with RTL via `I18nManager.forceRTL()`
- **Navigation**: Expo Router (tab-based)

## Architecture

- RTL-first: Use `paddingStart/End`, `marginStart/End` — never `paddingLeft/Right`
- Feature-sliced: lesson engine, exercise runner, gamification engine, skill tree, i18n, persistence
- Content as bundled JSON — no CMS, no API calls for lessons
- Exercise type registry pattern — map of type key to component + evaluator

## GSD Workflow

- Planning docs in `.planning/`
- Use `/gsd:progress` to check current state
- Use `/gsd:plan-phase N` to plan a phase
- Use `/gsd:execute-phase N` to execute a phase

## Conventions

- All UI components must support RTL from creation — no retrofitting
- Mixed Hebrew/English text requires explicit `<bdi>` or direction wrapping
- No guilt-based gamification mechanics (no punishment, no loss-framing)
- Simulated AI only — no live API calls in exercises
