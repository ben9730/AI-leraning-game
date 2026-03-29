import { useState, useEffect } from 'react'
import type { SimulatedChatExercise } from '@shared/content/schema'
import { evaluateSimulatedChat } from '@shared/exercise/evaluators'
import type { EvaluationResult } from '@shared/exercise/types'
import { useLanguage } from '@/hooks/useLanguage'
import type { ExerciseComponentProps } from '../types'
import { FeedbackCard } from './FeedbackCard'

export function SimulatedChatCard({
  exercise,
  onComplete,
}: ExerciseComponentProps<SimulatedChatExercise>) {
  const { currentLanguage: lang } = useLanguage()
  const [userPrompt, setUserPrompt] = useState('')
  const [promptSubmitted, setPromptSubmitted] = useState(false)
  const [showAiResponse, setShowAiResponse] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)

  // Phase 2: After prompt submitted, show AI response with a typing delay
  useEffect(() => {
    if (!promptSubmitted || showAiResponse) return

    const timer = setTimeout(() => {
      setShowAiResponse(true)

      // Auto-evaluate after showing AI response
      const evalResult = evaluateSimulatedChat(exercise, userPrompt, lang)
      setResult(evalResult)
      onComplete({
        exerciseId: exercise.id,
        score: evalResult.score,
        passed: evalResult.passed,
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [promptSubmitted, showAiResponse, exercise, userPrompt, lang, onComplete])

  function handleSendPrompt() {
    if (userPrompt.trim().length === 0 || promptSubmitted) return
    setPromptSubmitted(true)
  }

  return (
    <div className="space-y-4">
      {/* Prompt instruction */}
      <h3 className="text-lg font-semibold text-gray-900 text-start">
        {exercise.prompt[lang]}
      </h3>

      {/* System context */}
      {(exercise.systemContext ?? (exercise as any).systemPrompt) && (
        <div className="border-s-4 border-blue-400 bg-blue-50 ps-4 pe-4 py-3 rounded-e-lg text-gray-600 text-sm text-start">
          {(exercise.systemContext ?? (exercise as any).systemPrompt)[lang]}
        </div>
      )}

      {/* Phase 1: User input */}
      {!promptSubmitted && (
        <>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            disabled={promptSubmitted}
            rows={3}
            placeholder={exercise.hint?.[lang] ?? ''}
            className="w-full rounded-lg border-2 border-gray-200 p-3 ps-4 pe-4 text-start text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed resize-y"
          />

          <button
            type="button"
            onClick={handleSendPrompt}
            disabled={userPrompt.trim().length === 0}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium transition-colors hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send to AI
          </button>
        </>
      )}

      {/* Phase 2+3: Chat bubbles */}
      {promptSubmitted && (
        <div className="space-y-3">
          {/* User message bubble (pushed to end) */}
          <div className="flex">
            <div className="ms-auto max-w-[80%] rounded-2xl bg-indigo-100 ps-4 pe-4 py-3 text-gray-800 text-start">
              {userPrompt}
            </div>
          </div>

          {/* AI response bubble (pushed to start) */}
          {showAiResponse && (
            <div className="flex">
              <div className="me-auto max-w-[80%] rounded-2xl bg-gray-100 ps-4 pe-4 py-3 text-gray-800 text-start">
                {exercise.preScriptedResponse?.[lang] ?? "Thanks for your prompt! Based on what you wrote, I'd be happy to help. Let me work through this step by step..."}
              </div>
            </div>
          )}

          {/* Disabled textarea showing what user typed */}
          <textarea
            value={userPrompt}
            disabled
            rows={2}
            className="w-full rounded-lg border-2 border-gray-200 p-3 ps-4 pe-4 text-start text-gray-500 bg-gray-50 cursor-not-allowed resize-none"
          />
        </div>
      )}

      {/* Phase 3: Feedback */}
      {result && (
        <FeedbackCard result={result} exercise={exercise} lang={lang} />
      )}
    </div>
  )
}
