import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext'
import './StudentLoungeHero.css'
import shushCustom from '../assets/shush-custom.svg'

function StudentLoungeHero({ searchInput, onSearchChange, isLoggedIn }) {
  const { t } = useLocale()

  return (
    <section className="student-lounge" aria-label="Student Lounge banner">
      <div className="sl-page-content">
        <div className="sl-background-overlay" aria-hidden="true" />

        <div className="sl-header">
          <div className="sl-logo-group">
            <div className="sl-university-name">YASAR<br />UNIVERSITY</div>
          </div>

          <div className="platform-title-wrapper">
            <div className="sl-platform-title-group">
              <div className="sl-platform-name">ARAMIZDA</div>
              <div className="sl-platform-subtitle">TOP SECRET STUDENT PLATFORM</div>
            </div>
            <img src={shushCustom} alt="Sus İşareti" className="shush-icon" />
          </div>

          <div className="sl-banned-group">
            <div className="sl-banned-stamp">{t('banned')}</div>
            <div className="sl-banned-subtitle">{t('teachers')}</div>
          </div>
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
            <div className="sl-user-profile" aria-hidden="true">◉</div>

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
