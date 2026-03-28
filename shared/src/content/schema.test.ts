import {
  LocalizedString,
  PromptRubric,
  MCQExercise,
  FreeTextExercise,
  PickBetterExercise,
  FillBlankExercise,
  SpotProblemExercise,
  SimulatedChatExercise,
  Lesson,
  validateRubricWeights,
} from './schema'
import { loadLesson } from './loader'

// Helper: assert a lesson has valid runtime shape
function assertValidLesson(lesson: Lesson): void {
  expect(lesson.id).toBeTruthy()
  expect(Array.isArray(lesson.exercises)).toBe(true)
  for (const ex of lesson.exercises) {
    expect(ex.id).toBeTruthy()
    expect(ex.type).toBeTruthy()
    expect(ex.prompt).toBeDefined()
    expect(typeof ex.prompt.en).toBe('string')
    expect(typeof ex.prompt.he).toBe('string')
  }
}

// --- Test 1: Valid Lesson object type-checks ---
describe('Lesson interface', () => {
  it('Test 1: a valid Lesson object satisfies the Lesson interface shape', () => {
    const lesson: Lesson = {
      id: 'lesson-test',
      order: 1,
      chapter: 1,
      prerequisites: [],
      xpReward: 10,
      content: {
        title: { en: 'Test Lesson', he: 'שיעור בדיקה' },
        body: { en: 'Body text', he: 'טקסט גוף' },
      },
      exercises: [],
    }
    expect(lesson.id).toBe('lesson-test')
    expect(lesson.prerequisites).toEqual([])
    expect(lesson.xpReward).toBe(10)
  })
})

// --- Test 2: LocalizedString requires both 'en' and 'he' ---
describe('LocalizedString', () => {
  it('Test 2: LocalizedString requires both en and he fields', () => {
    const ls: LocalizedString = { en: 'Hello', he: 'שלום' }
    expect(ls.en).toBe('Hello')
    expect(ls.he).toBe('שלום')
  })
})

// --- Test 3: MCQExercise ---
describe('MCQExercise', () => {
  it('Test 3: MCQExercise has type mcq, options, correctIndex, explanation', () => {
    const ex: MCQExercise = {
      id: 'ex-mcq-1',
      type: 'mcq',
      prompt: { en: 'What is a prompt?', he: 'מה זה פרומפט?' },
      order: 1,
      options: [
        { en: 'Option A', he: 'אפשרות א' },
        { en: 'Option B', he: 'אפשרות ב' },
      ],
      correctIndex: 0,
      explanation: { en: 'Because A is right', he: 'כי א נכון' },
    }
    expect(ex.type).toBe('mcq')
    expect(ex.options).toHaveLength(2)
    expect(ex.correctIndex).toBe(0)
    expect(ex.explanation.en).toBeTruthy()
  })
})

// --- Test 4: FreeTextExercise ---
describe('FreeTextExercise', () => {
  it('Test 4: FreeTextExercise has type free-text, optional simulatedResponse, and rubric', () => {
    const rubric: PromptRubric = {
      criteria: [
        {
          key: 'clarity',
          label: { en: 'Clarity', he: 'בהירות' },
          weight: 1.0,
          keywords: ['clear', 'specific'],
          required: true,
        },
      ],
      passingScore: 70,
      scoringMethod: 'checklist',
    }
    const ex: FreeTextExercise = {
      id: 'ex-ft-1',
      type: 'free-text',
      prompt: { en: 'Rewrite this prompt', he: 'שכתב את הפרומפט' },
      order: 2,
      rubric,
      modelAnswer: { en: 'A clear prompt', he: 'פרומפט ברור' },
      positiveFeedback: { en: 'Great!', he: 'נהדר!' },
      improvementFeedback: { en: 'Try being more specific', he: 'נסה להיות יותר ספציפי' },
    }
    expect(ex.type).toBe('free-text')
    expect(ex.simulatedResponse).toBeUndefined()
    expect(ex.rubric.criteria).toHaveLength(1)
  })
})

// --- Test 5: PickBetterExercise ---
describe('PickBetterExercise', () => {
  it('Test 5: PickBetterExercise has type pick-better, optionA, optionB, betterOption, explanation', () => {
    const ex: PickBetterExercise = {
      id: 'ex-pb-1',
      type: 'pick-better',
      prompt: { en: 'Which is better?', he: 'מה יותר טוב?' },
      order: 3,
      optionA: { en: 'Vague prompt', he: 'פרומפט מעורפל' },
      optionB: { en: 'Specific prompt', he: 'פרומפט ספציפי' },
      betterOption: 'B',
      explanation: { en: 'B is more specific', he: 'ב יותר ספציפי' },
    }
    expect(ex.type).toBe('pick-better')
    expect(ex.betterOption).toBe('B')
    expect(ex.optionA.en).toBeTruthy()
    expect(ex.optionB.en).toBeTruthy()
  })
})

