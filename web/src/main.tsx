import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { useHasHydrated } from './store/useProgressStore'
import './styles/globals.css'

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
      <App />
    </HydrationGate>
  </StrictMode>,
)
