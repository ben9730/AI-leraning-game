import { evaluateMCQ } from '../evaluateMCQ'
import type { MCQExercise } from '@/src/content/schema'

const mockExercise: MCQExercise = {
  id: 'ex-1',
  type: 'mcq',
  order: 1,
  prompt: { en: 'Which is the better prompt?', he: 'מה הפרומפט הטוב יותר?' },
  options: [
    { en: 'Option A', he: 'אפשרות א' },
    { en: 'Option B', he: 'אפשרות ב' },
    { en: 'Option C', he: 'אפשרות ג' },
  ],
  correctIndex: 1,
  explanation: { en: 'Option B is better because...', he: 'אפשרות ב טובה יותר כי...' },
}

describe('evaluateMCQ', () => {
  it('returns score 100 and passed:true for correct index', () => {
    const result = evaluateMCQ(mockExercise, 1)
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
    expect(result.feedback).toEqual(mockExercise.explanation)
  })

  it('returns score 0 and passed:false for incorrect index', () => {
    const result = evaluateMCQ(mockExercise, 0)
    expect(result.score).toBe(0)
    expect(result.passed).toBe(false)
    expect(result.feedback).toEqual(mockExercise.explanation)
  })

  it('returns explanation as feedback regardless of correctness', () => {
    const correct = evaluateMCQ(mockExercise, 1)
    const wrong = evaluateMCQ(mockExercise, 2)
    expect(correct.feedback).toEqual(mockExercise.explanation)
    expect(wrong.feedback).toEqual(mockExercise.explanation)
  })
})
