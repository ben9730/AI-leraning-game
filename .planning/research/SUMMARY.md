# Project Research Summary

**Project:** PromptPlay v2.1 — Chapter 5: AI for Code & Automation + Practice Sandbox
**Domain:** Gamified AI prompting education — mobile PWA, content chapter extension + freeform sandbox
**Researched:** 2026-03-30
**Confidence:** HIGH

## Executive Summary

PromptPlay v2.1 adds a fifth content chapter (AI for Code & Automation) and a Practice Sandbox to the existing Duolingo-style prompting course. The v2.0 foundation — Vite + React + Zustand + bundled JSON content + 6 exercise types — is well-established and explicitly designed for extension. All new work is additive: new lesson JSON files, light exercise type variants, one new UI surface (the sandbox), and one new shared component (CodeBlock). No architectural rewrites are needed. The exercise type registry pattern, content pipeline, gamification engine, and store are all ready to accept chapter 5 without changes to core abstractions.

The recommended approach is to build in two focused tracks: (1) content pipeline extension — add Chapter 5 lesson JSON files using existing and lightly extended exercise types, and (2) the Practice Sandbox — a new isolated UI surface with its own Zustand slice, pre-scripted responses, and a post-completion unlock gate. The code display problem is the one cross-cutting concern: a shared `<CodeBlock dir="ltr">` component must be built first and used everywhere code appears, because RTL bidi corruption in Hebrew mode will render code lessons unreadable if not addressed at the foundation.

The biggest risks are RTL bidi corruption in code blocks (discoverable late if Hebrew testing is skipped), sandbox state bleeding into lesson progress (structural risk if isolation is not designed in from the start), and the temptation to introduce live API calls for "more realistic" code responses (a hard architectural boundary that must never be crossed). All three are preventable with upfront design decisions.

## Key Findings

### Recommended Stack

The v2.0 stack (Vite 6, React 19, TypeScript 5, Tailwind v4, Zustand 5, React Router 7, i18next 24, vite-plugin-pwa) requires no changes for v2.1. All new work uses the existing stack. The only new dependency to evaluate is a syntax highlighter for code blocks — the recommendation is to avoid it entirely for v2.1 (use plain `<pre><code>` with Tailwind monospace + a `direction: ltr` wrapper), and only add `react-syntax-highlighter` (light build, selective language imports) if visual polish demands it. The full Prism bundle is 900KB unguarded; the light build with 3 languages is ~30KB.

**Core technologies:**
- Vite 6 + React 19 + TypeScript 5: existing build foundation — no changes needed
- Tailwind v4: logical properties (`ps-*`, `pe-*`) for RTL; `direction: ltr` on code blocks is the accepted physical exception
- Zustand 5 + localStorage persist: new `sandboxStore` slice must be isolated from `progressStore`
- Bundled JSON content: Chapter 5 adds 5 lesson files to `shared/content/lessons/`
- i18next 24: Hebrew content for Chapter 5 requires `<bdi>` wrapping for inline code terms

### Expected Features

**Must have (table stakes):**
- Code-block display in lessons — all code teaching contexts require this; plain `<pre><code>` with `dir="ltr"` is sufficient
- "Explain this code" exercise — variant of existing `simulated-chat` type with code context; core AI+coding skill
- "Fix this bug" exercise — variant of existing `spot-problem` type with code snippets
- "Write a prompt for this output" exercise — extends `free-text` evaluator with code-specific rubric signals
- Chapter 5 in skill tree — 5 new lesson nodes wired into the existing skill tree; required for progression visibility
- XP + completion badge for chapter — gamification parity; gamification engine already handles arbitrary chapters

**Should have (differentiators):**
- Practice Sandbox with 3 scenario templates — key milestone differentiator; no Duolingo-for-AI competitor offers freeform practice post-completion
- Code-context prompt scoring — evaluator checks language specified, error message included, enough context provided
- Scenario unlock progression — sandbox scenarios unlock as lessons complete, pulling users through chapter 5
- Inline "why this works" explanation — short panel after each coding exercise builds mental model faster

**Defer to v2.2:**
- "Iterate the prompt" as a distinct new exercise type — use `pick-better` to approximate now; engine change risk not worth it for v2.1
- Additional sandbox scenarios — pure content additions once the pipeline exists
- Sandbox chat history / multi-turn conversation — single-turn is sufficient for v2.1

### Architecture Approach

