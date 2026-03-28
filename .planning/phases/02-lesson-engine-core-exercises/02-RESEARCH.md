# Phase 2: Lesson Engine + Core Exercises - Research

**Researched:** 2026-03-28
**Domain:** React Native lesson flow UI, exercise component architecture, client-side scoring
**Confidence:** HIGH (builds on Phase 1 shipped code; all patterns well-established in existing architecture docs)

---

## Summary

Phase 2 delivers the core learning loop: load a lesson, show intro content, run exercises in sequence, evaluate answers, show completion. It builds directly on top of the schema, loader, curriculum index, and Zustand store that Phase 1 shipped. No new libraries are required for the lesson engine itself — Expo + React Native + Zustand cover everything. The only addition is `expo-haptics` for correct-answer feedback.

The exercise type registry pattern is already specified in ARCHITECTURE.md and is the correct approach: a `Record<ExerciseType, Component>` lookup eliminates switch-statement sprawl. Evaluators are pure functions — input is the exercise data + user answer, output is `{ score, passed, feedback, breakdown }`. This makes them trivially testable with jest. Scoring uses binary checklist for lessons 1-5 (did the answer contain role/goal/format?) graduating to weighted keyword rubric from lesson 6+.

LESS-06 requires 5 authored lessons. Only lesson-01 exists. Lessons 02-05 must be authored as JSON files following the exact seed lesson schema before the engine can be tested end-to-end.

**Primary recommendation:** Build in strict order — lesson engine shell first (navigation + state machine), then exercise runner + registry, then individual exercise components, then evaluators, then 4 more lesson JSON files. Never author lesson content before the engine that renders it is green.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LESS-01 | Lesson loader that fetches lesson by ID from bundled JSON | loader.ts already exists — `loadLesson(id)` returns typed `Lesson`; engine wraps it |
| LESS-02 | Lesson flow — content screen → exercise sequence → completion screen | React Native stack navigator within lesson; local state machine (intro/exercise/complete) |
| LESS-03 | Content renderer displaying lesson text with RTL-aware mixed Hebrew/English support | `Text` + RTL-safe layout; `lesson.content.body[lang]` via i18n helper |
| LESS-04 | Lesson completion fires events consumed by gamification engine | `completeLesson()` + `addXP()` already in store; Phase 3 adds XP logic on top |
| LESS-05 | Lesson progress tracked — not started / in progress / completed states | `completedLessons[]` and `unlockedLessons[]` already in useProgressStore |
| LESS-06 | Minimum 5 authored lessons for initial testing | lesson-01 exists; lessons 02-05 must be authored this phase |
| EXER-01 | Exercise type registry pattern | `Record<ExerciseType, ExerciseComponent>` — zero switch statements |
| EXER-02 | Multiple choice exercises with instant feedback | MCQExercise schema exists; need MCQCard component + evaluateMCQ() |
| EXER-03 | Pick-the-better-prompt exercises | PickBetterExercise schema exists; two-panel layout + evaluatePickBetter() |
| EXER-04 | Rewrite-the-bad-prompt (free text + rubric scoring) | FreeTextExercise schema exists; TextInput + evaluateFreeText() with checklist |
| EXER-06 | Fill-in-the-blank exercises | FillBlankExercise schema exists; inline blank TextInput + evaluateFillBlank() |
| EXER-07 | Spot-the-problem exercises | SpotProblemExercise schema exists; multi-select list + evaluateSpotProblem() |
| EXER-08 | Scoring rubric system — Clarity, Specificity, Context, Intent | RubricCriterion + PromptRubric already in schema.ts |
| EXER-09 | Score feedback with per-criterion breakdown | EvaluationResult.breakdown drives FeedbackCard component |
| EXER-10 | Checklist scoring (lessons 1-5), keyword-weighted rubric (lesson 6+) | scoringMethod: 'checklist' \| 'weighted-keyword' already on PromptRubric |
</phase_requirements>

---

## Standard Stack

