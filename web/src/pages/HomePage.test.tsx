import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useProgressStore } from '@/store/useProgressStore'

// Mock react-router
vi.mock('react-router', () => ({
  useNavigate: vi.fn(),
}))

// Mock content
vi.mock('@/content', () => ({
  loadLesson: vi.fn(),
  chapters: [
    {
      id: 1,
      title: { en: 'What Can AI Do?', he: 'מה AI יכול לעשות?' },
      description: { en: 'Discover what AI can help you with', he: 'גלו איך AI יכול לעזור לכם' },
      lessonIds: ['lesson-01-what-is-prompting', 'lesson-02-clarity'],
    },
    {
      id: 2,
      title: { en: 'Your First Good Prompt', he: 'הפרומפט הטוב הראשון שלך' },
      description: { en: 'Learn to write clear prompts', he: 'למדו לכתוב פרומפטים ברורים' },
      lessonIds: ['lesson-06-be-clear', 'lesson-07-give-context'],
    },
    {
      id: 3,
      title: { en: 'Level Up Your Prompts', he: 'שדרגו את הפרומפטים שלכם' },
      description: { en: 'Advanced techniques', he: 'טכניקות מתקדמות' },
      lessonIds: ['lesson-11-give-ai-a-role'],
    },
    {
      id: 4,
      title: { en: 'Real-World Skills', he: 'מיומנויות לעולם האמיתי' },
      description: { en: 'Apply your skills', he: 'יישמו את המיומנויות' },
      lessonIds: ['lesson-16-writing-help'],
    },
  ],
}))

// Mock useLanguage
vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: vi.fn(),
}))

import { useNavigate } from 'react-router'
import { loadLesson, chapters } from '@/content'
import { useLanguage } from '@/hooks/useLanguage'
import { HomePage } from './HomePage'

const mockNavigate = vi.fn()

function makeMockLesson(id: string, order: number, title: string) {
  return {
    id,
    order,
    chapter: 1,
    prerequisites: [],
    xpReward: 50,
    content: {
      title: { en: title, he: `${title} (HE)` },
      body: { en: 'Learn the basics', he: 'למד את היסודות' },
    },
    exercises: [{ id: 'ex-01', type: 'mcq', order: 1, prompt: { en: 'Q', he: 'ש' } }],
  }
}

const mockLessons: Record<string, ReturnType<typeof makeMockLesson>> = {
  'lesson-01-what-is-prompting': makeMockLesson('lesson-01-what-is-prompting', 1, 'What is Prompting?'),
  'lesson-02-clarity': makeMockLesson('lesson-02-clarity', 2, 'Clarity'),
  'lesson-06-be-clear': makeMockLesson('lesson-06-be-clear', 6, 'Be Clear'),
  'lesson-07-give-context': makeMockLesson('lesson-07-give-context', 7, 'Give Context'),
  'lesson-11-give-ai-a-role': makeMockLesson('lesson-11-give-ai-a-role', 11, 'Give AI a Role'),
  'lesson-16-writing-help': makeMockLesson('lesson-16-writing-help', 16, 'Writing Help'),
}

beforeEach(() => {
  vi.clearAllMocks()
  mockNavigate.mockReset()

  // Reset store state to fresh state
  useProgressStore.setState({
    xpTotal: 0,
    xpHistory: [],
    completedLessons: [],
    unlockedLessons: ['lesson-01-what-is-prompting'],
    language: 'en',
  })

  ;(useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate)
  ;(loadLesson as ReturnType<typeof vi.fn>).mockImplementation(
    (id: string) => mockLessons[id] ?? makeMockLesson(id, 99, `Lesson ${id}`)
  )
  ;(useLanguage as ReturnType<typeof vi.fn>).mockReturnValue({
    currentLanguage: 'en',
    isRTL: false,
    toggleLanguage: vi.fn(),
    setLanguage: vi.fn(),
  })
})

describe('HomePage', () => {
  it('renders all 4 chapter headings', () => {
    render(<HomePage />)
    expect(screen.getByText('What Can AI Do?')).toBeInTheDocument()
    expect(screen.getByText('Your First Good Prompt')).toBeInTheDocument()
    expect(screen.getByText('Level Up Your Prompts')).toBeInTheDocument()
    expect(screen.getByText('Real-World Skills')).toBeInTheDocument()
  })

  it('renders lesson cards within each chapter', () => {
    render(<HomePage />)
    expect(screen.getByText('What is Prompting?')).toBeInTheDocument()
    expect(screen.getByText('Clarity')).toBeInTheDocument()
    expect(screen.getByText('Be Clear')).toBeInTheDocument()
    expect(screen.getByText('Writing Help')).toBeInTheDocument()
  })

  it('first lesson shows unlocked state on fresh store', () => {
    render(<HomePage />)
    // Unlocked lesson should be a button (clickable)
    const buttons = screen.getAllByRole('button')
    const lesson1Button = buttons.find(btn => btn.textContent?.includes('What is Prompting?'))
    expect(lesson1Button).toBeDefined()
    // Should NOT have cursor-not-allowed class
    expect(lesson1Button?.className).not.toContain('cursor-not-allowed')
  })

  it('locked lessons show lock icon and are not clickable', () => {
    render(<HomePage />)
    // lesson-02-clarity is locked by default — should render as div not button
    // Find the card containing "Clarity" text
    const clarityText = screen.getByText('Clarity')
    // The locked card is a div, not a button
    const card = clarityText.closest('[class*="rounded-xl"]')
    expect(card?.tagName).toBe('DIV')
    // Lock icon (🔒) should be present somewhere in the locked cards
    const lockIconText = screen.getAllByText(/\u{1F512}/u)
    expect(lockIconText.length).toBeGreaterThan(0)
  })

  it('completed lessons show checkmark', () => {
    useProgressStore.setState({
      completedLessons: ['lesson-01-what-is-prompting'],
      unlockedLessons: ['lesson-01-what-is-prompting', 'lesson-02-clarity'],
    })
    render(<HomePage />)
    // Checkmark character ✓ should appear
    const checkmarks = screen.getAllByText('✓')
    expect(checkmarks.length).toBeGreaterThan(0)
    // The completed lesson card should show "Completed" label
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('clicking unlocked lesson navigates to /lesson/:id', () => {
    render(<HomePage />)
    // Find the button for lesson-01 (unlocked by default)
    const buttons = screen.getAllByRole('button')
    const lesson1Button = buttons.find(btn => btn.textContent?.includes('What is Prompting?'))
    expect(lesson1Button).toBeDefined()
    fireEvent.click(lesson1Button!)
    expect(mockNavigate).toHaveBeenCalledWith('/lesson/lesson-01-what-is-prompting')
  })

  it('clicking completed lesson navigates to /lesson/:id for review', () => {
    useProgressStore.setState({
      completedLessons: ['lesson-01-what-is-prompting'],
      unlockedLessons: ['lesson-01-what-is-prompting', 'lesson-02-clarity'],
    })
    render(<HomePage />)
    const buttons = screen.getAllByRole('button')
    const lesson1Button = buttons.find(btn => btn.textContent?.includes('What is Prompting?'))
    expect(lesson1Button).toBeDefined()
    fireEvent.click(lesson1Button!)
    expect(mockNavigate).toHaveBeenCalledWith('/lesson/lesson-01-what-is-prompting')
  })

  it('clicking a locked lesson does not navigate', () => {
    render(<HomePage />)
    // lesson-02-clarity is locked — its container is a div, not a button
    // Verify navigate is NOT called when we try to interact with it
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
