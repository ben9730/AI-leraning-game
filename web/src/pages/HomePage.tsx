import { useNavigate } from 'react-router'
import { chapters, loadLesson } from '@/content'
import { useProgressStore } from '@/store/useProgressStore'
import { useLanguage } from '@/hooks/useLanguage'
import { AppHead } from '@/components/AppHead'

type LessonUIState = 'locked' | 'unlocked' | 'completed'

function getLessonUIState(
  id: string,
  completedLessons: string[],
  unlockedLessons: string[]
): LessonUIState {
  if (completedLessons.includes(id)) return 'completed'
  if (unlockedLessons.includes(id)) return 'unlocked'
  return 'locked'
}

export function HomePage() {
  const navigate = useNavigate()
  const { currentLanguage: lang } = useLanguage()
  const completedLessons = useProgressStore(s => s.completedLessons)
  const unlockedLessons = useProgressStore(s => s.unlockedLessons)

  return (
    <div className="flex-1 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 pb-8">
      <AppHead description="Practice AI prompting with gamified lessons. Earn XP, build streaks." />
      <h1 className="text-3xl font-bold text-indigo-600 text-center mb-6">PromptPlay</h1>
      <div className="max-w-lg mx-auto space-y-6">
        {chapters.map(chapter => (
          <div key={chapter.id}>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 text-start">
              {chapter.title[lang]}
            </h2>
            <p className="text-sm text-gray-500 mb-3 text-start">
              {chapter.description[lang]}
            </p>
            <div className="space-y-2">
              {chapter.lessonIds.map(lessonId => {
                const lesson = loadLesson(lessonId)
                const state = getLessonUIState(lessonId, completedLessons, unlockedLessons)

                if (state === 'completed') {
                  return (
                    <button
                      key={lessonId}
                      onClick={() => navigate(`/lesson/${lessonId}`)}
                      className="w-full flex items-center gap-3 rounded-xl border-2 border-green-200 bg-green-50 p-4 ps-4 pe-4 shadow-sm hover:shadow-md transition-all cursor-pointer text-start"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white font-bold text-sm">
                        &#10003;
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700 truncate">
                          {lesson.content.title[lang]}
                        </p>
                        <p className="text-xs text-gray-500">Completed</p>
                      </div>
                    </button>
                  )
                }

                if (state === 'unlocked') {
                  return (
                    <button
                      key={lessonId}
                      onClick={() => navigate(`/lesson/${lessonId}`)}
                      className="w-full flex items-center gap-3 rounded-xl border-2 border-indigo-200 bg-white p-4 ps-4 pe-4 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer text-start"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                        {lesson.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {lesson.content.title[lang]}
                        </p>
                        <p className="text-xs text-gray-500">{lesson.exercises.length} exercises</p>
                      </div>
                    </button>
                  )
                }

                // locked
                return (
                  <div
                    key={lessonId}
                    className="w-full flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-gray-50 p-4 ps-4 pe-4 opacity-60 cursor-not-allowed text-start"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-gray-500 font-bold text-sm">
                      &#128274;
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-500 truncate">
                        {lesson.content.title[lang]}
                      </p>
                      <p className="text-xs text-gray-400">Locked</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