### Core (already installed in Phase 1)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo / react-native | SDK 52+ / RN 0.76+ | UI rendering, navigation host | Project stack |
| expo-router | latest | File-based navigation | Project stack |
| zustand | 4.x | Global progress state | Installed Phase 1 |
| react-native-mmkv | 2.x | Persistence | Installed Phase 1 |
| typescript | 5.x | Type safety | Installed Phase 1 |

### New This Phase
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-haptics | latest | Tap feedback on correct/incorrect | Correct answer = `ImpactFeedbackStyle.Light`; incorrect = `NotificationFeedbackType.Error` |

**Installation (only new dep):**
```bash
npx expo install expo-haptics
```

### Not Needed This Phase
- Reanimated for lesson flow animations — plain React Native `Animated` or no animation is fine; Reanimated is Phase 3 (celebrations)
- Lottie — completion celebrations are Phase 3 scope
- Any NLP/ML library — keyword matching is intentionally simple for v1

---

## Architecture Patterns

### Recommended File Structure
```
PromptPlay/src/
├── features/
│   ├── lesson/
│   │   ├── LessonScreen.tsx          # Top-level: manages intro/exercise/complete state
│   │   ├── LessonContentScreen.tsx   # Renders lesson.content (title, body, tip)
│   │   ├── LessonCompletionScreen.tsx# XP awarded, "Next lesson" CTA
│   │   ├── useLessonSession.ts       # Local hook: currentStep, advance(), exit()
│   │   └── __tests__/
│   │       └── useLessonSession.test.ts
│   └── exercise/
│       ├── ExerciseRunner.tsx        # Looks up registry, renders component
│       ├── registry.ts               # EXERCISE_REGISTRY record
│       ├── evaluators/
│       │   ├── evaluateMCQ.ts
│       │   ├── evaluatePickBetter.ts
│       │   ├── evaluateFreeText.ts
│       │   ├── evaluateFillBlank.ts
│       │   ├── evaluateSpotProblem.ts
│       │   └── index.ts
│       ├── components/
│       │   ├── MCQCard.tsx
│       │   ├── PickBetterCard.tsx
│       │   ├── FreeTextCard.tsx
│       │   ├── FillBlankCard.tsx
│       │   ├── SpotProblemCard.tsx
│       │   └── FeedbackCard.tsx      # Shared per-criterion breakdown display
│       └── __tests__/
│           ├── evaluateMCQ.test.ts
│           ├── evaluatePickBetter.test.ts
│           ├── evaluateFreeText.test.ts
│           ├── evaluateFillBlank.test.ts
│           └── evaluateSpotProblem.test.ts
├── content/
│   ├── schema.ts                     # ALREADY EXISTS — do not modify
│   ├── loader.ts                     # ALREADY EXISTS — add lessons 02-05 to import map
│   ├── curriculum.ts                 # ALREADY EXISTS — add lesson IDs to chapter 1
│   └── lessons/
│       ├── lesson-01-what-is-prompting.json  # EXISTS
│       ├── lesson-02-clarity.json            # AUTHOR THIS PHASE
│       ├── lesson-03-specificity.json        # AUTHOR THIS PHASE
│       ├── lesson-04-context.json            # AUTHOR THIS PHASE
│       └── lesson-05-intent.json             # AUTHOR THIS PHASE
```

### Pattern 1: Lesson Session State Machine
**What:** A local hook manages the lesson flow as a simple state machine: `intro → exercise[0] → exercise[1] → ... → complete`
**When to use:** Single lesson session; state resets when user navigates away

```typescript
// src/features/lesson/useLessonSession.ts
type LessonStep =
  | { phase: 'intro' }
  | { phase: 'exercise'; index: number }
  | { phase: 'complete'; totalScore: number }

function useLessonSession(lesson: Lesson) {
  const [step, setStep] = useState<LessonStep>({ phase: 'intro' })

  const advance = (score?: number) => {
    if (step.phase === 'intro') {
      setStep({ phase: 'exercise', index: 0 })
    } else if (step.phase === 'exercise') {
      const next = step.index + 1
      if (next < lesson.exercises.length) {
        setStep({ phase: 'exercise', index: next })
      } else {
        setStep({ phase: 'complete', totalScore: score ?? 0 })
      }
    }
  }

  return { step, advance }
}
```

