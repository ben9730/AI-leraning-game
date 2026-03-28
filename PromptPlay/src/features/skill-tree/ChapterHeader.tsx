import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { isRTL } from '@/src/i18n'

interface ChapterHeaderProps {
  title: string
  lessonCount: number
  completedCount: number
}

export function ChapterHeader({ title, lessonCount, completedCount }: ChapterHeaderProps) {
  const { t } = useTranslation()
  const rtl = isRTL()

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { textAlign: rtl ? 'right' : 'left' }]}>{title}</Text>
      <Text style={[styles.progress, { textAlign: rtl ? 'right' : 'left' }]}>
        {t('skillTree.chapterProgress', { completed: completedCount, total: lessonCount })}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingStart: 4,
    paddingEnd: 4,
    paddingTop: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  progress: {
    fontSize: 13,
    color: '#757575',
  },
})
