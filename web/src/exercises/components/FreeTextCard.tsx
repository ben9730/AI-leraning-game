import { useState } from 'react'
import type { FreeTextExercise } from '@shared/content/schema'
import { evaluateFreeText } from '@shared/exercise/evaluators'
import type { EvaluationResult } from '@shared/exercise/types'
import { useLanguage } from '@/hooks/useLanguage'
import type { ExerciseComponentProps } from '../types'
import { FeedbackCard } from './FeedbackCard'

export function FreeTextCard({
  exercise,
  onComplete,
}: ExerciseComponentProps<FreeTextExercise>) {
  const { currentLanguage: lang } = useLanguage()
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (answer.trim().length === 0 || submitted) return
    const evalResult = evaluateFreeText(exercise, answer, lang)
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

      {/* Starter prompt (blockquote style) */}
      {exercise.starterPrompt && (
        <div className="border-s-4 border-amber-400 bg-amber-50 ps-4 pe-4 py-3 rounded-e-lg text-gray-700 text-start">
          {exercise.starterPrompt[lang]}
        </div>
      )}

      {/* Text input */}
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={submitted}
        rows={4}
        placeholder={exercise.hint?.[lang] ?? ''}
        className="w-full rounded-lg border-2 border-gray-200 p-3 ps-4 pe-4 text-start text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed resize-y"
      />

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
