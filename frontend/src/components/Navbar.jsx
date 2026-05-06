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
    location.pathname === path ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-cyan-400'

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || ''

  return (
    <nav className="bg-[#10141a] border-b border-cyan-900/40 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <Link to="/notes" className="text-xl font-bold text-cyan-400 shrink-0 tracking-tight">
          {t('appTitle')}
        </Link>

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 border border-cyan-900/50 rounded-md p-1">
            <button
              onClick={() => setLocale('en')}
              className={`px-2 py-1 text-xs font-medium rounded transition ${
                locale === 'en'
                  ? 'bg-cyan-400 text-[#0b1117]'
                  : 'text-slate-400 hover:bg-cyan-900/30'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale('tr')}
              className={`px-2 py-1 text-xs font-medium rounded transition ${
                locale === 'tr'
                  ? 'bg-cyan-400 text-[#0b1117]'
                  : 'text-slate-400 hover:bg-cyan-900/30'
              }`}
            >
              TR
            </button>
          </div>

          {user ? (
            <div className="flex items-center border border-cyan-900/40 rounded-lg overflow-hidden text-sm">
              <Link
                to={`/profile/${user.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:bg-cyan-900/20 transition font-medium"
              >
                <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="max-w-[100px] truncate">{username}</span>
              </Link>
              <div className="w-px h-6 bg-cyan-900/50" />
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-red-400 hover:bg-red-950/40 transition font-medium"
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
                className="text-sm font-medium bg-cyan-400 text-[#0b1117] px-4 py-1.5 rounded-full hover:bg-cyan-300 transition"
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
