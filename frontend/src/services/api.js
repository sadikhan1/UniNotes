const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
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
