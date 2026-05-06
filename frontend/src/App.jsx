import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LocaleProvider } from './context/LocaleContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import NoteFormPage from './pages/NoteFormPage'
import NoteDetailPage from './pages/NoteDetailPage'
import ProfilePage from './pages/ProfilePage'
import CurriculumPage from './pages/CurriculumPage'
import CoursePage from './pages/CoursePage'
import ExamCalendarPage from './pages/ExamCalendarPage'
import Toast from './components/Toast'

const AUTH_PAGES = ['/login', '/register']

function RootRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0b1117' }}>
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <Navigate to={user ? '/notes' : '/login'} replace />
}

function AppShell() {
  const location = useLocation()
  const isAuthPage = AUTH_PAGES.includes(location.pathname)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0b1117' }}>
      {!isAuthPage && <Navbar />}
      <Toast />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/notes" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/notes/new" element={<ProtectedRoute><NoteFormPage /></ProtectedRoute>} />
        <Route path="/notes/:id/edit" element={<ProtectedRoute><NoteFormPage /></ProtectedRoute>} />
        <Route path="/notes/:id" element={<ProtectedRoute><NoteDetailPage /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/departments/:slug" element={<ProtectedRoute><CurriculumPage /></ProtectedRoute>} />
        <Route path="/courses/:courseCode" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
        <Route path="/departments/:slug/exams" element={<ProtectedRoute><ExamCalendarPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </LocaleProvider>
  )
}

export default App
