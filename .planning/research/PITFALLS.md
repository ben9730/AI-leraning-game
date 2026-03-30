# Domain Pitfalls: Code & Automation Chapter + Practice Sandbox

**Domain:** Adding new chapter + freeform sandbox mode to existing gamified AI prompting app (v2.1)
**Researched:** 2026-03-30
**Milestone:** v2.1 — Chapter 5: AI for Code & Automation + Practice Sandbox

---

## Critical Pitfalls

Mistakes that cause rewrites, broken features, or significant rework.

### Pitfall 1: Code Blocks Rendered as RTL — Bidi Corruption

**What goes wrong:** Code snippets displayed inside lesson exercises or sandbox responses inherit the Hebrew `dir="rtl"` context from the parent layout. Variable names, function calls, and punctuation reverse direction or reorder visually. A line like `console.log("hello")` becomes `)"olleh"(gol.elosnoc`.

**Why it happens:** When `I18nManager` or the root `<html dir="rtl">` attribute is active, all child text nodes inherit the direction unless explicitly overridden. Code is always LTR regardless of UI language — browser bidi algorithm does not protect inline code in RTL containers without an explicit directive.

**Consequences:** Every code-teaching lesson is unreadable in Hebrew mode. Discovered late if Hebrew testing is skipped during development. Full component rewrite required if the pattern is baked into many exercise types.

**Prevention:**
- Every `<code>`, `<pre>`, or syntax highlighter wrapper MUST have `dir="ltr"` and `unicode-bidi: isolate` applied unconditionally — not conditionally on current language.
- Tailwind: add a `code-block` component class that includes `direction: ltr` and `text-align: left` (these are the two physical properties that are acceptable to use here, because code direction is intrinsically LTR).
- Create a shared `<CodeBlock>` component that enforces this; never render raw `<pre>` or syntax highlighter directly in exercise JSX.
- Test every new exercise type in Hebrew mode before marking it done.

**Detection:** Switch UI to Hebrew, open any code lesson. If any code block shows reversed or garbled characters, the pitfall has hit.

---

### Pitfall 2: New Exercise Types Not Registered — Silent Render Failures

**What goes wrong:** A new exercise type (e.g., `code-fix`, `code-complete`, `sandbox-prompt`) is defined in the JSON content but not added to the exercise registry. The exercise runner either silently skips the exercise, renders nothing, or throws a runtime error depending on how the registry handles unknown keys.

**Why it happens:** The exercise registry is a map of type key → component + evaluator. Adding a new exercise type requires updating the registry, defining a React component, and defining a scoring evaluator. These are three separate files across the monorepo. It is easy to add the JSON content and forget one of the three.

**Consequences:** Lessons appear to work in development (exercises with known types render fine) but silently fail on the new type. QA catches it only if new exercise types are explicitly tested.

**Prevention:**
- Add TypeScript discriminated union for `ExerciseType` — adding a new variant forces a compile error wherever the type is switched/matched without the new case.
- Exercise registry should use `satisfies Record<ExerciseType, ...>` so TypeScript enforces completeness.
- Add a dev-mode assertion: `if (!registry[exercise.type]) throw new Error(\`Unregistered exercise type: \${exercise.type}\`)`.
- Phase checklist: new exercise type requires (1) JSON schema entry, (2) registry entry, (3) React component, (4) evaluator, (5) Hebrew content.

**Detection:** Open a lesson containing the new type in dev. If the exercise area is blank or throws, the registry is incomplete.

**Phase:** Content pipeline extension, Exercise system.

---

### Pitfall 3: Practice Sandbox State Bleeds into Lesson Progress

**What goes wrong:** The sandbox is a new "mode" that allows freeform prompting. If sandbox session state (current scenario, prompt history, response history) is stored in the same Zustand slice as lesson progress, partial sandbox data can interfere with lesson completion tracking or cause the XP/streak system to award points incorrectly.

**Why it happens:** Zustand stores encourage flat state by default. Adding sandbox fields to the existing `progress` or `lesson` slice is the path of least resistance but creates coupling. If the sandbox can award XP or update streaks independently, the gamification engine may double-count or trigger completion flows unexpectedly.

**Consequences:** XP awarded twice. Streaks incremented during sandbox play. Lesson completion state corrupted if sandbox session IDs collide with lesson IDs.

**Prevention:**
- Create a dedicated `sandboxStore` (or `sandboxSlice`) isolated from `progressStore`. No shared mutable fields.
- Sandbox XP awards (if any) must go through the same `awardXP(source: 'sandbox' | 'lesson', ...)` action with explicit source tagging.
- Sandbox session state is transient — do NOT persist it to localStorage (only persist high scores or template selections if needed).
- Define clear boundary: the sandbox does not call `completeLesson()`, `incrementStreak()`, or any lesson-scoped action directly.

**Detection:** Complete a sandbox session and inspect Zustand devtools. Lesson progress should be unchanged. XP delta should match only intentional sandbox rewards.

**Phase:** Sandbox mode implementation.

---

### Pitfall 4: Simulated AI Responses for Code Lessons Break the "No Live API" Constraint

