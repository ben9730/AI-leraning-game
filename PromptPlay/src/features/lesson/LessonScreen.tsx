import React, { useMemo } from 'react'
import { useRouter } from 'expo-router'
import { loadLesson } from '@/src/content/loader'
import { curriculum } from '@/src/content/curriculum'
import { useProgressStore } from '@/src/store/useProgressStore'
import { useLessonSession } from './useLessonSession'
import { LessonContentScreen } from './LessonContentScreen'
import { LessonCompletionScreen } from './LessonCompletionScreen'
import { ExerciseRunner } from '@/src/features/exercise/ExerciseRunner'

interface LessonScreenProps {
  lessonId: string
}

export function LessonScreen({ lessonId }: LessonScreenProps) {
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
      <ExerciseRunner
        key={currentExercise?.id}
        exercise={currentExercise!}
        onComplete={(result) => advance(result.score)}
        exerciseIndex={exerciseIndex}
        exerciseCount={exerciseCount}
      />
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
