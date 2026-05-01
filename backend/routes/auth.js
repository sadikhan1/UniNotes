import { Router } from 'express'
import { body } from 'express-validator'
import supabase from '../services/supabase.js'
import { validate } from '../middleware/validate.js'

const router = Router()


const registerRules = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
]

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
]

// POST /api/auth/register
router.post('/register', validate(registerRules), async (req, res) => {
  const { email, username, password } = req.body

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { username: username.trim() } },
  })

  if (error) return res.status(400).json({ error: error.message })

  const { error: profileError } = await supabase
    .from('users')
    .insert({ id: data.user.id, email: email.trim(), username: username.trim() })

  if (profileError) return res.status(500).json({ error: 'Registration failed. Please try again.' })

  return res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' })
})

// POST /api/auth/login
router.post('/login', validate(loginRules), async (req, res) => {
  const { email, password } = req.body

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return res.status(403).json({ error: 'Please verify your email first' })
    }
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  return res.status(200).json({
    access_token: data.session.access_token,
    user: data.user,
  })
})

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null

  if (token) {
    await supabase.auth.admin.signOut(token)
  }

  return res.status(200).json({ message: 'Logged out' })
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null

  if (!token) return res.status(401).json({ error: 'No token provided' })

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired token' })

  return res.status(200).json({ user: data.user })
})

export default router
