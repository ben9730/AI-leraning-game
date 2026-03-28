# Phase 5: Full Curriculum - Research

**Researched:** 2026-03-28
**Domain:** Content authoring (JSON lessons), simulated-chat exercise type, graduate scoring rubric
**Confidence:** HIGH (exercise patterns), HIGH (content schema), MEDIUM (Hebrew authoring workflow)

---

## Summary

Phase 5 delivers the product's two biggest remaining work items: the full 20-lesson curriculum (EN + HE) and the simulated AI chat exercise — the core differentiator. The technical foundations are completely in place. Schema, evaluator pattern, registry, and loader all exist and follow clear conventions. Adding `simulated-chat` is ~90% a repeat of the `free-text` exercise pattern: same rubric scoring logic, same evaluator shape, different UI (chat bubble layout instead of plain text input). The planner should treat `simulated-chat` as a single focused task before the content authoring waves begin.

Content authoring is the dominant cost of this phase. Lessons 01-05 already exist and establish the JSON format. Lessons 06-20 must be written following the same schema, graduating from checklist scoring (`scoringMethod: 'checklist'`) to weighted-keyword scoring (`scoringMethod: 'weighted-keyword'`) from lesson 06 onward. Each lesson requires: body text in EN + HE, 2-3 exercises with full bilingual content, rubric definitions for any free-text or simulated-chat exercises, model answers, and feedback strings. The loader.ts and curriculum.ts files must also be extended for each new lesson.

The critical constraint for Hebrew content is quality. Machine translation is insufficient for instructional text — an AI-term glossary must be authored first and applied consistently. All 20 lessons must be tested in RTL on a Hebrew-locale device before the phase closes.

**Primary recommendation:** Implement `SimulatedChatCard` + `evaluateSimulatedChat` first (mirrors `FreeTextCard` + `evaluateFreeText`), then author content in two waves: lessons 06-10 (completing chapters 1-2), then lessons 11-20 (chapters 3-4).

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONT-01 | 20 lessons authored across 4 chapters in English | Lessons 01-05 exist; 06-20 need authoring following existing JSON schema |
| CONT-02 | Chapter 1: "What Can AI Do?" (5 lessons) | Lessons 01-05 already authored; curriculum.ts only has Chapter 1 with these 5 |
| CONT-03 | Chapter 2: "Your First Good Prompt" (5 lessons) | Lessons 06-10 — clarity, specificity, context, intent, synthesis |
| CONT-04 | Chapter 3: "Level Up Your Prompts" (5 lessons) | Lessons 11-15 — roles, examples, constraints, iteration |
| CONT-05 | Chapter 4: "Real-World Skills" (5 lessons) | Lessons 16-20 — writing, research, brainstorming, analysis |
| CONT-06 | All 20 lessons translated to Hebrew | Every `LocalizedString` field needs both `en` and `he` values |
| CONT-07 | Each lesson includes 2-3 exercises with variety of types | Mix: MCQ, pick-better, fill-blank, free-text, simulated-chat, spot-problem |
| CONT-08 | Tool-agnostic content — teaches principles, not specific tool UIs | Lesson tip field used for tool-agnostic framing; verified in lesson-01 |
| EXER-05 | Simulated AI chat — user writes prompt, sees pre-scripted response, gets scored | Schema exists (SimulatedChatExercise); needs SimulatedChatCard component + evaluateSimulatedChat evaluator + registry entry |
</phase_requirements>

---

## Standard Stack

### Core (already in project — no new installs)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| React Native / Expo | SDK 52+ | UI component for SimulatedChatCard | Existing |
| TypeScript | 5.x | Type-safe JSON authoring via schema.ts interfaces | Existing |
| Metro bundler | — | Static `require()` for JSON lesson files | Static imports required — no dynamic import |

### No new dependencies needed for this phase.

All exercise infrastructure exists. `SimulatedChatCard` uses existing primitives: `TextInput`, `ScrollView`, `Animated`/`Reanimated` for the chat bubble reveal. The evaluator reuses `evaluateFreeText` logic verbatim — it only needs a thin wrapper typed against `SimulatedChatExercise`.

