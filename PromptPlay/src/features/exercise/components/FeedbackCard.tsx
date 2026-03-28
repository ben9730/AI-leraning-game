import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import type { EvaluationResult } from '../types'
import type { PromptRubric, LocalizedString } from '@/src/content/schema'

interface FeedbackCardProps {
  result: EvaluationResult
  rubric?: PromptRubric
  modelAnswer?: LocalizedString
  lang: 'en' | 'he'
}

export function FeedbackCard({ result, rubric, modelAnswer, lang }: FeedbackCardProps) {
  const { t } = useTranslation()

  const scoreLabel = t('exercise.score', { score: Math.round(result.score) })
  const statusLabel = result.passed ? t('exercise.passed') : t('exercise.failed')

  // Build criterion label lookup from rubric
  const criterionLabels: Record<string, string> = {}
  if (rubric) {
    for (const criterion of rubric.criteria) {
      criterionLabels[criterion.key] = criterion.label[lang]
    }
  }

  const getCriterionLabel = (key: string): string => {
    if (criterionLabels[key]) return criterionLabels[key]
    // Fallback to i18n key if available
    const i18nKey = `rubric.${key}`
    return t(i18nKey, { defaultValue: key })
  }

  return (
    <View style={styles.card}>
      {/* Pass/Fail indicator with score */}
      <View style={styles.headerRow}>
        <Text style={[styles.statusText, result.passed ? styles.statusPass : styles.statusFail]}>
          {statusLabel}
        </Text>
        <Text style={styles.scoreText}>{scoreLabel}</Text>
      </View>

      {/* Feedback message */}
      <Text style={styles.feedbackText}>{result.feedback[lang]}</Text>

      {/* Per-criterion breakdown */}
      {result.breakdown && rubric && (
        <View style={styles.breakdownContainer}>
          {rubric.criteria.map((criterion) => {
            const score = result.breakdown?.[criterion.key] ?? 0
            const hasScore = score > 0
            return (
              <View key={criterion.key} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{getCriterionLabel(criterion.key)}</Text>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      hasScore ? styles.barFillPass : styles.barFillEmpty,
                      { width: `${score}%` as any },
                    ]}
                  />
                </View>
                <Text style={styles.breakdownScore}>{Math.round(score)}%</Text>
              </View>
            )
          })}
        </View>
      )}

      {/* Model answer — always shown when provided */}
      {modelAnswer && (
        <View style={styles.modelAnswerBox}>
          <Text style={styles.modelAnswerLabel}>{t('exercise.model_answer')}</Text>
          <Text style={styles.modelAnswerText}>{modelAnswer[lang]}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#e8e8f0',
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 16,
    paddingStart: 16,
    paddingEnd: 16,
    marginTop: 12,
    gap: 12,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusPass: {
    color: '#22c55e',
  },
  statusFail: {
    color: '#ef4444',
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  feedbackText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingTop: 12,
    paddingBottom: 12,
    paddingStart: 14,
    paddingEnd: 14,
  },
  breakdownContainer: {
    gap: 10,
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
    width: 100,
    fontSize: 12,
    color: '#555',
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  barFillPass: {
    backgroundColor: '#22c55e',
  },
  barFillEmpty: {
    backgroundColor: '#d1d5db',
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
})
