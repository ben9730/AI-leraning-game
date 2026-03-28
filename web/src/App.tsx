import type { Lesson } from '@shared/content/schema'

export function App() {
  // Type-only import proves the alias works at compile time
  const _typeCheck: Lesson | null = null
  void _typeCheck

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-indigo-600 mb-2">
          PromptPlay
        </h1>
        <p className="text-lg text-gray-600">
          Web v2.0 — Coming Soon
        </p>
        <p className="text-sm text-gray-400 mt-4">
          Shared package connected
        </p>
      </div>
    </div>
  )
}
