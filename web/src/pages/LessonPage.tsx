import { useState, useMemo, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { loadLesson, getAllLessonIds, chapters } from '@/content'
import { getExerciseComponent } from '@/exercises/registry'
import { useProgressStore } from '@/store/useProgressStore'
import { useLanguage } from '@/hooks/useLanguage'
import { DotStepper } from '@/components/DotStepper'
import type { ExerciseResult } from '@/exercises/types'

type LessonPhase = 'intro' | 'running' | 'complete'

export function LessonPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentLanguage } = useLanguage()
  const lang = currentLanguage as 'en' | 'he'

  const completeLesson = useProgressStore(s => s.completeLesson)
  const unlockLesson = useProgressStore(s => s.unlockLesson)
  const addXP = useProgressStore(s => s.addXP)
  const updateStreak = useProgressStore(s => s.updateStreak)

  const lesson = useMemo(() => {
    try {
      return loadLesson(id!)
    } catch {
      return null
    }
  }, [id])

  const [phase, setPhase] = useState<LessonPhase>('intro')
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [exerciseCompleted, setExerciseCompleted] = useState(false)

  const completionHandledRef = useRef(false)

  // Redirect on invalid ID (must happen after all hooks)
  if (!lesson) {
    navigate('/', { replace: true })
    return null
  }

  const exercises = useMemo(
    () => [...lesson.exercises].sort((a, b) => a.order - b.order),
    [lesson],
  )

  const chapterName = useMemo(() => {
    const ch = (chapters as Array<{ lessonIds: string[]; title: { en: string; he: string } }>).find(
      c => c.lessonIds.includes(lesson.id),
    )
    return ch ? ch.title : null
  }, [lesson.id])

  const nextLessonId = useMemo(() => {
    const allIds = getAllLessonIds()
    const idx = allIds.indexOf(lesson.id)
    return idx !== -1 && idx + 1 < allIds.length ? allIds[idx + 1] : null
  }, [lesson.id])

  const handleExerciseComplete = useCallback((_result: ExerciseResult) => {
    setExerciseCompleted(true)
  }, [])

  const handleContinue = useCallback(() => {
    if (exerciseIndex + 1 < exercises.length) {
      setExerciseIndex(i => i + 1)
      setExerciseCompleted(false)
    } else {
      // All exercises done — fire store actions ONCE
      if (!completionHandledRef.current) {
        completionHandledRef.current = true
        completeLesson(lesson.id)
        // Unlock next lesson
        const allIds = getAllLessonIds()
        const idx = allIds.indexOf(lesson.id)
        if (idx !== -1 && idx + 1 < allIds.length) {
          unlockLesson(allIds[idx + 1])
        }
        addXP(lesson.xpReward, 'lesson_complete')
        updateStreak()
      }
      setPhase('complete')
    }
  }, [lesson, exerciseIndex, exercises.length, completeLesson, unlockLesson, addXP])

  // ── INTRO PHASE ──────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="w-full max-w-lg">
          {chapterName && (
            <p className="text-sm text-gray-500 text-start mb-1">
              {chapterName[lang]}
            </p>
          )}
          <h1 className="text-3xl font-bold text-gray-900 text-start mb-4">
            {lesson.content.title[lang]}
          </h1>
          {lesson.content.tip && (
            <div className="rounded-lg bg-indigo-50 border border-indigo-200 ps-4 pe-4 py-3 mb-6">
              <p className="text-sm text-indigo-800 text-start">
                {lesson.content.tip[lang]}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setPhase('running')}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-white font-semibold text-lg hover:bg-indigo-700 transition-colors"
          >
            Start
          </button>
        </div>
      </div>
    )
  }

  // ── RUNNING PHASE ────────────────────────────────────────────────────────────
  if (phase === 'running') {
    const currentExercise = exercises[exerciseIndex]
    const { component: ExerciseCard } = getExerciseComponent(currentExercise.type as any)

    return (
      <div className="flex-1 flex flex-col p-4 max-w-lg mx-auto">
        <div className="py-4">
          <DotStepper total={exercises.length} current={exerciseIndex} />
        </div>
        <div className="flex-1">
          <ExerciseCard
            key={currentExercise.id}
            exercise={currentExercise as any}
            onComplete={handleExerciseComplete}
          />
          {exerciseCompleted && (
            <button
              type="button"
              onClick={handleContinue}
              className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-3 text-white font-semibold hover:bg-indigo-700 transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── COMPLETE PHASE ───────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-indigo-50">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Lesson Complete!</h1>
        <p className="text-5xl font-extrabold text-indigo-600 mb-2">
          +{lesson.xpReward} XP
        </p>
        <p className="text-gray-500 mb-8">Great work!</p>
        <div className="space-y-3">
          {nextLessonId ? (
            <button
              type="button"
              onClick={() => navigate(`/lesson/${nextLessonId}`)}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-white font-semibold hover:bg-indigo-700 transition-colors"
            >
              Next Lesson
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            {nextLessonId ? 'Back to Home' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  )
}
