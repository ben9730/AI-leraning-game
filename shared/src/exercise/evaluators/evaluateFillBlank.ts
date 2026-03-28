import type { FillBlankExercise } from '../../content/schema'
import type { EvaluationResult } from '../types'

function normalize(text: string, lang: 'en' | 'he'): string {
  return lang === 'he' ? text.trim() : text.trim().toLowerCase()
}

export function evaluateFillBlank(
  exercise: FillBlankExercise,
  answer: string,
  lang: 'en' | 'he',
): EvaluationResult {
  const normalizedAnswer = normalize(answer, lang)

  const matched = exercise.acceptableAnswers.some(acceptable => {
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
