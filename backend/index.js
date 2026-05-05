import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'

import authRoutes from './routes/auth.js'
import notesRoutes from './routes/notes.js'
import usersRoutes from './routes/users.js'
import commentRouters from './routes/comments.js'
import { notesRouter as likesNotesRouter, usersRouter as likesUsersRouter } from './routes/likes.js'
import filesRouter from './routes/files.js'

const app = express()
const PORT = process.env.PORT || 5010

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.FRONTEND_URL || '')
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean)
  : ['http://localhost:5173']

const corsOptions = {
  origin: (origin, callback) => {
    // Allow same-origin/server-to-server requests without an Origin header.
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}

const globalLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
})

const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
})

app.use(cors(corsOptions))
// app.use(globalLimit)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true })
})

// Routes
app.use('/api/auth', /* authLimit, */ authRoutes)

app.use('/api/notes', notesRoutes)
app.use('/api/users', usersRoutes)

// Comments
app.use('/api/notes', commentRouters.notes)
app.use('/api/comments', commentRouters.comments)

// Likes
app.use('/api/notes', likesNotesRouter)
app.use('/api/users', likesUsersRouter)

// Files
app.use('/api/files', filesRouter)

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})