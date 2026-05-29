import { useState } from 'react'
import { api } from '../api'
import { getHardwareId } from '../sketchup'

export default function Login({ onLogin, apiUrl }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Enter email and password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const hardwareId = await getHardwareId()
      if (!hardwareId) {
        setError('Could not read device ID from SketchUp.')
        return
      }

      const res = await api.login(email.trim(), password, hardwareId)
      onLogin(res.token, res.user)
    } catch (err) {
      if (err.status === 403) {
        setError(
          err.message ||
            'This account is linked to another computer. Contact support to reset.',
        )
      } else if (err.status === 401) {
        setError('Invalid email or password.')
      } else {
        setError(err.message || 'Login failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.container}>
      <h1 style={s.title}>SketchLib</h1>
      <p style={s.subtitle}>Sign in to access your 3D library</p>
      <p style={s.apiHint}>API: {apiUrl}</p>

      <input
        style={s.input}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <input
        style={s.input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
        autoComplete="current-password"
      />

      {error && <p style={s.error}>{error}</p>}

      <button type="button" style={s.button} onClick={handleSubmit} disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </div>
  )
}

const s = {
  container: {
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxWidth: 360,
    margin: '48px auto 0',
  },
  title: { fontSize: 24, fontWeight: 600, margin: 0 },
  subtitle: { fontSize: 13, color: '#666', margin: '0 0 4px' },
  apiHint: { fontSize: 10, color: '#999', margin: '0 0 8px', wordBreak: 'break-all' },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
  },
  button: {
    padding: '11px 0',
    background: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    background: '#fef2f2',
    padding: '8px 12px',
    borderRadius: 6,
    margin: 0,
  },
}
