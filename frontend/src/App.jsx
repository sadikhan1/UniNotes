import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StudentGatePage from './pages/StudentGatePage'
import HomePage from './pages/HomePage'
import NotesPage from './pages/NotesPage'
import NoteFormPage from './pages/NoteFormPage'
import NoteDetailPage from './pages/NoteDetailPage'
import ProfilePage from './pages/ProfilePage'
import CurriculumPage from './pages/CurriculumPage'
import CoursePage from './pages/CoursePage'
import Toast from './components/Toast'
import Splash from './components/Splash'

function App() {
  const location = useLocation()
  const isStudentLoungePage = location.pathname === '/notes'
  const isDepartmentsPage = location.pathname.startsWith('/departments')
  const isGatePage = location.pathname === '/'
  const routeTransitionKey = `${location.pathname}${location.search}`

  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    document.body.style.overflow = showSplash ? 'hidden' : ''

    if (!showSplash) {
      // When splash disappears, always start from the top of the page.
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [showSplash])

  useEffect(() => {
    // Smooth page-to-page transitions should begin from top unless user targets a hash.
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }
  }, [location.pathname, location.search, location.hash])

  return (
    <AuthProvider>
      {showSplash && <Splash />}
      <div className={`min-h-screen ${isStudentLoungePage || isDepartmentsPage ? 'bg-[#0b1117]' : 'bg-gray-50'}`}>
        {!(isStudentLoungePage || isDepartmentsPage || isGatePage) && <Navbar />}
        <Toast />
        <div key={routeTransitionKey} className="page-transition-layer">
          <Routes>
            <Route path="/" element={<StudentGatePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/notes" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/notes/new" element={
              <ProtectedRoute><NoteFormPage /></ProtectedRoute>
            } />
            <Route path="/notes/:id/edit" element={
              <ProtectedRoute><NoteFormPage /></ProtectedRoute>
            } />
            <Route path="/notes/:id" element={<ProtectedRoute><NoteDetailPage /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/departments/:slug" element={<ProtectedRoute><CurriculumPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  )
}

export default App
