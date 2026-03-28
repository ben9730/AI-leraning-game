import React, { useEffect, useRef } from 'react'
import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useProgressStore } from '@/src/store/useProgressStore'
import { useSkillTreeData, getCurrentLessonId } from '@/src/features/skill-tree/useSkillTreeData'
import { SkillTreeNode } from '@/src/features/skill-tree/SkillTreeNode'
import { ChapterHeader } from '@/src/features/skill-tree/ChapterHeader'
import { curriculum, chapters } from '@/src/content/curriculum'
import { isRTL } from '@/src/i18n'

export default function SkillTreeScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const rtl = isRTL()

  const completedLessons = useProgressStore(s => s.completedLessons)
  const unlockedLessons = useProgressStore(s => s.unlockedLessons)
  const language = useProgressStore(s => s.language)

  const chapterGroups = useSkillTreeData()
  const currentLessonId = getCurrentLessonId(chapters, completedLessons, unlockedLessons)

  const scrollRef = useRef<ScrollView>(null)
  const nodeOffsets = useRef<Record<string, number>>({})

  const completedCount = completedLessons.length
  const totalCount = curriculum.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  useEffect(() => {
    if (!currentLessonId) return
    const timer = setTimeout(() => {
      const offset = nodeOffsets.current[currentLessonId]
      if (offset !== undefined) {
        scrollRef.current?.scrollTo({ y: Math.max(0, offset - 100), animated: true })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [currentLessonId])

  const handleNodePress = (lessonId: string) => {
    router.push({ pathname: '/(lesson)/[lessonId]', params: { lessonId } })
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Screen header */}
      <Text style={[styles.screenTitle, { textAlign: rtl ? 'right' : 'left' }]}>
        {t('skillTree.title')}
      </Text>

      {/* Overall progress bar */}
      <View style={styles.progressSection}>
        <Text style={[styles.progressLabel, { textAlign: rtl ? 'right' : 'left' }]}>
          {t('skillTree.progress', { completed: completedCount, total: totalCount })}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* Chapter groups */}
      {chapterGroups.map((group) => {
        const chapterTitle = group.chapter.title[language] ?? group.chapter.title.en
        const chapterCompletedCount = group.nodes.filter(n => n.state === 'complete').length

        return (
          <View key={group.chapter.id} style={styles.chapterSection}>
            <ChapterHeader
              title={chapterTitle}
              lessonCount={group.nodes.length}
              completedCount={chapterCompletedCount}
            />
            {group.nodes.map((node) => {
              const nodeTitle = node.title[language] ?? node.title.en
              const isCurrent = node.lessonId === currentLessonId

              return (
                <SkillTreeNode
                  key={node.lessonId}
                  lessonId={node.lessonId}
                  title={nodeTitle}
                  state={node.state}
                  isCurrent={isCurrent}
                  onPress={() => handleNodePress(node.lessonId)}
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout
                    nodeOffsets.current[node.lessonId] = y
                  }}
                />
              )
            })}
            <View style={styles.chapterSpacer} />
          </View>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingTop: 48,
    paddingStart: 16,
    paddingEnd: 16,
    paddingBottom: 32,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 6,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 4,
  },
  chapterSection: {
    marginBottom: 24,
  },
  chapterSpacer: {
    height: 8,
  },
})
