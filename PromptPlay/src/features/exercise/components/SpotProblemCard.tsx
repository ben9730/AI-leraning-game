import React, { useMemo, useState } from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useTranslation } from 'react-i18next'
import type { SpotProblemExercise } from '@/src/content/schema'
import type { EvaluationResult } from '../types'
import { evaluateSpotProblem } from '../evaluators/evaluateSpotProblem'

interface SpotProblemCardProps {
  exercise: SpotProblemExercise
  onComplete: (result: EvaluationResult) => void
}

export function SpotProblemCard({ exercise, onComplete }: SpotProblemCardProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'he'

  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)

  // Combined list: issues first, then distractors (deterministic order, no shuffle for v1)
  const combinedItems = useMemo(() => {
    const issueItems = exercise.issues.map((item, i) => ({ label: item, isIssue: true, originalIndex: i }))
    const distractorItems = exercise.distractors.map((item, i) => ({
      label: item,
      isIssue: false,
      originalIndex: exercise.issues.length + i,
    }))
    return [...issueItems, ...distractorItems]
  }, [exercise.id])

  const toggleIndex = (originalIndex: number) => {
    if (submitted) return
    setSelectedIndices(prev =>
      prev.includes(originalIndex) ? prev.filter(i => i !== originalIndex) : [...prev, originalIndex],
    )
  }

  const handleCheck = () => {
    const res = evaluateSpotProblem(exercise, selectedIndices, lang)
    setResult(res)
    setSubmitted(true)
    if (res.passed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  const getChipStyle = (item: (typeof combinedItems)[number]) => {
    const idx = item.originalIndex
    const isSelected = selectedIndices.includes(idx)

    if (!submitted) {
      return [styles.chip, isSelected && styles.chipSelected]
    }

    if (item.isIssue) {
      if (isSelected) return [styles.chip, styles.chipCorrect]
      return [styles.chip, styles.chipMissed] // missed issue
    } else {
      if (isSelected) return [styles.chip, styles.chipWrong] // wrongly selected distractor
      return [styles.chip]
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.prompt}>{exercise.prompt[lang]}</Text>

      <View style={styles.problematicBox}>
        <Text style={styles.problematicLabel}>Problematic prompt:</Text>
        <Text style={styles.problematicText}>{exercise.problematicPrompt[lang]}</Text>
      </View>

      <View style={styles.chipsContainer}>
        {combinedItems.map((item, displayIndex) => (
          <Pressable
            key={displayIndex}
            style={getChipStyle(item)}
            onPress={() => toggleIndex(item.originalIndex)}
            accessibilityRole="checkbox"
            accessibilityState={{
              checked: selectedIndices.includes(item.originalIndex),
              disabled: submitted,
            }}
          >
            <Text style={styles.chipText}>{item.label[lang]}</Text>
          </Pressable>
        ))}
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
    gap: 20,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    lineHeight: 26,
  },
  problematicBox: {
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    paddingTop: 14,
    paddingBottom: 14,
    paddingStart: 16,
    paddingEnd: 16,
    borderStartWidth: 3,
    borderStartColor: '#f59e0b',
  },
  problematicLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  problematicText: {
    fontSize: 15,
    color: '#1a1a2e',
    lineHeight: 22,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingTop: 8,
    paddingBottom: 8,
    paddingStart: 16,
    paddingEnd: 16,
    backgroundColor: '#fafafa',
  },
  chipSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#f0eeff',
  },
  chipCorrect: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  chipWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  chipMissed: {
    borderColor: '#f59e0b',
    backgroundColor: '#fff8f0',
  },
  chipText: {
    fontSize: 14,
    color: '#1a1a2e',
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
