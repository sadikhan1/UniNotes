import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getNote, deleteNote } from '../services/api'
import { useAuth } from '../context/AuthContext'

function NoteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Loading...'
    getNote(id)
      .then(n => { setNote(n); document.title = n.title })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
    return () => { document.title = 'UniNotes' }
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this note? This cannot be undone.')) return
    try {
      await deleteNote(id)
      navigate('/')
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !note) {
    return <div className="text-center py-20 text-gray-500">{error || 'Note not found.'}</div>
  }

  const isOwner = user?.id === note.user_id

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{note.title}</h1>
          {isOwner && (
            <div className="flex gap-2 shrink-0">
              <Link
                to={`/notes/${id}/edit`}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6">
          {note.author && (
            <Link to={`/profile/${note.user_id}`} className="text-blue-600 hover:underline font-medium">
              {note.author}
            </Link>
          )}
          {note.course && (
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
              {note.course}
            </span>
          )}
          <span>{new Date(note.created_at).toLocaleDateString()}</span>
        </div>

        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {note.tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {note.content || <span className="text-gray-400 italic">No content.</span>}
        </div>
      </div>
    </div>
  )
}

export default NoteDetailPage