v2.1 is purely additive on top of the established monorepo architecture (`shared/` + `web/`). The shared content schema needs optional new fields for code lessons (`codeLanguage`, `starterCode`). The exercise registry adds no new types — existing types are extended via variants in content JSON and lightly adapted evaluators. The sandbox is a new route (`/sandbox`) with its own feature directory (`web/src/features/sandbox/`) and an isolated Zustand slice that never calls lesson-scoped store actions. The `<CodeBlock>` component lives in `web/src/ui/` and is the single enforced wrapper for all code rendering.

**Major components:**
1. `<CodeBlock>` (new, `web/src/ui/`) — enforces `dir="ltr"` and `unicode-bidi: isolate` for all code in lessons and sandbox
2. Chapter 5 lesson JSON files (new, `shared/content/lessons/`) — 5 files using existing + extended exercise types
3. `web/src/features/sandbox/` (new) — SandboxScreen, ScenarioSelector, SandboxPromptInput, SandboxResponse, useSandbox hook
4. `sandboxStore` (new Zustand slice) — isolated session state, never persisted, no shared fields with `progressStore`
5. Extended evaluators (new, `shared/exercise/evaluators/`) — code-context rubric signals for free-text exercises

### Critical Pitfalls

1. **RTL bidi corruption in code blocks** — every `<pre>`, `<code>`, and syntax highlighter wrapper MUST have `dir="ltr"` + `unicode-bidi: isolate` unconditionally; build `<CodeBlock>` before any code lesson content; test in Hebrew before marking any code exercise done
2. **Sandbox state bleeding into lesson progress** — create a dedicated `sandboxStore` slice from day one; sandbox never calls `completeLesson()`, `updateStreak()`, or any lesson-scoped action; sandbox session state is transient, not persisted
3. **New exercise variants not registered** — use TypeScript discriminated union for `ExerciseType` so the compiler enforces registry completeness; add dev-mode assertion for unregistered types
4. **Live API calls for code responses** — hard boundary: no component in `web/` or `shared/` makes fetch calls to external AI APIs; all code lesson responses are authored as `preScriptedResponse` fields in JSON; enforce with lint rule
5. **Content schema drift breaks existing 20 lessons** — all new fields on shared content types must be optional (`?`); run `tsc --noEmit` on all existing lesson JSON after any schema change; add to CI

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: CodeBlock Foundation + Schema Extension
**Rationale:** The `<CodeBlock>` component and schema changes are dependencies for everything else in v2.1. Building them first prevents RTL bidi corruption from being discovered late, and optional schema fields prevent breaking existing lessons.
**Delivers:** `<CodeBlock dir="ltr">` component; optional `codeLanguage`/`starterCode` fields on exercise schema; `tsc --noEmit` CI check on lesson JSON
**Addresses:** Code-block display (table stakes)
**Avoids:** RTL bidi corruption (Pitfall 1), content schema drift (Pitfall 5)

### Phase 2: Chapter 5 Content Pipeline
**Rationale:** Lesson JSON files are the content foundation; exercise components cannot be meaningfully built without the content they render. Five lessons using existing and lightly extended exercise types keeps engine risk low.
**Delivers:** 5 lesson JSON files (explain code, debug with AI, write a script, automate a task, iterate and refine); Hebrew content with `<bdi>` wrapping; skill tree nodes for all 5 lessons
**Addresses:** All table-stakes chapter 5 features; Chapter 5 in skill tree; XP + badge
**Avoids:** Skill tree nodes missing (Pitfall 9), Hebrew mixed-direction instructions (Pitfall 8)

### Phase 3: Code Exercise Variants + Evaluators
**Rationale:** With content in place, wire the exercise components and evaluators. Variants of existing types (simulated-chat, spot-problem, free-text) are lower risk than new types and reuse the established registry pattern.
**Delivers:** Extended `free-text` evaluator with code-context rubric; code-specific feedback in exercise completion; exercise registry completeness enforced by TypeScript
**Addresses:** "Explain code", "Fix the bug", "Prompt for output" exercises (table stakes)
**Avoids:** Unregistered exercise type silent failure (Pitfall 2)

### Phase 4: Practice Sandbox
**Rationale:** The sandbox is the milestone's key differentiator and has more novel architecture than the chapter content (new route, new store slice, new UI surface). Build after chapter 5 is stable so the unlock gate has real completion state to read.
**Delivers:** `/sandbox` route; `sandboxStore` isolated slice; 3 scenario templates with pre-scripted responses; unlock gate (reads chapter 5 completion); code-context prompt quality hints
**Addresses:** Practice Sandbox (differentiator); scenario unlock progression; code-context scoring
**Avoids:** Sandbox state bleeding into lesson progress (Pitfall 3), free-mode breaking evaluator assumptions (Pitfall 7), sandbox unlock gate reading wrong state (Pitfall 10)

