import React, { useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { loadLesson } from '@/src/content/loader'
import { curriculum } from '@/src/content/curriculum'
import { useProgressStore } from '@/src/store/useProgressStore'
import { useLessonSession } from './useLessonSession'
import { LessonContentScreen } from './LessonContentScreen'
import { LessonCompletionScreen } from './LessonCompletionScreen'
import { ExerciseRunner } from '@/src/features/exercise/ExerciseRunner'
import { calcXP } from '@/src/features/gamification/engine'
import { LevelUpModal } from '@/src/features/gamification/celebrations/LevelUpModal'

interface LessonScreenProps {
  lessonId: string
}

export function LessonScreen({ lessonId }: LessonScreenProps) {
  const router = useRouter()
  const completeLesson = useProgressStore(s => s.completeLesson)
  const addXP = useProgressStore(s => s.addXP)
  const unlockLesson = useProgressStore(s => s.unlockLesson)
  const updateStreak = useProgressStore(s => s.updateStreak)
  const clearPendingLevelUp = useProgressStore(s => s.clearPendingLevelUp)

  const [showLevelUp, setShowLevelUp] = useState(false)
  const [pendingLevel, setPendingLevel] = useState<number | null>(null)

  const lesson = useMemo(() => loadLesson(lessonId), [lessonId])
  const { step, advance, currentExercise, exerciseCount, exerciseIndex } = useLessonSession(lesson)

  const handleFinish = () => {
    const streakCount = useProgressStore.getState().streakCount
    const isPerfect = step.phase === 'complete' && step.totalScore === 100
    const xpResult = calcXP(lesson.xpReward, streakCount, isPerfect)

    completeLesson(lesson.id)
    addXP(xpResult.total, 'lesson_complete')
    updateStreak()

    // Unlock the next lesson in the curriculum
    const currentIndex = curriculum.indexOf(lesson.id)
    if (currentIndex !== -1 && currentIndex + 1 < curriculum.length) {
      unlockLesson(curriculum[currentIndex + 1])
    }

    // Check if a level-up occurred after all store updates
    const pendingLevelUp = useProgressStore.getState().pendingLevelUp
    if (pendingLevelUp !== null) {
      setPendingLevel(pendingLevelUp)
      setShowLevelUp(true)
    } else {
      router.replace('/(tabs)')
    }
  }

  const handleLevelUpDismiss = () => {
    clearPendingLevelUp()
    setShowLevelUp(false)
    setPendingLevel(null)
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
  const isPerfect = step.totalScore === 100
  const xpResult = calcXP(lesson.xpReward, useProgressStore.getState().streakCount, isPerfect)

  return (
    <>
      <LessonCompletionScreen
        lesson={lesson}
        totalScore={step.totalScore}
        onFinish={handleFinish}
        xpBreakdown={xpResult}
      />
      {showLevelUp && pendingLevel !== null && (
        <LevelUpModal
          level={pendingLevel}
          onDismiss={handleLevelUpDismiss}
        />
      )}
    </>
  )
}
