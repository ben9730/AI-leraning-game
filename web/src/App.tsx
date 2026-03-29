import { createBrowserRouter, RouterProvider } from 'react-router'
import { LessonPage } from './pages/LessonPage'

// Temporary placeholder until Plan 02 builds HomePage
function HomePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-indigo-600 mb-2">PromptPlay</h1>
        <p className="text-lg text-gray-600">Home page coming in next plan</p>
      </div>
    </div>
  )
}

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/lesson/:id', element: <LessonPage /> },
])

export function App() {
  return <RouterProvider router={router} />
}
