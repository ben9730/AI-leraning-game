import type { Exercise } from '@shared/content/schema'

export interface ExerciseComponentProps<T extends Exercise = Exercise> {
  exercise: T
  onComplete: (result: ExerciseResult) => void
}

export interface ExerciseResult {
  exerciseId: string
  score: number
  passed: boolean
}
