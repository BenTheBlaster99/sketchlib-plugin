import { useState, useEffect } from 'react'
import { api } from '../api'
import { canAccessCategory, hasFullLibraryAccess } from '../lib/access'
import ModelCard from './ModelCard'

export default function Library({ user, packCategoryIds, onLogout }) {
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [activeSlug, setActiveSlug] = useState(null)
  const [activeTags, setActiveTags] = useState([])
  const [models, setModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [lockedMessage, setLockedMessage] = useState('')
  const [search, setSearch] = useState('')
  const [loadError, setLoadError] = useState('')
  const [view, setView] = useState('browse')

  useEffect(() => {
    api
      .getCategories()
      .then((data) => {
        setCategories(data)
        if (data.length > 0) selectCategory(data[0])
      })
      .catch((err) => setLoadError(err.message || 'Could not load categories'))

    api
      .getTags()
      .then(setTags)
      .catch(() => {})
  }, [])

  const selectCategory = async (category) => {
    setView('browse')
    setActiveSlug(category.slug)
    setActiveTags([])
    setSearch('')
    setLockedMessage('')
    setModels([])

    if (!canAccessCategory(category.id, user, packCategoryIds)) {
      setLockedMessage('This category is locked. Buy the pack or subscribe on sketchlib.com.')
      return
    }

    await loadCategoryModels(category.slug, [])
  }

  const loadCategoryModels = async (slug, tagSlugs) => {
    setLoadingModels(true)
    try {
      const res = await api.getCategoryModels(slug, tagSlugs)
      setModels(res.models || [])
      setLoadError('')
    } catch (err) {
      if (err.status === 403) {
        setLockedMessage(err.message || 'No access to this category.')
        setModels([])
      } else {
        setLoadError(err.message || 'Could not load models')
      }
    } finally {
      setLoadingModels(false)
    }
  }

  const loadSaved = async () => {
    setView('saved')
    setActiveSlug(null)
    setLockedMessage('')
    setSearch('')
    setLoadingModels(true)
    try {
      const data = await api.getFavorites()
      setModels(Array.isArray(data) ? data : [])
      setLoadError('')
    } catch (err) {
      setLoadError(err.message || 'Could not load saved models')
      setModels([])
    } finally {
      setLoadingModels(false)
    }
  }

  useEffect(() => {
    if (view !== 'browse' || !activeSlug || lockedMessage) return
    loadCategoryModels(activeSlug, activeTags)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTags])

  const toggleTag = (slug) => {
    setActiveTags((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug],
    )
  }

  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  )

  const sub = user.active_subscription
  const accessLabel = user.is_beta
    ? 'Beta'
    : sub?.status === 'active' || sub?.status === 'beta'
      ? sub.plan?.name || 'Subscribed'
      : hasFullLibraryAccess(user)
        ? 'Subscribed'
        : 'Pack access'

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div>
          <span style={s.brand}>SketchLib</span>
          <span style={s.badge}>{accessLabel}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            style={{ ...s.savedBtn, ...(view === 'saved' ? s.savedBtnActive : {}) }}
            onClick={loadSaved}
          >
            Saved
          </button>
          <span style={s.userName}>{user.name}</span>
          <button type="button" style={s.logoutBtn} onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {view === 'browse' && (
        <div style={s.tabs}>
          {categories.map((cat) => {
            const locked = !canAccessCategory(cat.id, user, packCategoryIds)
            return (
              <button
                key={cat.id}
                type="button"
                style={{
                  ...s.tab,
                  ...(activeSlug === cat.slug ? s.tabActive : {}),
                  ...(locked ? s.tabLocked : {}),
                }}
                onClick={() => selectCategory(cat)}
              >
                {cat.name}
                {locked ? ' 🔒' : ''}
              </button>
            )
          })}
        </div>
      )}

      {view === 'browse' && tags.length > 0 && !lockedMessage && (
        <div style={s.tagRow}>
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              style={{
                ...s.tagChip,
                ...(activeTags.includes(tag.slug) ? s.tagChipActive : {}),
              }}
              onClick={() => toggleTag(tag.slug)}
            >
              #{tag.name}
            </button>
          ))}
          {activeTags.length > 0 && (
            <button type="button" style={s.tagClear} onClick={() => setActiveTags([])}>
              Clear
            </button>
          )}
        </div>
      )}

      <div style={{ padding: '8px 12px' }}>
        <input
          style={s.input}
          placeholder={view === 'saved' ? 'Search saved…' : 'Search models…'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={!!lockedMessage}
        />
      </div>

      {loadError && <p style={s.bannerErr}>{loadError}</p>}
      {lockedMessage && <p style={s.bannerLock}>{lockedMessage}</p>}

      <div style={s.grid}>
        {loadingModels ? (
          <p style={s.hint}>Loading models…</p>
        ) : lockedMessage ? null : filteredModels.length === 0 ? (
          <p style={s.hint}>
            {view === 'saved'
              ? 'No saved models yet. Tap ♡ on any model to save it.'
              : activeTags.length
                ? 'No models match these tags.'
                : 'No models in this category.'}
          </p>
        ) : (
          filteredModels.map((model) => <ModelCard key={model.id} model={model} />)
        )}
      </div>
    </div>
  )
}

