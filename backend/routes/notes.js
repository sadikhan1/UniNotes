import { Router } from 'express'
import supabase from '../services/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

async function syncTags(noteId, tagNames) {
  await supabase.from('note_tags').delete().eq('note_id', noteId)

  const names = (tagNames || []).map(t => t.trim().toLowerCase()).filter(Boolean)
  if (names.length === 0) return

  const { data: tags } = await supabase
    .from('tags')
    .upsert(names.map(name => ({ name })), { onConflict: 'name' })
    .select('id')

  if (!tags) return

  await supabase
    .from('note_tags')
    .insert(tags.map(tag => ({ note_id: noteId, tag_id: tag.id })))
}

function formatNote(note) {
  return {
    ...note,
    author: note.users?.username ?? null,
    tags: (note.note_tags || []).map(nt => nt.tags?.name).filter(Boolean),
    users: undefined,
    note_tags: undefined,
  }
}

// POST /api/notes
router.post('/', requireAuth, async (req, res) => {
  const { title, content, course, is_public, tags } = req.body

  if (!title?.trim()) return res.status(400).json({ error: 'Title is required' })

  const { data: note, error } = await supabase
    .from('notes')
    .insert({
      user_id: req.user.id,
      title: title.trim(),
      content: content || '',
      course: course || null,
      is_public: is_public ?? false,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  if (tags?.length > 0) await syncTags(note.id, tags)

  return res.status(201).json(note)
})

// PUT /api/notes/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const { title, content, course, is_public, tags } = req.body

  if (!title?.trim()) return res.status(400).json({ error: 'Title is required' })

  const { data: existing } = await supabase
    .from('notes')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existing) return res.status(404).json({ error: 'Note not found' })
  if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })

  const { data: note, error } = await supabase
    .from('notes')
    .update({
      title: title.trim(),
      content: content || '',
      course: course || null,
      is_public: is_public ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  await syncTags(note.id, tags || [])

  return res.status(200).json(note)
})

// DELETE /api/notes/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params

  const { data: existing } = await supabase
    .from('notes')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existing) return res.status(404).json({ error: 'Note not found' })
  if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })

  const { error } = await supabase.from('notes').delete().eq('id', id)

  if (error) return res.status(500).json({ error: error.message })

  return res.status(204).send()
})

// GET /api/notes
router.get('/', async (req, res) => {
  const { page = 1, limit = 12, search, course, tag, sort = 'latest' } = req.query
  const offset = (Number(page) - 1) * Number(limit)

  let query = supabase
    .from('notes')
    .select('*, users!fk_notes_user(username), note_tags(tags(name))', { count: 'exact' })
    .eq('is_public', true)

  if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  if (course) {
    const courseTrimmed = String(course).trim()
    const noSpaces = courseTrimmed.replace(/\s+/g, '')
    // ensure there's a space between letters and numbers for one variant (e.g. COMP4102 -> COMP 4102)
    const spaced = courseTrimmed.replace(/([A-Za-z]+)\s*(\d+)/, '$1 $2')

    // Try matching multiple variants: exact-ish, without spaces, and with standard spacing
    // Build an OR clause for case-insensitive partial matches
    const orClause = `course.ilike.%${courseTrimmed}%,course.ilike.%${noSpaces}%,course.ilike.%${spaced}%`
    query = query.or(orClause)
  }

  if (tag) {
    const { data: tagRow } = await supabase
      .from('tags')
      .select('id')
      .eq('name', tag.toLowerCase())
      .maybeSingle()

    if (!tagRow) {
      return res.status(200).json({ notes: [], total: 0, hasNextPage: false })
    }

    const { data: noteTags } = await supabase
      .from('note_tags')
      .select('note_id')
      .eq('tag_id', tagRow.id)

    const noteIds = (noteTags || []).map(nt => nt.note_id)
    if (noteIds.length === 0) {
      return res.status(200).json({ notes: [], total: 0, hasNextPage: false })
    }

    query = query.in('id', noteIds)
  }

  query = query
    .order('created_at', { ascending: sort !== 'latest' })
    .range(offset, offset + Number(limit) - 1)

  const { data: notes, count, error } = await query

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({
    notes: (notes || []).map(formatNote),
    total: count ?? 0,
    hasNextPage: offset + (notes?.length ?? 0) < (count ?? 0),
  })
})

// GET /api/notes/courses
router.get('/courses', async (_req, res) => {
  const { data, error } = await supabase
    .from('notes')
    .select('course')
    .eq('is_public', true)
    .not('course', 'is', null)

  if (error) return res.status(500).json({ error: error.message })

  const courses = [...new Set((data || []).map(n => n.course).filter(Boolean))].sort()
  return res.status(200).json(courses)
})

// GET /api/notes/:id  — must come after GET /
router.get('/:id', async (req, res) => {
  const { id } = req.params

  const { data: note, error } = await supabase
    .from('notes')
    .select('*, users!fk_notes_user(username), note_tags(tags(name)), files(id, file_url, file_name, file_type, file_size)')
    .eq('id', id)
    .single()

  if (error || !note) return res.status(404).json({ error: 'Note not found' })

  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null

  let userId = null

  if (!note.is_public) {
    if (!token) return res.status(403).json({ error: 'Private note' })
    const { data: userData } = await supabase.auth.getUser(token)
    if (!userData?.user || userData.user.id !== note.user_id) {
      return res.status(403).json({ error: 'Private note' })
    }
    userId = userData.user.id
  } else if (token) {
    const { data: userData } = await supabase.auth.getUser(token)
    if (userData?.user) userId = userData.user.id
  }

  const { count: likeCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('note_id', id)

  let liked = false
  let saved = false
  if (userId) {
    const [{ data: likeRow }, { data: saveRow }] = await Promise.all([
      supabase.from('likes').select('user_id').eq('user_id', userId).eq('note_id', id).maybeSingle(),
      supabase.from('saved_notes').select('user_id').eq('user_id', userId).eq('note_id', id).maybeSingle(),
    ])
    liked = !!likeRow
    saved = !!saveRow
  }

  return res.status(200).json({ ...formatNote(note), like_count: likeCount ?? 0, liked, saved })
})

export default router
