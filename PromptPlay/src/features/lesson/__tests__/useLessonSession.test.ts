import { renderHook, act } from '@testing-library/react-native'
import { useLessonSession } from '../useLessonSession'
import { Lesson } from '@/src/content/schema'

// Minimal mock lesson with 2 exercises
const mockLesson: Lesson = {
  id: 'test-lesson',
  order: 1,
  chapter: 1,
  prerequisites: [],
  xpReward: 10,
  content: {
    title: { en: 'Test Lesson', he: 'שיעור בדיקה' },
    body: { en: 'Test body', he: 'גוף בדיקה' },
  },
  exercises: [
    {
      id: 'ex-01',
      type: 'mcq',
      prompt: { en: 'Question 1', he: 'שאלה 1' },
      order: 1,
      options: [
        { en: 'A', he: 'א' },
        { en: 'B', he: 'ב' },
      ],
      correctIndex: 0,
      explanation: { en: 'Explanation 1', he: 'הסבר 1' },
    },
    {
      id: 'ex-02',
      type: 'mcq',
      prompt: { en: 'Question 2', he: 'שאלה 2' },
      order: 2,
      options: [
        { en: 'C', he: 'ג' },
        { en: 'D', he: 'ד' },
      ],
      correctIndex: 1,
      explanation: { en: 'Explanation 2', he: 'הסבר 2' },
    },
  ],
}

describe('useLessonSession', () => {
  it('initial step is { phase: "intro" }', () => {
    const { result } = renderHook(() => useLessonSession(mockLesson))
    expect(result.current.step).toEqual({ phase: 'intro' })
  })

  it('advance() from intro moves to { phase: "exercise", index: 0 }', () => {
    const { result } = renderHook(() => useLessonSession(mockLesson))
    act(() => {
      result.current.advance()
    })
    expect(result.current.step).toEqual({ phase: 'exercise', index: 0 })
  })

  it('advance() from exercise index 0 with 2 exercises moves to { phase: "exercise", index: 1 }', () => {
    const { result } = renderHook(() => useLessonSession(mockLesson))
    act(() => { result.current.advance() })        // intro -> exercise 0
    act(() => { result.current.advance(80) })      // exercise 0 -> exercise 1
    expect(result.current.step).toEqual({ phase: 'exercise', index: 1 })
  })

  it('advance() from last exercise moves to { phase: "complete", totalScore: accumulated }', () => {
    const { result } = renderHook(() => useLessonSession(mockLesson))
    act(() => { result.current.advance() })        // intro -> exercise 0
    act(() => { result.current.advance(80) })      // exercise 0 -> exercise 1
    act(() => { result.current.advance(60) })      // exercise 1 -> complete
    expect(result.current.step.phase).toBe('complete')
  })

  it('score accumulation — advance(80) then advance(60) results in totalScore 70', () => {
    const { result } = renderHook(() => useLessonSession(mockLesson))
    act(() => { result.current.advance() })        // intro -> exercise 0
    act(() => { result.current.advance(80) })      // score 80
    act(() => { result.current.advance(60) })      // score 60, complete
    const step = result.current.step
    expect(step.phase).toBe('complete')
    if (step.phase === 'complete') {
      expect(step.totalScore).toBe(70) // Math.round((80 + 60) / 2)
    }
  })

  it('currentExercise returns the correct exercise object from lesson.exercises[index]', () => {
    const { result } = renderHook(() => useLessonSession(mockLesson))
    act(() => { result.current.advance() })        // intro -> exercise 0
    expect(result.current.currentExercise).toEqual(mockLesson.exercises[0])
    act(() => { result.current.advance(100) })     // exercise 0 -> exercise 1
    expect(result.current.currentExercise).toEqual(mockLesson.exercises[1])
  })

  it('exerciseCount returns lesson.exercises.length', () => {
    const { result } = renderHook(() => useLessonSession(mockLesson))
    expect(result.current.exerciseCount).toBe(2)
  })

  it('exerciseIndex returns current 0-based index (or -1 when not in exercise phase)', () => {
    const { result } = renderHook(() => useLessonSession(mockLesson))
    // In intro phase
    expect(result.current.exerciseIndex).toBe(-1)
    act(() => { result.current.advance() })        // intro -> exercise 0
    expect(result.current.exerciseIndex).toBe(0)
    act(() => { result.current.advance(100) })     // exercise 0 -> exercise 1
    expect(result.current.exerciseIndex).toBe(1)
  })
})
