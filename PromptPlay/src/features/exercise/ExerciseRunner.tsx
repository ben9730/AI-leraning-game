import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import type { Exercise } from '@/src/content/schema'
import type { EvaluationResult } from './types'
import { EXERCISE_REGISTRY } from './registry'

interface ExerciseRunnerProps {
  exercise: Exercise
  onComplete: (result: EvaluationResult) => void
  exerciseIndex: number
  exerciseCount: number
}

export function ExerciseRunner({
  exercise,
  onComplete,
  exerciseIndex,
  exerciseCount,
}: ExerciseRunnerProps) {
  const { t } = useTranslation()
  const Component = EXERCISE_REGISTRY[exercise.type]

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>
        {t('lesson.exercise_count', { current: exerciseIndex + 1, total: exerciseCount })}
      </Text>

      {Component ? (
        <Component
          exercise={exercise}
          onComplete={onComplete}
        />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>Exercise type not yet supported</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  counter: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textAlign: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    paddingStart: 24,
    paddingEnd: 24,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingStart: 24,
    paddingEnd: 24,
  },
  fallbackText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
})
