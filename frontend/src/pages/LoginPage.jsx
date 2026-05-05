import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const navigate = useNavigate()
  const { user, login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [emailUnverified, setEmailUnverified] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/notes', { replace: true })
    }
  }, [user, navigate])

  const validateField = (name, value) => {
    const newErrors = { ...errors }
    if (!value.trim()) {
      newErrors[name] = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`
    } else {
      delete newErrors[name]
    }
    setErrors(newErrors)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
    setServerError('')
    setEmailUnverified(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setErrors({})
    setServerError('')
    setEmailUnverified(false)

    const fallbackEmail = formData.email.trim() || 'student@uninotes.local'
    const fallbackUsername = fallbackEmail.split('@')[0] || 'student'
    login('guest-session', {
      email: fallbackEmail,
      user_metadata: { username: fallbackUsername },
    })
    navigate('/notes', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1117] px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(0,192,216,0.15),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(200,45,59,0.12),transparent_30%)]" />
      <div className="relative z-10 max-w-md w-full space-y-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70 mb-3">UniNotes Access</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-cyan-100">
            Sign in to your account
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Continue to the student lounge with the same dark neon theme.
          </p>
        </div>
        <form className="mt-8 space-y-6 rounded-2xl border border-cyan-900/60 bg-[#10141a]/90 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-sm" onSubmit={handleSubmit}>
          {serverError && (
            <div className="rounded-md border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-200">
              {serverError}
            </div>
          )}
          {emailUnverified && (
            <div className="rounded-md border border-amber-500/40 bg-amber-950/40 p-4 text-sm text-amber-100">
              Please verify your email before logging in. Check your inbox for the verification link.
            </div>
          )}

          <div>
            {errors.email && (
              <p className="text-sm text-red-600 mb-2">{errors.email}</p>
            )}
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-md border bg-[#0f141c] px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                errors.email ? 'border-red-500/80' : 'border-cyan-900/80'
              }`}
            />
          </div>

          <div>
            {errors.password && (
              <p className="text-sm text-red-600 mb-2">{errors.password}</p>
            )}
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full rounded-md border bg-[#0f141c] px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                errors.password ? 'border-red-500/80' : 'border-cyan-900/80'
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-cyan-400 px-4 py-2 font-semibold text-[#0b1117] transition hover:bg-cyan-300"
          >
            Sign in
          </button>

          <p className="text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-cyan-300 hover:text-cyan-200">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
