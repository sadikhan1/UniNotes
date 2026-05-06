import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'

function Navbar() {
  const { user, logout } = useAuth()
  const { locale, setLocale, t } = useLocale()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) =>
    location.pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || ''

  return (
    <nav className="border-b border-cyan-900/60 bg-[#0b1117]/95 px-4 py-3 text-slate-100 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-xl font-bold text-cyan-300 shrink-0 tracking-wide">
          UniNotes
        </Link>

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-md p-1">
            <button
              onClick={() => setLocale('en')}
              className={`px-2 py-1 text-xs font-medium rounded transition ${
                locale === 'en' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale('tr')}
              className={`px-2 py-1 text-xs font-medium rounded transition ${
                locale === 'tr' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              TR
            </button>
          </div>

          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-slate-300 font-medium max-w-[12rem] truncate">
                {user.user_metadata?.username || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-400 hover:text-red-300 transition"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className={`text-sm transition ${isActive('/login')}`}>
                {t('login')}
              </Link>
              <Link
                to="/register"
                className={`text-sm font-semibold bg-cyan-400 text-[#0b1117] px-4 py-1.5 rounded-full hover:bg-cyan-300 transition ${
                  location.pathname === '/register' ? 'ring-2 ring-cyan-300/60' : ''
                }`}
              >
                {t('register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
