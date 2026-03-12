import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useDevices, useTelemetryHistory } from '../hooks/useMockData'
import type { Device } from '../hooks/useMockData'

const card = { background: '#1e293b', borderRadius: 12, padding: '20px 24px', border: '1px solid #334155' }
const statusColor = { online: '#22c55e', warning: '#f59e0b', offline: '#ef4444' }
const statusLabel = { online: '正常', warning: '警告', offline: '離線' }

function DeviceDetail({ device }: { device: Device }) {
  const history = useTelemetryHistory(device.id)
  return (
    <div style={card}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{device.name} — 即時遙測</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ background: '#0f172a', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>溫度</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: device.temperature > 85 ? '#ef4444' : '#38bdf8' }}>
            {device.temperature}°C
          </div>
        </div>
        <div style={{ background: '#0f172a', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>濕度</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#818cf8' }}>{device.humidity}%</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
          <Line type="monotone" dataKey="temperature" stroke="#38bdf8" strokeWidth={2} dot={false} name="溫度" />
          <Line type="monotone" dataKey="humidity" stroke="#818cf8" strokeWidth={2} dot={false} name="濕度" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function DevicesPage() {
  const devices = useDevices()
  const [selected, setSelected] = useState<Device | null>(null)
  const [filter, setFilter] = useState<string>('全部')

  const types = ['全部', '製造', '建築', '農業']
  const filtered = filter === '全部' ? devices : devices.filter(d => d.type === filter)

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>設備管理</h1>

      {/* 場域篩選 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
            background: filter === t ? '#38bdf8' : '#1e293b',
            color: filter === t ? '#0f172a' : '#94a3b8',
          }}>{t}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 16 }}>
        {/* 設備列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(d => (
            <div key={d.id}
              onClick={() => setSelected(d.id === selected?.id ? null : d)}
              style={{
                ...card, cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                borderColor: d.id === selected?.id ? '#38bdf8' : '#334155',
              }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {d.type} · {d.lastSeen}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {d.status !== 'offline' && (
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{d.temperature}°C / {d.humidity}%</span>
                )}
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: statusColor[d.status],
                  boxShadow: `0 0 6px ${statusColor[d.status]}`,
                  flexShrink: 0,
                }} title={statusLabel[d.status]} />
              </div>
            </div>
          ))}
        </div>

        {/* 設備詳情 */}
        {selected && <DeviceDetail device={selected} />}
      </div>
    </div>
  )
}
