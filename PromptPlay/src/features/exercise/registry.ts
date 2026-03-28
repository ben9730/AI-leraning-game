import React from 'react'
import type { Exercise } from '@/src/content/schema'
import type { EvaluationResult } from './types'
import { MCQCard } from './components/MCQCard'
import { PickBetterCard } from './components/PickBetterCard'
import { FreeTextCard } from './components/FreeTextCard'
import { FillBlankCard } from './components/FillBlankCard'
import { SpotProblemCard } from './components/SpotProblemCard'

export type ExerciseComponentProps = {
  exercise: Exercise
  onComplete: (result: EvaluationResult) => void
}

export const EXERCISE_REGISTRY: Partial<
  Record<Exercise['type'], React.ComponentType<ExerciseComponentProps>>
> = {
  mcq: MCQCard as React.ComponentType<ExerciseComponentProps>,
  'pick-better': PickBetterCard as React.ComponentType<ExerciseComponentProps>,
  'free-text': FreeTextCard as React.ComponentType<ExerciseComponentProps>,
  'fill-blank': FillBlankCard as React.ComponentType<ExerciseComponentProps>,
  'spot-problem': SpotProblemCard as React.ComponentType<ExerciseComponentProps>,
  // 'simulated-chat': Phase 5
}
