import type { SpotProblemExercise } from '@/src/content/schema'
import type { EvaluationResult } from '../types'

export function evaluateSpotProblem(
  exercise: SpotProblemExercise,
  selectedIndices: number[],
  _lang: 'en' | 'he',
): EvaluationResult {
  const issueCount = exercise.issues.length
  // Issues occupy indices 0..issueCount-1
  // Distractors occupy indices issueCount..issueCount+distractors.length-1

  const correctCount = selectedIndices.filter(i => i < issueCount).length
  const distractorCount = selectedIndices.filter(i => i >= issueCount).length

  const rawScore = (correctCount / issueCount) * 100 - distractorCount * 25
  const score = Math.round(Math.max(0, rawScore))
  const passed = score >= 50

  return {
    score,
    passed,
    feedback: exercise.explanation,
  }
}
