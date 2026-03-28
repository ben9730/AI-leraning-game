import { useTranslation } from 'react-i18next'
import { useProgressStore } from './store/useProgressStore'
import { useLanguage } from '@/hooks/useLanguage'

export function App() {
  const { t } = useTranslation()
  const { currentLanguage, isRTL, toggleLanguage } = useLanguage()
  const xpTotal = useProgressStore(s => s.xpTotal)
  const addXP = useProgressStore(s => s.addXP)

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-indigo-600 mb-2">
          {t('home.title')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('home.start_lesson')}
        </p>
        <div className="mt-6 space-y-3">
          <p className="text-2xl font-semibold text-purple-700">
            {xpTotal} XP
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-gray-500">
              {currentLanguage.toUpperCase()} {isRTL ? '(RTL)' : '(LTR)'}
            </span>
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              {t('language.switchToHebrew')}
            </button>
          </div>
          <button
            type="button"
            onClick={() => addXP(10, 'exercise_pass')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            +10 XP
          </button>
        </div>
        <div className="mt-6 ps-4 pe-4 text-start">
          <p className="text-sm text-gray-400">
            {t('common.continue')} | {t('common.back')}
          </p>
          <p className="text-xs text-gray-300 mt-1">
            RTL demo: ps-4 pe-4 text-start (logical properties)
          </p>
        </div>
      </div>
    </div>
  )
}
