import { Link } from 'react-router-dom'
import './StudentLoungeHero.css'

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
            <div className="sl-main-logo" aria-hidden="true">YU</div>
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
            <div className="sl-faint-logo sl-faint-logo-1">YU</div>
            <div className="sl-faint-logo sl-faint-logo-2">YU</div>
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
