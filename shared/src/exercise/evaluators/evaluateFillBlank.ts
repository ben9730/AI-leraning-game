import type { FillBlankExercise } from '../../content/schema'
import type { EvaluationResult } from '../types'
import { normalize } from './normalize'

export function evaluateFillBlank(
  exercise: FillBlankExercise,
  answers: string | string[],
  lang: 'en' | 'he',
): EvaluationResult {
  const answerList = Array.isArray(answers) ? answers : [answers]

  if (exercise.blanks) {
    // New format: per-blank acceptable answers
    let matchCount = 0
    for (let i = 0; i < exercise.blanks.length; i++) {
      const normalizedAnswer = normalize(answerList[i] ?? '', lang)
      const acceptable = exercise.blanks[i].acceptableAnswers?.[lang] ?? []
      const blankMatched = acceptable.some(acc => {
        const normAcc = normalize(acc, lang)
        return normalizedAnswer.includes(normAcc) || normAcc.includes(normalizedAnswer)
      })
      if (blankMatched) matchCount++
    }
    const score = Math.round((matchCount / exercise.blanks.length) * 100)
    return {
      score,
      passed: score >= 60,
      feedback: exercise.explanation,
    }
  }

  // Old format: single blank with flat acceptableAnswers array
  const normalizedAnswer = normalize(answerList[0] ?? '', lang)
  const matched = (exercise.acceptableAnswers ?? []).some(acceptable => {
    const normalizedAcceptable = normalize(acceptable[lang], lang)
    return (
      normalizedAnswer.includes(normalizedAcceptable) ||
      normalizedAcceptable.includes(normalizedAnswer)
    )
  })

  return {
    score: matched ? 100 : 0,
    passed: matched,
    feedback: exercise.explanation,
  }
}
