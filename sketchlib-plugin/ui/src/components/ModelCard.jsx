import { useState, useEffect } from 'react'
import { api } from '../api'
import { hasSketchupBridge } from '../sketchup'

export default function ModelCard({ model }) {
  const [insertState, setInsertState] = useState('idle')
  const [favorited, setFavorited] = useState(model.is_favorited ?? false)
  const [likes, setLikes] = useState(model.likes_count ?? 0)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    setFavorited(model.is_favorited ?? false)
    setLikes(model.likes_count ?? 0)
  }, [model.id, model.is_favorited, model.likes_count])

  useEffect(() => {
    const onInsert = (e) => {
      if (window.__sketchlibActiveModelId !== model.id) return
      const { phase } = e.detail || {}
      if (phase === 'placing') setInsertState('placing')
      if (phase === 'inserted') {
        setInsertState('inserted')
        window.__sketchlibActiveModelId = null
        setTimeout(() => setInsertState('idle'), 2000)
      }
      if (phase === 'cancelled') {
        window.__sketchlibActiveModelId = null
        setInsertState('idle')
      }
      if (phase === 'error') {
        window.__sketchlibActiveModelId = null
        setInsertState('error')
        setTimeout(() => setInsertState('idle'), 3000)
      }
    }
    window.addEventListener('sketchlib-insert', onInsert)
    return () => window.removeEventListener('sketchlib-insert', onInsert)
  }, [model.id])

  const handleInsert = async () => {
    if (!hasSketchupBridge()) {
      alert('SketchUp bridge not available.')
      return
    }
    if (insertState === 'loading' || insertState === 'placing') return

    setInsertState('loading')
    window.__sketchlibActiveModelId = model.id
    try {
      const res = await api.downloadModel(model.id)
      window.sketchup.insertModel(res.download_url, model.name)
    } catch (err) {
      window.__sketchlibActiveModelId = null
      alert('Could not load model. ' + (err.message || ''))
      setInsertState('idle')
    }
  }

  const handleFavorite = async (e) => {
    e.stopPropagation()
    if (toggling) return
    setToggling(true)
    try {
      const res = await api.toggleFavorite(model.id)
      setFavorited(res.favorited)
      setLikes(res.likes_count)
    } catch {
      // ignore — token may have expired
    } finally {
      setToggling(false)
    }
  }

  const buttonLabel = {
    idle: 'Insert model',
    loading: 'Downloading…',
    placing: 'Click in scene to place',
    inserted: 'Placed!',
    error: 'Error — retry',
  }[insertState]

  const buttonStyle = {
    ...s.btn,
    ...(insertState === 'placing' ? { background: '#2563eb' } : {}),
    ...(insertState === 'inserted' ? s.btnDone : {}),
    ...(insertState === 'error' ? { background: '#dc2626' } : {}),
  }

  const sizeMb =
    model.file_size_bytes != null
      ? (model.file_size_bytes / 1_000_000).toFixed(1)
      : '?'

  return (
    <div style={s.card}>
      {model.thumbnail_url ? (
        <img src={model.thumbnail_url} alt={model.name} style={s.thumb} loading="lazy" />
      ) : (
        <div style={s.thumbPlaceholder}>3D</div>
      )}
      <div style={s.info}>
        <p style={s.name}>{model.name}</p>
        <p style={s.meta}>
          SU {model.sketchup_version_min || '?'}+ · {sizeMb} MB
        </p>

        {model.tags?.length > 0 && (
          <div style={s.tags}>
            {model.tags.map((tag) => (
              <span key={tag.id} style={s.tag}>
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <div style={s.likeRow}>
          <span style={s.likes}>
            {likes} {likes === 1 ? 'like' : 'likes'}
          </span>
          <button
            type="button"
            style={{
              ...s.heart,
              color: favorited ? '#ef4444' : '#d1d5db',
            }}
            onClick={handleFavorite}
            disabled={toggling}
            aria-label={favorited ? 'Remove from saved' : 'Save and like'}
          >
            {favorited ? '♥' : '♡'}
          </button>
        </div>

        <button
          type="button"
          style={buttonStyle}
          onClick={handleInsert}
          disabled={insertState === 'loading' || insertState === 'placing'}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}

const s = {
  card: { border: '1px solid #eee', borderRadius: 10, overflow: 'hidden', background: '#fff' },
  thumb: { width: '100%', aspectRatio: '1', objectFit: 'cover', background: '#f5f5f5', display: 'block' },
  thumbPlaceholder: {
    width: '100%',
    aspectRatio: '1',
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#bbb',
    fontSize: 18,
    fontWeight: 600,
  },
  info: { padding: '8px 10px 10px' },
  name: {
    fontSize: 12,
    fontWeight: 500,
    margin: '0 0 2px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  meta: { fontSize: 10, color: '#999', margin: '0 0 4px' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
  tag: { fontSize: 9, color: '#9ca3af' },
  likeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  likes: { fontSize: 10, color: '#9ca3af' },
  heart: {
    border: 'none',
    background: 'none',
    fontSize: 16,
    lineHeight: 1,
    cursor: 'pointer',
    padding: 0,
  },
  btn: {
    width: '100%',
    padding: '6px 0',
    background: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
  },
  btnDone: { background: '#16a34a' },
}
