import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function Toast() {
  const location = useLocation()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!location.state?.toast) return
    setMessage(location.state.toast)
    navigate(location.pathname, { replace: true, state: {} })
    const t = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(t)
  }, [location.state?.toast])

  if (!message) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white text-sm md:text-base px-5 py-3 rounded-2xl shadow-2xl ring-1 ring-white/20 backdrop-blur-sm">
      {message}
    </div>
  )
}

export default Toast
