# Feature Landscape

**Domain:** AI prompting education — code & automation chapter + practice sandbox
**Researched:** 2026-03-30
**Milestone:** v2.1 — adding to existing PromptPlay v2.0 (20 lessons, 6 exercise types, gamification)

---

## Table Stakes

Features users expect in a "learn AI for coding" chapter. Missing = feels incomplete.

| Feature | Why Expected | Complexity | Dependency |
|---------|--------------|------------|------------|
| Code-block display in lessons | AI coding lessons always show code; plain text reads as broken | Low | New styled `<pre><code>` component — no heavy library needed |
| "Explain this code" exercise | Core AI + coding use case; Code.org teaches it as lesson 1 | Medium | Variant of existing `simulated-chat` type with code context |
| "Fix this bug" exercise | Spot-the-problem with code snippets — natural extension | Low | Variant of existing `spot-problem` type |
| "Write a prompt to get this output" exercise | Reverse-engineering prompts from desired code output | Medium | Extends `free-text` evaluator with code-specific rubric signals |
| Simulated AI code output (pre-scripted) | No live API — same pattern as all 20 existing lessons | Low | Already established; add new scripted responses in lesson JSON |
| Chapter 5 in skill tree | New chapter must appear in skill tree like chapters 1–4 | Low | Content pipeline already exists; add 5 lesson JSON files |
| XP + completion badge for chapter | Gamification parity with existing chapters | Low | Gamification engine already handles arbitrary chapters |

---

## Differentiators

Features that set v2.1 apart — not universally expected but high-value.

| Feature | Value Proposition | Complexity | Dependency |
|---------|-------------------|------------|------------|
| Practice Sandbox with scenario templates | Freeform practice area post-completion — no "Duolingo for AI" competitor offers this; drives retention after lessons end | High | New UI surface; 3–5 pre-scripted scenarios; unlock gate after chapter 5 |
| Code-context prompt scoring | Evaluator that checks code-specific quality signals: language specified? error message included? enough context? | Medium | Extends existing `free-text` evaluator; new rubric criteria |
| Scenario unlock progression | Sandbox scenarios unlock as lessons complete — pull-through motivation to finish chapter | Low | Reads existing lesson completion state from store |
| Inline "why this works" explanation | After each coding exercise, short panel explains why the better prompt worked — builds mental model faster | Low | Content-only addition to existing exercise completion screen |
| "Iterate the prompt" mini-flow | Show weak prompt + bad output → user improves it → see better output | Medium | Can simulate with existing `pick-better` type first; full new type is stretch |

---

## Anti-Features

Features to explicitly NOT build for this milestone.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Live code execution | Server infra + security surface + cost — fundamentally out of scope | Show pre-scripted AI output only, same as all existing exercises |
| Real AI API calls in sandbox | Core project constraint: zero marginal cost | Pre-script 3–5 responses per sandbox scenario template |
| Full syntax highlighting library (Prism/highlight.js) | ~30–80 KB extra for showing 5–15 line snippets | Plain `<pre><code>` with Tailwind monospace + minimal CSS token coloring |
| Multi-language deep dives (Python vs JS vs Bash) | Teaching language syntax = coding course, not prompting course | Keep snippets simple; pseudocode or minimal Python where needed |
| Sandbox chat history persistence | Multi-turn conversation storage adds state complexity for v2.1 | Single-turn: write prompt → see response → retry fresh |
| Sandbox leaderboards / sharing | Social features out of scope per PROJECT.md | Save sandbox attempts locally only (existing Zustand/MMKV) |
| New exercise type engine changes for iteration | Adds engine complexity risk; existing types cover the skill adequately | Use `pick-better` to simulate "improve this prompt" until v2.2 |

---

## Feature Dependencies

```
Existing lesson JSON pipeline (v2.0)
  └── 5 Chapter 5 lesson files (new content)
        ├── Code display component (new — 1 component, low risk)
        ├── "Explain code" simulated-chat variant (extends existing type)
        ├── "Fix the bug" spot-problem variant (extends existing type)
        └── "Prompt for output" free-text variant (extends existing evaluator)

Existing lesson completion tracking (v2.0 Zustand store)
  └── Practice Sandbox (new UI surface)
        ├── Scenario template list (3–5 templates, JSON-driven)
        ├── Pre-scripted responses per scenario (static, no API)
        ├── Unlock gate (chapter 5 complete OR all chapters complete)
        └── Code-context prompt quality hints (reuses evaluator logic)
```

---

## MVP Recommendation

Prioritize for v2.1:

1. **Code display component** — small lift, unblocks all 5 lessons
2. **Chapter 5 content** — 5 lesson JSON files using existing + lightly extended exercise types; topics: (1) explain code, (2) debug with AI, (3) write a script, (4) automate a task, (5) iterate and refine
3. **Code-context evaluator rubric** — needed for meaningful feedback in free-text coding exercises
4. **Practice Sandbox with 3 scenario templates** — the milestone's key differentiator; keep single-turn, 3 canned responses per scenario, unlock after any chapter 5 lesson complete

Defer to v2.2:
- "Iterate the prompt" as a distinct new exercise type — high value but engine risk; use `pick-better` to approximate now
- More sandbox scenarios — pure content additions, no code changes needed after pipeline exists
- Inline "why this works" panel — DX improvement, not blocking core loop

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Table stakes features | HIGH | Consistent across Code.org curriculum, Mimo, Codecademy patterns |
| Sandbox design (simulated, no API) | HIGH | Derived from core project constraint + offline sandbox patterns |
| Exercise type extensions | HIGH | Existing type registry explicitly designed for extension |
| Code display (no heavy library) | HIGH | Standard web pattern; snippets are short |
| Differentiator value of sandbox | MEDIUM | No direct competitor to benchmark against; market gap supports it |

---

## Sources

- [Code.org Coding with AI curriculum](https://code.org/curriculum/coding-with-ai) — lesson structure for AI + coding education (HIGH confidence)
- [Code.org AI Debugging Partner — Lesson 4](https://levelbuilder-studio.code.org/s/coding-with-ai/lessons/4) — exercise design patterns (HIGH confidence)
- [Duolingo Max blog — GPT-4 lesson design](https://blog.duolingo.com/duolingo-max/) — "explain my answer" pattern (HIGH confidence)
- [NN/G: Designing use-case prompt suggestions](https://www.nngroup.com/articles/designing-use-case-prompt-suggestions/) — sandbox scenario template UX (HIGH confidence)
- [How to Use AI in Coding — best practices 2026](https://zencoder.ai/blog/how-to-use-ai-in-coding) — which skills matter (debug, explain, generate, iterate) (MEDIUM confidence)
- [Mimo — coding apps for beginners 2026](https://mimo.org/blog/coding-apps-for-beginners) — Duolingo-style coding app patterns (MEDIUM confidence)
