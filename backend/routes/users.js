import { Router } from 'express'
import { body } from 'express-validator'
import supabase from '../services/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params

  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, created_at')
    .eq('id', id)
    .single()

  if (error || !user) return res.status(404).json({ error: 'User not found' })

  const { count } = await supabase
    .from('notes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', id)
    .eq('is_public', true)

  return res.status(200).json({ ...user, note_count: count ?? 0 })
})

// GET /api/users/:id/notes
router.get('/:id/notes', async (req, res) => {
  const { data: notes, error } = await supabase
    .from('notes')
    .select('*, users!fk_notes_user(username), note_tags(tags(name))')
    .eq('user_id', req.params.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json(
    (notes || []).map(note => ({
      ...note,
      author: note.users?.username ?? null,
      tags: (note.note_tags || []).map(nt => nt.tags?.name).filter(Boolean),
      users: undefined,
      note_tags: undefined,
    }))
  )
})

// PUT /api/users/me  — update own username
router.put('/me', requireAuth, async (req, res) => {
  const { username } = req.body
  if (!username?.trim() || username.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' })
  }

  const { data, error } = await supabase
    .from('users')
    .update({ username: username.trim() })
    .eq('id', req.user.id)
    .select('id, username, created_at')
    .single()

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json(data)
})

export default router