### Pattern 2: Exercise Type Registry
**What:** A record mapping ExerciseType keys to React components; ExerciseRunner does a single lookup
**When to use:** Always — adding a new type requires only creating a component and adding one entry

```typescript
// src/features/exercise/registry.ts
import type { Exercise } from '@/content/schema'
import { MCQCard } from './components/MCQCard'
import { PickBetterCard } from './components/PickBetterCard'
import { FreeTextCard } from './components/FreeTextCard'
import { FillBlankCard } from './components/FillBlankCard'
import { SpotProblemCard } from './components/SpotProblemCard'

type ExerciseComponent = React.ComponentType<{
  exercise: Exercise
  onComplete: (result: EvaluationResult) => void
}>

export const EXERCISE_REGISTRY: Partial<Record<Exercise['type'], ExerciseComponent>> = {
  'mcq':          MCQCard,
  'pick-better':  PickBetterCard,
  'free-text':    FreeTextCard,
  'fill-blank':   FillBlankCard,
  'spot-problem': SpotProblemCard,
  // 'simulated-chat': deferred to Phase 5
}

// ExerciseRunner.tsx
export function ExerciseRunner({ exercise, onComplete }: Props) {
  const Component = EXERCISE_REGISTRY[exercise.type]
  if (!Component) return <Text>Exercise type not yet implemented</Text>
  return <Component exercise={exercise} onComplete={onComplete} />
}
```

### Pattern 3: Pure Evaluator Functions
**What:** Each exercise type has a standalone evaluator that takes exercise + answer and returns EvaluationResult
**When to use:** All evaluation logic — pure functions are easy to unit-test with jest

```typescript
// EvaluationResult — the contract all evaluators return
export interface EvaluationResult {
  score: number           // 0-100
  passed: boolean
  feedback: LocalizedString
  breakdown?: Record<string, number>  // Per-criterion scores (for rubric types)
}

// evaluateMCQ.ts — simplest evaluator
export function evaluateMCQ(
  exercise: MCQExercise,
  selectedIndex: number
): EvaluationResult {
  const passed = selectedIndex === exercise.correctIndex
  return {
    score: passed ? 100 : 0,
    passed,
    feedback: exercise.explanation,
    breakdown: undefined,
  }
}

// evaluateFreeText.ts — checklist mode (lessons 1-5)
export function evaluateFreeText(
  exercise: FreeTextExercise,
  answer: string
): EvaluationResult {
  const text = answer.toLowerCase()
  const breakdown: Record<string, number> = {}
  let score = 0

  if (exercise.rubric.scoringMethod === 'checklist') {
    // Binary: each criterion is pass/fail, equal weight
    const weight = 100 / exercise.rubric.criteria.length
    for (const criterion of exercise.rubric.criteria) {
      const hit = criterion.keywords.some(kw => text.includes(kw.toLowerCase()))
      breakdown[criterion.key] = hit ? weight : 0
      score += breakdown[criterion.key]
    }
  } else {
    // weighted-keyword: use criterion.weight
    for (const criterion of exercise.rubric.criteria) {
      const hit = criterion.keywords.some(kw => text.includes(kw.toLowerCase()))
      breakdown[criterion.key] = hit ? criterion.weight * 100 : 0
      score += breakdown[criterion.key]
    }
  }

  return {
    score: Math.round(score),
    passed: score >= exercise.rubric.passingScore,
    feedback: score >= exercise.rubric.passingScore
      ? exercise.positiveFeedback
      : exercise.improvementFeedback,
    breakdown,
  }
}
```

### Pattern 4: LessonScreen Top-Level Coordinator
**What:** A single screen component that owns the lesson session and routes to sub-screens
**When to use:** Lesson entry point from navigation

