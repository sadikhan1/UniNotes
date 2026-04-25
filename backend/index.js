import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import authRoutes from './routes/auth.js'
import commentRouters from './routes/comments.js'
import { notesRouter as likesNotesRouter, usersRouter as likesUsersRouter } from './routes/likes.js'

const app = express()
const PORT = process.env.PORT || 5010

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/notes', commentRouters.notes)
app.use('/api/comments', commentRouters.comments)
app.use('/api/notes', likesNotesRouter)
app.use('/api/users', likesUsersRouter)

app.use((err, req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
