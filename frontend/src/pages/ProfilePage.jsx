import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUser, getUserNotes, updateUsername, getSavedNotes } from '../services/api'
import { useAuth } from '../context/AuthContext'

function NoteCard({ note }) {
  return (
    <Link
      to={`/notes/${note.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
    >
      <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
      {note.course && <p className="text-xs text-blue-600 mt-1 font-medium">{note.course}</p>}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-2">{new Date(note.created_at).toLocaleDateString()}</p>
    </Link>
  )
}

function ProfilePage() {
  const { id } = useParams()
  const { user: authUser } = useAuth()
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return <div className="text-center py-20 text-gray-500">User not found.</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            {editingUsername ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button onClick={handleUsernameUpdate} className="text-sm text-blue-600 font-medium hover:text-blue-700">Save</button>
                <button onClick={() => setEditingUsername(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                {isOwnProfile && (
                  <button
                    onClick={() => { setNewUsername(profile.username); setEditingUsername(true) }}
                    className="text-xs text-gray-400 hover:text-blue-600 transition"
                  >
                    Edit username
                  </button>
                )}
              </div>
            )}
            {usernameError && <p className="text-sm text-red-600 mt-1">{usernameError}</p>}
            <p className="text-sm text-gray-500 mt-1">
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{profile.note_count}</p>
            <p className="text-xs text-gray-500">public notes</p>
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => handleTabChange('public')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              activeTab === 'public'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Public Notes
          </button>
          <button
            onClick={() => handleTabChange('saved')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              activeTab === 'saved'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Saved Notes
          </button>
        </div>
      )}

      {!isOwnProfile && (
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Public Notes</h2>
      )}

      {activeTab === 'public' && (
        notes.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No public notes yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map(note => <NoteCard key={note.id} note={note} />)}
          </div>
        )
      )}

      {activeTab === 'saved' && (
        loadingSaved ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : savedNotes.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No saved notes yet.</p>
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