```typescript
// app/(lesson)/[lessonId].tsx  OR  a modal/stack within tabs
export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>()
  const lesson = useMemo(() => loadLesson(lessonId), [lessonId])
  const { step, advance } = useLessonSession(lesson)
  const { completeLesson, addXP } = useProgressStore()

  const handleComplete = (totalScore: number) => {
    completeLesson(lesson.id)
    addXP(lesson.xpReward, 'lesson')
    // Phase 3 will also call gamification engine here
  }

  if (step.phase === 'intro') {
    return <LessonContentScreen lesson={lesson} onContinue={() => advance()} />
  }
  if (step.phase === 'exercise') {
    const exercise = lesson.exercises[step.index]
    return (
      <ExerciseRunner
        exercise={exercise}
        onComplete={(result) => advance(result.score)}
      />
    )
  }
  return <LessonCompletionScreen lesson={lesson} onNext={handleComplete} />
}
```

### Pattern 5: Scoring Feedback Display
**What:** FeedbackCard renders the EvaluationResult breakdown visually after any rubric-based exercise
**When to use:** After free-text and fill-blank submission; not needed for MCQ/pick-better (explanation text is sufficient)

```typescript
// Criterion breakdown display (RTL-safe)
<View style={styles.breakdown}>
  {Object.entries(breakdown).map(([key, score]) => (
    <View key={key} style={styles.criterionRow}>
      <Text style={styles.criterionLabel}>{t(`rubric.${key}`)}</Text>
      <View style={[styles.bar, { width: `${score}%` }]} />
      <Text style={styles.criterionScore}>{Math.round(score)}%</Text>
    </View>
  ))}
</View>
```

### Anti-Patterns to Avoid
- **Switch statements in ExerciseRunner:** Every new exercise type requires editing the runner. Use the registry instead.
- **Evaluator logic in components:** FreeTextCard must not score itself. Pass answer up to evaluator, pass result back down.
- **Storing exercise answers in Zustand:** In-progress answers are component-local state. Only the final EvaluationResult matters to the store.
- **Hardcoded `left`/`right` in exercise layouts:** PickBetter two-panel layout, FillBlank inline input — all must use `paddingStart/End`.
- **Advancing on wrong answer without feedback:** Always show feedback before advancing. User must see why they were wrong.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Text input for free-text/fill-blank | Custom text field | React Native `TextInput` | Handles keyboard avoidance, focus management, accessibility |
| Keyword normalization | Custom string matcher | `toLowerCase()` + `includes()` | v1 rubrics are hand-tuned; simple matching is intentional |
| Exercise progress indicator | Custom progress bar | Simple fraction `{index+1}/{total}` text or View width percentage | Reanimated progress bar is Phase 3 polish |
| Lesson completion XP animation | Custom animation | Plain text display this phase | Lottie celebration is Phase 3 |

**Key insight:** This phase prioritizes correctness and test coverage over visual polish. Animations and celebrations are Phase 3 scope.

---

## Common Pitfalls

### Pitfall 1: Lesson Flow Navigation
**What goes wrong:** Using Expo Router stack navigation for the intro→exercise→complete sequence causes back-button issues (user navigates back mid-lesson and loses state) and multiple screen pushes for a single lesson.
**Why it happens:** Treating each exercise as a separate route rather than a view state.
**How to avoid:** Use a single route (`/lesson/[lessonId]`) with local state machine (`useLessonSession`) managing which sub-view renders. The router has one entry and one exit.
**Warning signs:** `router.push('/exercise/0')`, `router.push('/exercise/1')` pattern — wrong.

### Pitfall 2: Free-Text Scoring Too Strict
**What goes wrong:** Rubric keywords miss obvious synonyms ("specific" vs "specific detail" vs "detailed"). User writes a clearly good prompt, scores 0.
**Why it happens:** Keywords are hand-authored and don't account for synonyms.
**How to avoid:** For checklist mode (lessons 1-5), use 3-5 short keywords per criterion covering common variations. Set `passingScore` to 50 (not 100) — partial credit passes. Always show `modelAnswer` after submission regardless of score.
**Warning signs:** Playtest each free-text exercise yourself before shipping. If you can't pass it easily with a reasonable answer, the rubric is too strict.

