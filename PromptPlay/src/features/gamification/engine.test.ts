import { calcXP } from './engine'

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
