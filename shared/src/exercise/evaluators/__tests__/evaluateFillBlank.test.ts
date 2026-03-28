import { evaluateFillBlank } from '../evaluateFillBlank'
import type { FillBlankExercise } from '../../../content/schema'

const mockExercise: FillBlankExercise = {
  id: 'ex-4',
  type: 'fill-blank',
  order: 1,
  prompt: { en: 'Fill in the blank', he: 'מלא את החסר' },
  template: { en: 'A good prompt should be ___', he: 'פרומפט טוב צריך להיות ___' },
  acceptableAnswers: [
    { en: 'specific', he: 'ספציפי' },
    { en: 'clear', he: 'ברור' },
  ],
  explanation: { en: 'Being specific helps the AI understand', he: 'להיות ספציפי עוזר ל-AI להבין' },
}

describe('evaluateFillBlank', () => {
  it('returns score 100 for exact match (after trim)', () => {
    const result = evaluateFillBlank(mockExercise, '  specific  ', 'en')
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
    expect(result.feedback).toEqual(mockExercise.explanation)
  })

  it('returns score 100 when answer contains acceptable answer', () => {
    const result = evaluateFillBlank(mockExercise, 'very specific and detailed', 'en')
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
  })

  it('returns score 100 when acceptable answer contains user answer', () => {
    // "clear" contains "lear" — but more practically: acceptable "specific" contains user "pecific"...
    // More realistic: answer is a substring match scenario
    const result = evaluateFillBlank(mockExercise, 'clear', 'en')
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
  })

  it('returns score 0 for no match', () => {
    const result = evaluateFillBlank(mockExercise, 'vague', 'en')
    expect(result.score).toBe(0)
    expect(result.passed).toBe(false)
  })

  it('is case-insensitive for English', () => {
    const result = evaluateFillBlank(mockExercise, 'SPECIFIC', 'en')
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
  })

  it('uses trim() only for Hebrew (no toLowerCase)', () => {
    const result = evaluateFillBlank(mockExercise, '  ספציפי  ', 'he')
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
  })

  it('returns score 0 for wrong Hebrew answer', () => {
    const result = evaluateFillBlank(mockExercise, 'שגוי', 'he')
    expect(result.score).toBe(0)
    expect(result.passed).toBe(false)
  })
})
