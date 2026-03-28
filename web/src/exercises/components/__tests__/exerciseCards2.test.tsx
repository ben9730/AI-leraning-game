import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import type {
  FillBlankExercise,
  SpotProblemExercise,
  SimulatedChatExercise,
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

import { FillBlankCard } from '../FillBlankCard'
import { SpotProblemCard } from '../SpotProblemCard'
import { SimulatedChatCard } from '../SimulatedChatCard'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fillBlankFixture: FillBlankExercise = {
  id: 'fb-1',
  type: 'fill-blank',
  prompt: { en: 'Complete the prompt template', he: 'השלם את תבנית הפרומפט' },
  order: 1,
  template: { en: 'Write ___ here', he: 'כתוב ___ כאן' },
  acceptableAnswers: [
    { en: 'specific', he: 'ספציפי' },
    { en: 'clear', he: 'ברור' },
  ],
  explanation: {
    en: 'A specific or clear instruction works best.',
    he: 'הוראה ספציפית או ברורה עובדת הכי טוב.',
  },
}

const spotProblemFixture: SpotProblemExercise = {
  id: 'sp-1',
  type: 'spot-problem',
  prompt: { en: 'Find the issues', he: 'מצא את הבעיות' },
  order: 1,
  problematicPrompt: {
    en: 'Tell me stuff about things',
    he: 'ספר לי דברים על דברים',
  },
  issues: [
    { en: 'Too vague', he: 'מעורפל מדי' },
    { en: 'No context provided', he: 'לא סופק הקשר' },
  ],
  distractors: [{ en: 'Too short', he: 'קצר מדי' }],
  hints: [{ en: 'Look for specificity issues', he: 'חפש בעיות ספציפיות' }],
  explanation: {
    en: 'The prompt is vague and lacks context.',
    he: 'הפרומפט מעורפל וחסר הקשר.',
  },
}

const simulatedChatFixture: SimulatedChatExercise = {
  id: 'sc-1',
  type: 'simulated-chat',
  prompt: {
    en: 'Write a prompt asking AI to explain photosynthesis',
    he: 'כתוב פרומפט שמבקש מ-AI להסביר פוטוסינתזה',
  },
  order: 1,
  systemContext: {
    en: 'You are chatting with an AI assistant.',
    he: 'אתה משוחח עם עוזר AI.',
  },
  preScriptedResponse: {
    en: 'Photosynthesis is the process by which plants convert light into energy.',
    he: 'פוטוסינתזה היא התהליך שבו צמחים ממירים אור לאנרגיה.',
  },
  rubric: {
    criteria: [
      {
        key: 'clarity',
        label: { en: 'Clarity', he: 'בהירות' },
        weight: 0.5,
        keywords: ['explain', 'clear'],
        required: true,
      },
      {
        key: 'specificity',
        label: { en: 'Specificity', he: 'ספציפיות' },
        weight: 0.5,
        keywords: ['photosynthesis', 'plants'],
        required: false,
      },
    ],
    passingScore: 50,
    scoringMethod: 'weighted-keyword',
  },
  modelAnswer: {
    en: 'Explain how photosynthesis works in simple terms, covering the role of sunlight, water, and CO2.',
    he: 'הסבר כיצד פוטוסינתזה עובדת במילים פשוטות, כולל תפקיד אור השמש, מים ו-CO2.',
  },
  positiveFeedback: {
    en: 'Great prompt! You were clear and specific.',
    he: 'פרומפט מצוין! היית ברור וספציפי.',
  },
  improvementFeedback: {
    en: 'Try to be more specific about what you want explained.',
    he: 'נסה להיות ספציפי יותר לגבי מה שאתה רוצה שיוסבר.',
  },
}

// ---------------------------------------------------------------------------
// FillBlankCard tests
// ---------------------------------------------------------------------------

describe('FillBlankCard', () => {
  it('renders template text with an inline input at the blank position', () => {
    const onComplete = vi.fn()
    render(
      <FillBlankCard exercise={fillBlankFixture} onComplete={onComplete} />,
    )

    // Template "Write ___ here" should split into "Write " and " here"
    expect(screen.getByText(/Write/)).toBeInTheDocument()
    expect(screen.getByText(/here/)).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('submit button is disabled when input is empty', () => {
    const onComplete = vi.fn()
    render(
      <FillBlankCard exercise={fillBlankFixture} onComplete={onComplete} />,
    )

    const submitBtn = screen.getByRole('button', { name: /submit/i })
    expect(submitBtn).toBeDisabled()
  })

  it('typing an acceptable answer and submitting shows passing feedback', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(
      <FillBlankCard exercise={fillBlankFixture} onComplete={onComplete} />,
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'specific')

    const submitBtn = screen.getByRole('button', { name: /submit/i })
    expect(submitBtn).not.toBeDisabled()

    fireEvent.click(submitBtn)

    // Feedback should show passing
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('Passed')).toBeInTheDocument()

    expect(onComplete).toHaveBeenCalledWith({
      exerciseId: 'fb-1',
      score: 100,
      passed: true,
    })
  })

  it('disables input and submit after submission', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(
      <FillBlankCard exercise={fillBlankFixture} onComplete={onComplete} />,
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'specific')
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(input).toBeDisabled()
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })

  it('Enter key in input triggers submit', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(
      <FillBlankCard exercise={fillBlankFixture} onComplete={onComplete} />,
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'specific{Enter}')

    expect(onComplete).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// SpotProblemCard tests
// ---------------------------------------------------------------------------

describe('SpotProblemCard', () => {
  it('renders the problematic prompt in a blockquote', () => {
    const onComplete = vi.fn()
    render(
      <SpotProblemCard exercise={spotProblemFixture} onComplete={onComplete} />,
    )

    expect(
      screen.getByText('Tell me stuff about things'),
    ).toBeInTheDocument()
  })

  it('renders all issues and distractors as checkboxes', () => {
    const onComplete = vi.fn()
    render(
      <SpotProblemCard exercise={spotProblemFixture} onComplete={onComplete} />,
    )

    const checkboxes = screen.getAllByRole('checkbox')
    // 2 issues + 1 distractor = 3
    expect(checkboxes).toHaveLength(3)
    expect(screen.getByText('Too vague')).toBeInTheDocument()
    expect(screen.getByText('No context provided')).toBeInTheDocument()
    expect(screen.getByText('Too short')).toBeInTheDocument()
  })

  it('submit button is disabled when no checkboxes selected', () => {
    const onComplete = vi.fn()
    render(
      <SpotProblemCard exercise={spotProblemFixture} onComplete={onComplete} />,
    )

    const submitBtn = screen.getByRole('button', { name: /submit/i })
    expect(submitBtn).toBeDisabled()
  })

  it('selecting correct issues and submitting shows passing feedback', () => {
    const onComplete = vi.fn()
    render(
      <SpotProblemCard exercise={spotProblemFixture} onComplete={onComplete} />,
    )

    // Select both correct issues
    fireEvent.click(screen.getByText('Too vague'))
    fireEvent.click(screen.getByText('No context provided'))

    const submitBtn = screen.getByRole('button', { name: /submit/i })
    expect(submitBtn).not.toBeDisabled()

    fireEvent.click(submitBtn)

    // Should show feedback - both issues found = 100%
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('Passed')).toBeInTheDocument()

    expect(onComplete).toHaveBeenCalledWith({
      exerciseId: 'sp-1',
      score: 100,
      passed: true,
    })
  })

  it('disables checkboxes and submit after submission', () => {
    const onComplete = vi.fn()
    render(
      <SpotProblemCard exercise={spotProblemFixture} onComplete={onComplete} />,
    )

    fireEvent.click(screen.getByText('Too vague'))
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((cb) => expect(cb).toBeDisabled())
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// SimulatedChatCard tests
// ---------------------------------------------------------------------------

describe('SimulatedChatCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('Phase 1: renders system context, prompt instruction, and textarea', () => {
    const onComplete = vi.fn()
    render(
      <SimulatedChatCard
        exercise={simulatedChatFixture}
        onComplete={onComplete}
      />,
    )

    expect(
      screen.getByText('You are chatting with an AI assistant.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Write a prompt asking AI to explain photosynthesis',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /send to ai/i }),
    ).toBeInTheDocument()
  })

  it('Send button is disabled when textarea is empty', () => {
    const onComplete = vi.fn()
    render(
      <SimulatedChatCard
        exercise={simulatedChatFixture}
        onComplete={onComplete}
      />,
    )

    const sendBtn = screen.getByRole('button', { name: /send to ai/i })
    expect(sendBtn).toBeDisabled()
  })

  it('Phase 2 + 3: submitting prompt shows chat bubbles, AI response, and feedback', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onComplete = vi.fn()
    render(
      <SimulatedChatCard
        exercise={simulatedChatFixture}
        onComplete={onComplete}
      />,
    )

    const textarea = screen.getByRole('textbox')
    await user.type(
      textarea,
      'Please explain photosynthesis in clear simple terms',
    )

    const sendBtn = screen.getByRole('button', { name: /send to ai/i })
    fireEvent.click(sendBtn)

    // User's prompt should appear in a chat bubble
    expect(
      screen.getByText(
        'Please explain photosynthesis in clear simple terms',
      ),
    ).toBeInTheDocument()

    // Advance timers for typing delay
    vi.advanceTimersByTime(400)

    // AI response should appear
    await waitFor(() => {
      expect(
        screen.getByText(
          'Photosynthesis is the process by which plants convert light into energy.',
        ),
      ).toBeInTheDocument()
    })

    // Should show feedback (evaluator checks keywords: explain, clear, photosynthesis, plants)
    await waitFor(() => {
      expect(screen.getByText('Passed')).toBeInTheDocument()
    })

    // Should show breakdown section
    expect(screen.getByText('Breakdown')).toBeInTheDocument()

    // onComplete called
    expect(onComplete).toHaveBeenCalled()
    const result = onComplete.mock.calls[0][0]
    expect(result.exerciseId).toBe('sc-1')
    expect(result.passed).toBe(true)
  })

  it('disables textarea after sending prompt', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onComplete = vi.fn()
    render(
      <SimulatedChatCard
        exercise={simulatedChatFixture}
        onComplete={onComplete}
      />,
    )

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'explain photosynthesis clearly')

    fireEvent.click(screen.getByRole('button', { name: /send to ai/i }))

    expect(textarea).toBeDisabled()
  })
})
