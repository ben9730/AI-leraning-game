import { useState } from 'react'
import type { FillBlankExercise } from '@shared/content/schema'
import { evaluateFillBlank } from '@shared/exercise/evaluators'
import type { EvaluationResult } from '@shared/exercise/types'
import { useLanguage } from '@/hooks/useLanguage'
import type { ExerciseComponentProps } from '../types'
import { FeedbackCard } from './FeedbackCard'

export function FillBlankCard({
  exercise,
  onComplete,
}: ExerciseComponentProps<FillBlankExercise>) {
  const { currentLanguage: lang } = useLanguage()
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const template = exercise.template[lang]
  const parts = template.split('___')

  function handleSubmit() {
    if (answer.trim().length === 0 || submitted) return
    const evalResult = evaluateFillBlank(exercise, answer, lang)
    setResult(evalResult)
    setSubmitted(true)
    onComplete({
      exerciseId: exercise.id,
      score: evalResult.score,
      passed: evalResult.passed,
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-4">
      {/* Prompt */}
      <h3 className="text-lg font-semibold text-gray-900 text-start">
        {exercise.prompt[lang]}
      </h3>

      {/* Template with inline input */}
      <p className="text-gray-800 text-start text-lg leading-relaxed">
        <span>{parts[0]}</span>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={submitted}
          className="border-b-2 border-indigo-400 bg-transparent text-center min-w-[100px] focus:outline-none focus:border-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed mx-1"
          aria-label="Fill in the blank"
        />
        {parts.length > 1 && <span>{parts[1]}</span>}
      </p>

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={answer.trim().length === 0 || submitted}
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
