import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
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
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
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
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
