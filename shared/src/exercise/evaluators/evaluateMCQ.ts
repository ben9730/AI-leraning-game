import type { MCQExercise } from '../../content/schema'
import type { EvaluationResult } from '../types'

export function evaluateMCQ(exercise: MCQExercise, selectedIndex: number): EvaluationResult {
  const correct = selectedIndex === exercise.correctIndex
  return {
    score: correct ? 100 : 0,
    passed: correct,
    feedback: exercise.explanation,
  }
}
