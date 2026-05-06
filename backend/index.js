import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'

import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'

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

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})