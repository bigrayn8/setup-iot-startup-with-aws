import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import DevicesPage from './pages/DevicesPage'
import AlertsPage from './pages/AlertsPage'

const queryClient = new QueryClient()

export type Page = 'dashboard' | 'devices' | 'alerts'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />
      case 'devices':   return <DevicesPage />
      case 'alerts':    return <AlertsPage />
      default:          return <DashboardPage />
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ display: 'flex', height: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {renderPage()}
        </main>
      </div>
    </QueryClientProvider>
  )
}

export default App
