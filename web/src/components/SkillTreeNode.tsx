import { useNavigate } from 'react-router'
import type { NodeState } from '@shared/skill-tree/skillTreeUtils'

interface SkillTreeNodeProps {
  lessonId: string
  state: NodeState
  orderNumber: number
  lessonTitle: string
}

const stateStyles: Record<NodeState, string> = {
  locked: 'bg-gray-300 opacity-60 cursor-not-allowed',
  unlocked:
    'bg-white border-2 border-indigo-600 cursor-pointer hover:border-indigo-700 hover:shadow-md',
  complete: 'bg-green-500 cursor-pointer hover:bg-green-600',
}

export function SkillTreeNode({
  lessonId,
  state,
  orderNumber,
  lessonTitle,
}: SkillTreeNodeProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (state !== 'locked') {
      navigate(`/lesson/${lessonId}`)
    }
  }

  const ariaLabel = `${lessonTitle} \u2014 ${
    state === 'complete'
      ? 'completed'
      : state === 'unlocked'
        ? 'start lesson'
        : 'locked'
  }`

  return (
    <div className="relative" data-lesson-id={lessonId}>
      <button
        onClick={handleClick}
        disabled={state === 'locked'}
        aria-label={ariaLabel}
        aria-disabled={state === 'locked'}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm transition-all ${stateStyles[state]}`}
      >
        {state === 'complete' && (
          <span className="text-white font-bold text-base">{'\u2713'}</span>
        )}
        {state === 'unlocked' && (
          <span className="text-indigo-600 font-bold">{orderNumber}</span>
        )}
        {state === 'locked' && (
          <span className="text-gray-500 text-base">{'\u{1F512}'}</span>
        )}
      </button>
      {state === 'unlocked' && (
        <span className="absolute -top-1 -end-1 w-3 h-3 bg-indigo-600 rounded-full animate-pulse" />
      )}
    </div>
  )
}
