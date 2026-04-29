import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'

import authRoutes from './routes/auth.js'
import notesRoutes from './routes/notes.js'
import usersRoutes from './routes/users.js'
import commentRouters from './routes/comments.js'
import { notesRouter as likesNotesRouter, usersRouter as likesUsersRouter } from './routes/likes.js'

const app = express()
const PORT = process.env.PORT || 5010

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
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
app.use(globalLimit)
app.use(express.json())

// Routes
app.use('/api/auth', authLimit, authRoutes)

app.use('/api/notes', notesRoutes)
app.use('/api/users', usersRoutes)

// Comments
app.use('/api/notes', commentRouters.notes)
app.use('/api/comments', commentRouters.comments)

// Likes
app.use('/api/notes', likesNotesRouter)
app.use('/api/users', likesUsersRouter)

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})