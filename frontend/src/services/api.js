const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { headers, ...options })

  if (res.status === 204) return null

  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.error ?? 'Something went wrong')
    err.status = res.status
    throw err
  }
  return data
}

export async function registerUser(email, username, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password }),
  })
}

export async function loginUser(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function getNotes(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/notes${query ? `?${query}` : ''}`)
}

export async function getNote(id) {
  return request(`/notes/${id}`)
}

export async function createNote(data) {
  return request('/notes', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateNote(id, data) {
  return request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteNote(id) {
  return request(`/notes/${id}`, { method: 'DELETE' })
}
