import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import NotesPage from './pages/NotesPage'
import NoteFormPage from './pages/NoteFormPage'
import NoteDetailPage from './pages/NoteDetailPage'
import ProfilePage from './pages/ProfilePage'
import CurriculumPage from './pages/CurriculumPage'
import Toast from './components/Toast'

function App() {
  const location = useLocation()
  const isStudentLoungePage = location.pathname === '/notes'

  return (
    <AuthProvider>
      <div className={`min-h-screen ${isStudentLoungePage ? 'bg-[#0b1117]' : 'bg-gray-50'}`}>
        {!isStudentLoungePage && <Navbar />}
        <Toast />
        <Routes>
          <Route path="/" element={<Navigate to="/notes" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/notes" element={<HomePage />} />
          <Route path="/notes/new" element={
            <ProtectedRoute><NoteFormPage /></ProtectedRoute>
          } />
          <Route path="/notes/:id/edit" element={
            <ProtectedRoute><NoteFormPage /></ProtectedRoute>
          } />
          <Route path="/notes/:id" element={<NoteDetailPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/departments/:slug" element={<CurriculumPage />} />
          <Route path="*" element={<Navigate to="/notes" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
