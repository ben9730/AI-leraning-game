# Project Research Summary

**Project:** PromptPlay — Duolingo-style AI Literacy Learning App
**Domain:** Gamified mobile learning app (AI prompting skills)
**Researched:** 2026-03-28
**Confidence:** MEDIUM-HIGH

---

## Executive Summary

PromptPlay is a gamified skill-building app in an uncontested niche: there is no dominant "Duolingo for AI." The product teaches universal prompting principles through bite-sized lessons, simulated AI interactions, and Duolingo-style progression mechanics — with zero per-user API cost, since all AI responses are pre-scripted. Research confirms the technical approach is sound and the market timing is strong, but the product's success will ultimately hinge on content quality and first-session experience, not technical sophistication.

The recommended stack is Expo (React Native) + TypeScript, Zustand + MMKV for state, Supabase for auth and cloud progress sync, and bundled JSON for all lesson content. This combination delivers a PWA today and a native app store presence later without rewriting anything. The gamification system should follow the Duolingo model selectively: adopt streaks, XP, and lesson celebrations (proven high-ROI), but explicitly reject hearts/energy gates, guilt-based notifications, and leaderboards for v1. The curriculum spans 26 lessons across 5 chapters, fully specified and ready to author.

The two non-negotiable architectural decisions that must be made from line one: RTL support (Hebrew is a first-class layout requirement, not a translation layer) and the scoring rubric schema (all lesson content depends on it). Bolting either on later is a documented rewrite-class mistake. Build order should therefore start with i18n/RTL infrastructure and the content schema, before any UI or lesson content is written.

---

## Key Findings

### Recommended Stack

Expo (React Native) with TypeScript is the clear winner for a solo or small team building a mobile-first PWA that may go native later. It avoids the Dart learning tax of Flutter while providing native navigation feel, haptics, and an app store path that a pure PWA cannot offer. State is handled by Zustand (2KB, no boilerplate) persisted via MMKV (synchronous, 10-30x faster than AsyncStorage, eliminates hydration flicker). Supabase provides auth and progress cloud-sync on predictable $25/mo pricing with SQL that fits the relational lesson/progress data model better than Firebase's Firestore.

All lesson content ships as bundled JSON — zero CMS cost, fully offline, version-controlled alongside code. A CMS (Sanity) is a v2+ concern only when non-developer content editors exist. Animations use Reanimated (UI-thread, no JS bridge jank) for progress bars and micro-interactions, and Lottie for milestone celebrations (level-up, streak flame). i18next handles translations; React Native I18nManager handles RTL layout flipping.

**Core technologies:**
- **Expo SDK 52+ / React Native 0.76+**: App shell and UI rendering — fastest path to PWA + native from one codebase
- **TypeScript 5.x**: Language — prevents category of bugs in XP/streak/scoring logic
- **Zustand 4.x**: Global state (XP, streaks, progress) — zero boilerplate, hook-based, fine-grained updates
- **react-native-mmkv 2.x**: Persistent local storage — synchronous reads, no hydration flicker
- **Supabase**: Auth + cloud progress sync — SQL, predictable pricing, Row Level Security for user data
- **Bundled JSON**: All lesson content — offline, zero cost, version-controlled
- **react-native-reanimated**: Core animations — UI-thread, no jank
- **lottie-react-native**: Celebration animations — designer-friendly, free assets on LottieFiles
- **i18next + expo-localization**: i18n — battle-tested, works identically on RN and web
- **expo-router**: Navigation — file-based, Expo-native
- **expo-haptics**: Tap feedback — one-line integration

### Expected Features

**Must have (table stakes):**
- Daily streak tracking with flame icon — core Duolingo expectation; 7-day streak = 3.6x retention
- XP points per lesson and exercise — immediate reward signal
- Streak freeze — reduces churn 21% for at-risk users (Duolingo data)
- Progress bar within lessons ("Exercise 2 of 4") — users need location feedback
- Lesson completion celebration screen — dopamine signal; XP awarded display
- Skill tree / learning path map — users must see the full journey, with locked/unlocked states
- Level / tier system — sense of mastery beyond individual lessons
- Onboarding: goal setting → instant first lesson → deferred account creation
- Daily XP goal (5/10/15 min pace) — users 40% more likely to return when self-paced
- Lesson review / retry with best score tracking
- RTL layout for Hebrew — architecture-level requirement, not a skin