### Pitfall 3: SpotProblem Multi-Select Confusion
**What goes wrong:** SpotProblem has both `issues` (correct) and `distractors` (wrong). If the component shows all issues + distractors shuffled, the evaluator must track which selections are correct vs. distractor hits.
**Why it happens:** Treating SpotProblem like MCQ (single correct answer) when it allows multiple correct selections.
**How to avoid:** Evaluator checks: every selected item is in `issues` AND at least one issue is selected. Score = (correct selected / total issues) * 100.
**Warning signs:** Evaluator that only checks `selectedItems.every(...)` without checking coverage of all issues.

### Pitfall 4: FillBlank Answer Matching Case/Whitespace
**What goes wrong:** User types "Make it clearer" — `acceptableAnswers` has "clearer" — but `includes()` fails because the template has trailing space.
**Why it happens:** String matching without normalization.
**How to avoid:** Normalize both answer and acceptableAnswers: `trim().toLowerCase()`.

### Pitfall 5: RTL in Two-Panel PickBetter Layout
**What goes wrong:** "Option A | Option B" side-by-side panel renders as "Option B | Option A" in Hebrew (RTL flips flex direction).
**Why it happens:** Flex row reverses in RTL automatically.
**How to avoid:** Either (a) stack panels vertically (no RTL issue), or (b) explicitly label them by option letter not position. Recommended: vertical stacking is simpler and works better on small screens anyway.

### Pitfall 6: loader.ts Static Import Map Must Be Updated
**What goes wrong:** Lessons 02-05 are authored as JSON but `loadLesson('lesson-02-clarity')` throws "Lesson not found".
**Why it happens:** Metro bundler requires static imports — dynamic `require(path)` won't work.
**How to avoid:** Every new lesson JSON must be added to the static import map in `loader.ts` AND added to `curriculum.ts` chapter lessonIds array.

### Pitfall 7: Exercise Component Doesn't Reset State Between Exercises
**What goes wrong:** User answers MCQ exercise 1, sees feedback, advances to exercise 2 — previous selection state is still visible.
**Why it happens:** Component is reused with a different `exercise` prop but internal `useState` persists.
**How to avoid:** Use `key={exercise.id}` on ExerciseRunner (or the individual component). React will unmount/remount on key change, resetting all local state cleanly.

---

## Code Examples

### Lesson Content Renderer (RTL-aware)
```typescript
// src/features/lesson/LessonContentScreen.tsx
import { useTranslation } from 'react-i18next'
import { isRTL } from '@/i18n'

export function LessonContentScreen({ lesson, onContinue }: Props) {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'he'

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{lesson.content.title[lang]}</Text>
      <Text style={[styles.body, isRTL() && styles.rtlText]}>
        {lesson.content.body[lang]}
      </Text>
      {lesson.content.tip && (
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>{lesson.content.tip[lang]}</Text>
        </View>
      )}
      <Pressable onPress={onContinue} style={styles.cta}>
        <Text style={styles.ctaText}>Start</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 24 },
  body: { fontSize: 16, lineHeight: 24 },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  tipBox: {
    marginTop: 16,
    paddingStart: 12,           // RTL-safe
    borderStartWidth: 3,        // RTL-safe
    borderStartColor: '#6C63FF',
  },
})
```

### FillBlank Evaluator
```typescript
// src/features/exercise/evaluators/evaluateFillBlank.ts
export function evaluateFillBlank(
  exercise: FillBlankExercise,
  answer: string,
  lang: 'en' | 'he'
): EvaluationResult {
  const normalized = answer.trim().toLowerCase()
  const acceptable = exercise.acceptableAnswers.map(a => a[lang].trim().toLowerCase())
  const passed = acceptable.some(a => normalized.includes(a) || a.includes(normalized))

  return {
    score: passed ? 100 : 0,
    passed,
    feedback: exercise.explanation,
  }
}
```

### Haptic Feedback on Answer
```typescript
import * as Haptics from 'expo-haptics'

// In exercise component after evaluation:
if (result.passed) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
} else {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
}
```

