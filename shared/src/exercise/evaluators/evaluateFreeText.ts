import type { FreeTextExercise } from '../../content/schema'
import type { EvaluationResult } from '../types'
import { normalize } from './normalize'

export function evaluateFreeText(
  exercise: FreeTextExercise,
  answer: string,
  lang: 'en' | 'he',
): EvaluationResult {
  const normalizedAnswer = normalize(answer, lang)
  const { rubric } = exercise
  const { criteria, passingScore, scoringMethod } = rubric

  const breakdown: Record<string, number> = {}
  let totalScore = 0
  let requiredFailed = false

  for (const criterion of criteria) {
    const normalizedKeywords = criterion.keywords.map(k => normalize(k, lang))
    const matched = normalizedKeywords.some(kw => normalizedAnswer.includes(kw))

    let criterionScore: number
    if (scoringMethod === 'checklist') {
      criterionScore = matched ? 100 / criteria.length : 0
    } else {
      // weighted-keyword
      criterionScore = matched ? criterion.weight * 100 : 0
    }

    breakdown[criterion.key] = criterionScore
    totalScore += criterionScore

    if (criterion.required && !matched) {
      requiredFailed = true
    }
  }

  const score = Math.round(totalScore)
  const passed = !requiredFailed && score >= passingScore

  return {
    score,
    passed,
    feedback: passed ? exercise.positiveFeedback : exercise.improvementFeedback,
    breakdown,
  }
}
