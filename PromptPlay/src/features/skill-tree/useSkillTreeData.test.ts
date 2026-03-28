import { getCurrentLessonId, deriveNodeStates } from './skillTreeUtils'
import { Chapter } from '@/src/content/schema'

const mockChapters: Chapter[] = [
  {
    id: 1,
    title: { en: 'Chapter 1', he: 'פרק 1' },
    description: { en: 'Desc', he: 'תיאור' },
    lessonIds: ['lesson-01', 'lesson-02', 'lesson-03'],
  },
]

describe('getCurrentLessonId', () => {
  it('returns first unlocked lesson when nothing is completed', () => {
    expect(getCurrentLessonId(mockChapters, [], ['lesson-01'])).toBe('lesson-01')
  })

  it('returns second lesson when first is completed but second is unlocked', () => {
    expect(getCurrentLessonId(mockChapters, ['lesson-01'], ['lesson-01', 'lesson-02'])).toBe('lesson-02')
  })

  it('returns null when all lessons are completed', () => {
    expect(
      getCurrentLessonId(
        mockChapters,
        ['lesson-01', 'lesson-02', 'lesson-03'],
        ['lesson-01', 'lesson-02', 'lesson-03'],
      ),
    ).toBeNull()
  })

  it('returns null when all locked (no unlocked lessons)', () => {
    expect(getCurrentLessonId(mockChapters, [], [])).toBeNull()
  })

  it('skips completed lessons and finds next unlocked', () => {
    expect(
      getCurrentLessonId(
        mockChapters,
        ['lesson-01', 'lesson-02'],
        ['lesson-01', 'lesson-02', 'lesson-03'],
      ),
    ).toBe('lesson-03')
  })
})

describe('deriveNodeStates', () => {
  it('marks lessons not in either array as locked', () => {
    const states = deriveNodeStates(['lesson-01', 'lesson-02'], [], [])
    expect(states['lesson-01']).toBe('locked')
    expect(states['lesson-02']).toBe('locked')
  })

  it('marks lessons in unlockedLessons as unlocked', () => {
    const states = deriveNodeStates(['lesson-01', 'lesson-02'], [], ['lesson-01'])
    expect(states['lesson-01']).toBe('unlocked')
    expect(states['lesson-02']).toBe('locked')
  })

  it('marks lessons in completedLessons as complete (overrides unlocked)', () => {
    const states = deriveNodeStates(['lesson-01'], ['lesson-01'], ['lesson-01'])
    expect(states['lesson-01']).toBe('complete')
  })

  it('marks completed lesson as complete even if not in unlockedLessons', () => {
    const states = deriveNodeStates(['lesson-01'], ['lesson-01'], [])
    expect(states['lesson-01']).toBe('complete')
  })

  it('handles mixed states across multiple lessons', () => {
    const states = deriveNodeStates(
      ['lesson-01', 'lesson-02', 'lesson-03'],
      ['lesson-01'],
      ['lesson-01', 'lesson-02'],
    )
    expect(states['lesson-01']).toBe('complete')
    expect(states['lesson-02']).toBe('unlocked')
    expect(states['lesson-03']).toBe('locked')
  })
})
