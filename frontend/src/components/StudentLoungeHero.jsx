import { Link } from 'react-router-dom'
import './StudentLoungeHero.css'

function YasarSeal({ className }) {
  return (
    <svg className={className} viewBox="0 0 256 256" fill="none" aria-hidden="true">
      <circle cx="128" cy="128" r="102" stroke="currentColor" strokeWidth="12" />

      <path
        d="M78 82c20 8 36 26 46 49v72H93v-98c-3-9-8-17-15-23z"
        fill="currentColor"
      />
      <path
        d="M178 82c-20 8-36 26-46 49v72h31v-98c3-9 8-17 15-23z"
        fill="currentColor"
      />
      <path d="M121 128h14v75h-14z" fill="currentColor" />

      <path
        d="M128 132c-9-16-22-28-39-36"
        stroke="var(--logo-cut, #0b1117)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M128 132c9-16 22-28 39-36"
        stroke="var(--logo-cut, #0b1117)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M128 132v38"
        stroke="var(--logo-cut, #0b1117)"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function StudentLoungeHero({ searchInput, onSearchChange, isLoggedIn }) {
  return (
    <section className="student-lounge" aria-label="Student Lounge banner">
      <div className="sl-browser-header">
        <div className="sl-traffic-lights" aria-hidden="true">
          <span className="sl-red" />
          <span className="sl-yellow" />
          <span className="sl-green" />
        </div>
        <div className="sl-url-bar">stu.yasar.edu.tr</div>
      </div>

      <div className="sl-page-content">
        <div className="sl-background-overlay" aria-hidden="true" />

        <div className="sl-header">
          <div className="sl-logo-group">
            <div className="sl-main-logo" aria-hidden="true">
              <YasarSeal className="sl-main-logo-svg" />
            </div>
            <div className="sl-university-name">YASAR<br />UNIVERSITY</div>
          </div>

          <div className="sl-platform-title-group">
            <div className="sl-platform-name">ARAMIZDA</div>
            <div className="sl-platform-subtitle">
              TOP SECRET STUDENT PLATFORM
              <span className="sl-lock" aria-hidden="true">🔒</span>
            </div>
          </div>

          <div className="sl-banned-group">
            <div className="sl-banned-stamp">BANNED</div>
            <div className="sl-banned-subtitle">TEACHERS</div>
          </div>
        </div>

        <nav className="sl-nav" aria-label="Student lounge quick navigation">
          <ul>
            <li><a href="#notes-list">TUM BOLUMLER NOTLARI</a></li>
            <li><a href="#notes-list">CIKMIS SORULAR</a></li>
            <li><a href="#notes-list">BOLUM SOHBET</a></li>
            <li><a href="#notes-list">DERS PROGRAMI</a></li>
            <li><a href="#notes-list">DUYURULAR</a></li>
          </ul>
        </nav>

        <div className="sl-main">
          <div className="sl-left-content" aria-hidden="true">
            <div className="sl-circuit-pattern" />
            <div className="sl-faint-logo sl-faint-logo-1">
              <YasarSeal className="sl-faint-logo-svg" />
            </div>
            <div className="sl-faint-logo sl-faint-logo-2">
              <YasarSeal className="sl-faint-logo-svg" />
            </div>
          </div>

          <div className="sl-right-content">
            <div className="sl-user-profile" aria-hidden="true">◉</div>

            <div className="sl-message-box">
              <p className="sl-message-text">Vize haftasi yaklasiyor, notlarini paylas!</p>
              <p className="sl-message-hashtags">#FinalMaratonu #PaylasKazandir</p>
            </div>

            <div className="sl-action-bar">
              <label className="sl-search-bar" htmlFor="hero-note-search">
                <span className="sl-search-icon" aria-hidden="true">⌕</span>
                <input
                  id="hero-note-search"
                  type="search"
                  placeholder="Not ara"
                  value={searchInput}
                  onChange={event => onSearchChange(event.target.value)}
                />
              </label>

              {isLoggedIn ? (
                <Link className="sl-note-share-btn" to="/notes/new">
                  NOT PAYLAS
                  <span aria-hidden="true">＋</span>
                </Link>
              ) : (
                <Link className="sl-note-share-btn" to="/login">
                  GIRIS YAP
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
