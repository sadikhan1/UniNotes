const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
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

export async function getCourses() {
  return request('/notes/courses')
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

export async function getUser(id) {
  return request(`/users/${id}`)
}

export async function getUserNotes(id) {
  return request(`/users/${id}/notes`)
}

export async function updateUsername(username) {
  return request('/users/me', { method: 'PUT', body: JSON.stringify({ username }) })
}

export async function toggleLike(noteId) {
  return request(`/notes/${noteId}/like`, { method: 'POST' })
}

export async function toggleSave(noteId) {
  return request(`/notes/${noteId}/save`, { method: 'POST' })
}

export async function getComments(noteId) {
  return request(`/notes/${noteId}/comments`)
}

export async function addComment(noteId, content) {
  return request(`/notes/${noteId}/comments`, { method: 'POST', body: JSON.stringify({ content }) })
}

export async function deleteComment(commentId) {
  return request(`/comments/${commentId}`, { method: 'DELETE' })
}
export async function deleteFile(id) {
  return request(`/files/${id}`, { method: 'DELETE' })
}
export async function uploadFile(noteId, file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('note_id', noteId)

  const token = getToken()
  const res = await fetch(`${BASE_URL}/files`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })


  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.error ?? 'Upload failed')
    err.status = res.status
    throw err
  }
  return data

}