---

## Architecture Patterns

### Existing Exercise Pattern (authoritative — use for SimulatedChatCard)

The project follows a strict 3-part pattern for each exercise type:

```
src/features/exercise/
├── components/
│   ├── MCQCard.tsx          ← renders exercise, calls onComplete(result)
│   ├── FreeTextCard.tsx     ← closest model for SimulatedChatCard
│   └── SimulatedChatCard.tsx  ← Phase 5: implement this
├── evaluators/
│   ├── evaluateFreeText.ts  ← copy logic, retype for SimulatedChatExercise
│   └── evaluateSimulatedChat.ts  ← Phase 5: implement this
└── registry.ts              ← add 'simulated-chat' entry
```

### SimulatedChatCard Component Pattern

**What:** Renders a two-phase UI: (1) user writes prompt in text input, (2) on submit, reveals a chat bubble showing `preScriptedResponse`, then shows rubric score.

**When to use:** Any `SimulatedChatExercise` — the registry dispatches automatically.

```typescript
// Source: schema.ts — SimulatedChatExercise shape
// Phase pattern mirrors FreeTextCard with added chat bubble reveal step
// Props shape (same as all exercise cards):
type Props = {
  exercise: SimulatedChatExercise
  onComplete: (result: EvaluationResult) => void
}

// State machine: 'writing' | 'response-revealed' | 'scored'
// On submit: evaluate prompt → reveal preScriptedResponse → show breakdown → call onComplete
```

### evaluateSimulatedChat Pattern

```typescript
// Source: evaluateFreeText.ts — reuse verbatim, retype
import type { SimulatedChatExercise } from '@/src/content/schema'
import type { EvaluationResult } from '../types'

export function evaluateSimulatedChat(
  exercise: SimulatedChatExercise,
  answer: string,
  lang: 'en' | 'he',
): EvaluationResult {
  // Identical logic to evaluateFreeText — rubric shape is the same
  // exercise.rubric, exercise.positiveFeedback, exercise.improvementFeedback
  // are identical fields on both FreeTextExercise and SimulatedChatExercise
}
```

### Lesson JSON Authoring Pattern

Every lesson follows the schema in `lesson-01-what-is-prompting.json`. Key rules:

```json
{
  "id": "lesson-NN-kebab-title",
  "order": N,
  "chapter": N,
  "prerequisites": ["lesson-NN-1-previous-title"],
  "xpReward": 10,
  "content": {
    "title": { "en": "...", "he": "..." },
    "body": { "en": "...", "he": "..." },
    "tip": { "en": "These skills work with ChatGPT, Claude, Gemini...", "he": "..." }
  },
  "exercises": [ ... ]
}
```

**Scoring method graduation:**
- Lessons 01-05: `"scoringMethod": "checklist"` (binary per-criterion)
- Lessons 06-20: `"scoringMethod": "weighted-keyword"` (weights must sum to 1.0 — enforced by `validateRubricWeights()`)

### Loader Extension Pattern

Metro bundler requires static imports — no dynamic `require()`. Every new lesson must be explicitly added:

```typescript
// loader.ts — add imports and registry entry for each new lesson
import lesson06 from './lessons/lesson-06-be-clear.json'
// ...
const lessons: Record<string, Lesson> = {
  'lesson-01-what-is-prompting': lesson01 as unknown as Lesson,
  'lesson-06-be-clear': lesson06 as unknown as Lesson,
  // ...
}
```

### curriculum.ts Extension Pattern

Chapters 2-4 must be added to the `chapters` array:

```typescript
{
  id: 2,
  title: { en: 'Your First Good Prompt', he: 'הפרומפט הטוב הראשון שלך' },
  description: { ... },
  lessonIds: ['lesson-06-be-clear', ..., 'lesson-10-putting-it-together'],
},
```

### Anti-Patterns to Avoid