**Should have (differentiators):**
- Simulated AI response pane — user writes prompt, sees pre-scripted "AI" response; the core novel interaction
- Prompt quality scoring with rubric breakdown (Clarity, Specificity, Context, Intent) — with visible per-criterion feedback
- "What went wrong" feedback explaining WHY a prompt scored low
- Prompt comparison exercise (pick the stronger of two prompts)
- Prompt fix / debug exercise (improve a bad prompt)
- Before/after prompt examples showing output quality difference
- Tool-agnostic framing ("works in ChatGPT, Claude, Gemini") on every lesson
- 3-5 meaningful achievement badges (skill milestones, not participation trophies)
- Friendly mascot tone — non-judgmental, low-intimidation

**Defer (v2+):**
- Leaderboards / leagues — high implementation cost, needs social infra
- Gems / virtual currency — only useful when a store exists
- Multiple learning paths — validate one path first
- Lessons 21-26 (Chapter 5) — build after validating Chapters 1-4 completion rates
- Native app store submission — PWA first, native after validation
- CMS (Sanity) — only when non-developer editors need to author content

**Explicit anti-features (never build):**
- Hearts / energy gates — #1 Duolingo complaint, documented rage-quit trigger
- Guilt-based push notifications — "Your streak is about to die!" is a dark pattern
- Real AI API calls — hard constraint: zero marginal cost required
- AI-generated course content — Duolingo lost user trust doing this; hand-craft every lesson

### Exercise Mix for V1

The lesson engine must support these exercise types (in recommended v1 priority order):
1. Multiple choice — concept questions (low build cost, 40% of exercises)
2. Pick the better prompt — two-panel compare (low build cost, high learning value)
3. Rewrite the bad prompt — free text + rubric scoring (medium build cost)
4. Simulated AI chat — write prompt, see pre-scripted response, get scored (medium; core differentiator)
5. Fill-in-the-blank — complete a partial prompt (low build cost)
6. Spot the problem — identify what's wrong with a prompt (low build cost)

Defer: drag-and-drop prompt builder (medium-high build cost for marginal value in v1).

**Scoring approach:** Start with Approach B (binary checklist: did you include a role? a goal? a format?) for Lessons 1-5 to reduce beginner anxiety. Graduate to Approach A (weighted keyword rubric with partial scores) from Lesson 6 onward.

### Architecture Approach

The architecture follows a Feature-Sliced + Layered Hybrid pattern: each domain (lesson engine, exercise runner, gamification, skill tree, i18n) owns its slice of logic, state, and UI components. Data flows in one direction — UI dispatches events to engines, engines update the Zustand store, the store persists via MMKV/AsyncStorage. The UI never writes to the store directly.

The Exercise Runner uses a type registry pattern: a record mapping exercise type keys to React components. Adding a new exercise type requires creating one component and registering it — zero changes to the runner itself. Evaluators are pure functions (testable in isolation), one per exercise type.

Content architecture: all lesson JSON is bundled with the app. Lesson body text lives in `LocalizedString` objects (`{ en: "...", he: "..." }`) inside each lesson JSON file. UI chrome (button labels, error messages, XP text) lives in separate i18n files. This separation keeps content structure clean for RTL.

