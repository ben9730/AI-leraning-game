import { Chapter } from '@/src/content/schema'
import { NodeState } from './useSkillTreeData'

/**
 * Pure function: derive a state map for each lessonId.
 * Exported for unit testing without store dependencies.
 */
export function deriveNodeStates(
  lessonIds: string[],
  completedLessons: string[],
  unlockedLessons: string[],
): Record<string, NodeState> {
  const result: Record<string, NodeState> = {}
  for (const id of lessonIds) {
    if (completedLessons.includes(id)) {
      result[id] = 'complete'
    } else if (unlockedLessons.includes(id)) {
      result[id] = 'unlocked'
    } else {
      result[id] = 'locked'
    }
  }
  return result
}

/**
 * Pure function: find the first unlocked-but-not-completed lesson ID.
 * Exported for unit testing and scroll-to-current use.
 */
export function getCurrentLessonId(
  chapterList: Chapter[],
  completedLessons: string[],
  unlockedLessons: string[],
): string | null {
  for (const chapter of chapterList) {
    for (const id of chapter.lessonIds) {
      if (unlockedLessons.includes(id) && !completedLessons.includes(id)) {
        return id
      }
    }
  }
  return null
}
