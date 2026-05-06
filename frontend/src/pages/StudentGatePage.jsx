import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function StudentGatePage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showTeacherMessage, setShowTeacherMessage] = useState(false)

  const handleStudentClick = () => {
    // Auto login and navigate to notes
    login('guest-session', {
      email: 'student@uninotes.local',
      user_metadata: { username: 'student' },
    })
    navigate('/notes', { replace: true })
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b1117] px-4 py-12 text-slate-100">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(0,192,216,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(200,45,59,0.14),transparent_30%)]" />
      <section className="relative z-10 w-full max-w-xl text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-cyan-300/70">UniNotes Checkpoint</p>
        <h1 className="text-3xl font-extrabold text-cyan-100 sm:text-5xl">
          Are you a student?
        </h1>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleStudentClick}
            className="rounded-md bg-cyan-400 px-8 py-3 font-bold text-[#0b1117] transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-200"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setShowTeacherMessage(true)}
            className="rounded-md border border-cyan-800/80 bg-[#10141a]/80 px-8 py-3 font-bold text-cyan-100 transition hover:border-cyan-400 hover:bg-[#121b24] focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            No
          </button>
        </div>
        {showTeacherMessage && (
          <p className="mx-auto mt-8 max-w-md rounded-md border border-rose-400/30 bg-rose-950/20 px-5 py-4 text-base font-medium leading-7 text-rose-100 shadow-[0_16px_40px_rgba(0,0,0,0.32)]">
            There is nothing to see, our beloved teachers. Please go... attendance is already scary enough.
          </p>
        )}
      </section>
    </main>
  )
}

export default StudentGatePage