**Major components:**
1. **Lesson Engine** — loads lesson by ID, sequences content + exercises, tracks completion, fires events to Gamification Engine
2. **Exercise Runner + Evaluator** — renders correct exercise component by type; evaluator scores against rubric, returns `{ score, passed, feedback, breakdown }`
3. **Gamification Engine** — receives lesson/exercise completion events; calculates XP (base + streak multiplier + perfection bonus), updates streak, checks level-up, computes lesson unlocks
4. **User Progress Store (Zustand)** — single source of truth for XP, streak, completed lessons, language preference; persisted via MMKV
5. **Skill Tree View** — renders the lesson map using progress store; locked/unlocked/complete states; handles lesson navigation
6. **i18n Manager** — provides `t('key')` translations, detects/sets locale, applies RTL flag via `I18nManager.forceRTL()` + `Updates.reloadAsync()`
7. **Persistence Layer** — abstract `PersistenceAdapter` interface wrapping MMKV (RN) / IndexedDB (PWA); Supabase sync on top for cloud backup
8. **Content Renderer** — displays lesson markdown, RTL-aware text direction, handles mixed Hebrew/English inline content

**Key state rule:** `currentLevel` is derived from `xpTotal` on every read — never stored. Avoids desync bugs and makes level formula changes trivial.

### Critical Pitfalls

1. **RTL bolted on after launch** — Use `marginStart/marginEnd` and `paddingStart/paddingEnd` exclusively from day one. Never use directional properties (`left`, `right`, `margin-left`). Test every screen in Hebrew locale on a physical device as it is built, not as a final QA pass. RTL on React Native has known iOS/Android rendering differences that only appear on device.

2. **First-session value failure ("Tutorial Island")** — User must be in an interactive exercise within 60 seconds of opening the app. The first exercise must produce a visible "aha" moment (write a prompt → see before/after AI response → feel capable). Defer account creation until after Lesson 1 completes. Duolingo's biggest single retention lift came from removing the signup wall before the first lesson.

3. **Opaque or unfair scoring** — Score on structural dimensions (did the prompt include a role? a format? a goal?), not word matching. Always show the per-criterion breakdown immediately. Always display the model prompt after submission — not as "the right answer" but as "one strong version." Give partial credit generously. Never mark a response wrong without a specific, actionable explanation.

4. **Over-gamification (feels manipulative)** — No guilt-based notifications. No loss-framing. Separate intrinsic rewards (skill tree progress, new lesson unlocked) from extrinsic (XP, badges) — intrinsic must be the primary driver. Badges earned for skill milestones only. Reserve celebration animations for lesson completion, level-up, and streak milestones — not every exercise tap.

5. **Shallow content that teaches nothing** — Every lesson must have one explicitly stated transferable insight: "Next time you use ChatGPT, do X." Exercises must require active production (writing a prompt), not passive recognition only. Resist cutting content to hit a length target. The curriculum research has specified the Day 0 user state: "has tried AI once or twice, got unhelpful responses, does not know why" — write to that person.

**Additional risks to flag:**
- **iOS PWA limitations** — 50MB cache limit, 7-day cache eviction, no automatic install prompt. Design for these constraints from the start.
- **AI curriculum drift** — Tool UIs change every 3-6 months. Enforce the tool-agnostic rule strictly: teach principles ("give the AI a role"), never tool mechanics ("click Settings > Customize ChatGPT"). Schedule quarterly content audits post-launch.
- **Hebrew translation quality** — Build and maintain an AI-term glossary (translate vs. transliterate decisions) before authoring any Hebrew content. Machine translation is insufficient for instructional text.

---

## Implications for Roadmap

### Phase 1: Foundation — Infrastructure + Schema

**Rationale:** RTL and the content schema are the two decisions that, if deferred, require rewriting everything that comes after. Both must be established before any UI or content work begins. STACK.md and ARCHITECTURE.md both independently flag this ordering.

**Delivers:**
- Expo project scaffolded with TypeScript, expo-router, i18next, I18nManager, RTL conventions enforced
- Zustand store + MMKV persistence wired up with the `UserProgress` state shape defined
- Lesson JSON schema (TypeScript interfaces: `Lesson`, `Exercise`, `MCQExercise`, `FreeTextExercise`, `PromptRubric`, `LocalizedString`) finalized
- Supabase project created: schema for `users`, `lesson_progress`, `exercise_attempts` with RLS policies
- One "hello world" lesson JSON proving the schema works end-to-end

