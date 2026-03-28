import { evaluateSimulatedChat } from '../evaluateSimulatedChat'
import type { SimulatedChatExercise } from '../../../content/schema'

const makeExercise = (overrides?: Partial<SimulatedChatExercise>): SimulatedChatExercise => ({
  id: 'ex-sim-1',
  type: 'simulated-chat',
  order: 1,
  prompt: { en: 'Write a prompt to get a recipe', he: 'כתוב פרומפט לקבלת מתכון' },
  systemContext: { en: 'You are asking an AI chef assistant', he: 'אתה מבקש ממסייע שף AI' },
  preScriptedResponse: {
    en: 'Here is a great recipe for pasta!',
    he: 'הנה מתכון נהדר לפסטה!',
  },
  rubric: {
    criteria: [
      {
        key: 'clarity',
        label: { en: 'Clarity', he: 'בהירות' },
        weight: 0.5,
        keywords: ['clear', 'specific'],
        required: false,
      },
      {
        key: 'context',
        label: { en: 'Context', he: 'הקשר' },
        weight: 0.5,
        keywords: ['because', 'in order to'],
        required: false,
      },
    ],
    passingScore: 60,
    scoringMethod: 'checklist',
  },
  modelAnswer: { en: 'A clear, specific prompt with context', he: 'פרומפט ברור וספציפי עם הקשר' },
  positiveFeedback: { en: 'Great job!', he: 'כל הכבוד!' },
  improvementFeedback: { en: 'Try to be more specific', he: 'נסה להיות יותר ספציפי' },
  ...overrides,
})

describe('evaluateSimulatedChat — checklist mode', () => {
  it('scores 100 when answer matches all weighted-keyword criteria (weights sum to 1.0)', () => {
    const result = evaluateSimulatedChat(
      makeExercise(),
      'Please write a clear and specific recipe because I need help',
      'en',
    )
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
    expect(result.feedback).toEqual(makeExercise().positiveFeedback)
  })

  it('scores proportionally when only some criteria matched', () => {
    const result = evaluateSimulatedChat(
      makeExercise(),
      'Write something clear and specific',
      'en',
    )
    expect(result.score).toBe(50)
    expect(result.passed).toBe(false) // 50 < 60 passingScore
  })

  it('scores 0 when no keywords matched', () => {
    const result = evaluateSimulatedChat(makeExercise(), 'Help me please', 'en')
    expect(result.score).toBe(0)
    expect(result.passed).toBe(false)
    expect(result.feedback).toEqual(makeExercise().improvementFeedback)
  })

  it('returns passed:false when required criterion not met even if score >= passingScore', () => {
    const exercise = makeExercise({
      rubric: {
        criteria: [
          {
            key: 'clarity',
            label: { en: 'Clarity', he: 'בהירות' },
            weight: 0.5,
            keywords: ['clear'],
            required: true, // required!
          },
          {
            key: 'context',
            label: { en: 'Context', he: 'הקשר' },
            weight: 0.5,
            keywords: ['because'],
            required: false,
          },
        ],
        passingScore: 40,
        scoringMethod: 'checklist',
      },
    })
    // Matches context but NOT clarity (the required one)
    const result = evaluateSimulatedChat(exercise, 'do this because of reasons', 'en')
    expect(result.score).toBe(50) // 50% met context
    expect(result.passed).toBe(false) // required criterion not met
  })

  it('returns positiveFeedback when passed, improvementFeedback when not', () => {
    const passed = evaluateSimulatedChat(
      makeExercise(),
      'clear and specific because of reasons',
      'en',
    )
    expect(passed.feedback).toEqual(makeExercise().positiveFeedback)

    const failed = evaluateSimulatedChat(makeExercise(), 'no keywords here', 'en')
    expect(failed.feedback).toEqual(makeExercise().improvementFeedback)
  })
})

describe('evaluateSimulatedChat — weighted-keyword mode', () => {
  const weightedExercise = makeExercise({
    rubric: {
      criteria: [
        {
          key: 'clarity',
          label: { en: 'Clarity', he: 'בהירות' },
          weight: 0.7,
          keywords: ['specific', 'detailed'],
          required: false,
        },
        {
          key: 'intent',
          label: { en: 'Intent', he: 'כוונה' },
          weight: 0.3,
          keywords: ['goal', 'aim'],
          required: false,
        },
      ],
      passingScore: 60,
      scoringMethod: 'weighted-keyword',
    },
  })

  it('scores 100 when answer matches all criteria', () => {
    const result = evaluateSimulatedChat(
      weightedExercise,
      'Be specific and detailed about the goal',
      'en',
    )
    expect(result.score).toBe(100) // 0.7*100 + 0.3*100 = 100
    expect(result.passed).toBe(true)
  })

  it('scores proportionally when only some criteria matched (e.g., 0.7 weight matched = 70)', () => {
    const result = evaluateSimulatedChat(
      weightedExercise,
      'Be very specific and detailed about it',
      'en',
    )
    // Only clarity matched (weight 0.7), intent not matched
    expect(result.score).toBe(70)
    expect(result.passed).toBe(true) // 70 >= 60
  })
})

describe('evaluateSimulatedChat — Hebrew normalization', () => {
  it('uses trim-only for Hebrew (no toLowerCase)', () => {
    const exercise = makeExercise({
      rubric: {
        criteria: [
          {
            key: 'clarity',
            label: { en: 'Clarity', he: 'בהירות' },
            weight: 1,
            keywords: ['ברור'],
            required: false,
          },
        ],
        passingScore: 60,
        scoringMethod: 'checklist',
      },
    })
    const result = evaluateSimulatedChat(exercise, '  כתוב משהו ברור  ', 'he')
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
  })
})
