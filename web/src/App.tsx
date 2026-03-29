import { createBrowserRouter, RouterProvider } from 'react-router'
import { LessonPage } from './pages/LessonPage'
import { HomePage } from './pages/HomePage'

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/lesson/:id', element: <LessonPage /> },
])

export function App() {
  return <RouterProvider router={router} />
}
