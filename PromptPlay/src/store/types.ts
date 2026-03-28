import { LEVEL_THRESHOLDS } from '../features/gamification/constants'

export interface XPTransaction {
  amount: number
  source: 'lesson_complete' | 'exercise_pass' | 'streak_bonus' | 'perfection_bonus'
  timestamp: number // Unix ms
}

export interface UserProgress {
  // State
  userId: string
  xpTotal: number
  xpHistory: XPTransaction[]
  streakCount: number
  lastActivityDate: string  // ISO YYYY-MM-DD, local timezone
  completedLessons: string[]
  unlockedLessons: string[]
  language: 'en' | 'he'
  dailyGoal: 'casual' | 'regular' | 'serious' | null
  streakFreezes: number
  peakStreak: number              // highest streak ever — for badge derivation
  pendingLevelUp: number | null   // new level number, cleared after modal shown
  streakFreezeUsedEver: boolean   // for "resilient" badge

  // Actions
  addXP: (amount: number, source: XPTransaction['source']) => void
  completeLesson: (lessonId: string) => void
  unlockLesson: (lessonId: string) => void
  setLanguage: (lang: 'en' | 'he') => void
  setDailyGoal: (goal: UserProgress['dailyGoal']) => void
  updateStreak: () => void
  clearPendingLevelUp: () => void
  consumeStreakFreeze: () => void
  grantStreakFreeze: () => void
}

// NEVER store currentLevel — always derive from xpTotal
export const getLevel = (xp: number): number => {
  return LEVEL_THRESHOLDS.filter(t => xp >= t).length
}
