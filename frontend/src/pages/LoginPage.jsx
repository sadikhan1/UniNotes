import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/api'

function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [emailUnverified, setEmailUnverified] = useState(false)

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

    const newErrors = {}
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.password.trim()) newErrors.password = 'Password is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setServerError('')
      setEmailUnverified(false)
      const data = await loginUser(formData.email, formData.password)
      localStorage.setItem('token', data.access_token)
      navigate('/notes')
    } catch (err) {
      if (err.status === 403) {
        setEmailUnverified(true)
      } else {
        setServerError(err.message)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow" onSubmit={handleSubmit}>
          {serverError && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              {serverError}
            </div>
          )}
          {emailUnverified && (
            <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800 border border-yellow-200">
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition"
          >
            Sign in
          </button>

          <p className="text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
