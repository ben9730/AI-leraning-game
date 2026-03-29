import { useTranslation } from 'react-i18next'
import { useProgressStore } from '@/store/useProgressStore'
import { getLevel } from '@shared/store/types'
import { LEVEL_THRESHOLDS } from '@shared/gamification/constants'
import { ProgressRing } from './ProgressRing'

export function GameHeader() {
  const { t } = useTranslation()
  const xpTotal = useProgressStore(s => s.xpTotal)
  const streakCount = useProgressStore(s => s.streakCount)

  // Derive level — NEVER store it
  const level = getLevel(xpTotal)
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const prevThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const fillRatio = nextThreshold > prevThreshold
    ? (xpTotal - prevThreshold) / (nextThreshold - prevThreshold)
    : 1

  return (
    <header className="clay-surface flex items-center justify-between h-14 px-4 py-2">
      {/* Left: streak flame + count */}
      <div className="flex items-center gap-1.5">
        <span role="img" aria-label="streak" className="text-xl leading-none">🔥</span>
        <span className="text-sm font-semibold text-orange-600">
          {streakCount === 0
            ? t('streak.start')
            : t('streak.days', { count: streakCount })}
        </span>
      </div>

      {/* Center: XP counter */}
      <div className="flex items-center">
        <span className="text-sm font-semibold text-[var(--clay-primary)]">
          {xpTotal} XP
        </span>
      </div>

      {/* End: level ring (RTL-safe — uses end side) */}
      <div className="flex items-center">
        <ProgressRing fill={fillRatio} size={40} strokeWidth={4} level={level} />
      </div>
    </header>
  )
}
