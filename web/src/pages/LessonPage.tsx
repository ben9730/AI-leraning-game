import { useState, useMemo, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { AppHead } from '@/components/AppHead'
import { loadLesson, getAllLessonIds, chapters } from '@/content'
import { getExerciseComponent } from '@/exercises/registry'
import { useProgressStore } from '@/store/useProgressStore'
import { useLanguage } from '@/hooks/useLanguage'
import { DotStepper } from '@/components/DotStepper'
import { CelebrationOverlay } from '@/components/CelebrationOverlay'
import { XPFloatUp } from '@/components/XPFloatUp'
import { BadgeGrid } from '@/components/BadgeGrid'
import { BadgeToast } from '@/components/BadgeToast'
import { deriveBadges } from '@shared/gamification/badges'
import type { ExerciseResult } from '@/exercises/types'
import type { Badge } from '@shared/gamification/badges'

type LessonPhase = 'intro' | 'running' | 'complete'

export function LessonPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
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
  const [showCelebration, setShowCelebration] = useState(false)
  const [completionXP, setCompletionXP] = useState(0)
  const [allBadges, setAllBadges] = useState<Badge[]>([])
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<Badge | null>(null)

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
        // Snapshot badges BEFORE mutations
        const pre = useProgressStore.getState()
        const badgesBefore = deriveBadges(pre.completedLessons, pre.peakStreak, pre.xpTotal, pre.streakFreezeUsedEver)
        const earnedBefore = new Set(badgesBefore.filter(b => b.earned).map(b => b.id))

        completeLesson(lesson.id)
        const allIds = getAllLessonIds()
        const idx = allIds.indexOf(lesson.id)
        if (idx !== -1 && idx + 1 < allIds.length) {
          unlockLesson(allIds[idx + 1])
        }
        addXP(lesson.xpReward, 'lesson_complete')
        updateStreak()

        // Snapshot badges AFTER mutations
        const post = useProgressStore.getState()
        const badgesAfter = deriveBadges(post.completedLessons, post.peakStreak, post.xpTotal, post.streakFreezeUsedEver)
        const newBadge = badgesAfter.find(b => b.earned && !earnedBefore.has(b.id))

        setAllBadges(badgesAfter)
        setCompletionXP(lesson.xpReward)
        setShowCelebration(true)
        if (newBadge) setNewlyEarnedBadge(newBadge)
      }
      setPhase('complete')
    }
  }, [lesson, exerciseIndex, exercises.length, completeLesson, unlockLesson, addXP, updateStreak])

  // ── INTRO PHASE ──────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[var(--clay-bg)]">
        <AppHead title={lesson.content.title[lang] ?? 'Lesson'} />
        <div className="w-full max-w-lg">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-4 text-sm text-[var(--clay-primary)] hover:text-[var(--clay-text)] transition-colors"
          >
            ← {t('lesson.back')}
          </button>
          {chapterName && (
            <p className="text-sm text-gray-500 text-start mb-1">
              {chapterName[lang]}
            </p>
          )}
          <h1 className="text-3xl font-bold text-[var(--clay-text)] text-start mb-4">
            {lesson.content.title[lang]}
          </h1>
          {lesson.content.tip && (
            <div className="clay-card rounded-2xl bg-[var(--clay-secondary)]/10 border-3 border-[var(--clay-secondary)]/20 ps-4 pe-4 py-3 mb-6">
              <p className="text-sm text-[var(--clay-text)] text-start">
                {lesson.content.tip[lang]}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setPhase('running')}
            className="clay-button w-full rounded-2xl bg-[var(--clay-primary)] px-4 py-3 text-white font-semibold text-lg hover:bg-[var(--clay-text)] transition-colors"
          >
            {t('lesson.start')}
          </button>
        </div>
      </div>
    )
  }

  // ── RUNNING PHASE ────────────────────────────────────────────────────────────
  if (phase === 'running') {
    const currentExercise = exercises[exerciseIndex]
    const { component: ExerciseCard } = getExerciseComponent(currentExercise.type)

    return (
      <div className="flex-1 flex flex-col p-4 max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-2 text-sm text-[var(--clay-primary)] hover:text-[var(--clay-text)] transition-colors self-start"
        >
          ← {t('lesson.back')}
        </button>
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
              className="clay-button mt-4 w-full rounded-2xl bg-[var(--clay-primary)] px-4 py-3 text-white font-semibold hover:bg-[var(--clay-text)] transition-colors"
            >
              {t('common.continue')}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── COMPLETE PHASE ───────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[var(--clay-bg)]">
      {showCelebration && <CelebrationOverlay />}
      {newlyEarnedBadge && (
        <BadgeToast badge={newlyEarnedBadge} onDismiss={() => setNewlyEarnedBadge(null)} />
      )}
      <div className="w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold text-[var(--clay-text)] mb-4">Lesson Complete!</h1>
        <div className="relative inline-block mb-2">
          <p className="text-5xl font-extrabold text-[var(--clay-primary)]">
            +{completionXP || lesson.xpReward} XP
          </p>
          {showCelebration && <XPFloatUp amount={completionXP || lesson.xpReward} />}
        </div>
        <p className="text-gray-500 mb-6">Great work!</p>
        {allBadges.length > 0 && (
          <div className="mb-6">
            <BadgeGrid badges={allBadges} />
          </div>
        )}
        <div className="space-y-3">
          {nextLessonId ? (
            <button
              type="button"
              onClick={() => navigate(`/lesson/${nextLessonId}`)}
              className="clay-button w-full rounded-2xl bg-[var(--clay-cta)] px-4 py-3 text-white font-semibold hover:bg-green-600 transition-colors"
            >
              Next Lesson
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="clay-button w-full rounded-2xl border-3 border-gray-200 bg-white px-4 py-3 text-[var(--clay-text)] font-semibold hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
