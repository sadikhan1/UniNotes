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

  function requestDeleteComment(commentId) {
    setConfirmingCommentId(commentId)
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

  function handleCancelDelete() {
    setConfirmingCommentId(null)
  }

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        {t('comments')} {!loading && <span className="font-normal text-gray-400">({comments.length})</span>}
      </h3>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t('addComment')}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? t('posting') : t('postComment')}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-500">
          <Link to="/login" className="text-blue-600 hover:underline font-medium">{t('login')}</Link>
          {' '}{t('toComment')}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">{t('noComments')}</p>
      ) : (
        <ul className="space-y-4">
          {comments.map(comment => (
            <li key={comment.id} className="flex gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{comment.user?.username ?? t('unknownUser')}</span>
                    <span>·</span>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  {(currentUser?.id === comment.user?.id || currentUser?.id === noteOwnerId) && (
                    <button
                      onClick={() => requestDeleteComment(comment.id)}
                      className="text-xs text-red-400 hover:text-red-600 shrink-0 transition"
                    >
                      {t('deleteComment')}
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmationModal
        open={!!confirmingCommentId}
        message={t('confirmDeleteComment')}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmLabel={t('yes')}
        cancelLabel={t('no')}
      />
    </div>
  )
}

export default CommentSection
