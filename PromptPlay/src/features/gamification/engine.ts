import { STREAK_MULTIPLIER_TIERS } from './constants'

export interface XPResult {
  base: number
  streakMultiplier: number
  perfectionBonus: number
  total: number
}

/**
 * Pure function: calculates XP earned for a lesson completion.
 *
 * Streak multiplier tiers:
 *   0-2  => 1.0
 *   3-6  => 1.1
 *   7-13 => 1.2
 *   14+  => 1.5
 *
 * Perfection bonus: 50% of base XP (rounded) if isPerfect is true.
 * Total: Math.round(base * streakMultiplier) + perfectionBonus
 */
export function calcXP(
  lessonBaseXP: number,
  streakCount: number,
  isPerfect: boolean,
): XPResult {
  // Find highest matching tier (tiers are sorted descending by min)
  const tier = STREAK_MULTIPLIER_TIERS.find(t => streakCount >= t.min)
  const streakMultiplier = tier ? tier.mult : 1.0

  const perfectionBonus = isPerfect ? Math.round(lessonBaseXP * 0.5) : 0
  const total = Math.round(lessonBaseXP * streakMultiplier) + perfectionBonus

  return {
    base: lessonBaseXP,
    streakMultiplier,
    perfectionBonus,
    total,
  }
}