// --- Test 6: FillBlankExercise ---
describe('FillBlankExercise', () => {
  it('Test 6: FillBlankExercise has type fill-blank, template with blank marker, acceptableAnswers', () => {
    const ex: FillBlankExercise = {
      id: 'ex-fb-1',
      type: 'fill-blank',
      prompt: { en: 'Fill in the blank', he: 'מלא את החסר' },
      order: 4,
      template: { en: 'Write a ___ prompt', he: 'כתוב פרומפט ___' },
      acceptableAnswers: [
        { en: 'clear', he: 'ברור' },
        { en: 'specific', he: 'ספציפי' },
      ],
      explanation: { en: 'Both are correct', he: 'שניהם נכונים' },
    }
    expect(ex.type).toBe('fill-blank')
    expect(ex.template.en).toContain('___')
    expect(ex.acceptableAnswers).toHaveLength(2)
  })
})

// --- Test 7: SpotProblemExercise ---
describe('SpotProblemExercise', () => {
  it('Test 7: SpotProblemExercise has type spot-problem, problematicPrompt, issues, hints', () => {
    const ex: SpotProblemExercise = {
      id: 'ex-sp-1',
      type: 'spot-problem',
      prompt: { en: 'What is wrong with this prompt?', he: 'מה לא בסדר עם הפרומפט הזה?' },
      order: 5,
      problematicPrompt: { en: 'Do something', he: 'עשה משהו' },
      issues: [{ en: 'Too vague', he: 'מעורפל מדי' }],
      distractors: [{ en: 'Too long', he: 'ארוך מדי' }],
      hints: [{ en: 'Think about specificity', he: 'חשוב על ספציפיות' }],
      explanation: { en: 'The prompt lacks specifics', he: 'הפרומפט חסר ספציפיות' },
    }
    expect(ex.type).toBe('spot-problem')
    expect(ex.issues).toHaveLength(1)
    expect(ex.hints).toHaveLength(1)
  })
})

// --- Test 8: SimulatedChatExercise ---
describe('SimulatedChatExercise', () => {
  it('Test 8: SimulatedChatExercise has type simulated-chat, optional systemContext, preScriptedResponse, rubric', () => {
    const rubric: PromptRubric = {
      criteria: [
        {
          key: 'intent',
          label: { en: 'Intent', he: 'כוונה' },
          weight: 1.0,
          keywords: ['intent', 'goal'],
          required: true,
        },
      ],
      passingScore: 60,
      scoringMethod: 'weighted-keyword',
    }
    const ex: SimulatedChatExercise = {
      id: 'ex-sc-1',
      type: 'simulated-chat',
      prompt: { en: 'Write a prompt to get a recipe', he: 'כתוב פרומפט לקבלת מתכון' },
      order: 6,
      preScriptedResponse: { en: 'Here is a recipe...', he: 'הנה מתכון...' },
      rubric,
      modelAnswer: { en: 'Give me a recipe for pasta', he: 'תן לי מתכון לפסטה' },
      positiveFeedback: { en: 'Well done!', he: 'כל הכבוד!' },
      improvementFeedback: { en: 'Try adding more context', he: 'נסה להוסיף יותר הקשר' },
    }
    expect(ex.type).toBe('simulated-chat')
    expect(ex.systemContext).toBeUndefined()
    expect(ex.preScriptedResponse.en).toBeTruthy()
  })
})

// --- Test 9: PromptRubric weights sum to 1.0 ---
describe('validateRubricWeights', () => {
  it('Test 9a: returns true when weights sum to 1.0', () => {
    const rubric: PromptRubric = {
      criteria: [
        { key: 'clarity', label: { en: 'Clarity', he: 'בהירות' }, weight: 0.5, keywords: [], required: false },
        { key: 'specificity', label: { en: 'Specificity', he: 'ספציפיות' }, weight: 0.5, keywords: [], required: false },
      ],
      passingScore: 70,
      scoringMethod: 'weighted-keyword',
    }
    expect(validateRubricWeights(rubric)).toBe(true)
  })

  it('Test 9b: returns false when weights do not sum to 1.0', () => {
    const rubric: PromptRubric = {
      criteria: [
        { key: 'clarity', label: { en: 'Clarity', he: 'בהירות' }, weight: 0.4, keywords: [], required: false },
        { key: 'specificity', label: { en: 'Specificity', he: 'ספציפיות' }, weight: 0.3, keywords: [], required: false },
      ],
      passingScore: 70,
      scoringMethod: 'weighted-keyword',
    }
    expect(validateRubricWeights(rubric)).toBe(false)
  })
})

// --- Test 10: Seed lesson JSON conforms to Lesson interface ---
describe('Seed lesson', () => {
  it('Test 10: seed lesson JSON conforms to Lesson interface via assertValidLesson', () => {
    const lesson: Lesson = loadLesson('lesson-01-what-is-prompting')
    assertValidLesson(lesson)
    expect(lesson.id).toBe('lesson-01-what-is-prompting')
    expect(lesson.exercises.length).toBeGreaterThanOrEqual(2)
  })
})
