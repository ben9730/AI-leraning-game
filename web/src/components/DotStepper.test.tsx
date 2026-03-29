import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DotStepper } from './DotStepper'

describe('DotStepper', () => {
  it('renders the correct number of dots', () => {
    const { container } = render(<DotStepper total={5} current={0} />)
    const progressbar = container.querySelector('[role="progressbar"]')
    expect(progressbar).not.toBeNull()
    // 5 dot divs inside progressbar
    const dots = progressbar!.querySelectorAll('div')
    expect(dots).toHaveLength(5)
  })

  it('gives the current dot (index === current) the accent indigo class', () => {
    const { container } = render(<DotStepper total={5} current={2} />)
    const progressbar = container.querySelector('[role="progressbar"]')!
    const dots = progressbar.querySelectorAll('div')
    expect(dots[2].className).toContain('bg-indigo-500')
  })

  it('gives completed dots (index < current) the green class', () => {
    const { container } = render(<DotStepper total={5} current={2} />)
    const progressbar = container.querySelector('[role="progressbar"]')!
    const dots = progressbar.querySelectorAll('div')
    expect(dots[0].className).toContain('bg-green-500')
    expect(dots[1].className).toContain('bg-green-500')
  })

  it('gives upcoming dots (index > current) the gray class', () => {
    const { container } = render(<DotStepper total={5} current={2} />)
    const progressbar = container.querySelector('[role="progressbar"]')!
    const dots = progressbar.querySelectorAll('div')
    expect(dots[3].className).toContain('bg-gray-300')
    expect(dots[4].className).toContain('bg-gray-300')
  })

  it('renders all dots filled when current is past end (total=3, current=3)', () => {
    const { container } = render(<DotStepper total={3} current={3} />)
    const progressbar = container.querySelector('[role="progressbar"]')!
    const dots = progressbar.querySelectorAll('div')
    expect(dots[0].className).toContain('bg-green-500')
    expect(dots[1].className).toContain('bg-green-500')
    expect(dots[2].className).toContain('bg-green-500')
  })

  it('sets aria-valuenow and aria-valuemax on the progressbar container', () => {
    render(<DotStepper total={5} current={2} />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '2')
    expect(progressbar).toHaveAttribute('aria-valuemax', '5')
  })
})
