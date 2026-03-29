import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useProgressStore } from '@/store/useProgressStore'

// Mock react-router
vi.mock('react-router', () => ({
  useParams: vi.fn(),
  useNavigate: vi.fn(),
}))

// Mock content
vi.mock('@/content', () => ({
  loadLesson: vi.fn(),
  getAllLessonIds: vi.fn(),
  chapters: [],
}))

// Mock exercise registry
vi.mock('@/exercises/registry', () => ({
  getExerciseComponent: vi.fn(),
}))

import { useParams, useNavigate } from 'react-router'
import { loadLesson, getAllLessonIds, chapters } from '@/content'
import { getExerciseComponent } from '@/exercises/registry'
import { LessonPage } from './LessonPage'

const mockNavigate = vi.fn()

const mockLesson = {
  id: 'lesson-01-what-is-prompting',
  order: 1,
  chapter: 1,
  prerequisites: [],
  xpReward: 50,
  content: {
    title: { en: 'What is Prompting?', he: 'מה זה פרומפט?' },
    body: { en: 'Learn the basics', he: 'למד את היסודות' },
    tip: { en: 'Think carefully', he: 'חשוב בזהירות' },
  },
  exercises: [
    {
      id: 'ex-01',
      type: 'mcq',
      order: 1,
      prompt: { en: 'Question 1', he: 'שאלה 1' },
      options: [
        { id: 'a', text: { en: 'Option A', he: 'אפשרות א' }, correct: true },
      ],
    },
    {
      id: 'ex-02',
      type: 'mcq',
      order: 2,
      prompt: { en: 'Question 2', he: 'שאלה 2' },
      options: [
        { id: 'a', text: { en: 'Option A', he: 'אפשרות א' }, correct: true },
      ],
    },
  ],
}

// A fake exercise card that exposes onComplete for testing
function FakeExerciseCard({ exercise, onComplete }: { exercise: any; onComplete: (r: any) => void }) {
  return (
    <div>
      <span data-testid="exercise-id">{exercise.id}</span>
      <button
        onClick={() => onComplete({ exerciseId: exercise.id, score: 1, passed: true })}
      >
        Complete Exercise
      </button>
    </div>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockNavigate.mockReset()

  // Reset store state
  useProgressStore.setState({
    xpTotal: 0,
    xpHistory: [],
    completedLessons: [],
    unlockedLessons: ['lesson-01-what-is-prompting'],
  })

  // Default mocks
  ;(useParams as ReturnType<typeof vi.fn>).mockReturnValue({ id: 'lesson-01-what-is-prompting' })
  ;(useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate)
  ;(loadLesson as ReturnType<typeof vi.fn>).mockReturnValue(mockLesson)
  ;(getAllLessonIds as ReturnType<typeof vi.fn>).mockReturnValue([
    'lesson-01-what-is-prompting',
    'lesson-02-context',
  ])
  ;(getExerciseComponent as ReturnType<typeof vi.fn>).mockReturnValue({
    component: FakeExerciseCard,
    evaluator: vi.fn(),
  })
  // chapters mock — module-level mock returns []
  ;(chapters as any).length = 0
})

describe('LessonPage', () => {
  it('renders intro screen with lesson title and Start button', () => {
    render(<LessonPage />)
    expect(screen.getByText('What is Prompting?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
  })

  it('clicking Start shows exercise phase with DotStepper', () => {
    render(<LessonPage />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByTestId('exercise-id')).toBeInTheDocument()
  })

  it('shows Continue button after exercise completes', () => {
    render(<LessonPage />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    // Continue button should NOT be visible before completion
    expect(screen.queryByRole('button', { name: /continue/i })).toBeNull()
    // Complete the exercise
    fireEvent.click(screen.getByRole('button', { name: /complete exercise/i }))
    // Continue button should now appear
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('advancing past last exercise shows completion screen with XP', () => {
    render(<LessonPage />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))

    // Complete exercise 1
    fireEvent.click(screen.getByRole('button', { name: /complete exercise/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    // Complete exercise 2
    fireEvent.click(screen.getByRole('button', { name: /complete exercise/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    // Should show completion screen
    expect(screen.getByText(/lesson complete/i)).toBeInTheDocument()
    expect(screen.getAllByText(/50 XP/i).length).toBeGreaterThanOrEqual(1)
  })

  it('calls completeLesson and addXP on lesson completion', () => {
    const completeLesson = vi.fn()
    const addXP = vi.fn()
    useProgressStore.setState({ completeLesson, addXP } as any)

    render(<LessonPage />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))

    // Complete both exercises
    fireEvent.click(screen.getByRole('button', { name: /complete exercise/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    fireEvent.click(screen.getByRole('button', { name: /complete exercise/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    expect(completeLesson).toHaveBeenCalledWith('lesson-01-what-is-prompting')
    expect(addXP).toHaveBeenCalledWith(50, 'lesson_complete')
  })

  it('calls unlockLesson for the next lesson in curriculum order', () => {
    const unlockLesson = vi.fn()
    useProgressStore.setState({ unlockLesson } as any)

    render(<LessonPage />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))

    fireEvent.click(screen.getByRole('button', { name: /complete exercise/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    fireEvent.click(screen.getByRole('button', { name: /complete exercise/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    expect(unlockLesson).toHaveBeenCalledWith('lesson-02-context')
  })

  it('redirects to / for invalid lesson ID', () => {
    ;(loadLesson as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Lesson not found')
    })

    render(<LessonPage />)
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('Next Lesson button navigates to next lesson route', () => {
    render(<LessonPage />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))

    fireEvent.click(screen.getByRole('button', { name: /complete exercise/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    fireEvent.click(screen.getByRole('button', { name: /complete exercise/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    fireEvent.click(screen.getByRole('button', { name: /next lesson/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/lesson/lesson-02-context')
  })
})
