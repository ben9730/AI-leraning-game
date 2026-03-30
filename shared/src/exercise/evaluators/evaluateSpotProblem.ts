import type { SpotProblemExercise } from '../../content/schema'
import type { EvaluationResult } from '../types'

export function evaluateSpotProblem(
  exercise: SpotProblemExercise,
  selectedIndices: number[],
  _lang: 'en' | 'he',
): EvaluationResult {
  const combined = [...exercise.issues, ...(exercise.distractors ?? [])]
  const hasIsActualIssue = combined.some(item => 'isActualIssue' in item)

  let actualIssueCount: number
  let correctCount: number
  let distractorSelectedCount: number

  if (hasIsActualIssue) {
    actualIssueCount = combined.filter(item => item.isActualIssue).length
    correctCount = selectedIndices.filter(i => combined[i]?.isActualIssue).length
    distractorSelectedCount = selectedIndices.filter(i => !combined[i]?.isActualIssue).length
  } else {
    const issueCount = exercise.issues.length
    actualIssueCount = issueCount
    correctCount = selectedIndices.filter(i => i < issueCount).length
    distractorSelectedCount = selectedIndices.filter(i => i >= issueCount).length
  }

  const rawScore = (correctCount / actualIssueCount) * 100 - distractorSelectedCount * 25
  const score = Math.round(Math.max(0, rawScore))
  const passed = score >= 50

  return {
    score,
    passed,
    feedback: exercise.explanation,
  }
}
