import { useTranslation } from 'react-i18next'
import type { Badge } from '@shared/gamification/badges'

interface BadgeGridProps {
  badges: Badge[]
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map(badge => (
        <div
          key={badge.id}
          className={`rounded-lg border p-3 text-center ${
            badge.earned
              ? 'bg-indigo-50 border-indigo-200'
              : 'bg-gray-50 border-gray-200 opacity-50'
          }`}
        >
          <span className="text-3xl block mb-1">{badge.icon}</span>
          <span className="text-xs font-medium block">
            {t(badge.titleKey)}
          </span>
          <span className="text-xs text-gray-500">
            {badge.earned ? t('badge.earned') : t('badge.locked')}
          </span>
        </div>
      ))}
    </div>
  )
}
