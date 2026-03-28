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

  // Actions
  addXP: (amount: number, source: XPTransaction['source']) => void
  completeLesson: (lessonId: string) => void
  unlockLesson: (lessonId: string) => void
  setLanguage: (lang: 'en' | 'he') => void
  setDailyGoal: (goal: UserProgress['dailyGoal']) => void
  updateStreak: () => void
}

// NEVER store currentLevel — always derive from xpTotal
export const getLevel = (xp: number): number => {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5000]
  return thresholds.filter(t => xp >= t).length
}
