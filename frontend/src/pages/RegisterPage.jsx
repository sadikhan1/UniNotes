import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'

const STUDENT_EMAIL_RE = /^\d{11}@stu\.yasar\.edu\.tr$/

function RegisterPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLocale()
  const [formData, setFormData] = useState({ email: '', username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

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
    } else if (name === 'username') {
      if (!value.trim()) newErrors.username = t('usernameRequired')
      else if (value.trim().length < 3) newErrors.username = t('usernameMin')
      else delete newErrors.username
    } else if (name === 'password') {
      if (!value) newErrors.password = t('passwordRequired')
      else if (value.length < 8) newErrors.password = t('passwordMinLength')
      else delete newErrors.password
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
    const newErrors = {}
    const emailErr = validateEmail(formData.email)
    if (emailErr) newErrors.email = emailErr

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
      <div className="min-h-screen flex items-center justify-center bg-[#0b1117] py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-[#10141a] border border-cyan-900/50 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-100 mb-3">{t('checkEmailTitle')}</h2>
            <p className="text-slate-400 text-sm mb-2">
              {t('checkEmailMessage')} <span className="text-cyan-400 font-medium">{registeredEmail || t('yourEmail')}</span>
            </p>
            <p className="text-slate-500 text-sm mb-6">{t('verifyEmailMessage')}</p>
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors">
              {t('backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1117] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">

        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-400 flex items-center justify-center">
              <span className="text-[#0b1117] font-bold text-sm">U</span>
            </div>
            <span className="text-2xl font-bold text-slate-100 tracking-tight">UniNotes</span>
          </div>
          <p className="text-slate-400 text-sm">Yaşar Üniversitesi Öğrenci Platformu</p>
        </div>

        <div className="bg-[#10141a] border border-cyan-900/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-slate-100 mb-6 text-center">
            {t('createAccountTitle')}
          </h2>

          {apiError && (
            <div className="mb-4 rounded-lg bg-red-950/60 border border-red-800/50 p-3 text-sm text-red-400">
              {apiError}
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
                className={`w-full px-4 py-3 rounded-lg bg-[#0b1117] border text-slate-100 placeholder-slate-600
                  focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-600 transition
                  ${errors.email ? 'border-red-600' : 'border-cyan-900/50'}`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                name="username"
                type="text"
                placeholder={t('username')}
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-[#0b1117] border text-slate-100 placeholder-slate-600
                  focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-600 transition
                  ${errors.username ? 'border-red-600' : 'border-cyan-900/50'}`}
              />
              {errors.username && (
                <p className="mt-1.5 text-xs text-red-400">{errors.username}</p>
              )}
            </div>

            <div>
              <input
                name="password"
                type="password"
                placeholder={t('passwordMin')}
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-[#0b1117] border text-slate-100 placeholder-slate-600
                  focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-600 transition
                  ${errors.password ? 'border-red-600' : 'border-cyan-900/50'}`}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-400 text-[#0b1117] py-3 px-4 rounded-lg font-semibold
                hover:bg-cyan-300 active:bg-cyan-500 transition-colors mt-2"
            >
              {t('register')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {t('haveAccount')}{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
