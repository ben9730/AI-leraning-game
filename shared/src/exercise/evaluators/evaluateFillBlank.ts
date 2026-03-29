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

  // Support both old format (exercise.acceptableAnswers) and new format (exercise.blanks[].acceptableAnswers)
  let matched = false

  if (exercise.acceptableAnswers) {
    // Old format: single blank with flat acceptableAnswers array
    matched = exercise.acceptableAnswers.some(acceptable => {
      const normalizedAcceptable = normalize(acceptable[lang], lang)
      return (
        normalizedAnswer.includes(normalizedAcceptable) ||
        normalizedAcceptable.includes(normalizedAnswer)
      )
    })
  } else if ((exercise as any).blanks) {
    // New format: multiple blanks with per-blank acceptableAnswers
    const blanks = (exercise as any).blanks as Array<{
      acceptableAnswers: Record<string, string[]>
    }>
    // Check if any answer token matches any blank's acceptable answers
    // For multi-blank, answers are joined with ", " so split them back
    const answerParts = normalizedAnswer.split(/,\s*/)
    let matchCount = 0
    for (const blank of blanks) {
      const acceptable = blank.acceptableAnswers?.[lang] ?? []
      const blankMatched = answerParts.some(part =>
        acceptable.some(acc => {
          const normAcc = normalize(acc, lang)
          return part.includes(normAcc) || normAcc.includes(part)
        })
      )
      if (blankMatched) matchCount++
    }
    // Score proportionally to how many blanks matched
    const score = Math.round((matchCount / blanks.length) * 100)
    return {
      score,
      passed: score >= 60,
      feedback: exercise.explanation,
    }
  }

  return {
    score: matched ? 100 : 0,
    passed: matched,
    feedback: exercise.explanation,
  }
}
