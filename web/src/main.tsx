import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n' // Initialize i18next BEFORE any component imports
import i18next from 'i18next'
import { App } from './App'
import { useHasHydrated, useProgressStore } from './store/useProgressStore'
import './styles/globals.css'

/** Syncs persisted language preference to i18next + document dir on load and changes */
function LanguageSync() {
  const language = useProgressStore(s => s.language)

  useEffect(() => {
    i18next.changeLanguage(language)
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  return null
}

function HydrationGate({ children }: { children: React.ReactNode }) {
  const hasHydrated = useHasHydrated()

  if (!hasHydrated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    )
  }

  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HydrationGate>
      <LanguageSync />
      <App />
    </HydrationGate>
  </StrictMode>,
)
