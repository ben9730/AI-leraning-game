import { useState, useMemo } from 'react'
import type { SpotProblemExercise } from '@shared/content/schema'
import { evaluateSpotProblem } from '@shared/exercise/evaluators'
import type { EvaluationResult } from '@shared/exercise/types'
import { useLanguage } from '@/hooks/useLanguage'
import type { ExerciseComponentProps } from '../types'
import { FeedbackCard } from './FeedbackCard'

/**
 * Deterministic shuffle using exercise.id as seed.
 * Returns shuffled array and a mapping from shuffled index -> original index.
 */
function seededShuffle<T>(
  items: T[],
  seed: string,
): { shuffled: T[]; indexMap: number[] } {
  // Simple hash from string: sum of charCodes
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i)) * 31
  }

  // Seeded pseudo-random (LCG)
  let state = Math.abs(hash) || 1
  function nextRandom(): number {
    state = (state * 1664525 + 1013904223) & 0x7fffffff
    return state / 0x7fffffff
  }

  // Create index map and shuffle with Fisher-Yates
  const indexMap = items.map((_, i) => i)
  const shuffled = [...items]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1))
    // Swap items
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    // Swap index map
    ;[indexMap[i], indexMap[j]] = [indexMap[j], indexMap[i]]
  }

  return { shuffled, indexMap }
}

export function SpotProblemCard({
  exercise,
  onComplete,
}: ExerciseComponentProps<SpotProblemExercise>) {
  const { currentLanguage: lang } = useLanguage()
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(),
  )
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // Combine issues and distractors, shuffle deterministically
  const { shuffled, indexMap } = useMemo(() => {
    const combined = [...exercise.issues, ...exercise.distractors]
    return seededShuffle(combined, exercise.id)
  }, [exercise.id, exercise.issues, exercise.distractors])

  function toggleIndex(shuffledIdx: number) {
    if (submitted) return
    setSelectedIndices((prev) => {
      const next = new Set(prev)
      if (next.has(shuffledIdx)) {
        next.delete(shuffledIdx)
      } else {
        next.add(shuffledIdx)
      }
      return next
    })
  }

  function handleSubmit() {
    if (selectedIndices.size === 0 || submitted) return

    // Map shuffled indices back to original indices
    const originalIndices = Array.from(selectedIndices).map(
      (si) => indexMap[si],
    )

    const evalResult = evaluateSpotProblem(exercise, originalIndices, lang)
    setResult(evalResult)
    setSubmitted(true)
    onComplete({
      exerciseId: exercise.id,
      score: evalResult.score,
      passed: evalResult.passed,
    })
  }

  return (
    <div className="space-y-4">
      {/* Prompt */}
      <h3 className="text-lg font-semibold text-gray-900 text-start">
        {exercise.prompt[lang]}
      </h3>

      {/* Problematic prompt blockquote */}
      <div className="border-s-4 border-amber-400 bg-amber-50 ps-4 pe-4 py-3 rounded-e-lg text-gray-700 text-start">
        {exercise.problematicPrompt[lang]}
      </div>

      {/* Checkbox list */}
      <div className="space-y-2" role="group" aria-label="Select the issues">
        {shuffled.map((item, shuffledIdx) => {
          const isSelected = selectedIndices.has(shuffledIdx)
          return (
            <label
              key={shuffledIdx}
              className={`flex items-center gap-3 rounded-lg border-2 p-3 ps-4 pe-4 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-indigo-50 border-indigo-500'
                  : 'border-gray-200 hover:border-gray-300'
              } ${submitted ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleIndex(shuffledIdx)}
                disabled={submitted}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-800 text-start">{item[lang]}</span>
            </label>
          )
        })}
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={selectedIndices.size === 0 || submitted}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium transition-colors hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Submit
      </button>

      {/* Feedback */}
      {result && (
        <FeedbackCard result={result} exercise={exercise} lang={lang} />
      )}
    </div>
  )
}
