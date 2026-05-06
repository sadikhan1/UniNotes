import { Router } from 'express'
import multer from 'multer'
import supabase from '../services/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
const BUCKET = 'note-files'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      const err = new Error('Unsupported file type. Allowed: PDF, PNG, JPG, JPEG.')
      err.code = 'UNSUPPORTED_TYPE'
      cb(err)
    }
  },
})

function handleUpload(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (!err) return next()
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Max 10 MB.' })
    }
    if (err.code === 'UNSUPPORTED_TYPE') {
      return res.status(415).json({ error: err.message })
    }
    return res.status(400).json({ error: err.message })
  })
}

// POST /api/files
router.post('/', requireAuth, handleUpload, async (req, res) => {
  const { note_id } = req.body

  if (!note_id) return res.status(400).json({ error: 'note_id is required' })
  if (!req.file) return res.status(400).json({ error: 'file is required' })

  const { data: note } = await supabase
    .from('notes')
    .select('user_id')
    .eq('id', note_id)
    .maybeSingle()

  if (!note) return res.status(404).json({ error: 'Note not found' })
  if (note.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })

  const { originalname, mimetype, buffer, size } = req.file
  const safeName = originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${req.user.id}/${note_id}/${Date.now()}-${safeName}`

  const { data: storageData, error: storageError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: mimetype })

  if (storageError) return res.status(500).json({ error: storageError.message })

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storageData.path)

  const { data: file, error: dbError } = await supabase
    .from('files')
    .insert({
      note_id,
      file_url: urlData.publicUrl,
      file_name: originalname,
      file_type: mimetype,
      file_size: size,
    })
    .select('id, file_url, file_name, file_type, file_size')
    .single()

  if (dbError) {
    await supabase.storage.from(BUCKET).remove([storagePath])
    const isPermissionError = dbError.message.includes('row-level security policy')
    const message = isPermissionError
      ? 'You do not have permission to upload this file.'
      : dbError.message
    return res.status(isPermissionError ? 403 : 500).json({ error: message })
  }

  return res.status(201).json(file)
})

// DELETE /api/files/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { data: file } = await supabase
    .from('files')
    .select('id, file_url, note_id, notes!fk_files_note(user_id)')
    .eq('id', req.params.id)
    .maybeSingle()

  if (!file) return res.status(404).json({ error: 'File not found' })
  if (file.notes.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })

  const publicPrefix = `/storage/v1/object/public/${BUCKET}/`
  const urlPath = new URL(file.file_url).pathname
  const storagePath = urlPath.includes(publicPrefix)
    ? urlPath.split(publicPrefix)[1]
    : null

  if (storagePath) {
    await supabase.storage.from(BUCKET).remove([storagePath])
  }

  await supabase.from('files').delete().eq('id', req.params.id)

  return res.status(204).send()
})

export default router
