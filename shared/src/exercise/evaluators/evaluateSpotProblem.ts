import type { SpotProblemExercise } from '../../content/schema'
import type { EvaluationResult } from '../types'

export function evaluateSpotProblem(
  exercise: SpotProblemExercise,
  selectedIndices: number[],
  _lang: 'en' | 'he',
): EvaluationResult {
  // Support both old format (separate issues + distractors arrays)
  // and new format (issues array with isActualIssue flag)
  const distractors = (exercise as any).distractors ?? []
  const combined = [...exercise.issues, ...distractors]

  // Determine which combined indices are real issues
  const hasIsActualIssue = combined.some((item: any) => 'isActualIssue' in item)

  let actualIssueCount: number
  let correctCount: number
  let distractorSelectedCount: number

  if (hasIsActualIssue) {
    // New format: use isActualIssue flag
    actualIssueCount = combined.filter((item: any) => item.isActualIssue).length
    correctCount = selectedIndices.filter(i => (combined[i] as any)?.isActualIssue).length
    distractorSelectedCount = selectedIndices.filter(i => !(combined[i] as any)?.isActualIssue).length
  } else {
    // Old format: issues are first, distractors follow
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
