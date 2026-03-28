export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5000]

export const BASE_LESSON_XP = 20

export const BASE_EXERCISE_XP = 5

export const DAILY_GOAL_XP: Record<'casual' | 'regular' | 'serious', number> = {
  casual: 30,
  regular: 60,
  serious: 100,
}

/**
 * Streak multiplier tiers, evaluated from highest min downward.
 * Default multiplier when no tier matches: 1.0
 */
export const STREAK_MULTIPLIER_TIERS: { min: number; mult: number }[] = [
  { min: 14, mult: 1.5 },
  { min: 7, mult: 1.2 },
  { min: 3, mult: 1.1 },
]