### Authored Lesson JSON Template (lessons 02-05)
```json
{
  "id": "lesson-02-clarity",
  "order": 2,
  "chapter": 1,
  "prerequisites": ["lesson-01-what-is-prompting"],
  "xpReward": 10,
  "content": {
    "title": { "en": "Be Clear", "he": "היו ברורים" },
    "body": { "en": "...", "he": "..." },
    "tip": { "en": "...", "he": "..." }
  },
  "exercises": [
    {
      "id": "lesson-02-ex-01",
      "type": "mcq",
      "order": 1,
      "prompt": { "en": "...", "he": "..." },
      "options": [{ "en": "...", "he": "..." }],
      "correctIndex": 0,
      "explanation": { "en": "...", "he": "..." }
    },
    {
      "id": "lesson-02-ex-02",
      "type": "free-text",
      "order": 2,
      "prompt": { "en": "Rewrite this vague prompt to be clearer:", "he": "..." },
      "starterPrompt": { "en": "Help me write something.", "he": "..." },
      "rubric": {
        "scoringMethod": "checklist",
        "passingScore": 50,
        "criteria": [
          {
            "key": "clarity",
            "label": { "en": "Clear goal", "he": "מטרה ברורה" },
            "weight": 0.5,
            "keywords": ["write", "create", "draft", "make"],
            "required": false
          },
          {
            "key": "specificity",
            "label": { "en": "Specific details", "he": "פרטים ספציפיים" },
            "weight": 0.5,
            "keywords": ["email", "paragraph", "sentence", "words"],
            "required": false
          }
        ]
      },
      "modelAnswer": { "en": "Write a 3-sentence apology email to my client explaining the delivery delay.", "he": "..." },
      "positiveFeedback": { "en": "Great! Your prompt is clear and specific.", "he": "..." },
      "improvementFeedback": { "en": "Try adding what type of content and who it's for.", "he": "..." }
    }
  ]
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Each exercise as separate route | Single LessonScreen with local state machine | No back-navigation leakage, simpler state |
| Evaluator logic inside component | Pure evaluator functions, component only renders | Testable without mounting React components |
| `marginLeft/Right` in StyleSheet | `marginStart/End` + `paddingStart/End` | RTL-safe from creation, no future rework |
| Dynamic `require()` for lesson JSON | Static import map in loader.ts | Metro bundler compatible, tree-shakable |

---

## Open Questions

1. **Navigation entry point for lessons**
   - What we know: Expo Router is file-based; lessons navigate from skill tree (Phase 4 scope)
   - What's unclear: Should the lesson route live at `app/(tabs)/lesson/[lessonId].tsx` (tab-nested) or `app/lesson/[lessonId].tsx` (modal/full-screen)?
   - Recommendation: Use `app/(lesson)/[lessonId].tsx` as a separate group that renders full-screen without the tab bar. This is the standard Expo Router pattern for detail screens. Wire a temporary "Start Lesson" button on the Home tab for Phase 2 testing.

2. **FillBlank answer matching threshold**
   - What we know: Simple `includes()` matching is intentional for v1
   - What's unclear: Hebrew answer matching may need different normalization (no lowercase concept for some Hebrew characters)
   - Recommendation: For Hebrew, use `trim()` only (no `toLowerCase()`). Test at least one Hebrew fill-blank exercise manually before shipping.

3. **Progress bar design during exercises**
   - What we know: SUMMARY.md confirms "Exercise 2 of 4" progress indicator is table-stakes UX
   - What's unclear: Whether to show a visual bar or just text counter this phase
   - Recommendation: Ship a simple text counter (`{index+1} / {total}`) in Phase 2. Animated progress bar is Phase 3.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | jest + ts-jest (configured in Phase 1) |
| Config file | `PromptPlay/jest.config.js` |
| Quick run command | `npx jest src/features/exercise/evaluators/ --testPathPattern evaluators` |
| Full suite command | `npx jest --testPathPattern "src/(features\|content)"` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LESS-01 | loadLesson returns typed Lesson | unit | `npx jest src/content/loader` | ✅ (existing) |
| LESS-02 | useLessonSession advances intro→exercise→complete | unit | `npx jest src/features/lesson/useLessonSession` | ❌ Wave 0 |
| LESS-05 | completeLesson adds to completedLessons | unit | `npx jest src/store/useProgressStore` | ❌ Wave 0 |
| EXER-01 | EXERCISE_REGISTRY contains all 5 types | unit | `npx jest src/features/exercise/registry` | ❌ Wave 0 |
| EXER-02 | evaluateMCQ returns passed=true for correct index | unit | `npx jest src/features/exercise/evaluators/evaluateMCQ` | ❌ Wave 0 |
| EXER-03 | evaluatePickBetter returns passed for correct option | unit | `npx jest src/features/exercise/evaluators/evaluatePickBetter` | ❌ Wave 0 |
| EXER-04 | evaluateFreeText checklist scores partial credit | unit | `npx jest src/features/exercise/evaluators/evaluateFreeText` | ❌ Wave 0 |
| EXER-06 | evaluateFillBlank matches acceptable answers | unit | `npx jest src/features/exercise/evaluators/evaluateFillBlank` | ❌ Wave 0 |
| EXER-07 | evaluateSpotProblem handles multi-select correctly | unit | `npx jest src/features/exercise/evaluators/evaluateSpotProblem` | ❌ Wave 0 |
| EXER-08 | validateRubricWeights passes for well-formed rubric | unit | `npx jest src/content/schema` | ✅ (existing — 11 tests) |
| EXER-10 | evaluateFreeText uses checklist vs weighted-keyword based on scoringMethod | unit | `npx jest src/features/exercise/evaluators/evaluateFreeText` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest src/features/exercise/evaluators/ --passWithNoTests`
- **Per wave merge:** `npx jest --testPathPattern "src/(features|content|store)"`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `PromptPlay/src/features/lesson/__tests__/useLessonSession.test.ts` — covers LESS-02, LESS-05
- [ ] `PromptPlay/src/features/exercise/__tests__/registry.test.ts` — covers EXER-01
- [ ] `PromptPlay/src/features/exercise/evaluators/__tests__/evaluateMCQ.test.ts` — covers EXER-02
- [ ] `PromptPlay/src/features/exercise/evaluators/__tests__/evaluatePickBetter.test.ts` — covers EXER-03
- [ ] `PromptPlay/src/features/exercise/evaluators/__tests__/evaluateFreeText.test.ts` — covers EXER-04, EXER-08, EXER-10
- [ ] `PromptPlay/src/features/exercise/evaluators/__tests__/evaluateFillBlank.test.ts` — covers EXER-06
- [ ] `PromptPlay/src/features/exercise/evaluators/__tests__/evaluateSpotProblem.test.ts` — covers EXER-07

