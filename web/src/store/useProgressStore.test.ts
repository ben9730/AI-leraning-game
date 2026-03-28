import { describe, it, expect, beforeEach } from 'vitest'
import { useProgressStore } from './useProgressStore'
import type { UserProgress } from '@shared/store/types'

// Helper to get current state without React
const getState = () => useProgressStore.getState()

// Helper to get today's ISO date (same as store uses)
const todayISO = () => new Date().toLocaleDateString('en-CA')

describe('useProgressStore', () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset store state values without replacing action functions
    useProgressStore.setState({
      userId: 'test-user',
      xpTotal: 0,
      xpHistory: [],
      streakCount: 0,
      lastActivityDate: '',
      completedLessons: [],
      unlockedLessons: ['lesson-01-what-is-prompting'],
      language: 'en',
      dailyGoal: null,
      streakFreezes: 0,
      peakStreak: 0,
      pendingLevelUp: null,
      streakFreezeUsedEver: false,
      _hasHydrated: false,
    })
  })

  // Test 1: Default state
  it('initializes with default state', () => {
    const state = getState()
    expect(state.xpTotal).toBe(0)
    expect(state.streakCount).toBe(0)
    expect(state.language).toBe('en')
    expect(state.completedLessons).toEqual([])
    expect(state.unlockedLessons).toEqual(['lesson-01-what-is-prompting'])
  })

  // Test 2: addXP increments total and appends to history
  it('addXP increments xpTotal and appends to xpHistory', () => {
    getState().addXP(50, 'lesson_complete')
    const state = getState()
    expect(state.xpTotal).toBe(50)
    expect(state.xpHistory).toHaveLength(1)
    expect(state.xpHistory[0].amount).toBe(50)
    expect(state.xpHistory[0].source).toBe('lesson_complete')
    expect(state.xpHistory[0].timestamp).toBeGreaterThan(0)
  })

  // Test 3: addXP crossing level threshold sets pendingLevelUp
  it('addXP crossing level threshold sets pendingLevelUp', () => {
    // Level thresholds: [0, 100, 250, 500, 1000, 2000, 3500, 5000]
    // At 0 XP, level = 1 (passes threshold 0). Adding 100 XP => level 2.
    getState().addXP(100, 'lesson_complete')
    expect(getState().pendingLevelUp).toBe(2)
  })

  // Test 4: completeLesson adds to array, no duplicates
  it('completeLesson adds to completedLessons without duplicates', () => {
    getState().completeLesson('lesson-01')
    expect(getState().completedLessons).toEqual(['lesson-01'])
    getState().completeLesson('lesson-01')
    expect(getState().completedLessons).toEqual(['lesson-01'])
  })

  // Test 5: setLanguage
  it('setLanguage updates language', () => {
    getState().setLanguage('he')
    expect(getState().language).toBe('he')
  })

  // Test 6: updateStreak on first-ever call
  it('updateStreak on first call sets streakCount=1 and lastActivityDate=today', () => {
    getState().updateStreak()
    const state = getState()
    expect(state.streakCount).toBe(1)
    expect(state.lastActivityDate).toBe(todayISO())
  })

  // Test 7: localStorage round-trip
  it('persists state to localStorage and reads it back', () => {
    getState().addXP(42, 'exercise_pass')
    getState().setLanguage('he')

    // Force persist to localStorage
    const stored = localStorage.getItem('user-progress')
    expect(stored).toBeTruthy()

    const parsed = JSON.parse(stored!)
    expect(parsed.state.xpTotal).toBe(42)
    expect(parsed.state.language).toBe('he')
  })

  // Test 8: _hasHydrated starts false, becomes true after rehydration
  it('_hasHydrated starts false and becomes true after rehydration', () => {
    // After our beforeEach reset, _hasHydrated is false
    expect(getState()._hasHydrated).toBe(false)

    // Simulate rehydration callback
    getState().setHasHydrated(true)
    expect(getState()._hasHydrated).toBe(true)
  })

  // Test 9: partialize excludes _hasHydrated and actions from persistence
  it('partialize excludes _hasHydrated and actions from persisted state', () => {
    getState().addXP(10, 'exercise_pass')

    const stored = localStorage.getItem('user-progress')
    expect(stored).toBeTruthy()

    const parsed = JSON.parse(stored!)
    // Should NOT have hydration flag or actions in persisted data
    expect(parsed.state._hasHydrated).toBeUndefined()
    expect(parsed.state.setHasHydrated).toBeUndefined()
    expect(parsed.state.addXP).toBeUndefined()
    expect(parsed.state.completeLesson).toBeUndefined()
    expect(parsed.state.updateStreak).toBeUndefined()
    // Should HAVE regular state
    expect(parsed.state.xpTotal).toBe(10)
    expect(parsed.state.userId).toBeDefined()
  })
})