**Avoids:** RTL bolted on late (Pitfall 1), state management complexity from undefined data model (Pitfall 9)

**Research flag:** RTL testing automation in Expo is unresolved — needs investigation during this phase.

---

### Phase 2: Lesson Engine + Core Exercise Types

**Rationale:** The lesson loop is the product's core mechanic. Everything else (gamification, skill tree, onboarding) is a wrapper around it. Validate the engine with 2-3 exercise types before building the full curriculum or gamification layer.

**Delivers:**
- Lesson Engine: loads lesson JSON, sequences intro → exercises → completion
- Exercise Runner with type registry pattern
- Exercise types: multiple choice (MCQ), pick-the-better-prompt, rewrite-the-bad-prompt (free-text + Approach B checklist scoring)
- Exercise Evaluator: pure function per type, returns `{ score, passed, feedback, breakdown }`
- Content Renderer: displays lesson markdown, RTL-aware
- 5 fully authored lessons (Chapter 1: Lessons 1-4, plus Lesson 5) — enough to test the engine end-to-end

**Avoids:** Tutorial Island (Pitfall 3) — Lesson 1 designed as a 60-second "aha" demo

**Research flag:** Free-text rubric keyword design needs hands-on tuning against real user inputs — plan a small usability test after this phase.

---

### Phase 3: Gamification Engine

**Rationale:** Gamification depends on a working lesson engine (needs completion events to fire XP). Building it after Phase 2 means the engine is already tested. XP + streaks + streak freeze are the three highest-ROI gamification mechanics and should ship together.

**Delivers:**
- Gamification Engine: XP calculation (base + streak multiplier + perfection bonus), streak tracking, level-up detection, lesson unlock computation
- XP awarded screen with Lottie celebration animation
- Streak display (flame + day count), streak freeze mechanic
- Level / tier system with level-up full-screen celebration
- Daily XP goal setting (5/10/15 min pace)
- 3-5 achievement badges (skill milestones only)
- expo-haptics wired to correct-answer feedback

**Avoids:** Over-gamification dark patterns (Pitfall 2) — no guilt notifications, no loss-framing; reward milestones not participation

**Standard patterns:** XP and streak logic are well-documented; no phase research needed. Animation implementation with Reanimated + Lottie is well-documented.

---

### Phase 4: Skill Tree + Onboarding

**Rationale:** Skill tree requires progress data (Phase 3) and lesson metadata (Phase 2) to render meaningfully. Onboarding requires the first lesson to be polished (Phase 2). Both are retention-critical but depend on prior phases.

**Delivers:**
- Skill Tree View: renders all 26 lesson nodes with locked/unlocked/complete states; chapter groupings
- Lesson navigation from skill tree to lesson engine
- Onboarding flow: goal setting (30 sec) → instant Lesson 1 (no signup wall) → account creation prompt after Lesson 1 completion → opt-in streak reminder
- Supabase auth: email/password + Google OAuth

**Avoids:** Tutorial Island (Pitfall 3) — deferred signup is the proven retention pattern

**Research flag:** Supabase RLS policy design for lesson progress needs careful review during this phase.

---

### Phase 5: Full Curriculum — Chapters 1-4 (Lessons 1-20)

**Rationale:** With a proven engine and gamification layer, author the full v1 curriculum. Chapters 1-4 (20 lessons) are the validation target. Chapter 5 (Lessons 21-26) is deferred until Chapter 1-4 completion rates are measured.

**Delivers:**
- All 20 lessons (Chapters 1-4) fully authored in EN + HE
- Simulated AI chat exercise type implemented (the core differentiator)
- Scoring graduated to Approach A (weighted rubric) from Lesson 6
- Hebrew content reviewed by a native speaker; AI-term glossary maintained
- All lessons tested in RTL on a physical Hebrew-locale device

**Avoids:** Shallow content (Pitfall 4), wrong difficulty curve (Pitfall 5), translation quality issues (Pitfall 11), AI curriculum drift (Pitfall 10)

