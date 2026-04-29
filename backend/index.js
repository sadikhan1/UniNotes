import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import notesRoutes from './routes/notes.js'

const app = express()
const PORT = process.env.PORT || 5010

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/notes', notesRoutes)
app.use('/api/users', usersRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
