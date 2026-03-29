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
import { MCQCard } from './components/MCQCard'
import { PickBetterCard } from './components/PickBetterCard'
import { FreeTextCard } from './components/FreeTextCard'
import { FillBlankCard } from './components/FillBlankCard'
import { SpotProblemCard } from './components/SpotProblemCard'
import { SimulatedChatCard } from './components/SimulatedChatCard'

export interface ExerciseRegistryEntry {
  component: ComponentType<ExerciseComponentProps<any>>
  evaluator: Function
}

export const exerciseRegistry: Record<ExerciseType, ExerciseRegistryEntry> = {
  'mcq': {
    component: MCQCard as ComponentType<ExerciseComponentProps<any>>,
    evaluator: evaluateMCQ,
  },
  'pick-better': {
    component: PickBetterCard as ComponentType<ExerciseComponentProps<any>>,
    evaluator: evaluatePickBetter,
  },
  'free-text': {
    component: FreeTextCard as ComponentType<ExerciseComponentProps<any>>,
    evaluator: evaluateFreeText,
  },
  'fill-blank': {
    component: FillBlankCard as ComponentType<ExerciseComponentProps<any>>,
    evaluator: evaluateFillBlank,
  },
  'spot-problem': {
    component: SpotProblemCard as ComponentType<ExerciseComponentProps<any>>,
    evaluator: evaluateSpotProblem,
  },
  'simulated-chat': {
    component: SimulatedChatCard as ComponentType<ExerciseComponentProps<any>>,
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
