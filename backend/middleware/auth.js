import supabase from '../services/supabase.js'

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null

  if (!token) return res.status(401).json({ error: 'Authentication required' })

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired token' })

  req.user = data.user
  next()
}
