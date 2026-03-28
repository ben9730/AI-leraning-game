import { useState } from 'react'
import type { MCQExercise } from '@shared/content/schema'
import { evaluateMCQ } from '@shared/exercise/evaluators'
import type { EvaluationResult } from '@shared/exercise/types'
import { useLanguage } from '@/hooks/useLanguage'
import type { ExerciseComponentProps } from '../types'
import { FeedbackCard } from './FeedbackCard'

export function MCQCard({
  exercise,
  onComplete,
}: ExerciseComponentProps<MCQExercise>) {
  const { currentLanguage: lang } = useLanguage()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (selectedIndex === null || submitted) return
    const evalResult = evaluateMCQ(exercise, selectedIndex)
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
      {/* Question */}
      <h3 className="text-lg font-semibold text-gray-900 text-start">
        {exercise.prompt[lang]}
      </h3>

      {/* Options */}
      <div className="space-y-2" role="radiogroup" aria-label="Answer options">
        {exercise.options.map((option, index) => {
          const isSelected = selectedIndex === index
          return (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={submitted}
              onClick={() => setSelectedIndex(index)}
              className={`w-full rounded-lg border-2 p-3 ps-4 pe-4 text-start transition-colors ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${submitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            >
              {option[lang]}
            </button>
          )
        })}
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={selectedIndex === null || submitted}
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
