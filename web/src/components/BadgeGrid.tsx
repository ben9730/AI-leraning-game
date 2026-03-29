import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Badge } from '@shared/gamification/badges'

interface BadgeGridProps {
  badges: Badge[]
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  const { t } = useTranslation()
  const [activeBadge, setActiveBadge] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-3 gap-3">
      {activeBadge && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveBadge(null)}
        />
      )}
      {badges.map(badge => (
        <button
          key={badge.id}
          type="button"
          onClick={() => setActiveBadge(activeBadge === badge.id ? null : badge.id)}
          className={`relative cursor-pointer rounded-lg border p-3 text-center ${
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
          {activeBadge === badge.id && (
            <div className="absolute inset-x-0 -bottom-1 translate-y-full z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-start">
              <p className="text-xs font-semibold text-gray-800">{t(badge.titleKey)}</p>
              <p className="text-xs text-gray-500">{t(badge.descriptionKey)}</p>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