**What goes wrong:** Code lessons require AI responses that look like real code output — syntax-correct, runnable-looking Python/Bash/JS snippets. The temptation is to add a toggle or escape hatch that "just calls the real API for a better demo." This is a hard architectural boundary: once the first live API call lands, cost control and consistency guarantees collapse.

**Why it happens:** Pre-scripted code responses are harder to write convincingly than text responses. Code has correctness properties that text lacks. Content authors feel pressure to produce "real" output and reach for live API calls as a shortcut.

**Consequences:** Unpredictable costs. Loss of offline capability. Inconsistent exercise scoring (model output varies between users). PWA offline support broken for code lessons.

**Prevention:**
- All code lesson responses are authored in content JSON as `preScriptedResponse` fields — no exceptions.
- The `SimulatedChatCard` component MUST NOT accept a real API endpoint prop, ever.
- Content review process: every code lesson script is reviewed for plausibility before merge. A simulated `python` response with a syntax error is fine and teachable; it does not need to be "real."
- Architecture doc should explicitly state the boundary: "No component in `web/` or `shared/` makes fetch calls to external AI APIs."

**Detection:** Code search: `grep -r "openai\|anthropic\|api.openai\|generativelanguage" src/` must return empty.

**Phase:** All phases — ongoing constraint.

---

## Moderate Pitfalls

### Pitfall 5: Content Schema Drift Between Chapter 5 and Chapters 1–4

**What goes wrong:** Code lessons need new content fields not present in existing lessons: `codeLanguage`, `starterCode`, `expectedOutputPattern`, `sandboxTemplateId`. If these are added directly to existing lesson/exercise JSON types without making them optional, all 20 existing lessons fail TypeScript validation.

**Prevention:**
- New fields on shared content types MUST be optional (`?`) unless they apply to all existing content.
- Or: use discriminated union per chapter type (`CodeLesson extends BaseLesson`).
- Run `tsc --noEmit` on all existing lesson JSON after any schema change. Add this to CI.
- Add a content validation script that runs all lesson files through the schema before merge.

**Phase:** Content pipeline extension (first phase of v2.1).

---

### Pitfall 6: Syntax Highlighter Bundle Size — Unguarded Language Imports

**What goes wrong:** Libraries like `react-syntax-highlighter` ship ALL language grammars by default — the full Prism bundle is ~900KB. Importing naively pulls every language (Bash, Python, JavaScript, SQL, Ruby, etc.) into the web bundle, bloating the app by 500KB+.

**Prevention:**
- Import from the light build: `import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter/dist/esm/prism-light'`
- Register only the languages actually used in Chapter 5 content (likely: `python`, `bash`, `javascript`).
- Verify bundle impact with `vite-bundle-analyzer` or `rollup-plugin-visualizer` after adding the library.
- Consider `highlight.js` light build as alternative — similar API, similar selective import pattern.

**Phase:** Exercise system / code lesson components.

---

### Pitfall 7: Sandbox "Free Mode" Breaks Exercise Evaluator Assumptions

**What goes wrong:** Existing exercise evaluators expect a structured exercise object with `correctAnswer`, `rubric`, or `expectedKeywords` fields. The sandbox is freeform — there is no "correct" answer. If sandbox responses are piped through the existing evaluator pipeline, the evaluator either throws, returns 0%, or gives meaningless scores.

**Prevention:**
- Sandbox mode has its own response handler, not the lesson evaluator pipeline.
- Define a `SandboxEvaluator` type that accepts any prompt and returns qualitative feedback (not a percentage score).
- Feedback in sandbox mode is observational ("Your prompt includes specific context — good.") not scored.
- Never call `evaluateExercise(type, answer, exercise)` from sandbox components.

**Phase:** Sandbox mode implementation.

---

### Pitfall 8: Hebrew Content for Code Lessons — Mixed Direction in Instructions

**What goes wrong:** A lesson instruction might read: "כתוב פרומפט שמבקש מ-AI לכתוב פונקציה ב-Python" (Write a prompt asking AI to write a function in Python). The word "Python" and code terms are LTR embedded in RTL text. Without `<bdi>` wrapping or `unicode-bidi: isolate`, the bidi algorithm may misplace punctuation or scramble the technical terms.

**Prevention:**
- All Hebrew lesson `LocalizedString.he` fields containing code language names, technical terms, or inline code MUST wrap those terms in `<bdi>` tags in the JSON.
- Content authoring guide: "Any code term, language name, or variable name in Hebrew text gets `<bdi>` wrapping."
- The `t()` i18n render function must support rendering HTML (use `dangerouslySetInnerHTML` with sanitization, or a dedicated `<LocalizedRichText>` component).
- Test every Hebrew lesson instruction that contains technical terms.

**Phase:** Content authoring (Chapter 5 lessons).

---

### Pitfall 9: Skill Tree Node Not Added for New Lessons

**What goes wrong:** Chapter 5 lessons are added to the lesson JSON and content pipeline, but the skill tree visualization is not updated with the 5 new nodes. The chapter exists in data but is invisible in the UI progression map. Or: nodes are added but the chapter grouping logic doesn't include chapter 5, so nodes appear orphaned or in the wrong position.

