import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router'
import { LessonPage } from './pages/LessonPage'
import { HomePage } from './pages/HomePage'
import { SkillTreePage } from './pages/SkillTreePage'
import { ProfilePage } from './pages/ProfilePage'
import { OnboardingPage } from './pages/OnboardingPage'
import { GameHeader } from './components/GameHeader'
import { LevelUpModal } from './components/LevelUpModal'
import { TabBar } from './components/TabBar'
import { useProgressStore, useHasHydrated } from './store/useProgressStore'

function OnboardingLayout() {
  return <Outlet />
}

function RootLayout() {
  const pendingLevelUp = useProgressStore(s => s.pendingLevelUp)
  const clearPendingLevelUp = useProgressStore(s => s.clearPendingLevelUp)
  const hasOnboarded = useProgressStore(s => s.hasOnboarded)
  const hasHydrated = useHasHydrated()

  if (!hasHydrated) return null
  if (!hasOnboarded) return <Navigate to="/onboarding" replace />

  return (
    <div className="flex flex-col min-h-dvh">
      <GameHeader />
      <main className="flex-1 flex flex-col pb-14">
        <Outlet />
      </main>
      <TabBar />
      {pendingLevelUp !== null && (
        <LevelUpModal level={pendingLevelUp} onDismiss={clearPendingLevelUp} />
      )}
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <OnboardingLayout />,
    children: [
      { path: '/onboarding', element: <OnboardingPage /> },
    ],
  },
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/tree', element: <SkillTreePage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/lesson/:id', element: <LessonPage /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
