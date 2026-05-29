const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000/api'

let authToken = null

export function getApiUrl() {
  return API_URL
}

export function setToken(token) {
  authToken = token || null
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' }
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    })
  } catch {
    throw {
      status: 0,
      message: `Cannot reach API at ${API_URL}. Is Laravel running? Same Wi‑Fi? Built with correct VITE_API_URL?`,
    }
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw {
      status: res.status,
      message: data.message || 'Request failed',
    }
  }

  return data
}

export const api = {
  login: (email, password, hardware_id) =>
    request('POST', '/auth/login', { email, password, hardware_id }),

  me: () => request('GET', '/auth/me'),

  logout: () => request('POST', '/auth/logout'),
}
