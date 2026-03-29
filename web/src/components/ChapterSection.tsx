import { useTranslation } from 'react-i18next'
import { useLanguage } from '@/hooks/useLanguage'
import { SkillTreeNode } from './SkillTreeNode'
import type { NodeState } from '@shared/skill-tree/skillTreeUtils'
import type { Chapter } from '@shared/content/schema'

interface ChapterSectionProps {
  chapter: Chapter
  nodeStates: Record<string, NodeState>
  lessonTitles: Record<string, string>
  startOrder: number
}

export function ChapterSection({
  chapter,
  nodeStates,
  lessonTitles,
  startOrder,
}: ChapterSectionProps) {
  const { t } = useTranslation()
  const { currentLanguage: lang } = useLanguage()

  const completedCount = chapter.lessonIds.filter(
    (id) => nodeStates[id] === 'complete',
  ).length

  return (
    <section className="flex flex-col items-center">
      {/* Chapter header */}
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-gray-800">{chapter.title[lang]}</h2>
        <p className="text-xs text-gray-500 mt-1">
          {t('skillTree.chapterProgress', {
            completed: completedCount,
            total: chapter.lessonIds.length,
          })}
        </p>
      </div>

      {/* Node column */}
      <div className="flex flex-col items-center gap-0">
        {chapter.lessonIds.map((lessonId, idx) => (
          <div key={lessonId} className="flex flex-col items-center">
            <SkillTreeNode
              lessonId={lessonId}
              state={nodeStates[lessonId] || 'locked'}
              orderNumber={startOrder + idx}
              lessonTitle={lessonTitles[lessonId] || lessonId}
            />
            {/* Connector line between nodes (not after last) */}
            {idx < chapter.lessonIds.length - 1 && (
              <div
                className={`w-0.5 h-6 ${
                  nodeStates[chapter.lessonIds[idx + 1]] === 'complete'
                    ? 'bg-green-300'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
