import type { Page } from '../App'

const NAV = [
  { id: 'dashboard', label: '總覽', icon: '⬛' },
  { id: 'devices',   label: '設備管理', icon: '📡' },
  { id: 'alerts',    label: '警報中心', icon: '🔔' },
] as const

interface Props {
  currentPage: Page
  onNavigate: (p: Page) => void
}

const s = {
  sidebar: {
    width: 220, background: '#1e293b', borderRight: '1px solid #334155',
    display: 'flex', flexDirection: 'column' as const, padding: '20px 0',
  },
  logo: {
    padding: '0 20px 24px', borderBottom: '1px solid #334155', marginBottom: 16,
  },
  logoTitle: { fontSize: 16, fontWeight: 700, color: '#38bdf8' },
  logoSub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  navItem: (active: boolean) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
    cursor: 'pointer', fontSize: 14, borderRadius: 0,
    background: active ? '#0f172a' : 'transparent',
    color: active ? '#38bdf8' : '#94a3b8',
    borderLeft: active ? '3px solid #38bdf8' : '3px solid transparent',
    transition: 'all .15s',
  }),
}

export default function Sidebar({ currentPage, onNavigate }: Props) {
  return (
    <div style={s.sidebar}>
      <div style={s.logo}>
        <div style={s.logoTitle}>IoT Platform</div>
        <div style={s.logoSub}>智慧監控管理系統</div>
      </div>
      {NAV.map(item => (
        <div key={item.id} style={s.navItem(currentPage === item.id)}
          onClick={() => onNavigate(item.id as Page)}>
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
