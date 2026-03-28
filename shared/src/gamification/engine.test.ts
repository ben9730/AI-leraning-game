import { calcXP, calcStreakUpdate, shouldGrantFreeze } from './engine'

describe('calcXP', () => {
  describe('streak multiplier tiers', () => {
    it('streak 0 => multiplier 1.0, no perfection bonus, total = base', () => {
      const result = calcXP(20, 0, false)
      expect(result.base).toBe(20)
      expect(result.streakMultiplier).toBe(1.0)
      expect(result.perfectionBonus).toBe(0)
      expect(result.total).toBe(20)
    })

    it('streak 2 => multiplier 1.0 (below tier 1)', () => {
      const result = calcXP(20, 2, false)
      expect(result.streakMultiplier).toBe(1.0)
      expect(result.total).toBe(20)
    })

    it('streak 3 => multiplier 1.1', () => {
      const result = calcXP(20, 3, false)
      expect(result.streakMultiplier).toBe(1.1)
      expect(result.perfectionBonus).toBe(0)
      expect(result.total).toBe(22)
    })

    it('streak 6 => multiplier 1.1 (still tier 1)', () => {
      const result = calcXP(20, 6, false)
      expect(result.streakMultiplier).toBe(1.1)
      expect(result.total).toBe(22)
    })

    it('streak 7 => multiplier 1.2', () => {
      const result = calcXP(20, 7, false)
      expect(result.streakMultiplier).toBe(1.2)
      expect(result.total).toBe(24)
    })

    it('streak 13 => multiplier 1.2 (still tier 2)', () => {
      const result = calcXP(20, 13, false)
      expect(result.streakMultiplier).toBe(1.2)
      expect(result.total).toBe(24)
    })

    it('streak 14 => multiplier 1.5', () => {
      const result = calcXP(20, 14, false)
      expect(result.streakMultiplier).toBe(1.5)
      expect(result.total).toBe(30)
    })

    it('streak 100 => multiplier 1.5', () => {
      const result = calcXP(20, 100, false)
      expect(result.streakMultiplier).toBe(1.5)
      expect(result.total).toBe(30)
    })
  })

  describe('perfection bonus', () => {
    it('isPerfect=false => perfectionBonus 0', () => {
      const result = calcXP(20, 0, false)
      expect(result.perfectionBonus).toBe(0)
    })

    it('isPerfect=true => perfectionBonus = 50% of base', () => {
      const result = calcXP(20, 0, true)
      expect(result.perfectionBonus).toBe(10)
    })

    it('streak 7 + isPerfect => total = round(20 * 1.2) + 10 = 34', () => {
      const result = calcXP(20, 7, true)
      expect(result.streakMultiplier).toBe(1.2)
      expect(result.perfectionBonus).toBe(10)
      expect(result.total).toBe(34)
    })

    it('streak 14 + isPerfect => total = round(20 * 1.5) + 10 = 40', () => {
      const result = calcXP(20, 14, true)
      expect(result.streakMultiplier).toBe(1.5)
      expect(result.perfectionBonus).toBe(10)
      expect(result.total).toBe(40)
    })

    it('isPerfect bonus rounds correctly on non-divisible base', () => {
      // base=15 => perfectionBonus = Math.round(15 * 0.5) = 8 (round to nearest)
      const result = calcXP(15, 0, true)
      expect(result.perfectionBonus).toBe(8)
    })
  })

  describe('total calculation', () => {
    it('total = Math.round(base * streakMultiplier) + perfectionBonus', () => {
      const result = calcXP(20, 3, true)
      // Math.round(20 * 1.1) = 22, perfectionBonus = 10, total = 32
      expect(result.total).toBe(32)
    })
  })
})

describe('calcStreakUpdate', () => {
  const TODAY = '2026-03-28'

  it('same day — already logged today, no change', () => {
    const result = calcStreakUpdate('2026-03-28', 5, 0, TODAY)
    expect(result).toEqual({ newStreakCount: 5, newFreezes: 0, freezeConsumed: false })
  })

  it('consecutive day — increments streak', () => {
    const result = calcStreakUpdate('2026-03-27', 5, 0, TODAY)
    expect(result).toEqual({ newStreakCount: 6, newFreezes: 0, freezeConsumed: false })
  })

  it('1 day missed, freeze available — consumes freeze, increments streak', () => {
    const result = calcStreakUpdate('2026-03-26', 5, 1, TODAY)
    expect(result).toEqual({ newStreakCount: 6, newFreezes: 0, freezeConsumed: true })
  })

  it('1 day missed, no freeze — resets streak to 1', () => {
    const result = calcStreakUpdate('2026-03-26', 5, 0, TODAY)
    expect(result).toEqual({ newStreakCount: 1, newFreezes: 0, freezeConsumed: false })
  })

  it('2+ days missed, freezes preserved — resets streak to 1', () => {
    const result = calcStreakUpdate('2026-03-25', 5, 2, TODAY)
    expect(result).toEqual({ newStreakCount: 1, newFreezes: 2, freezeConsumed: false })
  })

  it('first ever activity (empty lastActivityDate) — starts streak at 1', () => {
    const result = calcStreakUpdate('', 0, 0, TODAY)
    expect(result).toEqual({ newStreakCount: 1, newFreezes: 0, freezeConsumed: false })
  })

  it('1 day missed with multiple freezes — consumes exactly 1 freeze', () => {
    const result = calcStreakUpdate('2026-03-26', 5, 3, TODAY)
    expect(result).toEqual({ newStreakCount: 6, newFreezes: 2, freezeConsumed: true })
  })
})

describe('shouldGrantFreeze', () => {
  it('streak 7 — grants freeze', () => {
    expect(shouldGrantFreeze(7)).toBe(true)
  })

  it('streak 14 — grants freeze', () => {
    expect(shouldGrantFreeze(14)).toBe(true)
  })

  it('streak 21 — grants freeze', () => {
    expect(shouldGrantFreeze(21)).toBe(true)
  })

  it('streak 6 — does not grant freeze', () => {
    expect(shouldGrantFreeze(6)).toBe(false)
  })

  it('streak 8 — does not grant freeze', () => {
    expect(shouldGrantFreeze(8)).toBe(false)
  })

  it('streak 0 — does not grant freeze', () => {
    expect(shouldGrantFreeze(0)).toBe(false)
  })

  it('streak 13 — does not grant freeze', () => {
    expect(shouldGrantFreeze(13)).toBe(false)
  })
})
