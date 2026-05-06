import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext'
import './StudentLoungeHero.css'

function StudentLoungeHero({ searchInput, onSearchChange, isLoggedIn }) {
  const { t } = useLocale()

  return (
    <section className="student-lounge" aria-label="Student Lounge banner">
      <div className="sl-page-content">
        <div className="sl-background-overlay" aria-hidden="true" />

        <div className="sl-header">
          <img
            src="/images/header2.png"
            alt="UniNotes Header"
            className="sl-header-image"
          />
        </div>

        <nav className="sl-nav" aria-label={t('heroNavigationLabel')}>
          <ul>
            <li><a href="#notes-list">{t('heroNavNotes')}</a></li>
            <li><a href="#notes-list">{t('heroNavPastExams')}</a></li>
            <li><a href="#notes-list">{t('heroNavLounge')}</a></li>
            <li><a href="#notes-list">{t('heroNavCurriculum')}</a></li>
            <li><a href="#notes-list">{t('heroNavAnnouncements')}</a></li>
          </ul>
        </nav>

        <div className="sl-main">
          <div className="sl-left-content" aria-hidden="true">
            <div className="sl-circuit-pattern" />
            <div className="sl-faint-logo sl-faint-logo-1">YU</div>
            <div className="sl-faint-logo sl-faint-logo-2">YU</div>
          </div>

          <div className="sl-right-content">
            <div className="sl-message-box">
              <p className="sl-message-text">{t('heroMessage')}</p>
              <p className="sl-message-hashtags">{t('heroHashtags')}</p>
            </div>

            <div className="sl-action-bar">
              <label className="sl-search-bar" htmlFor="hero-note-search">
                <span className="sl-search-icon" aria-hidden="true">⌕</span>
                <input
                  id="hero-note-search"
                  type="search"
                  placeholder={t('heroSearchPlaceholder')}
                  value={searchInput}
                  onChange={event => onSearchChange(event.target.value)}
                />
              </label>

              {isLoggedIn ? (
                <Link className="sl-note-share-btn" to="/notes/new">
                  {t('heroShareNote')}
                  <span aria-hidden="true">＋</span>
                </Link>
              ) : (
                <Link className="sl-note-share-btn" to="/login">
                  {t('heroLogin')}
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StudentLoungeHero
