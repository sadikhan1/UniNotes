import { useEffect } from 'react'
import './Splash.css'

export default function Splash() {
  useEffect(() => {
    // parent controls mount/unmount timing
  }, [])

  return (
    <div className="splash-root">
      <div className="splash-card">
        <div className="splash-title">UniNotes</div>
        <div className="splash-sub">Notes. Share. Learn.</div>
      </div>
    </div>
  )
}
