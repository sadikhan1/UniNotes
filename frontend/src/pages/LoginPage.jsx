import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'

const STUDENT_EMAIL_RE = /^\d{11}@stu\.yasar\.edu\.tr$/

function LoginPage() {
  const navigate = useNavigate()
  const { user, login } = useAuth()
  const { t } = useLocale()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [emailUnverified, setEmailUnverified] = useState(false)

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
                name="password"
                type="password"
                placeholder={t('password')}
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
