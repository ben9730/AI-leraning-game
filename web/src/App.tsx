import { useProgressStore } from './store/useProgressStore'

export function App() {
  const xpTotal = useProgressStore(s => s.xpTotal)
  const language = useProgressStore(s => s.language)
  const addXP = useProgressStore(s => s.addXP)

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-indigo-600 mb-2">
          PromptPlay
        </h1>
        <p className="text-lg text-gray-600">
          Web v2.0 — Coming Soon
        </p>
        <div className="mt-6 space-y-3">
          <p className="text-2xl font-semibold text-purple-700">
            {xpTotal} XP
          </p>
          <p className="text-sm text-gray-500">
            Language: {language}
          </p>
          <button
            type="button"
            onClick={() => addXP(10, 'exercise_pass')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            +10 XP
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Shared package connected
        </p>
      </div>
    </div>
  )
}
