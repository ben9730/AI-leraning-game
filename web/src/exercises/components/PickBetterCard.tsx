import { useState } from 'react'
import type { PickBetterExercise } from '@shared/content/schema'
import { evaluatePickBetter } from '@shared/exercise/evaluators'
import type { EvaluationResult } from '@shared/exercise/types'
import { useLanguage } from '@/hooks/useLanguage'
import type { ExerciseComponentProps } from '../types'
import { FeedbackCard } from './FeedbackCard'

export function PickBetterCard({
  exercise,
  onComplete,
}: ExerciseComponentProps<PickBetterExercise>) {
  const { currentLanguage: lang } = useLanguage()
  const [selected, setSelected] = useState<'A' | 'B' | null>(null)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (selected === null || submitted) return
    const evalResult = evaluatePickBetter(exercise, selected)
    setResult(evalResult)
    setSubmitted(true)
    onComplete({
      exerciseId: exercise.id,
      score: evalResult.score,
      passed: evalResult.passed,
    })
  }

  function optionClasses(option: 'A' | 'B') {
    const isSelected = selected === option
    return `flex-1 min-w-[140px] rounded-lg border-2 p-4 ps-4 pe-4 text-start transition-all cursor-pointer ${
      isSelected
        ? 'border-indigo-500 ring-2 ring-indigo-500 bg-indigo-50'
        : 'border-gray-200 hover:border-gray-300'
    } ${submitted ? 'cursor-not-allowed opacity-70' : ''}`
  }

  return (
    <div className="space-y-4">
      {/* Question */}
      <h3 className="text-lg font-semibold text-gray-900 text-start">
        {exercise.prompt[lang]}
      </h3>

      {/* Option cards */}
      <div className="flex flex-wrap gap-4" role="radiogroup" aria-label="Prompt options">
        <button
          type="button"
          role="radio"
          aria-checked={selected === 'A'}
          disabled={submitted}
          onClick={() => setSelected('A')}
          className={optionClasses('A')}
        >
          <span className="block text-xs font-medium text-gray-500 mb-1">Option A</span>
          <span className="block text-gray-800">{exercise.optionA[lang]}</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={selected === 'B'}
          disabled={submitted}
          onClick={() => setSelected('B')}
          className={optionClasses('B')}
        >
          <span className="block text-xs font-medium text-gray-500 mb-1">Option B</span>
          <span className="block text-gray-800">{exercise.optionB[lang]}</span>
        </button>
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={selected === null || submitted}
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
