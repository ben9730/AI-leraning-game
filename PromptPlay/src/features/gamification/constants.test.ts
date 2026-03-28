import { LEVEL_THRESHOLDS, DAILY_GOAL_XP, BASE_LESSON_XP, BASE_EXERCISE_XP, STREAK_MULTIPLIER_TIERS } from './constants'

describe('LEVEL_THRESHOLDS', () => {
  it('has exactly 8 entries', () => {
    expect(LEVEL_THRESHOLDS).toHaveLength(8)
  })

  it('starts at 0 and increases monotonically', () => {
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      expect(LEVEL_THRESHOLDS[i]).toBeGreaterThan(LEVEL_THRESHOLDS[i - 1])
    }
  })

  it('has expected values [0, 100, 250, 500, 1000, 2000, 3500, 5000]', () => {
    expect(LEVEL_THRESHOLDS).toEqual([0, 100, 250, 500, 1000, 2000, 3500, 5000])
  })
})

describe('DAILY_GOAL_XP', () => {
  it('maps casual to 30', () => {
    expect(DAILY_GOAL_XP.casual).toBe(30)
  })

  it('maps regular to 60', () => {
    expect(DAILY_GOAL_XP.regular).toBe(60)
  })

  it('maps serious to 100', () => {
    expect(DAILY_GOAL_XP.serious).toBe(100)
  })
})

describe('BASE_LESSON_XP', () => {
  it('equals 20', () => {
    expect(BASE_LESSON_XP).toBe(20)
  })
})

describe('BASE_EXERCISE_XP', () => {
  it('equals 5', () => {
    expect(BASE_EXERCISE_XP).toBe(5)
  })
})

describe('STREAK_MULTIPLIER_TIERS', () => {
  it('has tiers for 3, 7, 14 day streaks', () => {
    const mins = STREAK_MULTIPLIER_TIERS.map(t => t.min)
    expect(mins).toContain(3)
    expect(mins).toContain(7)
    expect(mins).toContain(14)
  })

  it('tier at 14 days has multiplier 1.5', () => {
    const tier = STREAK_MULTIPLIER_TIERS.find(t => t.min === 14)
    expect(tier?.mult).toBe(1.5)
  })

  it('tier at 7 days has multiplier 1.2', () => {
    const tier = STREAK_MULTIPLIER_TIERS.find(t => t.min === 7)
    expect(tier?.mult).toBe(1.2)
  })

  it('tier at 3 days has multiplier 1.1', () => {
    const tier = STREAK_MULTIPLIER_TIERS.find(t => t.min === 3)
    expect(tier?.mult).toBe(1.1)
  })
})
