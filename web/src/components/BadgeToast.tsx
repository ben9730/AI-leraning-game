import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Badge } from '@shared/gamification/badges'

interface BadgeToastProps {
  badge: Badge
  onDismiss: () => void
}

export function BadgeToast({ badge, onDismiss }: BadgeToastProps) {
  const { t } = useTranslation()

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="fixed top-16 start-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border border-indigo-200 px-4 py-3 flex items-center gap-3 animate-scale-pulse">
      <span className="text-2xl">{badge.icon}</span>
      <div>
        <p className="text-sm font-semibold text-indigo-700">
          {t('badge.new_badge')}
        </p>
        <p className="text-xs text-gray-600">{t(badge.titleKey)}</p>
      </div>
    </div>
  )
}
