import { getLevel } from './types'

// Mock react-native-mmkv with in-memory Map
const mockStorage = new Map<string, string>()

jest.mock('react-native-mmkv', () => {
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => mockStorage.get(key) ?? undefined,
      set: (key: string, value: string) => mockStorage.set(key, value),
      delete: (key: string) => mockStorage.delete(key),
      clearAll: () => mockStorage.clear(),
    })),
  }
})

// Must import store AFTER mocking native modules
let useProgressStore: typeof import('./useProgressStore').useProgressStore

beforeAll(async () => {
  const mod = await import('./useProgressStore')
  useProgressStore = mod.useProgressStore
})

beforeEach(() => {
  mockStorage.clear()
  // Reset store state between tests
  useProgressStore.getState().completedLessons.length // access to ensure loaded
})

describe('getLevel (pure function)', () => {
  test('Test 2a: getLevel(0) returns 1', () => {
    expect(getLevel(0)).toBe(1)
  })

  test('Test 2b: getLevel(100) returns 2', () => {
    expect(getLevel(100)).toBe(2)
  })

  test('Test 2c: getLevel(250) returns 3', () => {
    expect(getLevel(250)).toBe(3)
  })

  test('getLevel(99) returns 1', () => {
    expect(getLevel(99)).toBe(1)
  })

  test('getLevel(5000) returns 8', () => {
    expect(getLevel(5000)).toBe(8)
  })
})

describe('useProgressStore', () => {
  beforeEach(() => {
    // Reset store to defaults before each test
    useProgressStore.setState({
      xpTotal: 0,
      xpHistory: [],
      streakCount: 0,
      lastActivityDate: '',
      completedLessons: [],
      unlockedLessons: ['lesson-01-what-is-prompting'],
      language: 'en',
      dailyGoal: null,
      streakFreezes: 0,
    })
  })

  test('Test 1: Store initializes with correct defaults', () => {
    const state = useProgressStore.getState()
    expect(state.xpTotal).toBe(0)
    expect(state.streakCount).toBe(0)
    expect(state.completedLessons).toEqual([])
    expect(state.language).toBe('en')
  })

  test('Test 3: addXP(50) increases xpTotal from 0 to 50', () => {
    useProgressStore.getState().addXP(50, 'lesson_complete')
    expect(useProgressStore.getState().xpTotal).toBe(50)
  })

  test('Test 4: completeLesson adds to completedLessons', () => {
    useProgressStore.getState().completeLesson('lesson-01')
    expect(useProgressStore.getState().completedLessons).toContain('lesson-01')
  })

  test('Test 5: completeLesson twice does not duplicate', () => {
    useProgressStore.getState().completeLesson('lesson-01')
    useProgressStore.getState().completeLesson('lesson-01')
    const lessons = useProgressStore.getState().completedLessons
    expect(lessons.filter(l => l === 'lesson-01').length).toBe(1)
  })

  test('Test 6: setLanguage updates language field', () => {
    useProgressStore.getState().setLanguage('he')
    expect(useProgressStore.getState().language).toBe('he')
  })

  test('Test 7: unlockedLessons defaults to ["lesson-01-what-is-prompting"]', () => {
    expect(useProgressStore.getState().unlockedLessons).toEqual(['lesson-01-what-is-prompting'])
  })
})
