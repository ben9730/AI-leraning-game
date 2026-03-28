import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useTranslation } from 'react-i18next'
import type { MCQExercise } from '@/src/content/schema'
import type { EvaluationResult } from '../types'
import { evaluateMCQ } from '../evaluators/evaluateMCQ'

interface MCQCardProps {
  exercise: MCQExercise
  onComplete: (result: EvaluationResult) => void
}

export function MCQCard({ exercise, onComplete }: MCQCardProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'he'

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)

  const handleCheck = () => {
    if (selectedIndex === null) return
    const res = evaluateMCQ(exercise, selectedIndex)
    setResult(res)
    setSubmitted(true)
    if (res.passed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  const getOptionStyle = (index: number) => {
    if (!submitted) {
      return [styles.option, selectedIndex === index && styles.optionSelected]
    }
    if (index === exercise.correctIndex) return [styles.option, styles.optionCorrect]
    if (index === selectedIndex) return [styles.option, styles.optionWrong]
    return [styles.option]
  }

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{exercise.prompt[lang]}</Text>

      <View style={styles.optionsContainer}>
        {exercise.options.map((option, index) => (
          <Pressable
            key={index}
            style={getOptionStyle(index)}
            onPress={() => !submitted && setSelectedIndex(index)}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedIndex === index, disabled: submitted }}
          >
            <Text style={styles.optionText}>{option[lang]}</Text>
          </Pressable>
        ))}
      </View>

      {!submitted ? (
        <Pressable
          style={[styles.checkButton, selectedIndex === null && styles.checkButtonDisabled]}
          onPress={handleCheck}
          disabled={selectedIndex === null}
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
  option: {
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
  optionText: {
    fontSize: 16,
    color: '#1a1a2e',
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
