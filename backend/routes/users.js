import { Router } from 'express'
import supabase from '../services/supabase.js'

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

  const { count: noteCount } = await supabase
    .from('notes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', id)
    .eq('is_public', true)

  return res.status(200).json({ ...user, note_count: noteCount ?? 0 })
})

// GET /api/users/:id/notes
router.get('/:id/notes', async (req, res) => {
  const { id } = req.params

  const { data: notes, error } = await supabase
    .from('notes')
    .select('*, users!fk_notes_user(username), note_tags(tags(name))')
    .eq('user_id', id)
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

export default router