- **Dynamic import in loader:** Metro cannot tree-shake dynamic `require()` on JSON — always use static imports.
- **Rubric weights not summing to 1.0:** `validateRubricWeights()` exists — call it in tests to catch authoring errors before runtime.
- **Machine-translated Hebrew:** Instructional text translated by machine produces unnatural phrasing, especially for AI terminology. Use the glossary.
- **Missing `order` field on exercises:** The lesson engine sequences exercises by `order` integer — omitting it causes undefined sort behavior.
- **RTL-unaware chat bubble layout:** `SimulatedChatCard` must use `alignSelf: 'flex-end'` for user messages with `paddingStart/End` — never `paddingLeft/Right`.
- **Storing `preScriptedResponse` as English-only:** Every `LocalizedString` field needs both `en` and `he` — including AI response text.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rubric scoring logic | Custom scorer | Copy `evaluateFreeText.ts` | Identical algorithm — `SimulatedChatExercise` has identical rubric fields |
| Keyword normalization | Custom normalizer | The `normalize()` function in `evaluateFreeText.ts` | Already handles `he` case (no lowercasing) |
| Exercise dispatch | Custom router | `EXERCISE_REGISTRY` pattern | One line to add `'simulated-chat': SimulatedChatCard` |
| Hebrew translation | Ad-hoc translation | Establish glossary first, apply consistently | Machine translation of AI terms produces inconsistent/unnatural Hebrew |

---

## Common Pitfalls

### Pitfall 1: Lesson ID Drift
**What goes wrong:** lesson JSON `id` field doesn't match the key in `loader.ts` and the entry in `curriculum.ts`.
**Why it happens:** Three places must be kept in sync: filename, JSON `id`, `loader.ts` key, `curriculum.ts` lessonIds array.
**How to avoid:** Use the exact same kebab-case string in all four places. Write a loader test asserting `loadLesson(id).id === id` for each lesson.
**Warning signs:** `loadLesson()` throws "Lesson not found" at runtime.

### Pitfall 2: Rubric weights don't sum to 1.0
**What goes wrong:** `weighted-keyword` rubric scores incorrectly — e.g., max achievable score is 0.9 not 1.0.
**Why it happens:** Authoring error when adding/removing criteria and forgetting to renormalize weights.
**How to avoid:** Call `validateRubricWeights(rubric)` in a Jest test for each lesson 06+ that uses `weighted-keyword`.
**Warning signs:** Score ceiling below 100 for a perfect prompt.

### Pitfall 3: SimulatedChatCard shows response before evaluation
**What goes wrong:** User sees the pre-scripted AI response before submitting their prompt, giving away the answer.
**Why it happens:** State managed incorrectly — `preScriptedResponse` rendered unconditionally.
**How to avoid:** Three-state machine (`'writing' | 'response-revealed' | 'scored'`). Response only renders after submit.

### Pitfall 4: Hebrew content authored without glossary
**What goes wrong:** Different lessons use different Hebrew translations for the same AI terms (e.g., "prompt" transliterated differently, "context" translated differently).
**Why it happens:** Each lesson authored independently without a reference.
**How to avoid:** Author the glossary (a short markdown file of key terms) before writing a single lesson 06. Apply it to lessons 01-05 retrospectively if needed.
**Warning signs:** Inconsistent spelling of "פרומפט" vs other transliterations across lessons.

### Pitfall 5: curriculum.ts only has Chapter 1 at phase end
**What goes wrong:** Skill tree shows only 5 lesson nodes because `chapters` array wasn't extended.
**Why it happens:** `curriculum.ts` is easy to forget — it's separate from the lesson JSON files.
**How to avoid:** Extend `curriculum.ts` as part of each content wave plan, not as a final cleanup step.

### Pitfall 6: Chapter/lesson numbering mismatch with REQUIREMENTS.md
**What goes wrong:** Chapters 2-4 in REQUIREMENTS.md don't align with what's in `curriculum.ts` (currently Chapter 1 = lessons 01-05, labelled "What Can AI Do?").
**Why it happens:** REQUIREMENTS.md describes the final 4-chapter structure; `curriculum.ts` currently has only 1 chapter with 5 lessons.
**How to avoid:** When extending `curriculum.ts`, reconcile the chapter titles and lesson groupings against REQUIREMENTS.md definitions (CONT-02 through CONT-05) before authoring content.

