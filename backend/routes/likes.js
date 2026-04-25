import { Router } from 'express'
import supabase from '../services/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const notesRouter = Router()
const usersRouter = Router()

// POST /api/notes/:id/like  (toggle)
notesRouter.post('/:id/like', requireAuth, async (req, res) => {
  const noteId = req.params.id
  const userId = req.user.id

  const { data: existing } = await supabase
    .from('likes')
    .select('user_id')
    .eq('user_id', userId)
    .eq('note_id', noteId)
    .single()

  if (existing) {
    await supabase.from('likes').delete().eq('user_id', userId).eq('note_id', noteId)
  } else {
    await supabase.from('likes').insert({ user_id: userId, note_id: noteId })
  }

  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('note_id', noteId)

  return res.status(200).json({ liked: !existing, like_count: count ?? 0 })
})

// POST /api/notes/:id/save  (toggle)
notesRouter.post('/:id/save', requireAuth, async (req, res) => {
  const noteId = req.params.id
  const userId = req.user.id

  const { data: existing } = await supabase
    .from('saved_notes')
    .select('user_id')
    .eq('user_id', userId)
    .eq('note_id', noteId)
    .single()

  if (existing) {
    await supabase.from('saved_notes').delete().eq('user_id', userId).eq('note_id', noteId)
  } else {
    await supabase.from('saved_notes').insert({ user_id: userId, note_id: noteId })
  }

  return res.status(200).json({ saved: !existing })
})

// GET /api/users/me/saved
usersRouter.get('/me/saved', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('saved_notes')
    .select('notes(*, users!fk_notes_user(username), note_tags(tags(name)))')
    .eq('user_id', req.user.id)

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json(
    (data || []).map(row => {
      const note = row.notes
      return {
        ...note,
        author: note.users?.username ?? null,
        tags: (note.note_tags || []).map(nt => nt.tags?.name).filter(Boolean),
        users: undefined,
        note_tags: undefined,
      }
    })
  )
})

export { notesRouter, usersRouter }
