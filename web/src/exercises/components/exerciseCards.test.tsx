import { describe, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type {
  MCQExercise,
  PickBetterExercise,
  FreeTextExercise,
} from '@shared/content/schema'

// Mock useLanguage hook
vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    currentLanguage: 'en' as const,
    isRTL: false,
    toggleLanguage: vi.fn(),
    setLanguage: vi.fn(),
  }),
}))

import { MCQCard } from './MCQCard'
import { PickBetterCard } from './PickBetterCard'
import { FreeTextCard } from './FreeTextCard'

const mcqFixture: MCQExercise = {
  id: 'mcq-1',
  type: 'mcq',
  prompt: { en: 'What makes a good prompt?', he: 'מה הופך פרומפט לטוב?' },
  order: 1,
  options: [
    { en: 'Being vague', he: 'להיות מעורפל' },
    { en: 'Being specific', he: 'להיות ספציפי' },
    { en: 'Using jargon', he: 'שימוש בז\'רגון' },
  ],
  correctIndex: 1,
  explanation: { en: 'Specific prompts get better results.', he: 'פרומפטים ספציפיים מקבלים תוצאות טובות יותר.' },
}

const pickBetterFixture: PickBetterExercise = {
  id: 'pb-1',
  type: 'pick-better',
  prompt: { en: 'Which prompt is better?', he: 'איזה פרומפט טוב יותר?' },
  order: 1,
  optionA: { en: 'Tell me about dogs', he: 'ספר לי על כלבים' },
  optionB: { en: 'Write a 200-word guide about golden retriever care for new owners', he: 'כתוב מדריך של 200 מילים על טיפול בגולדן רטריבר לבעלים חדשים' },
  betterOption: 'B',
  explanation: { en: 'Option B is more specific and actionable.', he: 'אפשרות ב\' ספציפית ומעשית יותר.' },
}

const freeTextFixture: FreeTextExercise = {
  id: 'ft-1',
  type: 'free-text',
  prompt: { en: 'Rewrite this vague prompt to be more specific.', he: 'כתוב מחדש את הפרומפט המעורפל הזה כדי שיהיה ספציפי יותר.' },
  order: 1,
  starterPrompt: { en: 'Tell me about history', he: 'ספר לי על היסטוריה' },
  rubric: {
    criteria: [
      {
        key: 'clarity',
        label: { en: 'Clarity', he: 'בהירות' },
        weight: 0.5,
        keywords: ['clear', 'specific'],
        required: true,
      },
      {
        key: 'specificity',
        label: { en: 'Specificity', he: 'ספציפיות' },
        weight: 0.5,
        keywords: ['topic', 'detail'],
        required: false,
      },
    ],
    passingScore: 50,
    scoringMethod: 'weighted-keyword',
  },
  modelAnswer: { en: 'Explain 3 key causes of World War I in under 200 words.', he: 'הסבר 3 גורמים מרכזיים למלחמת העולם הראשונה בפחות מ-200 מילים.' },
  positiveFeedback: { en: 'Great job! Your prompt is specific and clear.', he: 'עבודה מצוינת! הפרומפט שלך ספציפי וברור.' },
  improvementFeedback: { en: 'Try adding more specific details.', he: 'נסה להוסיף פרטים ספציפיים יותר.' },
}

