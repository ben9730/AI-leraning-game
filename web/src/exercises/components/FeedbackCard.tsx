import { useState } from 'react'
import type { EvaluationResult } from '@shared/exercise/types'
import type { Exercise } from '@shared/content/schema'

interface FeedbackCardProps {
  result: EvaluationResult
  exercise: Exercise
  lang: 'en' | 'he'
}

function hasModelAnswer(
  exercise: Exercise,
): exercise is Exercise & { modelAnswer: { en: string; he: string } } {
  return 'modelAnswer' in exercise && exercise.modelAnswer != null
}

export function FeedbackCard({ result, exercise, lang }: FeedbackCardProps) {
  const [visible, setVisible] = useState(false)

  // Trigger CSS opacity transition after mount
  if (!visible) {
    requestAnimationFrame(() => setVisible(true))
  }

  const scoreColor =
    result.score >= 80
      ? 'text-green-600'
      : result.score >= 50
        ? 'text-amber-600'
        : 'text-red-600'

  const scoreBgColor =
    result.score >= 80
      ? 'border-green-400'
      : result.score >= 50
        ? 'border-amber-400'
        : 'border-red-400'

  return (
    <div
      className={`mt-4 rounded-xl border bg-white p-4 ps-4 pe-4 shadow-sm transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      {/* Score + Pass/Fail row */}
      <div className="flex items-center gap-3 mb-3">
        {/* Circular score indicator */}
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full border-4 ${scoreBgColor}`}
        >
          <span className={`text-lg font-bold ${scoreColor}`}>
            {result.score}%
          </span>
        </div>

        {/* Pass/Fail badge */}
        {result.passed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            Passed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            Try again
          </span>
        )}
      </div>

      {/* Feedback message */}
      <p className="text-start text-gray-700 mb-3">
        {result.feedback[lang]}
      </p>

      {/* Per-criterion breakdown */}
      {result.breakdown && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-600 mb-2 text-start">
            Breakdown
          </h4>
          <ul className="space-y-2">
            {Object.entries(result.breakdown).map(([criterion, score]) => (
              <li key={criterion} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 capitalize min-w-[80px] text-start">
                  {criterion}
                </span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.min(score, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 min-w-[36px] text-end">
                  {Math.round(score)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Model answer (collapsible) */}
      {hasModelAnswer(exercise) && (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-800 text-start">
            Model answer
          </summary>
          <div className="mt-2 rounded-lg bg-indigo-50 p-3 ps-4 pe-4 text-start text-gray-700">
            {exercise.modelAnswer[lang]}
          </div>
        </details>
      )}
    </div>
  )
}
