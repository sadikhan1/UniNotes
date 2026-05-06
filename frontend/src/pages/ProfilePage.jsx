import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUser, getUserNotes, updateUsername, getSavedNotes } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'

function NoteCard({ note }) {
  return (
    <Link
      to={`/notes/${note.id}`}
      className="block bg-[#0b1117] rounded-xl border border-cyan-900/40 p-4 hover:border-cyan-700/60 hover:bg-cyan-900/10 transition"
    >
      <h3 className="font-semibold text-slate-100 truncate">{note.title}</h3>
      {note.course && <p className="text-xs text-cyan-400 mt-1 font-medium">{note.course}</p>}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.map(tag => (
            <span key={tag} className="text-xs bg-[#10141a] border border-cyan-900/30 text-slate-500 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-600 mt-2">{new Date(note.created_at).toLocaleDateString()}</p>
    </Link>
  )
}

function ProfilePage() {
  const { id } = useParams()
  const { user: authUser } = useAuth()
  const { t } = useLocale()
  const isOwnProfile = authUser?.id === id

  const [profile, setProfile] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')

  const [activeTab, setActiveTab] = useState('public')
  const [savedNotes, setSavedNotes] = useState([])
  const [loadingSaved, setLoadingSaved] = useState(false)
  const [savedLoaded, setSavedLoaded] = useState(false)

  useEffect(() => {
    Promise.all([getUser(id), getUserNotes(id)])
      .then(([p, n]) => { setProfile(p); setNotes(n) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleTabChange = async (tab) => {
    setActiveTab(tab)
    if (tab === 'saved' && !savedLoaded) {
      setLoadingSaved(true)
      try {
        const data = await getSavedNotes()
        setSavedNotes(data)
        setSavedLoaded(true)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingSaved(false)
      }
    }
  }

  const handleUsernameUpdate = async () => {
    setUsernameError('')
    try {
      const updated = await updateUsername(newUsername)
      setProfile(p => ({ ...p, username: updated.username }))
      setEditingUsername(false)
    } catch (err) {
      setUsernameError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1117]">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return <div className="text-center py-20 text-slate-500">{t('userNotFound')}</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-[#10141a] rounded-xl border border-cyan-900/40 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            {editingUsername ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  className="px-3 py-1.5 bg-[#0b1117] border border-cyan-900/50 rounded-lg text-lg font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  autoFocus
                />
                <button onClick={handleUsernameUpdate} className="text-sm text-cyan-400 font-medium hover:text-cyan-300">{t('saveNote')}</button>
                <button onClick={() => setEditingUsername(false)} className="text-sm text-slate-500 hover:text-slate-300">{t('cancel')}</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-100">{profile.username}</h1>
                {isOwnProfile && (
                  <button
                    onClick={() => { setNewUsername(profile.username); setEditingUsername(true) }}
                    className="text-xs text-slate-600 hover:text-cyan-400 transition"
                  >
                    {t('editUsername')}
                  </button>
                )}
              </div>
            )}
            {usernameError && <p className="text-xs text-red-400 mt-1">{usernameError}</p>}
            <p className="text-sm text-slate-500 mt-1">
              {t('joined')} {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-400">{profile.note_count}</p>
            <p className="text-xs text-slate-500">{t('publicNotes')}</p>
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <div className="flex gap-1 mb-6 border-b border-cyan-900/40">
          <button
            onClick={() => handleTabChange('public')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              activeTab === 'public'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Public Notes
          </button>
          <button
            onClick={() => handleTabChange('saved')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              activeTab === 'saved'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Saved Notes
          </button>
        </div>
      )}

      {!isOwnProfile && (
        <h2 className="text-lg font-semibold text-slate-200 mb-4">{t('publicNotes')}</h2>
      )}

      {activeTab === 'public' && (
        notes.length === 0 ? (
          <p className="text-slate-500 text-center py-12">{t('noPublicNotes')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map(note => <NoteCard key={note.id} note={note} />)}
          </div>
        )
      )}

      {activeTab === 'saved' && (
        loadingSaved ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : savedNotes.length === 0 ? (
          <p className="text-slate-500 text-center py-12">{t('noSavedNotes')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedNotes.map(note => <NoteCard key={note.id} note={note} />)}
          </div>
        )
      )}
    </div>
  )
}

export default ProfilePage
