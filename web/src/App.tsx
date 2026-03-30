import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import { LessonPage } from './pages/LessonPage'
import { HomePage } from './pages/HomePage'
import { SkillTreePage } from './pages/SkillTreePage'
import { ProfilePage } from './pages/ProfilePage'
import { OnboardingPage } from './pages/OnboardingPage'
import { useParams } from 'react-router'
import { GameHeader } from './components/GameHeader'
import { LevelUpModal } from './components/LevelUpModal'
import { TabBar } from './components/TabBar'
import { Sidebar } from './components/Sidebar'
import { OfflineBanner } from './components/OfflineBanner'
import { UpdateToast } from './components/UpdateToast'
import { InstallBanner } from './components/InstallBanner'
import { useProgressStore, useHasHydrated } from './store/useProgressStore'

function LessonPageWrapper() {
  const { id } = useParams<{ id: string }>()
  return <LessonPage key={id} />
}

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
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex flex-col flex-1 lg:ms-64">
        <GameHeader />
        <OfflineBanner />
        <main className="flex-1 flex flex-col pb-14 lg:pb-0 w-full lg:max-w-2xl lg:mx-auto">
          <Outlet />
        </main>
        <TabBar />
      </div>
      <UpdateToast />
      <InstallBanner />
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
      { path: '/lesson/:id', element: <LessonPageWrapper /> },
    ],
  },
])

export function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  )
}
