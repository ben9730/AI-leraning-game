// Content schema — single source of truth for all content types
// All downstream phases (lesson engine, exercise runner, scoring) depend on these types.

// ---------------------------------------------------------------------------
// Localization
// ---------------------------------------------------------------------------

export interface LocalizedString {
  en: string
  he: string
}

// ---------------------------------------------------------------------------
// Exercise type discriminant
// ---------------------------------------------------------------------------

export type ExerciseType =
  | 'mcq'
  | 'free-text'
  | 'pick-better'
  | 'fill-blank'
  | 'spot-problem'
  | 'simulated-chat'

// ---------------------------------------------------------------------------
// Scoring rubric (used by free-text and simulated-chat)
// ---------------------------------------------------------------------------

export interface RubricCriterion {
  key: 'clarity' | 'specificity' | 'context' | 'intent'
  label: LocalizedString
  weight: number         // All weights in a rubric must sum to 1.0
  keywords: string[]     // Keyword presence signals criterion met
  required: boolean      // If true, failing this criterion = overall fail
}

export interface PromptRubric {
  criteria: RubricCriterion[]
  passingScore: number                          // 0-100
  scoringMethod: 'checklist' | 'weighted-keyword' // checklist for lessons 1-5, weighted from 6+
}

// ---------------------------------------------------------------------------
// Base exercise interface
// ---------------------------------------------------------------------------

export interface ExerciseBase {
  id: string
  type: ExerciseType
  prompt: LocalizedString
  hint?: LocalizedString
  order: number
}

// ---------------------------------------------------------------------------
// Exercise type: Multiple Choice
// ---------------------------------------------------------------------------

export interface MCQExercise extends ExerciseBase {
  type: 'mcq'
  options: LocalizedString[]
  correctIndex: number
  explanation: LocalizedString
}

// ---------------------------------------------------------------------------
// Exercise type: Free Text (rewrite the bad prompt)
// ---------------------------------------------------------------------------

export interface FreeTextExercise extends ExerciseBase {
  type: 'free-text'
  starterPrompt?: LocalizedString      // The bad prompt to rewrite
  simulatedResponse?: LocalizedString  // Pre-scripted "AI" response to show
  rubric: PromptRubric
  modelAnswer: LocalizedString         // Shown after submission as "one strong version"
  positiveFeedback: LocalizedString
  improvementFeedback: LocalizedString
}

// ---------------------------------------------------------------------------
// Exercise type: Pick the Better Prompt
// ---------------------------------------------------------------------------

export interface PickBetterExercise extends ExerciseBase {
  type: 'pick-better'
  optionA: LocalizedString
  optionB: LocalizedString
  betterOption: 'A' | 'B'
  explanation: LocalizedString
}

// ---------------------------------------------------------------------------
// Exercise type: Fill in the Blank
// ---------------------------------------------------------------------------

export interface FillBlankBlank {
  placeholder?: LocalizedString
  acceptableAnswers: Record<string, string[]>  // lang -> acceptable strings
}

export interface FillBlankExercise extends ExerciseBase {
  type: 'fill-blank'
  template: LocalizedString             // Contains "___" or "_[placeholder]_" as blank markers
  acceptableAnswers?: LocalizedString[] // Old format: single blank with LocalizedString answers
  blanks?: FillBlankBlank[]             // New format: per-blank acceptable answers
  explanation: LocalizedString
}

// ---------------------------------------------------------------------------
// Exercise type: Spot the Problem
// ---------------------------------------------------------------------------

export interface SpotProblemItem {
  label?: LocalizedString               // New format: item label
  en?: string                           // Old format: bare LocalizedString
  he?: string
  isActualIssue?: boolean               // New format: flag for real issues vs distractors
}

export interface SpotProblemExercise extends ExerciseBase {
  type: 'spot-problem'
  problematicPrompt?: LocalizedString   // Old format field name
  badExample?: LocalizedString          // New format field name
  issues: SpotProblemItem[]             // Issues (and possibly distractors in new format)
  distractors?: SpotProblemItem[]       // Old format: separate distractors array
  hints: LocalizedString[]
  explanation: LocalizedString
}

// ---------------------------------------------------------------------------
// Exercise type: Simulated AI Chat (Phase 5 — interface defined now)
// ---------------------------------------------------------------------------

export interface SimulatedChatExercise extends ExerciseBase {
  type: 'simulated-chat'
  systemContext?: LocalizedString       // Background context shown to user
  systemPrompt?: LocalizedString        // Alias for systemContext (content variant)
  preScriptedResponse?: LocalizedString // "AI" response to user's prompt
  rubric: PromptRubric
  modelAnswer: LocalizedString
  positiveFeedback: LocalizedString
  improvementFeedback: LocalizedString
}

// ---------------------------------------------------------------------------
// Union type for all exercises
// ---------------------------------------------------------------------------

export type Exercise =
  | MCQExercise
  | FreeTextExercise
  | PickBetterExercise
  | FillBlankExercise
  | SpotProblemExercise
  | SimulatedChatExercise

// ---------------------------------------------------------------------------
// Lesson
// ---------------------------------------------------------------------------

export interface Lesson {
  id: string
  order: number
  chapter: number             // 1-based chapter number
  prerequisites: string[]     // Lesson IDs that must be completed first
  xpReward: number
  content: {
    title: LocalizedString
    body: LocalizedString
    tip?: LocalizedString
  }
  exercises: Exercise[]
}

// ---------------------------------------------------------------------------
// Chapter metadata
// ---------------------------------------------------------------------------

export interface Chapter {
  id: number
  title: LocalizedString
  description: LocalizedString
  lessonIds: string[]
}

// ---------------------------------------------------------------------------
// Validation helper
// ---------------------------------------------------------------------------

export function validateRubricWeights(rubric: PromptRubric): boolean {
  const sum = rubric.criteria.reduce((acc, c) => acc + c.weight, 0)
  return Math.abs(sum - 1.0) < 0.001 // Float tolerance
}