**Research flag:** Hebrew content authoring workflow (native review process) needs to be defined before this phase begins.

---

### Phase 6: PWA Polish + Notifications

**Rationale:** Engagement hooks (push notifications, streak reminders) and PWA hardening are a retention layer, not a core loop component. They belong after the core loop is validated.

**Delivers:**
- Push notifications: opt-in streak reminder at user's preferred time, midnight warning before streak expires (friendly tone, no guilt-framing)
- PWA service worker (Workbox): CacheFirst for app shell + lesson JSON, StaleWhileRevalidate for images
- Explicit iOS install-to-home-screen prompt in UI
- Storage optimized to stay under iOS 50MB PWA cache limit
- Low-end Android animation performance audit (test on 2GB RAM device)

**Avoids:** iOS PWA limitations discovered late (Pitfall 8), animation performance on low-end Android (Pitfall 14), reward fatigue from celebration overload (Pitfall 13)

**Research flag:** iOS push notification registration flow (iOS 16.4+) differs from Android — needs device testing during this phase.

---

### Phase Ordering Rationale

- **Schema before content:** The lesson JSON schema defines the data contract for the entire content pipeline. Changing the schema after 20 lessons are authored is a painful rewrite.
- **Engine before gamification:** Gamification emits events from lesson completion — the engine must exist first. Building them simultaneously leads to tight coupling and harder debugging.
- **Gamification before skill tree:** The skill tree renders unlock states computed by the gamification engine. Reversed order means mocking data that already exists.
- **Core loop before onboarding:** Onboarding sends users into Lesson 1. Lesson 1 must be polished before optimizing the path to it.
- **Full curriculum after engine validation:** Writing 26 lessons before the exercise types are proven is wasted work if rubric design needs changing.
- **PWA hardening last:** Offline and notification infrastructure does not affect core loop development and is easier to add after content is stable.

### Research Flags

Phases needing deeper research during planning:
- **Phase 1:** RTL testing automation in Expo — how to catch RTL regressions in CI
- **Phase 1:** MMKV + Expo Go conflict — decide: use AsyncStorage during dev and switch to MMKV for production builds, or use dev builds from day one
- **Phase 4:** Supabase RLS policy design for lesson progress — row-level security for multi-table progress data needs careful schema design
- **Phase 5:** Hebrew content authoring workflow — define native review process and AI-term glossary before writing any Hebrew lessons
- **Phase 6:** iOS push notification registration — differs from Android, requires physical device testing

Phases with standard patterns (skip research-phase):
- **Phase 2:** Lesson engine + exercise registry — well-documented React Native patterns
- **Phase 3:** XP/streak/level logic — custom Zustand store logic, no library needed, straightforward implementation
- **Phase 3:** Reanimated + Lottie animations — official Expo docs are thorough
- **Phase 6:** Workbox PWA service worker — well-documented, standard cache strategies apply

---

## Content Structure

### Curriculum: 26 Lessons, 5 Chapters

| Chapter | Lessons | Theme | Exercise Focus |
|---------|---------|-------|----------------|
| 1: What Is AI? | 1-4 | Foundation concepts, build comfort | Concept MC, output matching, spot-the-problem |
| 2: Building Blocks | 5-9 | Clarity, Specificity, Context, Intent (one per lesson) | Rewrite bad prompt, fill-in-the-blank, simulated AI chat |
| 3: Everyday Tasks | 10-14 | Apply principles to real scenarios | Simulated AI chat, prompt comparison |
| 4: Leveling Up | 15-20 | Iteration, roles, constraints, few-shot, chain-of-thought | Multi-turn chat, prompt builder, concept MC |
| 5: Real-World Mastery | 21-26 | Advanced scenarios + capstone | Free-text challenges (deferred to post-validation) |

**Lesson format:** 30-sec intro text → 2-3 exercises → completion screen with XP award.

