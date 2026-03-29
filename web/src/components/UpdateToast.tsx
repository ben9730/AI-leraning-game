import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTranslation } from 'react-i18next'

export function UpdateToast() {
  const { t } = useTranslation()
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-16 start-1/2 -translate-x-1/2 z-50 bg-white border border-indigo-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3"
    >
      <span className="text-sm text-gray-800">{t('pwa.updateAvailable')}</span>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="px-3 py-1 bg-indigo-600 text-white text-sm font-bold rounded-md"
      >
        {t('pwa.updateRefresh')}
      </button>
      <button
        type="button"
        onClick={() => updateServiceWorker(false)}
        className="text-sm text-gray-500"
      >
        {t('pwa.updateLater')}
      </button>
    </div>
  )
}
