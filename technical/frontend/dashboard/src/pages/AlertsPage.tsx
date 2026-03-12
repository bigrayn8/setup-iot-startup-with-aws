import { useAlerts } from '../hooks/useMockData'

const card = { background: '#1e293b', borderRadius: 12, padding: '20px 24px', border: '1px solid #334155' }

const severityStyle = {
  high:   { bg: '#ef444422', color: '#ef4444', label: '嚴重' },
  medium: { bg: '#f59e0b22', color: '#f59e0b', label: '警告' },
  low:    { bg: '#22c55e22', color: '#22c55e', label: '輕微' },
}

export default function AlertsPage() {
  const alerts = useAlerts()
  const open = alerts.filter(a => !a.resolved)
  const resolved = alerts.filter(a => a.resolved)

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>警報中心</h1>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
        {open.length} 個未處理警報
      </p>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          未處理
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {open.map(a => {
            const sev = severityStyle[a.severity]
            return (
              <div key={a.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: sev.color,
                  boxShadow: `0 0 8px ${sev.color}`, flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{a.deviceName}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    {a.metric}：{a.value} → 閾值 {a.threshold}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, background: sev.bg, color: sev.color }}>
                    {sev.label}
                  </span>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{a.time}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          已處理
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.5 }}>
          {resolved.map(a => (
            <div key={a.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#334155', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14 }}>{a.deviceName}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {a.metric}：{a.value}
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{a.time} · 已處理</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
