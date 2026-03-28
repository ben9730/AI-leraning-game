import React from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Lesson } from '@/src/content/schema'
import { isRTL } from '@/src/i18n'

interface LessonContentScreenProps {
  lesson: Lesson
  onContinue: () => void
}

export function LessonContentScreen({ lesson, onContinue }: LessonContentScreenProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'he'
  const rtl = isRTL()
  const textAlign = rtl ? 'right' : 'left'
  const writingDirection = rtl ? 'rtl' : 'ltr'

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { textAlign, writingDirection }]}>
          {lesson.content.title[lang]}
        </Text>

        <Text style={[styles.body, { textAlign, writingDirection }]}>
          {lesson.content.body[lang]}
        </Text>

        {lesson.content.tip && (
          <View style={[styles.tipBox, { borderStartWidth: 3, borderStartColor: '#6C63FF' }]}>
            <Text style={[styles.tipText, { textAlign, writingDirection }]}>
              {lesson.content.tip[lang]}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onContinue}
          accessibilityRole="button"
          accessibilityLabel={t('lesson.start_exercises')}
        >
          <Text style={styles.buttonText}>{t('lesson.start_exercises')}</Text>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingStart: 24,
    paddingEnd: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 20,
  },
  body: {
    fontSize: 17,
    lineHeight: 26,
    color: '#333',
    marginBottom: 24,
  },
  tipBox: {
    backgroundColor: '#f3f0ff',
    borderRadius: 8,
    paddingStart: 16,
    paddingEnd: 16,
    paddingTop: 14,
    paddingBottom: 14,
    marginBottom: 16,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4b3fa0',
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
