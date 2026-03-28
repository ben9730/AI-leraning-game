import { STREAK_MULTIPLIER_TIERS } from './constants'

// ---------------------------------------------------------------------------
// Streak helpers
// ---------------------------------------------------------------------------

/**
 * Pure date arithmetic — returns an ISO YYYY-MM-DD string offset by `days`.
 * Works entirely in local timezone via en-CA locale formatting.
 */
export function offsetDate(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00') // parse as local midnight
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-CA')
}

export interface StreakResult {
  newStreakCount: number
  newFreezes: number
  freezeConsumed: boolean
}

/**
 * Pure function: calculates the new streak state after an activity.
 *
 * Rules (in priority order):
 *  1. Same day as lastActivityDate  → no change (idempotent)
 *  2. Consecutive day               → streak + 1, no freeze used
 *  3. Exactly 1 day missed + freeze → streak + 1, consume 1 freeze
 *  4. Otherwise                     → streak resets to 1, freezes unchanged
 *
 * "Day before today" and "day before that" are computed in local timezone
 * via offsetDate so midnight resets honour the user's local clock.
 */
export function calcStreakUpdate(
  lastActivityDate: string,
  streakCount: number,
  streakFreezes: number,
  todayISO: string,
): StreakResult {
  // Case 1: already logged today
  if (lastActivityDate === todayISO) {
    return { newStreakCount: streakCount, newFreezes: streakFreezes, freezeConsumed: false }
  }

  const yesterday = offsetDate(todayISO, -1)
  const dayBefore = offsetDate(todayISO, -2)

  // Case 2: consecutive day
  if (lastActivityDate === yesterday) {
    return { newStreakCount: streakCount + 1, newFreezes: streakFreezes, freezeConsumed: false }
  }

  // Case 3: exactly 1 day missed and freeze available
  if (lastActivityDate === dayBefore && streakFreezes > 0) {
    return { newStreakCount: streakCount + 1, newFreezes: streakFreezes - 1, freezeConsumed: true }
  }

  // Case 4: 2+ days missed, no freeze, or first-ever (empty string)
  return { newStreakCount: 1, newFreezes: streakFreezes, freezeConsumed: false }
}

/**
 * Returns true when newStreakCount is a positive multiple of 7 — grants a freeze.
 */
export function shouldGrantFreeze(newStreakCount: number): boolean {
  return newStreakCount > 0 && newStreakCount % 7 === 0
}

// ---------------------------------------------------------------------------
// XP calculation
// ---------------------------------------------------------------------------

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
