import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getNote, deleteNote, toggleLike, toggleSave } from '../services/api'
import { useAuth } from '../context/AuthContext'
import FileUploader from '../components/FileUploader'
import FilePreview from '../components/FilePreview'
import CommentSection from '../components/CommentSection'

function HeartIcon({ filled }) {
  return filled ? (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

function BookmarkIcon({ filled }) {
  return filled ? (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  )
}

function NoteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    document.title = 'Loading...'
    getNote(id)
      .then(n => {
        setNote(n)
        document.title = n.title
        setLiked(n.liked ?? false)
        setLikeCount(n.like_count ?? 0)
        setSaved(n.saved ?? false)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
    return () => { document.title = 'UniNotes' }
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this note? This cannot be undone.')) return
    try {
      await deleteNote(id)
      navigate('/', { state: { toast: 'Note deleted.' } })
    } catch (err) {
      alert(err.message)
    }
  }

  const handleLike = async () => {
    if (!user) return
    const prevLiked = liked
    const prevCount = likeCount
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
    try {
      const result = await toggleLike(id)
      setLiked(result.liked)
      setLikeCount(result.like_count)
    } catch {
      setLiked(prevLiked)
      setLikeCount(prevCount)
    }
  }

  const handleSave = async () => {
    if (!user) return
    const prevSaved = saved
    setSaved(!saved)
    try {
      const result = await toggleSave(id)
      setSaved(result.saved)
    } catch {
      setSaved(prevSaved)
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
          <div className="flex items-center gap-2 shrink-0">
            {/* Like button */}
            <div className="relative group">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition ${
                  liked
                    ? 'border-red-300 text-red-500 bg-red-50 hover:bg-red-100'
                    : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                } ${!user ? 'cursor-default' : 'cursor-pointer'}`}
                aria-label="Like note"
              >
                <HeartIcon filled={liked} />
                <span>{likeCount}</span>
              </button>
              {!user && (
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 z-10">
                  Log in to like
                </span>
              )}
            </div>

            {/* Save button */}
            <div className="relative group">
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition ${
                  saved
                    ? 'border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                } ${!user ? 'cursor-default' : 'cursor-pointer'}`}
                aria-label="Save note"
              >
                <BookmarkIcon filled={saved} />
              </button>
              {!user && (
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 z-10">
                  Log in to save
                </span>
              )}
            </div>

            {isOwner && (
              <>
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
              </>
            )}
          </div>
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

        {isOwner
          ? <FileUploader noteId={note.id} initialFiles={note.files ?? []} />
          : <FilePreview files={note.files ?? []} />
        }

        <CommentSection noteId={note.id} currentUser={user} />
      </div>
    </div>
  )
}

export default NoteDetailPage
