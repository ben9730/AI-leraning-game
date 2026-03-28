import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Lesson } from '@/src/content/schema'
import { isRTL } from '@/src/i18n'
import { XPResult } from '@/src/features/gamification/engine'

interface LessonCompletionScreenProps {
  lesson: Lesson
  totalScore: number
  onFinish: () => void
  xpBreakdown?: XPResult  // populated by plan 03-03 celebration UI
}

export function LessonCompletionScreen({ lesson, totalScore, onFinish, xpBreakdown }: LessonCompletionScreenProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'he'
  const rtl = isRTL()
  const textAlign = rtl ? 'right' : 'left'
  const writingDirection = rtl ? 'rtl' : 'ltr'

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.checkmark}>✓</Text>

        <Text style={[styles.completeTitle, { textAlign, writingDirection }]}>
          {t('lesson.complete')}
        </Text>

        <Text style={[styles.lessonTitle, { textAlign, writingDirection }]}>
          {lesson.content.title[lang]}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalScore}%</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {t('lesson.xp_earned', { xp: lesson.xpReward })}
            </Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onFinish}
          accessibilityRole="button"
          accessibilityLabel={t('lesson.continue')}
        >
          <Text style={styles.buttonText}>{t('lesson.continue')}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingStart: 24,
    paddingEnd: 24,
  },
  checkmark: {
    fontSize: 64,
    color: '#6C63FF',
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  lessonTitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f0ff',
    borderRadius: 16,
    paddingTop: 24,
    paddingBottom: 24,
    paddingStart: 32,
    paddingEnd: 32,
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#d4ceee',
    marginStart: 16,
    marginEnd: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
  },
  footer: {
    paddingStart: 24,
    paddingEnd: 24,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
})