**Prevention:**
- Skill tree node data is generated from or in sync with lesson metadata — verify whether it is auto-generated (from lesson IDs) or manually maintained.
- If manually maintained: treat skill tree node updates as required deliverable for every new lesson, not optional polish.
- Add a consistency check: `lessonIds.length === skillTreeNodes.length` — fail loudly in dev if counts diverge.

**Phase:** Content pipeline extension.

---

## Minor Pitfalls

### Pitfall 10: Sandbox Unlock Gate Not Tied to Completion State

**What goes wrong:** The sandbox is intended to unlock post-completion (after finishing the main learning path). If the unlock check reads from a stale or wrong state slice, the sandbox either unlocks immediately (no incentive to complete lessons) or never unlocks.

**Prevention:** Unlock condition must read from the same canonical completion state used by the skill tree and progress tracking. Add a single `isSandboxUnlocked(): boolean` selector that is the single source of truth — components do not compute this independently.

### Pitfall 11: Code Lesson Starter Code Contains Tabs vs Spaces Inconsistency

**What goes wrong:** Starter code in JSON is authored with tabs in some exercises and spaces in others. The syntax highlighter renders them consistently but the `fill-blank` or `code-fix` evaluator's string comparison fails because `\t` !== `  `.

**Prevention:** Normalize all starter code to spaces (2-space indent) at content authoring time. Add a content lint step: `prettier --check` on all JSON files containing code fields.

### Pitfall 12: localStorage Quota Growth from Sandbox History

**What goes wrong:** If the sandbox persists prompt/response history (for "recent sessions" UX), unbounded history grows the Zustand persisted state. Combined with existing XP history, the 5MB localStorage limit can be hit by active users.

**Prevention:** Sandbox history is capped at last 20 sessions. Prompt + response pairs are trimmed to first 500 characters for storage. This mirrors the existing `xpHistory` cap pattern.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Content schema extension | Schema drift breaks existing 20 lessons (Pitfall 5) | Optional fields + `tsc --noEmit` CI check |
| Chapter 5 lesson authoring | Hebrew instructions with code terms garbled (Pitfall 8) | `<bdi>` wrapping in Hebrew content |
| New exercise type (code-fix, etc.) | Not registered, renders nothing (Pitfall 2) | Discriminated union enforces completeness |
| Code block rendering | RTL bidi corrupts code display (Pitfall 1) | `<CodeBlock dir="ltr">` universal wrapper |
| Syntax highlighter library | 900KB bundle bloat (Pitfall 6) | Light build + selective language registration |
| Skill tree update | Chapter 5 nodes missing from progression map (Pitfall 9) | Node count assertion in dev |
| Sandbox store design | State bleeds into lesson progress (Pitfall 3) | Isolated slice, no shared mutable fields |
| Sandbox evaluator | Existing evaluators called with freeform input (Pitfall 7) | Separate `SandboxEvaluator`, no score % |
| Sandbox unlock | Gate reads wrong state, unlocks immediately or never (Pitfall 10) | Single `isSandboxUnlocked()` selector |
| All phases | Live API call added "just for code demo" (Pitfall 4) | Hard lint rule, architecture boundary enforced |

---

## Preserved Pitfalls from v2.0 (Still Relevant)

The following pitfalls from the v2.0 rebuild remain active for all new development:

- **RTL physical CSS properties** (original Pitfall 2, 5): New components for code lessons and sandbox must use `ps-*`, `pe-*`, `ms-*`, `me-*` Tailwind classes. `dir="ltr"` on code blocks is the only acceptable exception.
- **LocalizedString not reactive** (original Pitfall 7): All new components that render `LocalizedString` content must use the `useLocale` hook, not hardcoded `.en`.
- **Service worker caching stale content** (original Pitfall 8): Chapter 5 lesson JSON is bundled (not fetched), so it updates with the app bundle — no extra cache concern.
- **Zustand hydration race** (original Pitfall 4): Sandbox unlock state reads from the same store — hydration gate must cover sandbox unlock check.

---

## Sources

- Direct codebase analysis of PromptPlay v2.0 exercise registry, content schema, and store patterns — HIGH confidence
- [Firefox RTL Guidelines — code blocks always LTR](https://firefox-source-docs.mozilla.org/code-quality/coding-style/rtl_guidelines.html) — HIGH confidence
- [W3C Bidi Unicode controls](https://www.w3.org/International/questions/qa-bidi-unicode-controls.en.html) — HIGH confidence
- [react-syntax-highlighter light build](https://github.com/react-syntax-highlighter/react-syntax-highlighter) — MEDIUM confidence (verify current light build import path)
- [Zustand persist middleware](https://zustand.docs.pmnd.rs/reference/middlewares/persist) — HIGH confidence
- [W3C Structural markup and RTL text](https://www.w3.org/International/questions/qa-html-dir.en) — HIGH confidence
- WebSearch: gamified learning integration patterns, sandbox state management — LOW confidence (general guidance only)
