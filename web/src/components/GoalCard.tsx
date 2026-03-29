import { useTranslation } from 'react-i18next'

interface GoalCardProps {
  labelKey: string
  icon: string
  selected: boolean
  onSelect: () => void
}

export function GoalCard({ labelKey, icon, selected, onSelect }: GoalCardProps) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={[
        'w-full p-4 rounded-xl flex items-center gap-3 text-start transition-colors duration-150 border-2',
        selected
          ? 'border-indigo-600 bg-indigo-50'
          : 'border-gray-200 bg-white',
      ].join(' ')}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-base font-medium text-gray-800">{t(labelKey)}</span>
    </button>
  )
}
