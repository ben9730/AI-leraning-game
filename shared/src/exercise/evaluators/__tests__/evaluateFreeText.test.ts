import { evaluateFreeText } from '../evaluateFreeText'
import type { FreeTextExercise } from '../../../content/schema'

const makeExercise = (overrides?: Partial<FreeTextExercise>): FreeTextExercise => ({
  id: 'ex-3',
  type: 'free-text',
  order: 1,
  prompt: { en: 'Rewrite this prompt', he: 'שכתב את הפרומפט' },
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

describe('evaluateFreeText — checklist mode', () => {
  it('scores 100 when answer matches all criteria keywords', () => {
    const result = evaluateFreeText(makeExercise(), 'Please write a clear and specific answer because I need help', 'en')
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
    expect(result.feedback).toEqual(makeExercise().positiveFeedback)
  })

  it('scores ~50 when answer matches half the criteria', () => {
    const result = evaluateFreeText(makeExercise(), 'Write something clear and specific', 'en')
    expect(result.score).toBe(50)
    expect(result.passed).toBe(false) // 50 < 60 passingScore
  })

  it('scores 0 when answer matches no keywords', () => {
    const result = evaluateFreeText(makeExercise(), 'Help me please', 'en')
    expect(result.score).toBe(0)
    expect(result.passed).toBe(false)
    expect(result.feedback).toEqual(makeExercise().improvementFeedback)
  })

  it('is case-insensitive for English', () => {
    const result = evaluateFreeText(makeExercise(), 'CLEAR and SPECIFIC task BECAUSE it matters', 'en')
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
  })

  it('returns breakdown with per-criterion scores', () => {
    const result = evaluateFreeText(makeExercise(), 'Write something clear and specific', 'en')
    expect(result.breakdown).toBeDefined()
    expect(result.breakdown!['clarity']).toBe(50)
    expect(result.breakdown!['context']).toBe(0)
  })

  it('returns passed:false when required criterion is not met even if score >= passingScore', () => {
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
    const result = evaluateFreeText(exercise, 'do this because of reasons', 'en')
    expect(result.score).toBe(50) // 50% met context
    expect(result.passed).toBe(false) // required criterion not met
  })
})

describe('evaluateFreeText — weighted-keyword mode', () => {
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

  it('scores based on weights when all criteria matched', () => {
    const result = evaluateFreeText(weightedExercise, 'Be specific and detailed about the goal', 'en')
    expect(result.score).toBe(100) // 0.7*100 + 0.3*100 = 100
    expect(result.passed).toBe(true)
  })

  it('gives proportional score based on matched criterion weights', () => {
    const result = evaluateFreeText(weightedExercise, 'Be very specific and detailed about it', 'en')
    // Only clarity matched (weight 0.7), intent not matched
    expect(result.score).toBe(70)
    expect(result.passed).toBe(true) // 70 >= 60
  })
})

describe('evaluateFreeText — Hebrew normalization', () => {
  it('uses trim() only for Hebrew (no toLowerCase)', () => {
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
    const result = evaluateFreeText(exercise, '  כתוב משהו ברור  ', 'he')
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
  })
})
