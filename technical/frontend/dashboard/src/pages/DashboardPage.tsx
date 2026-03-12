import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useDevices, useAlerts, useTelemetryHistory } from '../hooks/useMockData'

const card = {
  background: '#1e293b', borderRadius: 12, padding: '20px 24px',
  border: '1px solid #334155',
}

const statusColor = { online: '#22c55e', warning: '#f59e0b', offline: '#ef4444' }
const statusLabel = { online: '正常', warning: '警告', offline: '離線' }

export default function DashboardPage() {
  const devices = useDevices()
  const alerts = useAlerts()
  const history = useTelemetryHistory('overview')

  const online = devices.filter(d => d.status === 'online').length
  const warning = devices.filter(d => d.status === 'warning').length
  const offline = devices.filter(d => d.status === 'offline').length
  const openAlerts = alerts.filter(a => !a.resolved).length

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>系統總覽</h1>

      {/* KPI 卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: '總設備數', value: devices.length, color: '#38bdf8' },
          { label: '正常運作', value: online, color: '#22c55e' },
          { label: '警告中', value: warning, color: '#f59e0b' },
          { label: '未處理警報', value: openAlerts, color: '#ef4444' },
        ].map(item => (
          <div key={item.label} style={card}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{item.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* 即時溫度趨勢圖 */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>即時溫度趨勢（全場域平均）</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} unit="°C" />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Line type="monotone" dataKey="temperature" stroke="#38bdf8" strokeWidth={2} dot={false} name="溫度" />
              <Line type="monotone" dataKey="humidity" stroke="#818cf8" strokeWidth={2} dot={false} name="濕度" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 設備狀態列表 */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>設備狀態</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {devices.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#0f172a', borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{d.type} · 最後更新：{d.lastSeen}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {d.status !== 'offline' && (
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{d.temperature}°C</span>
                  )}
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: statusColor[d.status] + '22', color: statusColor[d.status] }}>
                    {statusLabel[d.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 場域分布 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
        {(['製造', '建築', '農業'] as const).map(type => {
          const group = devices.filter(d => d.type === type)
          return (
            <div key={type} style={card}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                {type === '製造' ? '⚙️' : type === '建築' ? '🏢' : '🌱'} {type}場域
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>{group.length}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>台設備 · {group.filter(d => d.status === 'online').length} 台正常</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
