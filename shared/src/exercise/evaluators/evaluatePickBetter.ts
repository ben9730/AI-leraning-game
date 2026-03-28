import type { PickBetterExercise } from '../../content/schema'
import type { EvaluationResult } from '../types'

export function evaluatePickBetter(
  exercise: PickBetterExercise,
  selectedOption: 'A' | 'B',
): EvaluationResult {
  const correct = selectedOption === exercise.betterOption
  return {
    score: correct ? 100 : 0,
    passed: correct,
    feedback: exercise.explanation,
  }
}
