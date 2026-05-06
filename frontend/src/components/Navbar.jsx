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

  const handleLanguageChange = (newLocale) => {
    setLocale(newLocale)
  }

  const isActive = (path) =>
    location.pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-xl font-bold text-blue-600 shrink-0">
          {t('appTitle')}
        </Link>

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-md p-1">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-2 py-1 text-xs font-medium rounded transition ${
                locale === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleLanguageChange('tr')}
              className={`px-2 py-1 text-xs font-medium rounded transition ${
                locale === 'tr'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              TR
            </button>
          </div>

          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-gray-700 font-medium max-w-[12rem] truncate">
                {user.user_metadata?.username || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 transition"
              >
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`text-sm transition ${isActive('/login')}`}>
                {t('login')}
              </Link>
              <Link
                to="/register"
                className={`text-sm font-medium bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 transition ${
                  location.pathname === '/register' ? 'ring-2 ring-blue-400' : ''
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