---

## Code Examples

### SimulatedChatExercise JSON (authoring pattern)

```json
{
  "id": "lesson-07-ex-02",
  "type": "simulated-chat",
  "order": 2,
  "prompt": {
    "en": "Ask the AI to explain photosynthesis to a 10-year-old.",
    "he": "בקשו מה-AI להסביר פוטוסינתזה לילד בן 10."
  },
  "systemContext": {
    "en": "You are practising giving context in your prompt.",
    "he": "אתם מתרגלים לתת הקשר בפרומפט שלכם."
  },
  "preScriptedResponse": {
    "en": "Sure! Photosynthesis is how plants make their own food using sunlight...",
    "he": "כמובן! פוטוסינתזה היא האופן שבו צמחים מייצרים את המזון שלהם באמצעות אור השמש..."
  },
  "rubric": {
    "scoringMethod": "weighted-keyword",
    "passingScore": 60,
    "criteria": [
      {
        "key": "clarity",
        "label": { "en": "Clarity", "he": "בהירות" },
        "weight": 0.25,
        "keywords": ["explain", "what is", "describe"],
        "required": false
      },
      {
        "key": "context",
        "label": { "en": "Context", "he": "הקשר" },
        "weight": 0.35,
        "keywords": ["10-year-old", "child", "kid", "simple", "10 year"],
        "required": true
      },
      {
        "key": "specificity",
        "label": { "en": "Specificity", "he": "ספציפיות" },
        "weight": 0.25,
        "keywords": ["photosynthesis"],
        "required": false
      },
      {
        "key": "intent",
        "label": { "en": "Output Format", "he": "פורמט פלט" },
        "weight": 0.15,
        "keywords": ["simple words", "easy", "short", "brief"],
        "required": false
      }
    ]
  },
  "modelAnswer": {
    "en": "Explain photosynthesis to a 10-year-old using simple words.",
    "he": "הסבר פוטוסינתזה לילד בן 10 בשפה פשוטה."
  },
  "positiveFeedback": {
    "en": "Great prompt! You gave the AI clear context about the audience.",
    "he": "פרומפט מעולה! נתתם ל-AI הקשר ברור לגבי הקהל."
  },
  "improvementFeedback": {
    "en": "Try specifying who you're explaining to — the AI gives much better answers when it knows the audience.",
    "he": "נסו לציין למי אתם מסבירים — ה-AI נותן תשובות הרבה יותר טובות כשהוא יודע מי הקהל."
  }
}
```

### Registry extension (one line)

```typescript
// registry.ts
import { SimulatedChatCard } from './components/SimulatedChatCard'

export const EXERCISE_REGISTRY = {
  // ... existing entries ...
  'simulated-chat': SimulatedChatCard as React.ComponentType<ExerciseComponentProps>,
}
```

---

## Curriculum Authoring Plan

### Chapter-to-Lesson Mapping (reconciled with REQUIREMENTS.md)

The current `curriculum.ts` has Chapter 1 with lessons 01-05, but the REQUIREMENTS.md chapter definitions (CONT-02 through CONT-05) describe a different grouping. The planner must decide one canonical mapping. Based on research summary and FEATURES.md:

| Chapter | REQUIREMENTS.md Title | Lesson IDs | Scoring Method |
|---------|----------------------|------------|----------------|
| 1 | "What Can AI Do?" | 01-05 | checklist (exists) |
| 2 | "Your First Good Prompt" | 06-10 | weighted-keyword |
| 3 | "Level Up Your Prompts" | 11-15 | weighted-keyword |
| 4 | "Real-World Skills" | 16-20 | weighted-keyword |

### Lesson Titles (from FEATURES.md curriculum outline, reconciled to 20 lessons)

