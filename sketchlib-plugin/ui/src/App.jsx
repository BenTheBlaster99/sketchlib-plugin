import { useState, useEffect, useCallback } from 'react'
import Login from './components/Login'
import Library from './components/Library'
import { api, setToken, getApiUrl } from './api'
import { getSavedToken, saveToken, clearToken, waitForSketchup } from './sketchup'

export default function App() {
  const [token, setTokenState] = useState(null)
  const [user, setUser] = useState(null)
  const [packCategoryIds, setPackCategoryIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [bridgeError, setBridgeError] = useState('')

  const applySession = (session) => {
    setUser(session.user)
    setPackCategoryIds(session.pack_category_ids || [])
  }

  const handleLogout = useCallback(() => {
    api.logout().catch(() => {})
    setToken(null)
    setTokenState(null)
    setUser(null)
    setPackCategoryIds([])
    clearToken()
  }, [])

  useEffect(() => {
    window.dispatchInsertEvent = (phase, extra = {}) => {
      window.dispatchEvent(
        new CustomEvent('sketchlib-insert', { detail: { phase, ...extra } }),
      )
    }
    window.onPlacementMode = () => window.dispatchInsertEvent('placing')
    window.onModelInserted = (modelName) =>
      window.dispatchInsertEvent('inserted', { modelName })
    window.onInsertCancelled = () => window.dispatchInsertEvent('cancelled')
    window.onInsertError = (msg) => window.dispatchInsertEvent('error', { message: msg })
  }, [])

  useEffect(() => {
    let cancelled = false

    waitForSketchup().then((ready) => {
      if (cancelled) return
      if (!ready) {
        setBridgeError('SketchUp bridge not ready. Close the panel and open Extensions → SketchLib again.')
        setLoading(false)
        return
      }

      return getSavedToken()
        .then((savedToken) => {
          if (!savedToken) {
            setLoading(false)
            return
          }
          setToken(savedToken)
          setTokenState(savedToken)
          return api.me().then((res) => {
            if (!cancelled) applySession(res)
          })
        })
        .catch(() => handleLogout())
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    })

    return () => {
      cancelled = true
    }
  }, [handleLogout])

  const handleLogin = async (newToken, userData) => {
    setToken(newToken)
    setTokenState(newToken)
    setUser(userData)
    saveToken(newToken)
    try {
      const res = await api.me()
      applySession(res)
    } catch {
      setPackCategoryIds([])
    }
  }

  if (loading) {
    return (
      <div style={center}>
        <p style={{ color: '#888' }}>Loading…</p>
      </div>
    )
  }

  if (bridgeError) {
    return (
      <div style={{ ...center, padding: 24, textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>{bridgeError}</p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', height: '100vh', overflow: 'hidden' }}>
      {token && user ? (
        <Library user={user} packCategoryIds={packCategoryIds} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} apiUrl={getApiUrl()} />
      )}
    </div>
  )
}

const center = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
}
