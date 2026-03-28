import { useCallback } from 'react'
import { useProgressStore } from '@/store/useProgressStore'
import i18next from '@/i18n'

type Language = 'en' | 'he'

export function useLanguage() {
  const currentLanguage = useProgressStore(s => s.language)
  const storeSetLanguage = useProgressStore(s => s.setLanguage)
  const isRTL = currentLanguage === 'he'

  const setLanguage = useCallback(
    (lang: Language) => {
      storeSetLanguage(lang)
      i18next.changeLanguage(lang)
      document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
      document.documentElement.lang = lang
    },
    [storeSetLanguage],
  )

  const toggleLanguage = useCallback(() => {
    const next: Language = currentLanguage === 'en' ? 'he' : 'en'
    setLanguage(next)
  }, [currentLanguage, setLanguage])

  return { currentLanguage, isRTL, toggleLanguage, setLanguage }
}
