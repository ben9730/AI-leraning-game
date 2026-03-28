import { useProgressStore } from '@/src/store/useProgressStore'
import { chapters } from '@/src/content/curriculum'
import { loadLesson } from '@/src/content/loader'
import { Chapter, LocalizedString } from '@/src/content/schema'
import { deriveNodeStates, getCurrentLessonId } from './skillTreeUtils'

export type NodeState = 'locked' | 'unlocked' | 'complete'

export interface SkillNode {
  lessonId: string
  title: LocalizedString
  state: NodeState
}

export interface ChapterGroup {
  chapter: Chapter
  nodes: SkillNode[]
}

// Re-export pure utilities for consumers
export { deriveNodeStates, getCurrentLessonId }

/**
 * Hook: derives ChapterGroup[] from the progress store + curriculum data.
 */
export function useSkillTreeData(): ChapterGroup[] {
  const completedLessons = useProgressStore(s => s.completedLessons)
  const unlockedLessons = useProgressStore(s => s.unlockedLessons)

  return chapters.map((chapter) => {
    const nodes: SkillNode[] = chapter.lessonIds.map((lessonId) => {
      let title: LocalizedString
      try {
        title = loadLesson(lessonId).content.title
      } catch {
        title = { en: lessonId, he: lessonId }
      }

      let state: NodeState
      if (completedLessons.includes(lessonId)) {
        state = 'complete'
      } else if (unlockedLessons.includes(lessonId)) {
        state = 'unlocked'
      } else {
        state = 'locked'
      }

      return { lessonId, title, state }
    })

    return { chapter, nodes }
  })
}
