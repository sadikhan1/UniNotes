import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getNote, deleteNote, toggleLike, toggleSave } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'
import FileUploader from '../components/FileUploader'
import FilePreview from '../components/FilePreview'
import CommentSection from '../components/CommentSection'
import ConfirmationModal from '../components/ConfirmationModal'

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
  const { t, locale } = useLocale()

  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [saved, setSaved] = useState(false)
  const [showDeleteNoteConfirm, setShowDeleteNoteConfirm] = useState(false)

  useEffect(() => {
    document.title = t('loading')
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
    return () => { document.title = t('appTitle') }
  }, [id, t])

  const handleDelete = () => setShowDeleteNoteConfirm(true)

  const handleConfirmDeleteNote = async () => {
    setShowDeleteNoteConfirm(false)
    try {
      await deleteNote(id)
      navigate('/', { state: { toast: t('noteDeleted') } })
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-base)]">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !note) {
    return <div className="text-center py-20 text-slate-500">{error || t('noteNotFound')}</div>
  }

  const isOwner = user?.id === note.user_id

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {note.course && (
        <div className="mb-4">
          <Link
            to={`/courses/${encodeURIComponent(note.course)}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-cyan-400 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            {note.course}
          </Link>
        </div>
      )}

      <div className="bg-[var(--color-surface)] rounded-xl border border-cyan-900/40 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-slate-100">{note.title}</h1>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Like button */}
            <div className="relative group">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition ${
                  liked
                    ? 'border-red-700/60 text-red-400 bg-red-950/40 hover:bg-red-950/60'
                    : 'border-cyan-900/50 text-slate-400 hover:bg-cyan-900/20 hover:text-slate-300'
                } ${!user ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <HeartIcon filled={liked} />
                <span>{likeCount}</span>
              </button>
              {!user && (
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-[var(--color-surface)] border border-cyan-900/40 px-2 py-1 text-xs text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                  {t('loginToLike')}
                </span>
              )}
            </div>

            {/* Save button */}
            <div className="relative group">
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition ${
                  saved
                    ? 'border-cyan-600/60 text-cyan-400 bg-cyan-900/30 hover:bg-cyan-900/50'
                    : 'border-cyan-900/50 text-slate-400 hover:bg-cyan-900/20 hover:text-slate-300'
                } ${!user ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <BookmarkIcon filled={saved} />
              </button>
              {!user && (
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-[var(--color-surface)] border border-cyan-900/40 px-2 py-1 text-xs text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                  {t('loginToSave')}
                </span>
              )}
            </div>

            {isOwner && (
              <>
                <Link
                  to={`/notes/${id}/edit`}
                  className="px-3 py-1.5 text-sm border border-cyan-900/50 rounded-lg text-slate-300 hover:bg-cyan-900/20 transition"
                >
                  {t('edit')}
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm border border-red-800/50 text-red-400 rounded-lg hover:bg-red-950/40 transition"
                >
                  {t('delete')}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-6">
          {note.author && (
            <Link to={`/profile/${note.user_id}`} className="text-cyan-400 hover:text-cyan-300 font-medium">
              {note.author}
            </Link>
          )}
          {note.course && (
            <Link
              to={`/courses/${encodeURIComponent(note.course)}`}
              className="bg-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded text-xs font-medium hover:bg-cyan-900/50 transition"
            >
              {note.course}
            </Link>
          )}
          <span>{new Date(note.created_at).toLocaleDateString(locale)}</span>
        </div>

        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {note.tags.map(tag => (
              <span key={tag} className="text-xs bg-[var(--color-base)] border border-cyan-900/40 text-slate-400 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
          {note.content || <span className="text-slate-600 italic">{t('noContent')}</span>}
        </div>

        {isOwner
          ? <FileUploader noteId={note.id} initialFiles={note.files ?? []} />
          : <FilePreview files={note.files ?? []} />
        }

        <CommentSection noteId={note.id} currentUser={user} noteOwnerId={note.user_id} />
      </div>

      <ConfirmationModal
        open={showDeleteNoteConfirm}
        message={t('confirmDelete')}
        onConfirm={handleConfirmDeleteNote}
        onCancel={() => setShowDeleteNoteConfirm(false)}
        confirmLabel={t('yes')}
        cancelLabel={t('no')}
      />
    </div>
  )
}

export default NoteDetailPage
