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
import { AccountPromptModal } from '@/src/features/onboarding/AccountPromptModal'
import { AuthScreen } from '@/src/features/auth/AuthScreen'
import { syncProgressToCloud } from '@/src/features/auth/syncProgress'
import { supabase } from '@/src/lib/supabase'

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
  const [showAccountPrompt, setShowAccountPrompt] = useState(false)
  const [accountPromptShown, setAccountPromptShown] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const lesson = useMemo(() => loadLesson(lessonId), [lessonId])
  const { step, advance, currentExercise, exerciseCount, exerciseIndex } = useLessonSession(lesson)

  const navigateAfterLesson = () => {
    const pendingLevelUp = useProgressStore.getState().pendingLevelUp
    if (pendingLevelUp !== null) {
      setPendingLevel(pendingLevelUp)
      setShowLevelUp(true)
      return
    }

    // Navigate to next lesson if available, otherwise go home
    const currentIndex = curriculum.indexOf(lesson.id)
    const nextLessonId = currentIndex !== -1 && currentIndex + 1 < curriculum.length
      ? curriculum[currentIndex + 1]
      : null

    if (nextLessonId) {
      router.replace(`/(lesson)/${nextLessonId}`)
    } else {
      router.replace('/(tabs)')
    }
  }

  const handleFinish = async () => {
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

    // Silent sync for already signed-in users (fire-and-forget)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        syncProgressToCloud(session.user.id).catch(() => {
          // Sync failure is non-blocking
        })
      }
    } catch {
      // Supabase/SecureStore may be unavailable on web — non-blocking
    }

    // Show account prompt after lesson 2 completion (once per session)
    const completedCount = useProgressStore.getState().completedLessons.length
    if (completedCount >= 2 && !accountPromptShown) {
      setShowAccountPrompt(true)
      return
    }

    navigateAfterLesson()
  }

  const handleLevelUpDismiss = () => {
    clearPendingLevelUp()
    setShowLevelUp(false)
    setPendingLevel(null)

    // Navigate to next lesson if available, otherwise go home
    const currentIndex = curriculum.indexOf(lesson.id)
    const nextLessonId = currentIndex !== -1 && currentIndex + 1 < curriculum.length
      ? curriculum[currentIndex + 1]
      : null

    if (nextLessonId) {
      router.replace(`/(lesson)/${nextLessonId}`)
    } else {
      router.replace('/(tabs)')
    }
  }

  const handleAccountPromptSkip = () => {
    setShowAccountPrompt(false)
    setAccountPromptShown(true)
    navigateAfterLesson()
  }

  const handleAccountPromptSignUp = () => {
    setShowAccountPrompt(false)
    setAccountPromptShown(true)
    setShowAuth(true)
  }

  const handleAuthSuccess = async () => {
    setShowAuth(false)
    // Sync to cloud after successful auth (session just established)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      syncProgressToCloud(session.user.id).catch(() => {
        // Non-blocking
      })
    }
    navigateAfterLesson()
  }

  const handleAuthCancel = () => {
    setShowAuth(false)
    navigateAfterLesson()
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
      <AccountPromptModal
        visible={showAccountPrompt}
        onSignUp={handleAccountPromptSignUp}
        onSkip={handleAccountPromptSkip}
      />
      {showAuth && (
        <AuthScreen
          onSuccess={handleAuthSuccess}
          onCancel={handleAuthCancel}
        />
      )}
    </>
  )
}
