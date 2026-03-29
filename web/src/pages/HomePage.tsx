import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const { currentLanguage: lang } = useLanguage()
  const completedLessons = useProgressStore(s => s.completedLessons)
  const unlockedLessons = useProgressStore(s => s.unlockedLessons)

  return (
    <div className="flex-1 bg-[var(--clay-bg)] p-4 pb-8">
      <AppHead description="Practice AI prompting with gamified lessons. Earn XP, build streaks." />
      <h1 className="text-3xl font-bold text-[var(--clay-primary)] text-center mb-6">PromptPlay</h1>
      <div className="max-w-lg mx-auto space-y-6">
        {chapters.map(chapter => (
          <div key={chapter.id}>
            <h2 className="text-xl font-semibold text-[var(--clay-text)] mb-3 text-start">
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
                      className="clay-card w-full flex items-center gap-3 rounded-2xl border-3 border-green-200 bg-green-50 p-4 ps-4 pe-4 cursor-pointer text-start"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--clay-cta)] text-white font-bold text-sm">
                        &#10003;
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--clay-text)] truncate">
                          {lesson.content.title[lang]}
                        </p>
                        <p className="text-xs text-gray-500">{t('lesson.completed')}</p>
                      </div>
                    </button>
                  )
                }

                if (state === 'unlocked') {
                  return (
                    <button
                      key={lessonId}
                      onClick={() => navigate(`/lesson/${lessonId}`)}
                      className="clay-card w-full flex items-center gap-3 rounded-2xl border-3 border-[var(--clay-secondary)]/30 bg-white p-4 ps-4 pe-4 cursor-pointer text-start"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--clay-secondary)]/20 text-[var(--clay-primary)] font-bold text-sm">
                        {lesson.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--clay-text)] truncate">
                          {lesson.content.title[lang]}
                        </p>
                        <p className="text-xs text-gray-500">{t('lesson.exercises_count', { count: lesson.exercises.length })}</p>
                      </div>
                    </button>
                  )
                }

                // locked
                return (
                  <div
                    key={lessonId}
                    className="w-full flex items-center gap-3 rounded-2xl border-3 border-gray-200 bg-gray-50 p-4 ps-4 pe-4 opacity-50 cursor-not-allowed text-start"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-gray-500 font-bold text-sm">
                      &#128274;
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-500 truncate">
                        {lesson.content.title[lang]}
                      </p>
                      <p className="text-xs text-gray-400">{t('lesson.locked')}</p>
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
