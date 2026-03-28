import { deriveBadges, CHAPTER_1_LESSON_IDS, Badge } from './badges'

describe('deriveBadges', () => {
  const empty = {
    completedLessons: [] as string[],
    peakStreak: 0,
    xpTotal: 0,
    streakFreezeUsedEver: false,
  }

  it('returns exactly 5 badges', () => {
    const badges = deriveBadges(empty.completedLessons, empty.peakStreak, empty.xpTotal, empty.streakFreezeUsedEver)
    expect(badges).toHaveLength(5)
  })

  it('brand new user has 0 earned badges', () => {
    const badges = deriveBadges(empty.completedLessons, empty.peakStreak, empty.xpTotal, empty.streakFreezeUsedEver)
    const earned = badges.filter(b => b.earned)
    expect(earned).toHaveLength(0)
  })

  describe('first_lesson badge', () => {
    it('is NOT earned when completedLessons is empty', () => {
      const badges = deriveBadges([], 0, 0, false)
      const badge = badges.find(b => b.id === 'first_lesson')!
      expect(badge.earned).toBe(false)
    })

    it('IS earned when completedLessons has 1+ entries', () => {
      const badges = deriveBadges(['lesson-01-what-is-prompting'], 0, 0, false)
      const badge = badges.find(b => b.id === 'first_lesson')!
      expect(badge.earned).toBe(true)
    })
  })

  describe('streak_7 badge', () => {
    it('is NOT earned when peakStreak < 7', () => {
      const badges = deriveBadges([], 6, 0, false)
      const badge = badges.find(b => b.id === 'streak_7')!
      expect(badge.earned).toBe(false)
    })

    it('IS earned when peakStreak >= 7', () => {
      const badges = deriveBadges([], 7, 0, false)
      const badge = badges.find(b => b.id === 'streak_7')!
      expect(badge.earned).toBe(true)
    })

    it('uses peakStreak (not current streak)', () => {
      // peakStreak=7, but if it used current streak=0, it would fail
      const badges = deriveBadges([], 7, 0, false)
      const badge = badges.find(b => b.id === 'streak_7')!
      expect(badge.earned).toBe(true)
    })
  })

  describe('chapter_1_complete badge', () => {
    it('is NOT earned when only some chapter 1 lessons are completed', () => {
      const badges = deriveBadges(['lesson-01-what-is-prompting', 'lesson-02-clarity'], 0, 0, false)
      const badge = badges.find(b => b.id === 'chapter_1_complete')!
      expect(badge.earned).toBe(false)
    })

    it('IS earned when all CHAPTER_1_LESSON_IDS are completed', () => {
      const badges = deriveBadges([...CHAPTER_1_LESSON_IDS], 0, 0, false)
      const badge = badges.find(b => b.id === 'chapter_1_complete')!
      expect(badge.earned).toBe(true)
    })

    it('IS earned even when extra lessons are completed beyond chapter 1', () => {
      const badges = deriveBadges([...CHAPTER_1_LESSON_IDS, 'lesson-06-extra'], 0, 0, false)
      const badge = badges.find(b => b.id === 'chapter_1_complete')!
      expect(badge.earned).toBe(true)
    })
  })

  describe('level_3 badge', () => {
    it('is NOT earned when xpTotal gives level < 3', () => {
      // Level thresholds: [0, 100, 250, 500, ...] — need 250 for level 3
      const badges = deriveBadges([], 0, 249, false)
      const badge = badges.find(b => b.id === 'level_3')!
      expect(badge.earned).toBe(false)
    })

    it('IS earned when xpTotal gives level >= 3', () => {
      // 500 XP = level 4 (thresholds 0,100,250,500 all satisfied)
      const badges = deriveBadges([], 0, 500, false)
      const badge = badges.find(b => b.id === 'level_3')!
      expect(badge.earned).toBe(true)
    })

    it('IS earned at exactly level 3 (250 XP)', () => {
      const badges = deriveBadges([], 0, 250, false)
      const badge = badges.find(b => b.id === 'level_3')!
      expect(badge.earned).toBe(true)
    })
  })

  describe('resilient badge', () => {
    it('is NOT earned when streakFreezeUsedEver is false', () => {
      const badges = deriveBadges([], 0, 0, false)
      const badge = badges.find(b => b.id === 'resilient')!
      expect(badge.earned).toBe(false)
    })

    it('IS earned when streakFreezeUsedEver is true', () => {
      const badges = deriveBadges([], 0, 0, true)
      const badge = badges.find(b => b.id === 'resilient')!
      expect(badge.earned).toBe(true)
    })
  })

  it('each badge has required fields: id, titleKey, descriptionKey, icon, earned', () => {
    const badges = deriveBadges([], 0, 0, false)
    for (const badge of badges) {
      expect(badge).toHaveProperty('id')
      expect(badge).toHaveProperty('titleKey')
      expect(badge).toHaveProperty('descriptionKey')
      expect(badge).toHaveProperty('icon')
      expect(badge).toHaveProperty('earned')
      expect(typeof badge.earned).toBe('boolean')
    }
  })

  it('CHAPTER_1_LESSON_IDS exports 5 lesson IDs', () => {
    expect(CHAPTER_1_LESSON_IDS).toHaveLength(5)
  })
})
