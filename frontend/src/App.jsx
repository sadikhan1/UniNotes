import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function NotesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-900">Notes (coming soon)</h1>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/notes" element={<NotesPage />} />
    </Routes>
  )
}

export default App
