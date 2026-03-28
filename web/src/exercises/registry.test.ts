import { describe, it, expect } from 'vitest'
import { exerciseRegistry, getExerciseComponent } from './registry'
import type { ExerciseType } from '@shared/content/schema'

const ALL_TYPES: ExerciseType[] = [
  'mcq',
  'free-text',
  'pick-better',
  'fill-blank',
  'spot-problem',
  'simulated-chat',
]

describe('exerciseRegistry', () => {
  it('has entries for all 6 exercise types', () => {
    for (const type of ALL_TYPES) {
      expect(exerciseRegistry[type]).toBeDefined()
    }
  })

  it('each entry has a component (truthy) and evaluator (function)', () => {
    for (const type of ALL_TYPES) {
      const entry = exerciseRegistry[type]
      expect(entry.component).toBeTruthy()
      expect(typeof entry.evaluator).toBe('function')
    }
  })
})

describe('getExerciseComponent', () => {
  it('returns the correct entry for mcq', () => {
    const entry = getExerciseComponent('mcq')
    expect(entry).toBe(exerciseRegistry['mcq'])
    expect(entry.component).toBeTruthy()
    expect(typeof entry.evaluator).toBe('function')
  })

  it('returns the correct entry for each valid type', () => {
    for (const type of ALL_TYPES) {
      const entry = getExerciseComponent(type)
      expect(entry).toBe(exerciseRegistry[type])
    }
  })

  it('throws for invalid type', () => {
    expect(() => getExerciseComponent('invalid' as ExerciseType)).toThrow(
      'Unknown exercise type: invalid',
    )
  })
})