describe('MCQCard', () => {
  it('renders the prompt and all options', () => {
    const onComplete = vi.fn()
    render(<MCQCard exercise={mcqFixture} onComplete={onComplete} />)

    expect(screen.getByText('What makes a good prompt?')).toBeInTheDocument()
    expect(screen.getByText('Being vague')).toBeInTheDocument()
    expect(screen.getByText('Being specific')).toBeInTheDocument()
    expect(screen.getByText('Using jargon')).toBeInTheDocument()
  })

  it('submit button is disabled before selecting an option', () => {
    const onComplete = vi.fn()
    render(<MCQCard exercise={mcqFixture} onComplete={onComplete} />)

    const submitBtn = screen.getByRole('button', { name: /submit/i })
    expect(submitBtn).toBeDisabled()
  })

  it('clicking an option and submitting shows FeedbackCard with score', () => {
    const onComplete = vi.fn()
    render(<MCQCard exercise={mcqFixture} onComplete={onComplete} />)

    // Click the correct option
    fireEvent.click(screen.getByText('Being specific'))

    const submitBtn = screen.getByRole('button', { name: /submit/i })
    expect(submitBtn).not.toBeDisabled()

    fireEvent.click(submitBtn)

    // FeedbackCard should show score
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('Passed')).toBeInTheDocument()

    // onComplete should be called
    expect(onComplete).toHaveBeenCalledWith({
      exerciseId: 'mcq-1',
      score: 100,
      passed: true,
    })
  })

  it('disables inputs after submission', () => {
    const onComplete = vi.fn()
    render(<MCQCard exercise={mcqFixture} onComplete={onComplete} />)

    fireEvent.click(screen.getByText('Being specific'))
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    const submitBtn = screen.getByRole('button', { name: /submit/i })
    expect(submitBtn).toBeDisabled()
  })
})

describe('PickBetterCard', () => {
  it('renders prompt and both options', () => {
    const onComplete = vi.fn()
    render(<PickBetterCard exercise={pickBetterFixture} onComplete={onComplete} />)

    expect(screen.getByText('Which prompt is better?')).toBeInTheDocument()
    expect(screen.getByText('Tell me about dogs')).toBeInTheDocument()
    expect(screen.getByText(/200-word guide/)).toBeInTheDocument()
  })

  it('submit button is disabled before selection', () => {
    const onComplete = vi.fn()
    render(<PickBetterCard exercise={pickBetterFixture} onComplete={onComplete} />)

    const submitBtn = screen.getByRole('button', { name: /submit/i })
    expect(submitBtn).toBeDisabled()
  })

  it('selecting option A and submitting shows feedback', () => {
    const onComplete = vi.fn()
    render(<PickBetterCard exercise={pickBetterFixture} onComplete={onComplete} />)

    // Click option A (wrong answer)
    fireEvent.click(screen.getByText('Tell me about dogs'))

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    // Should show fail feedback (option A is wrong, B is better)
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()

    expect(onComplete).toHaveBeenCalledWith({
      exerciseId: 'pb-1',
      score: 0,
      passed: false,
    })
  })
})

describe('FreeTextCard', () => {
  it('renders prompt and starter prompt', () => {
    const onComplete = vi.fn()
    render(<FreeTextCard exercise={freeTextFixture} onComplete={onComplete} />)

    expect(screen.getByText('Rewrite this vague prompt to be more specific.')).toBeInTheDocument()
    expect(screen.getByText('Tell me about history')).toBeInTheDocument()
  })

  it('submit button is disabled when textarea is empty', () => {
    const onComplete = vi.fn()
    render(<FreeTextCard exercise={freeTextFixture} onComplete={onComplete} />)

    const submitBtn = screen.getByRole('button', { name: /submit/i })
    expect(submitBtn).toBeDisabled()
  })

  it('typing text and submitting shows feedback with breakdown', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<FreeTextCard exercise={freeTextFixture} onComplete={onComplete} />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Write a clear and specific topic with detail about the French Revolution')

    const submitBtn = screen.getByRole('button', { name: /submit/i })
    expect(submitBtn).not.toBeDisabled()

    fireEvent.click(submitBtn)

    // Should show feedback (evaluator checks keywords: clear, specific, topic, detail)
    expect(screen.getByText('Passed')).toBeInTheDocument()

    // Should show breakdown section
    expect(screen.getByText('Breakdown')).toBeInTheDocument()

    // onComplete should be called
    expect(onComplete).toHaveBeenCalled()
    const result = onComplete.mock.calls[0][0]
    expect(result.exerciseId).toBe('ft-1')
    expect(result.passed).toBe(true)
  })
})
