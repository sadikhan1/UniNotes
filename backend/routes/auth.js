import { Router } from 'express'
import supabase from '../services/supabase.js'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, username, password } = req.body

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Email, username, and password are required' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  return res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return res.status(403).json({ error: 'Please verify your email first' })
    }
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  return res.status(200).json({
    access_token: data.session.access_token,
    user: data.user
  })
})

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  return res.status(200).json({ message: 'Logged out' })
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  return res.status(200).json({ user: data.user })
})

export default router
