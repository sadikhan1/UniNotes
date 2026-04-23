import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import authRoutes from './routes/auth.js'

const app = express()
const PORT = process.env.PORT || 5010

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
