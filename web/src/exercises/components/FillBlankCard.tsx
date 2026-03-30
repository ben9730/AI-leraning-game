import { useState, useMemo } from 'react'
import type { FillBlankExercise } from '@shared/content/schema'
import { evaluateFillBlank } from '@shared/exercise/evaluators'
import type { EvaluationResult } from '@shared/exercise/types'
import { useLanguage } from '@/hooks/useLanguage'
import type { ExerciseComponentProps } from '../types'
import { FeedbackCard } from './FeedbackCard'

const BLANK_PATTERN = /___|\b_\[.*?\]_/g

function parseTemplate(template: string): { parts: string[]; blankCount: number } {
  const parts = template.split(BLANK_PATTERN)
  const blankCount = parts.length - 1
  return { parts, blankCount }
}

export function FillBlankCard({
  exercise,
  onComplete,
}: ExerciseComponentProps<FillBlankExercise>) {
  const { currentLanguage: lang } = useLanguage()
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const template = exercise.template[lang]
  const { parts, blankCount } = useMemo(() => parseTemplate(template), [template])
  const [answers, setAnswers] = useState<string[]>(() => new Array(blankCount).fill(''))

  const allFilled = answers.every(a => a.trim().length > 0)

  function updateAnswer(index: number, value: string) {
    setAnswers(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function handleSubmit() {
    if (!allFilled || submitted) return
    const evalResult = evaluateFillBlank(exercise, answers, lang)
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

      {/* Template with inline inputs */}
      <p className="text-gray-800 text-start text-lg leading-relaxed">
        {parts.map((part, i) => (
          <span key={i}>
            <span>{part}</span>
            {i < blankCount && (
              <input
                type="text"
                value={answers[i]}
                onChange={(e) => updateAnswer(i, e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={submitted}
                placeholder={exercise.blanks?.[i]?.placeholder?.[lang] ?? ''}
                className="border-b-2 border-indigo-400 bg-transparent text-center min-w-[100px] focus:outline-none focus:border-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed mx-1"
                aria-label={`Blank ${i + 1}`}
              />
            )}
          </span>
        ))}
      </p>

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allFilled || submitted}
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
