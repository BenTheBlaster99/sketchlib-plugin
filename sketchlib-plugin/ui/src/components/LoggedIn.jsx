/** Phase 2 placeholder — full library UI comes in Phase 3. */

export default function LoggedIn({ user, onLogout }) {
  const sub = user.active_subscription
  const subLabel = user.is_beta
    ? 'Beta access'
    : sub?.status === 'active' || sub?.status === 'beta'
      ? `Subscription: ${sub.plan?.name || sub.status}`
      : 'No active subscription'

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <span style={s.brand}>SketchLib</span>
        <button type="button" style={s.logout} onClick={onLogout}>
          Logout
        </button>
      </header>

      <div style={s.body}>
        <p style={s.hello}>Signed in as {user.name}</p>
        <p style={s.email}>{user.email}</p>
        <p style={s.status}>{subLabel}</p>
        <p style={s.phase}>
          Phase 2 complete — library browser arrives in Phase 3.
        </p>
      </div>
    </div>
  )
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'system-ui, sans-serif' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #eee',
    background: '#fff',
  },
  brand: { fontWeight: 600, fontSize: 15 },
  logout: {
    fontSize: 12,
    border: '1px solid #ddd',
    borderRadius: 6,
    padding: '4px 10px',
    background: '#fff',
    cursor: 'pointer',
  },
  body: { padding: 20, flex: 1 },
  hello: { fontSize: 16, fontWeight: 500, margin: '0 0 4px' },
  email: { fontSize: 13, color: '#666', margin: '0 0 12px' },
  status: { fontSize: 13, color: '#0369a1', background: '#e0f2fe', padding: '8px 12px', borderRadius: 8, margin: '0 0 16px' },
  phase: { fontSize: 12, color: '#888', margin: 0 },
}
