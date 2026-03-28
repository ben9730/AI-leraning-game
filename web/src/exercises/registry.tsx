import type { ComponentType } from 'react'
import type { ExerciseType } from '@shared/content/schema'
import type { ExerciseComponentProps } from './types'
import {
  evaluateMCQ,
  evaluatePickBetter,
  evaluateFreeText,
  evaluateFillBlank,
  evaluateSpotProblem,
  evaluateSimulatedChat,
} from '@shared/exercise/evaluators'

export interface ExerciseRegistryEntry {
  component: ComponentType<ExerciseComponentProps<any>>
  evaluator: Function
}

// Placeholder component for exercise types not yet implemented
function PlaceholderExercise({ exercise }: ExerciseComponentProps) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center text-gray-500">
      Coming soon: {exercise.type}
    </div>
  )
}

export const exerciseRegistry: Record<ExerciseType, ExerciseRegistryEntry> = {
  'mcq': {
    component: PlaceholderExercise,
    evaluator: evaluateMCQ,
  },
  'pick-better': {
    component: PlaceholderExercise,
    evaluator: evaluatePickBetter,
  },
  'free-text': {
    component: PlaceholderExercise,
    evaluator: evaluateFreeText,
  },
  'fill-blank': {
    component: PlaceholderExercise,
    evaluator: evaluateFillBlank,
  },
  'spot-problem': {
    component: PlaceholderExercise,
    evaluator: evaluateSpotProblem,
  },
  'simulated-chat': {
    component: PlaceholderExercise,
    evaluator: evaluateSimulatedChat,
  },
}

export function getExerciseComponent(type: ExerciseType): ExerciseRegistryEntry {
  const entry = exerciseRegistry[type]
  if (!entry) {
    throw new Error(`Unknown exercise type: ${type}`)
  }
  return entry
}
