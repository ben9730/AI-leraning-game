import { useState, useRef } from 'react'
import { Lesson, Exercise } from '@/src/content/schema'

export type LessonStep =
  | { phase: 'intro' }
  | { phase: 'exercise'; index: number }
  | { phase: 'complete'; totalScore: number }

export function useLessonSession(lesson: Lesson) {
  const [step, setStep] = useState<LessonStep>({ phase: 'intro' })
  const scoresRef = useRef<number[]>([])

  const advance = (score?: number) => {
    setStep(current => {
      if (current.phase === 'intro') {
        return { phase: 'exercise', index: 0 }
      }

      if (current.phase === 'exercise') {
        // Accumulate score for this exercise
        const newScores = [...scoresRef.current, score ?? 0]
        scoresRef.current = newScores

        const nextIndex = current.index + 1
        if (nextIndex < lesson.exercises.length) {
          return { phase: 'exercise', index: nextIndex }
        }

        // All exercises done — compute average
        const totalScore = Math.round(
          newScores.reduce((sum, s) => sum + s, 0) / newScores.length
        )
        return { phase: 'complete', totalScore }
      }

      // Already complete — no-op
      return current
    })
  }

  const currentExercise: Exercise | undefined =
    step.phase === 'exercise' ? lesson.exercises[step.index] : undefined

  const exerciseCount = lesson.exercises.length

  const exerciseIndex = step.phase === 'exercise' ? step.index : -1

  return { step, advance, currentExercise, exerciseCount, exerciseIndex }
}