| # | ID | Title | Key Exercise Types |
|---|-----|-------|-------------------|
| 01 | lesson-01-what-is-prompting | What Is Prompting? | mcq, pick-better (EXISTS) |
| 02 | lesson-02-clarity | Clarity | (EXISTS) |
| 03 | lesson-03-specificity | Specificity | (EXISTS) |
| 04 | lesson-04-context | Context | (EXISTS) |
| 05 | lesson-05-intent | Intent / Output Format | (EXISTS) |
| 06 | lesson-06-be-clear | Be Clear | free-text (weighted), fill-blank |
| 07 | lesson-07-give-context | Give Context | simulated-chat, pick-better |
| 08 | lesson-08-set-the-format | Set the Format | fill-blank, mcq |
| 09 | lesson-09-put-it-together | Put It Together | simulated-chat (graded) |
| 10 | lesson-10-your-first-good-prompt | Your First Good Prompt | free-text, pick-better |
| 11 | lesson-11-give-ai-a-role | Give AI a Role | simulated-chat, pick-better |
| 12 | lesson-12-set-constraints | Set Constraints | free-text, fill-blank |
| 13 | lesson-13-few-shot-prompting | Few-Shot Prompting | fill-blank, mcq |
| 14 | lesson-14-iteration | Iteration: The Follow-Up | simulated-chat |
| 15 | lesson-15-chain-of-thought | Chain of Thought | mcq, simulated-chat |
| 16 | lesson-16-writing-help | Writing Help | simulated-chat, pick-better |
| 17 | lesson-17-summarizing | Summarizing | spot-problem, simulated-chat |
| 18 | lesson-18-brainstorming | Brainstorming | free-text, pick-better |
| 19 | lesson-19-research-assistance | Research Assistance | spot-problem, mcq |
| 20 | lesson-20-debugging-bad-output | Debugging Bad Output | free-text, spot-problem |

### Hebrew AI-Term Glossary (must be authored before any Hebrew content)

| English Term | Hebrew Recommended | Notes |
|---|---|---|
| prompt | פרומפט | Transliterate — no native equivalent |
| AI / artificial intelligence | בינה מלאכותית / AI | Use "AI" in parenthetical, "בינה מלאכותית" in body |
| context | הקשר | Translate — natural Hebrew word |
| clarity | בהירות | Translate |
| specificity | ספציפיות | Transliterate |
| rubric / scoring | מחוון ניקוד | Translate |
| output format | פורמט פלט | Mix — "פורמט" is borrowed |
| few-shot | few-shot / דוגמאות ללמידה | Transliterate or explain |
| chain of thought | שרשרת מחשבה | Translate |
| iteration | איטרציה | Transliterate |

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Checklist scoring (lessons 1-5) | Graduate to weighted-keyword from lesson 6 | More nuanced feedback; partial credit for good-but-not-perfect prompts |
| `simulated-chat` schema placeholder in registry comment | Implement `SimulatedChatCard` + evaluator | Enables the core differentiating exercise type |
| Single chapter in `curriculum.ts` | Extend to 4 chapters | Skill tree and lesson unlock chain require full chapter metadata |

---

## Open Questions

1. **Chapter 1 vs. REQUIREMENTS.md chapter titles**
   - What we know: `curriculum.ts` currently labels Chapter 1 as "What Can AI Do?" and contains lessons 01-05. REQUIREMENTS.md CONT-02 defines Chapter 1 as "What Can AI Do?" (5 lessons) but CONT-03 through CONT-05 define Chapters 2-4 differently from FEATURES.md.
   - What's unclear: The lesson titles in FEATURES.md differ slightly from REQUIREMENTS.md (e.g., FEATURES.md has "Be Clear" as lesson 5; REQUIREMENTS.md CONT-03 describes Chapter 2 as "clarity, specificity, context" lessons).
   - Recommendation: Planner should canonicalize the chapter/lesson mapping in the first plan (05-01) and use it as the ground truth for all subsequent content waves.

2. **Hebrew native review process**
   - What we know: STATE.md flags "Hebrew native review process and AI-term glossary must be established before Phase 5 begins."
   - What's unclear: Whether native review is synchronous (blocks lesson publication) or async (content ships, review follows).
   - Recommendation: Establish the glossary as a deliverable in plan 05-02. If native review cannot happen before phase end, ship EN content complete and HE content as best-effort with a review flag.

