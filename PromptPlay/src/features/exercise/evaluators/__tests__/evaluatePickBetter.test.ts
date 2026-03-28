import { evaluatePickBetter } from '../evaluatePickBetter'
import type { PickBetterExercise } from '@/src/content/schema'

const mockExercise: PickBetterExercise = {
  id: 'ex-2',
  type: 'pick-better',
  order: 1,
  prompt: { en: 'Pick the better prompt', he: 'בחר את הפרומפט הטוב יותר' },
  optionA: { en: 'Write me a poem', he: 'כתוב לי שיר' },
  optionB: { en: 'Write a haiku about autumn leaves falling', he: 'כתוב האיקו על עלים נופלים בסתיו' },
  betterOption: 'B',
  explanation: { en: 'Option B is more specific', he: 'אפשרות ב ספציפית יותר' },
}

describe('evaluatePickBetter', () => {
  it('returns score 100 and passed:true when selecting the betterOption', () => {
    const result = evaluatePickBetter(mockExercise, 'B')
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
    expect(result.feedback).toEqual(mockExercise.explanation)
  })

  it('returns score 0 and passed:false when selecting the wrong option', () => {
    const result = evaluatePickBetter(mockExercise, 'A')
    expect(result.score).toBe(0)
    expect(result.passed).toBe(false)
    expect(result.feedback).toEqual(mockExercise.explanation)
  })

  it('works when betterOption is A', () => {
    const exerciseA = { ...mockExercise, betterOption: 'A' as const }
    expect(evaluatePickBetter(exerciseA, 'A').score).toBe(100)
    expect(evaluatePickBetter(exerciseA, 'B').score).toBe(0)
  })
})
