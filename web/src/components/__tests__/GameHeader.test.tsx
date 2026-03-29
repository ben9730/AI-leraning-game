import React from 'react'
import { describe, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { GameHeader } from '../GameHeader'
import { ProgressRing } from '../ProgressRing'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (key === 'streak.start') return 'Start streak!'
      if (key === 'streak.days') return `${opts?.count} day streak`
      return key
    },
  }),
}))

// Mock the store
const mockStore: Record<string, unknown> = {
  xpTotal: 0,
  streakCount: 0,
}

vi.mock('@/store/useProgressStore', () => ({
  useProgressStore: (selector: (s: Record<string, unknown>) => unknown) => selector(mockStore),
}))

describe('ProgressRing', () => {
  it('renders SVG with correct dimensions', () => {
    const { container } = render(<ProgressRing fill={0.5} size={40} strokeWidth={4} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('width', '40')
    expect(svg).toHaveAttribute('height', '40')
  })

  it('renders level number when provided', () => {
    render(<ProgressRing fill={0.5} level={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('does not render level text when not provided', () => {
    const { container } = render(<ProgressRing fill={0.5} />)
    expect(container.querySelector('text')).toBeNull()
  })

  it('clamps fill between 0 and 1', () => {
    const { container } = render(<ProgressRing fill={1.5} size={40} strokeWidth={4} />)
    const circles = container.querySelectorAll('circle')
    // Fill circle should use clamped value (1.0 * circumference)
    const r = (40 / 2) - (4 / 2)
    const circ = 2 * Math.PI * r
    expect(circles[1]).toHaveAttribute('stroke-dasharray', `${1 * circ} ${circ}`)
  })
})

describe('GameHeader', () => {
  beforeEach(() => {
    mockStore.xpTotal = 0
    mockStore.streakCount = 0
  })

  it('shows streak start message when streak is 0', () => {
    render(<MemoryRouter><GameHeader /></MemoryRouter>)
    expect(screen.getByText('Start streak!')).toBeInTheDocument()
  })

  it('shows streak count when streak > 0', () => {
    mockStore.streakCount = 5
    render(<MemoryRouter><GameHeader /></MemoryRouter>)
    expect(screen.getByText('5 day streak')).toBeInTheDocument()
  })

  it('displays XP total', () => {
    mockStore.xpTotal = 150
    render(<MemoryRouter><GameHeader /></MemoryRouter>)
    expect(screen.getByText('150 XP')).toBeInTheDocument()
  })

  it('renders flame emoji for streak', () => {
    render(<MemoryRouter><GameHeader /></MemoryRouter>)
    expect(screen.getByLabelText('streak')).toBeInTheDocument()
  })

  it('renders ProgressRing with level', () => {
    mockStore.xpTotal = 0
    const { container } = render(<MemoryRouter><GameHeader /></MemoryRouter>)
    // Level 0 at 0 XP — should render SVG
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('uses no physical left/right CSS classes', () => {
    const { container } = render(<MemoryRouter><GameHeader /></MemoryRouter>)
    const html = container.innerHTML
    expect(html).not.toMatch(/\bpl-|\bpr-|\bml-|\bmr-|\bleft-|\bright-/)
  })
})