### Phase 5: Polish + Validation
**Rationale:** RTL testing, Hebrew content review, bundle size check, and end-to-end lesson flow validation. Catches any bidi or registry issues before release.
**Delivers:** Hebrew mode tested for all Chapter 5 exercises; bundle analyzer run if syntax highlighter added; `isSandboxUnlocked()` selector verified; localStorage growth check
**Avoids:** Syntax highlighter bundle bloat (Pitfall 6), localStorage quota growth (Pitfall 12)

### Phase Ordering Rationale

- `<CodeBlock>` must precede all content work because RTL bidi corruption is invisible until Hebrew mode is tested — build the guard first
- Schema extension must precede content authoring to avoid TypeScript errors during JSON authoring
- Chapter 5 content precedes exercise wiring because exercise components need real content to render against
- Sandbox is last structured phase because its unlock gate depends on chapter 5 completion state existing in the store
- The "no live API" constraint (Pitfall 4) applies to all phases — enforce from Phase 1 with a lint rule

### Research Flags

Phases with standard patterns (skip research-phase):
- **Phase 1 (CodeBlock + Schema):** Well-documented web bidi patterns; RTL + code direction is a solved problem with W3C guidance
- **Phase 2 (Content Pipeline):** Existing lesson JSON pipeline is well-understood; 5 more files follow the same pattern
- **Phase 3 (Exercise Variants):** Registry pattern is established; evaluator extension is well-documented in the codebase

Phases likely needing deeper research during planning:
- **Phase 4 (Sandbox):** New UI surface with no existing pattern in the codebase; sandbox evaluator design (qualitative, not scored) needs a concrete spec before building; scenario template structure needs definition

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | v2.0 stack is proven; only open question is syntax highlighter (avoidable for v2.1) |
| Features | HIGH | Table stakes derived from Code.org, Mimo, Duolingo Max patterns; sandbox differentiator value is MEDIUM (no direct competitor benchmark) |
| Architecture | HIGH | Based on direct codebase analysis; shared/ + web/ monorepo is already built; extension patterns are explicit |
| Pitfalls | HIGH | RTL + code bidi backed by W3C and Firefox docs; schema drift and state isolation from direct codebase analysis |

**Overall confidence:** HIGH

### Gaps to Address

- **Sandbox evaluator spec:** The qualitative feedback model for sandbox mode (no score %, observational hints) needs a concrete design before Phase 4 implementation. Define 3-5 signal checks and their feedback strings before building.
- **Syntax highlighter decision:** Defer to implementation. Run bundle analyzer after Phase 1 with plain `<pre><code>`; only add a highlighter library if the visual gap is unacceptable.
- **Sandbox scenario content:** 3 scenario templates need to be authored (topic, pre-scripted responses, quality hints). Content authoring is not blocked but must complete before Phase 4 can finish.
- **Chapter 5 lesson exercise distribution:** FEATURES.md defines 5 topics but not the exercise type mix per lesson (how many MCQ vs free-text vs simulated-chat). Needs content planning before Phase 2.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis of PromptPlay v2.0 (50+ source files) — architecture, registry pattern, store, evaluators
- [Code.org Coding with AI curriculum](https://code.org/curriculum/coding-with-ai) — lesson structure for AI + coding education
- [W3C Bidi Unicode controls](https://www.w3.org/International/questions/qa-bidi-unicode-controls.en.html) — code block RTL handling
- [Firefox RTL Guidelines](https://firefox-source-docs.mozilla.org/code-quality/coding-style/rtl_guidelines.html) — code always LTR
- [Tailwind CSS v4 docs](https://tailwindcss.com/) — logical property utilities
- [Zustand persist middleware](https://zustand.docs.pmnd.rs/reference/middlewares/persist) — store isolation patterns
- [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) — PWA build

### Secondary (MEDIUM confidence)
- [Duolingo Max blog — GPT-4 lesson design](https://blog.duolingo.com/duolingo-max/) — exercise design patterns
- [NN/G: Designing use-case prompt suggestions](https://www.nngroup.com/articles/designing-use-case-prompt-suggestions/) — sandbox scenario UX
- [react-syntax-highlighter light build](https://github.com/react-syntax-highlighter/react-syntax-highlighter) — bundle size mitigation
- [Vite vs Next.js 2025](https://strapi.io/blog/vite-vs-nextjs-2025-developer-framework-comparison) — build tool rationale

### Tertiary (LOW confidence)
- WebSearch: gamified learning integration patterns, sandbox state management — general guidance, validate during implementation

---
*Research completed: 2026-03-30*
*Ready for roadmap: yes*