3. **Multi-turn chat for lesson 14 (Iteration)**
   - What we know: FEATURES.md describes lesson 15 as "Multi-turn simulated chat." The current `SimulatedChatExercise` schema has a single `preScriptedResponse`.
   - What's unclear: Whether multi-turn requires a schema extension (array of turn responses) or can be approximated with two sequential `simulated-chat` exercises.
   - Recommendation: Approximate with two sequential exercises for v1 — schema extension deferred. Multi-turn schema is a Phase 5+ enhancement if needed.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest (dual-project config: node + react-native presets) |
| Config file | `PromptPlay/jest.config.js` (existing dual-project setup) |
| Quick run command | `cd PromptPlay && npx jest --testPathPattern="content\|simulated"` |
| Full suite command | `cd PromptPlay && npx jest` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EXER-05 | `evaluateSimulatedChat` scores correctly for pass/fail | unit | `npx jest evaluateSimulatedChat` | Wave 0 |
| EXER-05 | Registry has `simulated-chat` entry | unit | `npx jest registry` | Wave 0 |
| CONT-01 | All 20 lesson IDs loadable via `loadLesson()` | unit | `npx jest loader` | Wave 0 (extend existing) |
| CONT-06 | All LocalizedString fields have non-empty `he` values | unit | `npx jest content` | Wave 0 |
| CONT-07 | Each lesson has 2-3 exercises | unit | `npx jest lesson-structure` | Wave 0 |
| EXER-05 | Rubric weights sum to 1.0 for all weighted-keyword lessons | unit | `npx jest rubric-weights` | Wave 0 |

### Wave 0 Gaps

- [ ] `PromptPlay/src/features/exercise/evaluators/__tests__/evaluateSimulatedChat.test.ts` — covers EXER-05 evaluator
- [ ] `PromptPlay/src/content/__tests__/lesson-structure.test.ts` — covers CONT-01, CONT-06, CONT-07; extend loader.test.ts or add new file
- [ ] `PromptPlay/src/content/__tests__/rubric-weights.test.ts` — validates all weighted-keyword rubrics sum to 1.0

---

## Sources

### Primary (HIGH confidence)
- `PromptPlay/src/content/schema.ts` — `SimulatedChatExercise` interface; `PromptRubric`; `validateRubricWeights()`
- `PromptPlay/src/features/exercise/evaluators/evaluateFreeText.ts` — evaluator pattern to replicate
- `PromptPlay/src/features/exercise/registry.ts` — registry pattern; `'simulated-chat'` placeholder comment
- `PromptPlay/src/content/loader.ts` — static import requirement for Metro bundler
- `PromptPlay/src/content/lessons/lesson-01-what-is-prompting.json` — canonical JSON authoring format
- `.planning/REQUIREMENTS.md` — CONT-01..08, EXER-05 requirements
- `.planning/research/FEATURES.md` — curriculum outline, exercise mix rationale, scoring approach

### Secondary (MEDIUM confidence)
- `.planning/research/SUMMARY.md` — Phase 5 research flags; Hebrew content authoring concern; scoring approach A vs B
- `.planning/STATE.md` — Accumulated decisions; Phase 5 blocker re: Hebrew review

---

## Metadata

**Confidence breakdown:**
- SimulatedChatCard implementation: HIGH — schema is fully defined, evaluator logic is a direct copy of `evaluateFreeText`, registry pattern is established
- Content authoring (JSON structure): HIGH — format proven across 5 existing lessons
- Scoring graduation (weighted-keyword): HIGH — `validateRubricWeights()` enforces correctness
- Hebrew content quality: MEDIUM — glossary approach is sound but native review process is unresolved
- Lesson title/chapter mapping: MEDIUM — minor discrepancy between REQUIREMENTS.md and FEATURES.md outline needs resolution in planning

**Research date:** 2026-03-28
**Valid until:** Stable — content schema is locked; valid until schema.ts changes
