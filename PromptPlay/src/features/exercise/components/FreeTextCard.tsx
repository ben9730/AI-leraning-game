import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useTranslation } from 'react-i18next'
import type { FreeTextExercise } from '@/src/content/schema'
import type { EvaluationResult } from '../types'
import { evaluateFreeText } from '../evaluators/evaluateFreeText'

interface FreeTextCardProps {
  exercise: FreeTextExercise
  onComplete: (result: EvaluationResult) => void
}

export function FreeTextCard({ exercise, onComplete }: FreeTextCardProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'he'

  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)

  const handleSubmit = () => {
    if (!text.trim()) return
    const res = evaluateFreeText(exercise, text, lang)
    setResult(res)
    setSubmitted(true)
    if (res.passed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.prompt}>{exercise.prompt[lang]}</Text>

      {exercise.starterPrompt && (
        <View style={styles.starterBox}>
          <Text style={styles.starterLabel}>Original prompt:</Text>
          <Text style={styles.starterText}>{exercise.starterPrompt[lang]}</Text>
        </View>
      )}

      <TextInput
        style={[styles.textInput, submitted && styles.textInputDisabled]}
        multiline
        numberOfLines={4}
        placeholder="Write your improved prompt here..."
        value={text}
        onChangeText={setText}
        editable={!submitted}
        accessibilityLabel="Your answer"
      />

      {!submitted ? (
        <Pressable
          style={[styles.submitButton, !text.trim() && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!text.trim()}
          accessibilityRole="button"
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </Pressable>
      ) : (
        <View style={styles.feedbackContainer}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreText}>Score: {result?.score}/100</Text>
            <Text style={[styles.passText, result?.passed ? styles.passGreen : styles.passFail]}>
              {result?.passed ? 'Passed' : 'Keep practicing'}
            </Text>
          </View>

          {result?.breakdown && (
            <View style={styles.breakdownContainer}>
              {Object.entries(result.breakdown).map(([key, score]) => (
                <View key={key} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{key}</Text>
                  <View style={styles.barBackground}>
                    <View style={[styles.barFill, { width: `${score}%` as any }]} />
                  </View>
                  <Text style={styles.breakdownScore}>{Math.round(score)}%</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.modelAnswerBox}>
            <Text style={styles.modelAnswerLabel}>One strong version:</Text>
            <Text style={styles.modelAnswerText}>{exercise.modelAnswer[lang]}</Text>
          </View>

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
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingStart: 24,
    paddingEnd: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 16,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    lineHeight: 26,
  },
  starterBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingTop: 14,
    paddingBottom: 14,
    paddingStart: 16,
    paddingEnd: 16,
    borderStartWidth: 3,
    borderStartColor: '#6C63FF',
  },
  starterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  starterText: {
    fontSize: 15,
    color: '#1a1a2e',
    lineHeight: 22,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingTop: 14,
    paddingBottom: 14,
    paddingStart: 16,
    paddingEnd: 16,
    fontSize: 15,
    color: '#1a1a2e',
    minHeight: 110,
    textAlignVertical: 'top',
  },
  textInputDisabled: {
    backgroundColor: '#fafafa',
    color: '#888',
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#c4c4c4',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  feedbackContainer: {
    gap: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  passText: {
    fontSize: 14,
    fontWeight: '600',
  },
  passGreen: {
    color: '#22c55e',
  },
  passFail: {
    color: '#f59e0b',
  },
  breakdownContainer: {
    gap: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingTop: 12,
    paddingBottom: 12,
    paddingStart: 14,
    paddingEnd: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownLabel: {
    width: 80,
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  barFill: {
    height: 8,
    backgroundColor: '#6C63FF',
    borderRadius: 4,
  },
  breakdownScore: {
    width: 36,
    fontSize: 12,
    color: '#444',
    textAlign: 'right',
  },
  modelAnswerBox: {
    backgroundColor: '#f0eeff',
    borderRadius: 10,
    paddingTop: 14,
    paddingBottom: 14,
    paddingStart: 16,
    paddingEnd: 16,
    borderStartWidth: 3,
    borderStartColor: '#6C63FF',
  },
  modelAnswerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C63FF',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  modelAnswerText: {
    fontSize: 15,
    color: '#1a1a2e',
    lineHeight: 22,
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
