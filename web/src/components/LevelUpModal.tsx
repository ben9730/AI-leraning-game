import { useTranslation } from 'react-i18next'

interface LevelUpModalProps {
  level: number
  onDismiss: () => void
}

export function LevelUpModal({ level, onDismiss }: LevelUpModalProps) {
  const { t } = useTranslation()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center animate-scale-pulse">
        <span className="text-5xl block mb-4">⭐</span>
        <h2 className="text-2xl font-bold text-indigo-700 mb-2">
          {t('gamification.level_up')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('gamification.level_up_message', { level })}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          {t('common.continue')}
        </button>
      </div>
    </div>
  )
}