Note: LESS-03 (content renderer RTL), LESS-04 (completion fires events), EXER-09 (feedback display) are UI concerns best validated manually; no unit test can fully cover them.

---

## Sources

### Primary (HIGH confidence)
- `PromptPlay/src/content/schema.ts` — all exercise types, rubric shape confirmed
- `PromptPlay/src/content/loader.ts` — static import map pattern confirmed
- `PromptPlay/src/store/useProgressStore.ts` — `completeLesson()`, `addXP()`, `unlockLesson()` confirmed present
- `PromptPlay/src/content/lessons/lesson-01-what-is-prompting.json` — seed lesson structure confirmed
- `.planning/research/ARCHITECTURE.md` — exercise registry pattern, evaluator pattern, data flow diagram

### Secondary (MEDIUM confidence)
- `.planning/research/SUMMARY.md` — scoring approach (checklist vs weighted), exercise mix targets
- `.planning/phases/01-foundation/01-03-SUMMARY.md` — decisions: static import map, discriminated union, TDD pattern confirmed

### Tertiary (LOW confidence — none needed)
All findings are grounded in existing shipped code and prior architecture research. No unverified claims.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies confirmed in Phase 1 package.json; only expo-haptics is new
- Architecture: HIGH — patterns directly specified in ARCHITECTURE.md and confirmed by shipped loader/schema code
- Exercise evaluators: HIGH — pure function patterns with existing schema types; no external library uncertainty
- Authored content (lessons 02-05): MEDIUM — content quality/keyword tuning requires manual playtesting
- Pitfalls: HIGH — backed by existing architecture decisions and known React Native patterns

**Research date:** 2026-03-28
**Valid until:** 2026-06-28 (stable stack, 90 days)
