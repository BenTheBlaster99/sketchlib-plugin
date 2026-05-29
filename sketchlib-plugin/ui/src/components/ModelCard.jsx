import { useState } from 'react'
import { api } from '../api'
import { hasSketchupBridge } from '../sketchup'

export default function ModelCard({ model }) {
  const [inserting, setInserting] = useState(false)
  const [inserted, setInserted] = useState(false)

  const handleInsert = async () => {
    if (!hasSketchupBridge()) {
      alert('SketchUp bridge not available.')
      return
    }

    setInserting(true)
    try {
      const res = await api.downloadModel(model.id)
      window.sketchup.insertModel(res.download_url, model.name)
      setTimeout(() => setInserted(true), 500)
      setTimeout(() => setInserted(false), 2500)
    } catch (err) {
      alert('Could not load model. ' + (err.message || ''))
    } finally {
      setInserting(false)
    }
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
        <button
          type="button"
          style={{ ...s.btn, ...(inserted ? s.btnDone : {}) }}
          onClick={handleInsert}
          disabled={inserting}
        >
          {inserting ? 'Loading…' : inserted ? '✓ Inserted!' : 'Insert model'}
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
  meta: { fontSize: 10, color: '#999', margin: '0 0 6px' },
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
