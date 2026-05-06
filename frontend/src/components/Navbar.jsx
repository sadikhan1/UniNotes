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
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-xl font-bold text-blue-600 shrink-0">
          {t('appTitle')}
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
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-sm">
              <Link
                to="/profile"
                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="max-w-[100px] truncate">{username}</span>
              </Link>
              <div className="w-px h-6 bg-gray-200" />
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-red-600 hover:bg-red-50 transition font-medium"
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
