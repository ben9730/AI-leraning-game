import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type InstallMode = 'android' | 'ios' | 'none'

const DISMISSED_KEY = 'promptplay_install_dismissed'

export function InstallBanner() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<InstallMode>('none')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Already dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return

    // Already installed as standalone
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // iOS detection
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    if (isIOS) {
      setMode('ios')
      return
    }

    // Android / Chrome — listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setMode('android')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setMode('none')
  }

  const install = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    dismiss()
  }

  if (mode === 'none') return null

  return (
    <nav
      role="complementary"
      aria-label={t('pwa.installButton')}
      className="fixed bottom-14 lg:bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 shadow-lg px-4 py-3 flex items-center justify-between gap-3"
    >
      <span className="text-sm text-gray-800 flex-1">
        {mode === 'ios' ? t('pwa.iosInstallHint') : t('pwa.installButton')}
      </span>
      {mode === 'android' && (
        <button
          type="button"
          onClick={install}
          className="h-11 px-4 bg-indigo-600 text-white text-sm font-bold rounded-md"
        >
          {t('pwa.installButton')}
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('pwa.dismiss')}
        className="h-11 px-3 text-sm text-gray-500"
      >
        ✕
      </button>
    </nav>
  )
}
