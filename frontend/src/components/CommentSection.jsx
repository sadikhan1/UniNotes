import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getComments, addComment, deleteComment } from '../services/api'
import { useLocale } from '../context/LocaleContext'
import ConfirmationModal from './ConfirmationModal'

function CommentSection({ noteId, currentUser, noteOwnerId }) {
  const { t } = useLocale()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmingCommentId, setConfirmingCommentId] = useState(null)

  useEffect(() => {
    getComments(noteId)
      .then(setComments)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [noteId])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const comment = await addComment(noteId, text.trim())
      setComments(prev => [comment, ...prev])
      setText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirmDelete() {
    if (!confirmingCommentId) return
    try {
      await deleteComment(confirmingCommentId)
      setComments(prev => prev.filter(c => c.id !== confirmingCommentId))
    } catch (err) {
      setError(err.message)
    } finally {
      setConfirmingCommentId(null)
    }
  }

  return (
    <div className="mt-6 border-t border-cyan-900/30 pt-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">
        {t('comments')} {!loading && <span className="font-normal text-slate-600">({comments.length})</span>}
      </h3>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t('addComment')}
            rows={3}
            className="w-full bg-[#0b1117] border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600
              focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-600 resize-none transition"
          />
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="px-4 py-1.5 text-sm bg-cyan-400 text-[#0b1117] rounded-lg hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {submitting ? t('posting') : t('postComment')}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-lg bg-cyan-900/10 border border-cyan-900/40 px-4 py-3 text-sm text-slate-500">
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">{t('login')}</Link>
          {' '}{t('toComment')}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-600 text-center py-4">{t('noComments')}</p>
      ) : (
        <ul className="space-y-4">
          {comments.map(comment => (
            <li key={comment.id} className="flex gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-300">{comment.user?.username ?? t('unknownUser')}</span>
                    <span>·</span>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  {(currentUser?.id === comment.user?.id || currentUser?.id === noteOwnerId) && (
                    <button
                      onClick={() => setConfirmingCommentId(comment.id)}
                      className="text-xs text-red-500 hover:text-red-400 shrink-0 transition"
                    >
                      {t('deleteComment')}
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-1 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmationModal
        open={!!confirmingCommentId}
        message={t('confirmDeleteComment')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmingCommentId(null)}
        confirmLabel={t('yes')}
        cancelLabel={t('no')}
      />
    </div>
  )
}

export default CommentSection