**Exercise mix target:** 40% multiple choice, 30% rewrite/fix exercises, 30% simulated AI interaction. Avoid over-indexing on free-text in early lessons — harder to score, can frustrate beginners before they have the rubric internalized.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official docs cross-checked, multiple 2025 sources, production usage confirmed for all core libraries |
| Features | HIGH (gamification), MEDIUM (scoring) | Duolingo mechanics well-documented with retention data; simulated prompt scoring approach is novel, needs real-user validation |
| Architecture | MEDIUM-HIGH | Component patterns are well-established; RTL edge cases and offline sync strategy have known unknowns |
| Pitfalls | HIGH | Backed by peer-reviewed research (arXiv), Duolingo post-mortems, and documented PWA platform constraints |
| Curriculum | MEDIUM | Lesson structure is well-reasoned but unvalidated; difficulty curve and scoring rubric need user testing |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Prompt scoring rubric accuracy:** Keyword/pattern matching will miss synonym variation. Plan a rubric tuning session after 10-20 real users attempt free-text exercises. Consider whether passing thresholds are too strict or too lenient.
- **Hebrew content quality:** No Hebrew-native review process is defined. Must be established before Phase 5 begins — this is a first-class product quality concern, not a translation afterthought.
- **MMKV + Expo Go dev workflow:** During Phase 1, decide whether to use Expo Go with AsyncStorage as a dev substitute (and switch to MMKV in production builds) or require development builds from day one. Either choice has tradeoffs; pick one and document it.
- **iOS PWA install UX:** No "Add to Home Screen" automatic prompt on iOS. A custom in-app install nudge must be designed. No validated design pattern exists — needs UX iteration.
- **Chapter 5 gating:** Decide whether to show Chapter 5 lessons as locked placeholders from day one or hide them until Chapter 4 completion rates are measured. Affects skill tree UI design in Phase 4.
- **Lottie asset licensing:** LottieFiles free tier licenses need review before shipping. Some animations require attribution or have commercial restrictions.

---

## Sources

### Primary (HIGH confidence)
- [React Native Official Docs](https://reactnative.dev/architecture/overview) — Architecture, I18nManager, RTL
- [Expo Official Docs](https://docs.expo.dev/develop/user-interface/animation/) — Animation, EAS Build, Haptics
- [React Native Reanimated Official Docs](https://docs.swmansion.com/react-native-reanimated/) — Animation performance, worklets
- [When Gamification Spoils Your Learning — arXiv](https://arxiv.org/pdf/2203.16175) — Peer-reviewed; over-gamification pitfall

### Secondary (MEDIUM confidence)
- [How Duolingo Reignited User Growth — Lenny's Newsletter](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth) — Onboarding, streak retention data
- [Duolingo Gamification Case Study — Trophy](https://trophy.so/blog/duolingo-gamification-case-study) — XP, streak, freeze mechanics and retention stats
- [Supabase vs Firebase — Bytebase](https://www.bytebase.com/blog/supabase-vs-firebase/) — Backend stack decision
- [Expo Offline-First with MMKV + Zustand — Medium](https://medium.com/@nithinpatelmlm/expo-react-native-easy-offline-first-setup-in-expo-using-mmkv-and-zustand-react-native-mmkv-and-68f662c6bc3f) — State persistence pattern
- [PWA iOS Limitations 2026 — MagicBell](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide) — iOS PWA pitfall
- [Right to Left in React — LeanCode](https://leancode.co/blog/right-to-left-in-react) — RTL implementation patterns

### Tertiary (MEDIUM-LOW confidence)
- [Duolingo's Shallow Learning Trap — DEV Community](https://dev.to/yaptech/duolingos-shallow-learning-trap-gamified-streaks-harmful-habits-4134) — Content depth pitfall (opinion piece, corroborated by arXiv)
- [Gamified Mobile Experiences with RN 2025 — Medium](https://medium.com/@TheblogStacker/building-gamified-mobile-experiences-with-react-native-in-2025-a1f5371685f4) — General patterns
- [Learn Prompting — learnprompting.org](https://learnprompting.org/) — Curriculum topic reference

---

*Research completed: 2026-03-28*
*Ready for roadmap: yes*
