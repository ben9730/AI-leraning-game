import { createBrowserRouter, RouterProvider, Outlet } from 'react-router'
import { LessonPage } from './pages/LessonPage'
import { HomePage } from './pages/HomePage'
import { GameHeader } from './components/GameHeader'
import { LevelUpModal } from './components/LevelUpModal'
import { useProgressStore } from './store/useProgressStore'

function RootLayout() {
  const pendingLevelUp = useProgressStore(s => s.pendingLevelUp)
  const clearPendingLevelUp = useProgressStore(s => s.clearPendingLevelUp)

  return (
    <div className="flex flex-col min-h-dvh">
      <GameHeader />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      {pendingLevelUp !== null && (
        <LevelUpModal level={pendingLevelUp} onDismiss={clearPendingLevelUp} />
      )}
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/lesson/:id', element: <LessonPage /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
