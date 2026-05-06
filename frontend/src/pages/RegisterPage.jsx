import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registerUser } from '../services/api'
import { useLocale } from '../context/LocaleContext'

function RegisterPage() {
  const { t } = useLocale()
  const [formData, setFormData] = useState({ email: '', username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('checkEmailTitle')}</h2>
            <p className="text-gray-600 mb-6">
              {t('checkEmailMessage')} <strong>{registeredEmail || t('yourEmail')}</strong>.
            </p>
            <p className="text-gray-600 mb-6">
              {t('verifyEmailMessage')}
            </p>
            <Link
              to="/login"
              className="inline-block text-blue-600 hover:text-blue-700 font-medium"
            >
              {t('backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('createAccountTitle')}
          </h2>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow" onSubmit={handleSubmit}>
          {apiError && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.username ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition"
          >
            {t('register')}
          </button>

          <p className="text-center text-gray-600">
            {t('haveAccount')}{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              {t('signIn')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
