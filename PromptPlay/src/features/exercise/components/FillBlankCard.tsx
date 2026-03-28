import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useTranslation } from 'react-i18next'
import type { FillBlankExercise } from '@/src/content/schema'
import type { EvaluationResult } from '../types'
import { evaluateFillBlank } from '../evaluators/evaluateFillBlank'

interface FillBlankCardProps {
  exercise: FillBlankExercise
  onComplete: (result: EvaluationResult) => void
}

export function FillBlankCard({ exercise, onComplete }: FillBlankCardProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'he'

  const [inputValue, setInputValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)

  const handleCheck = () => {
    const res = evaluateFillBlank(exercise, inputValue, lang)
    setResult(res)
    setSubmitted(true)
    if (res.passed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  // Split template by "___" to render inline input
  const templateParts = exercise.template[lang].split('___')

  const inputBorderColor = !submitted
    ? '#6C63FF'
    : result?.passed
    ? '#22c55e'
    : '#ef4444'

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{exercise.prompt[lang]}</Text>

      <View style={styles.templateContainer}>
        <View style={styles.templateRow}>
          {templateParts.map((part, index) => (
            <React.Fragment key={index}>
              <Text style={styles.templateText}>{part}</Text>
              {index < templateParts.length - 1 && (
                <TextInput
                  style={[styles.blankInput, { borderBottomColor: inputBorderColor }]}
                  value={inputValue}
                  onChangeText={setInputValue}
                  editable={!submitted}
                  autoCorrect={false}
                  autoCapitalize="none"
                  accessibilityLabel="Fill in the blank"
                />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      {!submitted ? (
        <Pressable
          style={styles.checkButton}
          onPress={handleCheck}
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
    gap: 20,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    lineHeight: 26,
  },
  templateContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingTop: 18,
    paddingBottom: 18,
    paddingStart: 16,
    paddingEnd: 16,
  },
  templateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  templateText: {
    fontSize: 16,
    color: '#1a1a2e',
    lineHeight: 28,
  },
  blankInput: {
    width: 120,
    fontSize: 16,
    color: '#1a1a2e',
    borderBottomWidth: 2,
    paddingBottom: 2,
    minWidth: 80,
    textAlign: 'center',
  },
  checkButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
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
