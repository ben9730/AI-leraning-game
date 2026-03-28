import { evaluateSpotProblem } from '../evaluateSpotProblem'
import type { SpotProblemExercise } from '../../../content/schema'

const mockExercise: SpotProblemExercise = {
  id: 'ex-5',
  type: 'spot-problem',
  order: 1,
  prompt: { en: 'Spot the problems in this prompt', he: 'זהה את הבעיות בפרומפט' },
  problematicPrompt: { en: 'Do the thing', he: 'עשה את הדבר' },
  issues: [
    { en: 'Too vague', he: 'מעורפל מדי' },
    { en: 'No context', he: 'אין הקשר' },
  ],
  distractors: [
    { en: 'Too long', he: 'ארוך מדי' },
    { en: 'Wrong format', he: 'פורמט שגוי' },
  ],
  hints: [],
  explanation: { en: 'The prompt lacks clarity and context', he: 'הפרומפט חסר בהירות והקשר' },
}

// Combined list: [issue0(idx0), issue1(idx1), distractor0(idx2), distractor1(idx3)]

describe('evaluateSpotProblem', () => {
  it('scores 100 when selecting all issues and no distractors', () => {
    const result = evaluateSpotProblem(mockExercise, [0, 1], 'en')
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
    expect(result.feedback).toEqual(mockExercise.explanation)
  })

  it('scores proportionally for partial issue selection', () => {
    // 1/2 issues selected = 50, no distractors
    const result = evaluateSpotProblem(mockExercise, [0], 'en')
    expect(result.score).toBe(50)
    expect(result.passed).toBe(true) // >= 50
  })

  it('reduces score for distractor selection (penalty -25 per distractor)', () => {
    // 2/2 issues = 100, 1 distractor = -25 => 75
    const result = evaluateSpotProblem(mockExercise, [0, 1, 2], 'en')
    expect(result.score).toBe(75)
    expect(result.passed).toBe(true)
  })

  it('floors score at 0 when penalty exceeds score', () => {
    // 0/2 issues = 0, 2 distractors = -50 => floor at 0
    const result = evaluateSpotProblem(mockExercise, [2, 3], 'en')
    expect(result.score).toBe(0)
    expect(result.passed).toBe(false)
  })

  it('scores 0 when selecting nothing', () => {
    const result = evaluateSpotProblem(mockExercise, [], 'en')
    expect(result.score).toBe(0)
    expect(result.passed).toBe(false)
  })

  it('passes when score is exactly 50', () => {
    // 1 out of 2 issues selected, no distractors = 50
    const result = evaluateSpotProblem(mockExercise, [1], 'en')
    expect(result.score).toBe(50)
    expect(result.passed).toBe(true)
  })

  it('fails when score is below 50', () => {
    // 1/2 issues = 50, 1 distractor = -25 => 25
    const result = evaluateSpotProblem(mockExercise, [0, 2], 'en')
    expect(result.score).toBe(25)
    expect(result.passed).toBe(false)
  })
})
