interface DotStepperProps {
  total: number
  current: number
}

/**
 * DotStepper renders a row of progress dots for a lesson exercise sequence.
 * - index < current: completed (green)
 * - index === current: active (indigo, slightly larger)
 * - index > current: upcoming (gray)
 *
 * Dots represent ordinal position, NOT directional flow — no RTL flex-reverse.
 */
export function DotStepper({ total, current }: DotStepperProps) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemax={total}
    >
      {Array.from({ length: total }, (_, index) => {
        let className: string
        if (index < current) {
          className = 'w-2.5 h-2.5 rounded-full bg-green-500'
        } else if (index === current) {
          className = 'w-3 h-3 rounded-full bg-indigo-500'
        } else {
          className = 'w-2.5 h-2.5 rounded-full bg-gray-300'
        }
        return <div key={index} className={className} />
      })}
    </div>
  )
}