const s = {
  root: { display: 'flex', flexDirection: 'column', height: '100vh' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderBottom: '1px solid #eee',
    background: '#fff',
  },
  brand: { fontWeight: 600, fontSize: 15, marginRight: 8 },
  badge: {
    fontSize: 10,
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '2px 8px',
    borderRadius: 999,
    fontWeight: 600,
  },
  userName: { fontSize: 12, color: '#888' },
  savedBtn: {
    fontSize: 11,
    border: '1px solid #ddd',
    borderRadius: 6,
    padding: '3px 8px',
    background: 'white',
    cursor: 'pointer',
  },
  savedBtnActive: { background: '#000', color: '#fff', borderColor: '#000' },
  tabs: {
    display: 'flex',
    gap: 4,
    padding: '8px 12px',
    overflowX: 'auto',
    borderBottom: '1px solid #eee',
    background: '#fff',
  },
  tab: {
    padding: '5px 12px',
    border: '1px solid #ddd',
    borderRadius: 20,
    fontSize: 12,
    background: 'white',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tabActive: { background: '#000', color: '#fff', border: '1px solid #000' },
  tabLocked: { opacity: 0.65 },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    padding: '8px 12px',
    borderBottom: '1px solid #eee',
    background: '#fafafa',
  },
  tagChip: {
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 11,
    border: '1px solid #ddd',
    background: '#fff',
    color: '#555',
    cursor: 'pointer',
  },
  tagChipActive: { background: '#000', color: '#fff', borderColor: '#000' },
  tagClear: {
    padding: '3px 8px',
    fontSize: 11,
    border: 'none',
    background: 'none',
    color: '#888',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '8px 10px',
    border: '1px solid #ddd',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
  },
  grid: {
    flex: 1,
    overflowY: 'auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    padding: 12,
    alignContent: 'start',
  },
  hint: { color: '#888', fontSize: 13, padding: 16, gridColumn: '1 / -1' },
  bannerLock: {
    margin: '0 12px',
    padding: '10px 12px',
    background: '#fffbeb',
    color: '#92400e',
    fontSize: 12,
    borderRadius: 8,
  },
  bannerErr: {
    margin: '0 12px',
    padding: '10px 12px',
    background: '#fef2f2',
    color: '#b91c1c',
    fontSize: 12,
    borderRadius: 8,
  },
  logoutBtn: {
    fontSize: 11,
    border: '1px solid #ddd',
    borderRadius: 6,
    padding: '3px 8px',
    background: 'white',
    cursor: 'pointer',
  },
}
