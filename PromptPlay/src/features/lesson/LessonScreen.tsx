import React, { useMemo } from 'react'
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { loadLesson } from '@/src/content/loader'
import { curriculum } from '@/src/content/curriculum'
import { useProgressStore } from '@/src/store/useProgressStore'
import { useLessonSession } from './useLessonSession'
import { LessonContentScreen } from './LessonContentScreen'
import { LessonCompletionScreen } from './LessonCompletionScreen'

interface LessonScreenProps {
  lessonId: string
}

export function LessonScreen({ lessonId }: LessonScreenProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const completeLesson = useProgressStore(s => s.completeLesson)
  const addXP = useProgressStore(s => s.addXP)
  const unlockLesson = useProgressStore(s => s.unlockLesson)

  const lesson = useMemo(() => loadLesson(lessonId), [lessonId])
  const { step, advance, currentExercise, exerciseCount, exerciseIndex } = useLessonSession(lesson)

  const handleFinish = () => {
    completeLesson(lesson.id)
    addXP(lesson.xpReward, 'lesson_complete')

    // Unlock the next lesson in the curriculum
    const currentIndex = curriculum.indexOf(lesson.id)
    if (currentIndex !== -1 && currentIndex + 1 < curriculum.length) {
      unlockLesson(curriculum[currentIndex + 1])
    }

    router.replace('/(tabs)')
  }

  if (step.phase === 'intro') {
    return (
      <LessonContentScreen
        lesson={lesson}
        onContinue={() => advance()}
      />
    )
  }

  if (step.phase === 'exercise') {
    return (
      <View style={styles.exercisePlaceholder} key={currentExercise?.id}>
        <Text style={styles.exerciseText}>
          {t('lesson.exercise_count', {
            current: exerciseIndex + 1,
            total: exerciseCount,
          })}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]}
          onPress={() => advance(100)}
          accessibilityRole="button"
        >
          <Text style={styles.nextButtonText}>Next (placeholder)</Text>
        </Pressable>
      </View>
    )
  }

  // phase === 'complete'
  return (
    <LessonCompletionScreen
      lesson={lesson}
      totalScore={step.totalScore}
      onFinish={handleFinish}
    />
  )
}

const styles = StyleSheet.create({
  exercisePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingStart: 24,
    paddingEnd: 24,
    backgroundColor: '#fff',
  },
  exerciseText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 32,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 16,
    paddingStart: 40,
    paddingEnd: 40,
  },
  nextButtonPressed: {
    opacity: 0.85,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
})
