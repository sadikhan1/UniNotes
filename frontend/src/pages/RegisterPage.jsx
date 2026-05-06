import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

function RegisterPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState({ email: '', username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  useEffect(() => {
    if (user) {
      navigate('/notes', { replace: true })
    }
  }, [user, navigate])

  const validateField = (name, value) => {
    const newErrors = { ...errors }

    if (!value.trim()) {
      newErrors[name] = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`
    } else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        newErrors[name] = t('invalidEmail')
      } else {
        delete newErrors[name]
      }
    } else if (name === 'username') {
      if (value.trim().length < 3) {
        newErrors[name] = t('usernameMin')
      } else {
        delete newErrors[name]
      }
    } else if (name === 'password') {
      if (value.length < 8) {
        newErrors[name] = t('passwordMinLength')
      } else {
        delete newErrors[name]
      }
    }

    setErrors(newErrors)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
    setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all fields before submission
    const newErrors = {}
    if (!formData.email.trim()) newErrors.email = t('emailRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('invalidEmail')

    if (!formData.username.trim()) newErrors.username = t('usernameRequired')
    else if (formData.username.trim().length < 3) newErrors.username = t('usernameMin')

    if (!formData.password) newErrors.password = t('passwordRequired')
    else if (formData.password.length < 8) newErrors.password = t('passwordMinLength')

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setApiError('')
      setRegisteredEmail(formData.email)
      await registerUser(formData.email, formData.username, formData.password)
      setSuccess(true)
      setFormData({ email: '', username: '', password: '' })
    } catch (error) {
      setApiError(error.message)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1117] px-4 py-12 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(0,192,216,0.15),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(200,45,59,0.12),transparent_30%)]" />
        <div className="relative z-10 max-w-md w-full space-y-8 text-center">
          <div className="rounded-2xl border border-cyan-900/60 bg-[#10141a]/90 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-cyan-100 mb-4">Check your email</h2>
            <p className="text-slate-300 mb-6">
              We've sent a verification link to <strong>{registeredEmail || 'your email'}</strong>.
            </p>
            <p className="text-slate-400 mb-6">
              Please verify your email address to complete registration.
            </p>
            <Link
              to="/login"
              className="inline-block font-semibold text-cyan-300 hover:text-cyan-200"
            >
              {t('backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1117] px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(0,192,216,0.15),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(200,45,59,0.12),transparent_30%)]" />
      <div className="relative z-10 max-w-md w-full space-y-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70 mb-3">UniNotes Access</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-cyan-100">
            Create your account
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Join the same dark, neon-styled student lounge.
          </p>
        </div>
        <form className="mt-8 space-y-6 rounded-2xl border border-cyan-900/60 bg-[#10141a]/90 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-sm" onSubmit={handleSubmit}>
          {apiError && (
            <div className="rounded-md border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-200">
              {apiError}
            </div>
          )}

          <div>
            {errors.email && (
              <p className="text-sm text-red-600 mb-2">{errors.email}</p>
            )}
            <input
              name="email"
              type="email"
              placeholder={t('email')}
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-md border bg-[#0f141c] px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                errors.email ? 'border-red-500/80' : 'border-cyan-900/80'
              }`}
            />
          </div>

          <div>
            {errors.username && (
              <p className="text-sm text-red-600 mb-2">{errors.username}</p>
            )}
            <input
              name="username"
              type="text"
              placeholder={t('username')}
              value={formData.username}
              onChange={handleChange}
              className={`w-full rounded-md border bg-[#0f141c] px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                errors.username ? 'border-red-500/80' : 'border-cyan-900/80'
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
              placeholder={t('passwordMin')}
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
            {t('register')}
          </button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
