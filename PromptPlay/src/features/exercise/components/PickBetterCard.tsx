import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useTranslation } from 'react-i18next'
import type { PickBetterExercise } from '@/src/content/schema'
import type { EvaluationResult } from '../types'
import { evaluatePickBetter } from '../evaluators/evaluatePickBetter'

interface PickBetterCardProps {
  exercise: PickBetterExercise
  onComplete: (result: EvaluationResult) => void
}

export function PickBetterCard({ exercise, onComplete }: PickBetterCardProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'he'

  const [selected, setSelected] = useState<'A' | 'B' | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)

  const handleCheck = () => {
    if (!selected) return
    const res = evaluatePickBetter(exercise, selected)
    setResult(res)
    setSubmitted(true)
    if (res.passed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  const getOptionStyle = (option: 'A' | 'B') => {
    if (!submitted) {
      return [styles.optionCard, selected === option && styles.optionSelected]
    }
    if (option === exercise.betterOption) return [styles.optionCard, styles.optionCorrect]
    if (option === selected) return [styles.optionCard, styles.optionWrong]
    return [styles.optionCard]
  }

  const renderOption = (option: 'A' | 'B') => {
    const text = option === 'A' ? exercise.optionA[lang] : exercise.optionB[lang]
    return (
      <Pressable
        key={option}
        style={getOptionStyle(option)}
        onPress={() => !submitted && setSelected(option)}
        accessibilityRole="radio"
        accessibilityState={{ selected: selected === option, disabled: submitted }}
      >
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{option}</Text>
          </View>
        </View>
        <Text style={styles.optionText}>{text}</Text>
      </Pressable>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{exercise.prompt[lang]}</Text>

      <View style={styles.optionsContainer}>
        {renderOption('A')}
        {renderOption('B')}
      </View>

      {!submitted ? (
        <Pressable
          style={[styles.checkButton, !selected && styles.checkButtonDisabled]}
          onPress={handleCheck}
          disabled={!selected}
          accessibilityRole="button"
        >
          <Text style={styles.checkButtonText}>Check</Text>
        </Pressable>
      ) : (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{result?.feedback[lang]}</Text>
          <Pressable
            style={styles.continueButton}
            onPress={() => onComplete(result!)}
            accessibilityRole="button"
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingStart: 24,
    paddingEnd: 24,
    paddingTop: 24,
    backgroundColor: '#fff',
  },
  prompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingTop: 14,
    paddingBottom: 14,
    paddingStart: 16,
    paddingEnd: 16,
    backgroundColor: '#fafafa',
  },
  optionSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#f0eeff',
  },
  optionCorrect: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  optionWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  badgeRow: {
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#6C63FF',
    borderRadius: 6,
    paddingTop: 2,
    paddingBottom: 2,
    paddingStart: 10,
    paddingEnd: 10,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  optionText: {
    fontSize: 15,
    color: '#1a1a2e',
    lineHeight: 22,
  },
  checkButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: '#c4c4c4',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  feedbackContainer: {
    gap: 16,
  },
  feedbackText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingTop: 14,
    paddingBottom: 14,
    paddingStart: 16,
    paddingEnd: 16,
  },
  continueButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
})
