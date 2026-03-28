import { getLevel } from '../store/types'

export interface Badge {
  id: string
  titleKey: string
  descriptionKey: string
  icon: string
  earned: boolean
}

/**
 * The 5 lesson IDs that comprise Chapter 1.
 * Used by deriveBadges to determine chapter_1_complete badge eligibility.
 */
export const CHAPTER_1_LESSON_IDS: string[] = [
  'lesson-01-what-is-prompting',
  'lesson-02-clarity',
  'lesson-03-specificity',
  'lesson-04-context',
  'lesson-05-intent',
]

interface BadgeDefinition {
  id: string
  titleKey: string
  descriptionKey: string
  icon: string
  check: (
    completedLessons: string[],
    peakStreak: number,
    xpTotal: number,
    streakFreezeUsedEver: boolean,
  ) => boolean
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_lesson',
    titleKey: 'badge.first_lesson.title',
    descriptionKey: 'badge.first_lesson.description',
    icon: '🎯',
    check: (completedLessons) => completedLessons.length >= 1,
  },
  {
    id: 'streak_7',
    titleKey: 'badge.streak_7.title',
    descriptionKey: 'badge.streak_7.description',
    icon: '🔥',
    check: (_completedLessons, peakStreak) => peakStreak >= 7,
  },
  {
    id: 'chapter_1_complete',
    titleKey: 'badge.chapter_1.title',
    descriptionKey: 'badge.chapter_1.description',
    icon: '📚',
    check: (completedLessons) =>
      CHAPTER_1_LESSON_IDS.every(id => completedLessons.includes(id)),
  },
  {
    id: 'level_3',
    titleKey: 'badge.level_3.title',
    descriptionKey: 'badge.level_3.description',
    icon: '⭐',
    check: (_completedLessons, _peakStreak, xpTotal) => getLevel(xpTotal) >= 3,
  },
  {
    id: 'resilient',
    titleKey: 'badge.resilient.title',
    descriptionKey: 'badge.resilient.description',
    icon: '🛡️',
    check: (_completedLessons, _peakStreak, _xpTotal, streakFreezeUsedEver) =>
      streakFreezeUsedEver,
  },
]

/**
 * Pure function: derives all badge states from current progress.
 * Badges are NEVER stored — always computed fresh from state.
 */
export function deriveBadges(
  completedLessons: string[],
  peakStreak: number,
  xpTotal: number,
  streakFreezeUsedEver: boolean,
): Badge[] {
  return BADGE_DEFINITIONS.map(def => ({
    id: def.id,
    titleKey: def.titleKey,
    descriptionKey: def.descriptionKey,
    icon: def.icon,
    earned: def.check(completedLessons, peakStreak, xpTotal, streakFreezeUsedEver),
  }))
}
