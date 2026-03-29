import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AppHead } from '@/components/AppHead'
import { chapters, loadLesson } from '@/content'
import { deriveNodeStates, getCurrentLessonId } from '@shared/skill-tree/skillTreeUtils'
import { useProgressStore } from '@/store/useProgressStore'
import { useLanguage } from '@/hooks/useLanguage'
import { ChapterSection } from '@/components/ChapterSection'

export function SkillTreePage() {
  const { t } = useTranslation()
  const { currentLanguage: lang } = useLanguage()
  const completedLessons = useProgressStore((s) => s.completedLessons)
  const unlockedLessons = useProgressStore((s) => s.unlockedLessons)

  const allLessonIds = useMemo(() => chapters.flatMap((ch) => ch.lessonIds), [])

  const nodeStates = useMemo(
    () => deriveNodeStates(allLessonIds, completedLessons, unlockedLessons),
    [allLessonIds, completedLessons, unlockedLessons],
  )

  const currentLessonId = useMemo(
    () => getCurrentLessonId(chapters, completedLessons, unlockedLessons),
    [completedLessons, unlockedLessons],
  )

  const totalCompleted = completedLessons.length

  const lessonTitles = useMemo(() => {
    const titles: Record<string, string> = {}
    for (const id of allLessonIds) {
      try {
        const lesson = loadLesson(id)
        titles[id] = lesson.content.title[lang]
      } catch {
        titles[id] = id
      }
    }
    return titles
  }, [allLessonIds, lang])

  useEffect(() => {
    if (currentLessonId) {
      const el = document.querySelector(`[data-lesson-id="${currentLessonId}"]`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentLessonId])

  return (
    <div className="flex-1 overflow-y-auto py-6 px-4">
      <AppHead title="Skill Tree" />
      {/* Page header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{t('skillTree.title')}</h1>
        <p className="text-sm text-gray-500">
          {t('skillTree.progress', { completed: totalCompleted, total: allLessonIds.length })}
        </p>
      </div>

      {/* Chapter sections */}
      <div className="flex flex-col items-center gap-8 max-w-lg mx-auto">
        {chapters.map((chapter, chapterIdx) => {
          const startOrder =
            chapters
              .slice(0, chapterIdx)
              .reduce((sum, ch) => sum + ch.lessonIds.length, 0) + 1
          return (
            <ChapterSection
              key={chapter.id}
              chapter={chapter}
              nodeStates={nodeStates}
              lessonTitles={lessonTitles}
              startOrder={startOrder}
            />
          )
        })}
      </div>
    </div>
  )
}
