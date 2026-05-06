import { Router } from 'express'
import multer from 'multer'
import supabase from '../services/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const AVATAR_BUCKET = 'avatars'
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only image files are allowed (PNG, JPG, GIF, WebP)'))
  },
})

function handleAvatarUpload(req, res, next) {
  avatarUpload.single('avatar')(req, res, (err) => {
    if (!err) return next()
    return res.status(400).json({ error: err.message })
  })
}

const USER_COLS = '*'

async function noteCount(userId) {
  const { count } = await supabase
    .from('notes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_public', true)
  return count ?? 0
}

// GET /api/users/me — own full profile; resolves or creates row
router.get('/me', requireAuth, async (req, res) => {
  const userId = req.user.id
  const email  = req.user.email ?? ''

  // 1. Try by primary key
  let { data: user, error } = await supabase
    .from('users').select('*').eq('id', userId).maybeSingle()
  if (error) return res.status(500).json({ error: error.message })

  // 2. Fallback: find by email (handles legacy rows with a different id column)
  if (!user && email) {
    const { data: byEmail } = await supabase
      .from('users').select('*').eq('email', email).maybeSingle()
    if (byEmail) user = byEmail
  }

  // 3. Still not found → create a fresh row with a guaranteed-unique username
  if (!user) {
    let username =
      req.user.user_metadata?.username ||
      email.split('@')[0] ||
      `user_${userId.slice(0, 8)}`

    // If username is taken, append short UUID suffix
    const { data: taken } = await supabase
      .from('users').select('id').eq('username', username).maybeSingle()
    if (taken) username = `${username}_${userId.slice(0, 6)}`

    const { data: created, error: createErr } = await supabase
      .from('users')
      .insert({ id: userId, email, username })
      .select('*').single()

    if (createErr) return res.status(500).json({ error: createErr.message })
    user = created
  }

  return res.status(200).json({ ...user, note_count: await noteCount(userId) })
})

// PUT /api/users/me — update own profile fields
router.put('/me', requireAuth, async (req, res) => {
  const { username, first_name, last_name, department } = req.body
  const userId = req.user.id

  if (username !== undefined) {
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' })
    }
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.trim())
      .neq('id', userId)
      .maybeSingle()
    if (existing) return res.status(400).json({ error: 'Username is already taken.' })
  }

  const updates = {}
  if (username !== undefined)   updates.username   = username.trim()
  if (first_name !== undefined) updates.first_name = first_name.trim()
  if (last_name !== undefined)  updates.last_name  = last_name.trim()
  if (department !== undefined) updates.department = department.trim()

  const { data: updated, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select(USER_COLS)
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json(updated)
})

// PUT /api/users/me/password — change own password
router.put('/me/password', requireAuth, async (req, res) => {
  const { password } = req.body
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  const { error } = await supabase.auth.admin.updateUserById(req.user.id, { password })
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ message: 'Password updated' })
})

// POST /api/users/me/avatar — upload profile photo
router.post('/me/avatar', requireAuth, handleAvatarUpload, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  const { mimetype, buffer } = req.file
  const ext = mimetype.split('/')[1].replace('jpeg', 'jpg')
  const storagePath = `${req.user.id}/avatar.${ext}`

  const { data: storageData, error: storageErr } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(storagePath, buffer, { contentType: mimetype, upsert: true })

  if (storageErr) return res.status(500).json({ error: storageErr.message })

  const { data: urlData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(storageData.path)

  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`

  const { error: updateErr } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', req.user.id)

  if (updateErr) return res.status(500).json({ error: updateErr.message })

  return res.status(200).json({ avatar_url: avatarUrl })
})

// GET /api/users/:id — public profile
router.get('/:id', async (req, res) => {
  const { id } = req.params

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !user) return res.status(404).json({ error: 'User not found' })

  return res.status(200).json({ ...user, note_count: await noteCount(id) })
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
