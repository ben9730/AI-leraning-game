import React from 'react'
import { describe, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type {
  MCQExercise,
  FreeTextExercise,
  PickBetterExercise,
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

import { exerciseRegistry, getExerciseComponent } from '@/exercises'

// ---------------------------------------------------------------------------
// Fixtures — one per exercise type
// ---------------------------------------------------------------------------

const mcqFixture: MCQExercise = {
  id: 'int-mcq-1',
  type: 'mcq',
  prompt: { en: 'Which option is correct?', he: 'איזו אפשרות נכונה?' },
  order: 1,
  options: [
    { en: 'Option A', he: 'אפשרות א' },
    { en: 'Option B', he: 'אפשרות ב' },
  ],
  correctIndex: 0,
  explanation: { en: 'Option A is correct.', he: 'אפשרות א נכונה.' },
}

const freeTextFixture: FreeTextExercise = {
  id: 'int-ft-1',
  type: 'free-text',
  prompt: { en: 'Write a clear prompt', he: 'כתוב פרומפט ברור' },
  order: 1,
  rubric: {
    criteria: [
      {
        key: 'clarity',
        label: { en: 'Clarity', he: 'בהירות' },
        weight: 1.0,
        keywords: ['clear', 'specific'],
        required: true,
      },
    ],
    passingScore: 50,
    scoringMethod: 'weighted-keyword',
  },
  modelAnswer: {
    en: 'Please provide a clear and specific answer.',
    he: 'אנא ספק תשובה ברורה וספציפית.',
  },
  positiveFeedback: { en: 'Great!', he: 'מצוין!' },
  improvementFeedback: { en: 'Try adding keywords.', he: 'נסה להוסיף מילות מפתח.' },
}

const pickBetterFixture: PickBetterExercise = {
  id: 'int-pb-1',
  type: 'pick-better',
  prompt: { en: 'Which prompt is better?', he: 'איזה פרומפט טוב יותר?' },
  order: 1,
  optionA: { en: 'Do stuff', he: 'עשה דברים' },
  optionB: { en: 'Explain photosynthesis in simple terms', he: 'הסבר פוטוסינתזה במילים פשוטות' },
  betterOption: 'B',
  explanation: { en: 'Prompt B is more specific.', he: 'פרומפט ב ספציפי יותר.' },
}

const fillBlankFixture: FillBlankExercise = {
  id: 'int-fb-1',
  type: 'fill-blank',
  prompt: { en: 'Fill in the blank', he: 'מלא את הרווח' },
  order: 1,
  template: { en: 'Use ___ prompts', he: 'השתמש ב ___ פרומפטים' },
  acceptableAnswers: [
    { en: 'specific', he: 'ספציפיים' },
    { en: 'clear', he: 'ברורים' },
  ],
  explanation: { en: 'Specific prompts work best.', he: 'פרומפטים ספציפיים עובדים הכי טוב.' },
}

const spotProblemFixture: SpotProblemExercise = {
  id: 'int-sp-1',
  type: 'spot-problem',
  prompt: { en: 'Find the problems', he: 'מצא את הבעיות' },
  order: 1,
  problematicPrompt: { en: 'Write me something', he: 'כתוב לי משהו' },
  issues: [
    { en: 'Too vague', he: 'מעורפל מדי' },
  ],
  distractors: [{ en: 'Too long', he: 'ארוך מדי' }],
  hints: [{ en: 'Look for specificity', he: 'חפש ספציפיות' }],
  explanation: { en: 'The prompt is too vague.', he: 'הפרומפט מעורפל מדי.' },
}

const simulatedChatFixture: SimulatedChatExercise = {
  id: 'int-sc-1',
  type: 'simulated-chat',
  prompt: { en: 'Ask the AI about climate change', he: 'שאל את ה-AI על שינוי האקלים' },
  order: 1,
  preScriptedResponse: {
    en: 'Climate change refers to long-term shifts in temperatures and weather patterns.',
    he: 'שינוי האקלים מתייחס לשינויים ארוכי טווח בטמפרטורות ודפוסי מזג האוויר.',
  },
  rubric: {
    criteria: [
      {
        key: 'relevance',
        label: { en: 'Relevance', he: 'רלוונטיות' },
        weight: 1.0,
        keywords: ['climate', 'change'],
        required: true,
      },
    ],
    passingScore: 50,
    scoringMethod: 'weighted-keyword',
  },
  modelAnswer: {
    en: 'Explain the main causes of climate change.',
    he: 'הסבר את הגורמים העיקריים לשינוי האקלים.',
  },
  positiveFeedback: { en: 'Well asked!', he: 'שאלה טובה!' },
  improvementFeedback: { en: 'Be more specific.', he: 'היה ספציפי יותר.' },
}

// ---------------------------------------------------------------------------
// Test 1: Registry has all 6 exercise types
// ---------------------------------------------------------------------------

describe('exerciseRegistry', () => {
  it('has all 6 exercise types', () => {
    const keys = Object.keys(exerciseRegistry)
    expect(keys).toContain('mcq')
    expect(keys).toContain('pick-better')
    expect(keys).toContain('free-text')
    expect(keys).toContain('fill-blank')
    expect(keys).toContain('spot-problem')
    expect(keys).toContain('simulated-chat')
    expect(keys).toHaveLength(6)
  })

  it('each entry has a truthy component and evaluator function', () => {
    for (const [_type, entry] of Object.entries(exerciseRegistry)) {
      expect(entry.component).toBeTruthy()
      expect(typeof entry.evaluator).toBe('function')
    }
  })
})

// ---------------------------------------------------------------------------
// Test 2: getExerciseComponent returns correct entry
// ---------------------------------------------------------------------------

describe('getExerciseComponent', () => {
  it('returns the same entry as direct registry access for each type', () => {
    const types = ['mcq', 'pick-better', 'free-text', 'fill-blank', 'spot-problem', 'simulated-chat'] as const
    for (const type of types) {
      const entry = getExerciseComponent(type)
      expect(entry).toBe(exerciseRegistry[type])
    }
  })

  it('throws for unknown type', () => {
    expect(() => getExerciseComponent('unknown-type' as any)).toThrow()
  })
})

// ---------------------------------------------------------------------------
// Test 3: MCQ renders, interacts, and completes
// ---------------------------------------------------------------------------

describe('MCQ exercise render + complete cycle', () => {
  it('renders and completes with score 100 when correct option chosen', () => {
    const onComplete = vi.fn()
    const { component: MCQCard } = getExerciseComponent('mcq')
    render(<MCQCard exercise={mcqFixture} onComplete={onComplete} />)

    expect(screen.getByText('Which option is correct?')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Option A'))
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(onComplete).toHaveBeenCalledWith({
      exerciseId: 'int-mcq-1',
      score: 100,
      passed: true,
    })
  })
})

// ---------------------------------------------------------------------------
// Test 4: FreeText exercise with breakdown
// ---------------------------------------------------------------------------

describe('FreeText exercise with rubric breakdown', () => {
  it('renders feedback with breakdown section after submitting keywords', async () => {
    const onComplete = vi.fn()
    const { component: FreeTextCard } = getExerciseComponent('free-text')
    render(<FreeTextCard exercise={freeTextFixture} onComplete={onComplete} />)

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Write a clear and specific prompt' },
    })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled()
    })

    // FeedbackCard breakdown section should be visible
    expect(screen.getByText('Breakdown')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Test 5: All 6 components render without crashing
// ---------------------------------------------------------------------------

describe('all 6 exercise types render without crashing', () => {
  const fixtures = [
    { type: 'mcq' as const, fixture: mcqFixture, promptText: 'Which option is correct?' },
    { type: 'pick-better' as const, fixture: pickBetterFixture, promptText: 'Which prompt is better?' },
    { type: 'free-text' as const, fixture: freeTextFixture, promptText: 'Write a clear prompt' },
    { type: 'fill-blank' as const, fixture: fillBlankFixture, promptText: 'Fill in the blank' },
    { type: 'spot-problem' as const, fixture: spotProblemFixture, promptText: 'Find the problems' },
    { type: 'simulated-chat' as const, fixture: simulatedChatFixture, promptText: 'Ask the AI about climate change' },
  ]

  for (const { type, fixture, promptText } of fixtures) {
    it(`${type} renders prompt text without crashing`, () => {
      const onComplete = vi.fn()
      const { component: Component } = getExerciseComponent(type)
      const { unmount } = render(<Component exercise={fixture as any} onComplete={onComplete} />)
      expect(screen.getByText(promptText)).toBeInTheDocument()
      unmount()
    })
  }
})

// ---------------------------------------------------------------------------
// Test 6: RTL logical property usage (no physical direction classes)
// ---------------------------------------------------------------------------

describe('RTL class usage', () => {
  it('MCQCard uses logical properties and no physical left/right classes', () => {
    const onComplete = vi.fn()
    const { component: MCQCard } = getExerciseComponent('mcq')
    const { container } = render(<MCQCard exercise={mcqFixture} onComplete={onComplete} />)

    const html = container.innerHTML

    // Must not contain physical direction classes
    expect(html).not.toMatch(/\bpl-\d/)
    expect(html).not.toMatch(/\bpr-\d/)
    expect(html).not.toMatch(/\bml-\d/)
    expect(html).not.toMatch(/\bmr-\d/)
    expect(html).not.toMatch(/\btext-left\b/)
    expect(html).not.toMatch(/\btext-right\b/)

    // Must contain logical property classes
    const hasLogical =
      html.includes('ps-') ||
      html.includes('pe-') ||
      html.includes('ms-') ||
      html.includes('me-') ||
      html.includes('text-start') ||
      html.includes('text-end')
    expect(hasLogical).toBe(true)
  })
})
