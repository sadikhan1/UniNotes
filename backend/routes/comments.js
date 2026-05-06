import { Router } from 'express'
import supabase from '../services/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = { notes: Router(), comments: Router() }

// POST /api/notes/:id/comments
router.notes.post('/:id/comments', requireAuth, async (req, res) => {
  const { content } = req.body
  if (!content?.trim()) return res.status(400).json({ error: 'Content is required' })

  const { data, error } = await supabase
    .from('comments')
    .insert({ note_id: req.params.id, user_id: req.user.id, content: content.trim() })
    .select('id, content, created_at, users!fk_comments_user(username)')
    .single()

  if (error) return res.status(500).json({ error: error.message })

  return res.status(201).json({
    id: data.id,
    content: data.content,
    created_at: data.created_at,
    user: { username: data.users?.username },
  })
})

// GET /api/notes/:id/comments
router.notes.get('/:id/comments', async (req, res) => {
  const { data, error } = await supabase
    .from('comments')
    .select('id, content, created_at, users!fk_comments_user(username)')
    .eq('note_id', req.params.id)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json(
    (data || []).map(c => ({ id: c.id, content: c.content, created_at: c.created_at, user: { username: c.users?.username } }))
  )
})

// DELETE /api/comments/:id
router.comments.delete('/:id', requireAuth, async (req, res) => {
  const { data: comment } = await supabase
    .from('comments')
    .select('user_id, note_id')
    .eq('id', req.params.id)
    .single()

  if (!comment) return res.status(404).json({ error: 'Comment not found' })

  const isCommentAuthor = comment.user_id === req.user.id
  if (!isCommentAuthor) {
    const { data: note } = await supabase.from('notes').select('user_id').eq('id', comment.note_id).single()
    if (!note || note.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
  }

  await supabase.from('comments').delete().eq('id', req.params.id)
  return res.status(204).send()
})

export default router
