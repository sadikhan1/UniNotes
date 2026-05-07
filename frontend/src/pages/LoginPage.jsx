import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'
import { useTheme } from '../context/ThemeContext'

const STUDENT_EMAIL_RE = /^\d{11}@stu\.yasar\.edu\.tr$/

function LoginPage() {
  const navigate = useNavigate()
  const { user, login } = useAuth()
  const { t } = useLocale()
  const { isDark, toggleTheme } = useTheme()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [emailUnverified, setEmailUnverified] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) navigate('/notes', { replace: true })
  }, [user, navigate])

  const validateEmail = (value) => {
    if (!value.trim()) return t('emailRequired')
    if (!STUDENT_EMAIL_RE.test(value.trim())) return t('invalidStudentEmail')
    return null
  }

  const validateField = (name, value) => {
    const newErrors = { ...errors }
    if (name === 'email') {
      const err = validateEmail(value)
      if (err) newErrors.email = err
      else delete newErrors.email
    } else if (!value.trim()) {
      newErrors[name] = t(`${name}Required`)
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
    const newErrors = {}
    const emailErr = validateEmail(formData.email)
    if (emailErr) newErrors.email = emailErr
    if (!formData.password.trim()) newErrors.password = t('passwordRequired')

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setServerError('')
      setEmailUnverified(false)
      const data = await loginUser(formData.email, formData.password)
      login(data.access_token, data.user)
      navigate('/notes')
    } catch (err) {
      if (err.status === 403) {
        setEmailUnverified(true)
      } else if (err.status === 0 || err.message === 'Network request failed') {
        setServerError(t('networkError'))
      } else if (err.status === 401) {
        setServerError(t('invalidCredentials'))
      } else {
        setServerError(err.message)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-base)] py-12 px-4 sm:px-6 lg:px-8">
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 p-2 rounded-md border transition z-10 ${
          isDark
            ? 'border-amber-600/60 text-amber-400 hover:bg-amber-400/10'
            : 'border-indigo-400/60 text-indigo-500 hover:bg-indigo-100/60'
        }`}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <div className="w-full max-w-md space-y-8">

        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-400 flex items-center justify-center">
              <span className="text-[#0b1117] font-bold text-sm">U</span>
            </div>
            <span className="text-2xl font-bold text-slate-100 tracking-tight">UniNotes</span>
          </div>
          <p className="text-slate-400 text-sm">{t('platformSubtitle')}</p>
        </div>

        <div className="bg-[var(--color-surface)] border border-cyan-900/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-slate-100 mb-6 text-center">
            {t('signInTitle')}
          </h2>

          {serverError && (
            <div className="mb-4 rounded-lg bg-red-950/60 border border-red-800/50 p-3 text-sm text-red-400">
              {serverError}
            </div>
          )}
          {emailUnverified && (
            <div className="mb-4 rounded-lg bg-yellow-950/60 border border-yellow-700/50 p-3 text-sm text-yellow-400">
              {t('emailVerification')}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <input
                name="email"
                type="email"
                placeholder="XXXXXXXXXXX@stu.yasar.edu.tr"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-[var(--color-base)] border text-slate-100 placeholder-slate-600
                  focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-600 transition
                  ${errors.email ? 'border-red-600' : 'border-cyan-900/50'}`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('password')}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-11 rounded-lg bg-[var(--color-base)] border text-slate-100 placeholder-slate-600
                    focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-600 transition
                    ${errors.password ? 'border-red-600' : 'border-cyan-900/50'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition"
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-400 text-[#0b1117] py-3 px-4 rounded-lg font-semibold
                hover:bg-cyan-300 active:bg-cyan-500 transition-colors mt-2"
            >
              {t('signIn')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {t('noAccount')}{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              {t('register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
