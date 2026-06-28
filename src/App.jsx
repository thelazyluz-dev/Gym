import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import PlanBuilder from './components/PlanBuilder'
import ActiveWorkout from './components/ActiveWorkout'
import History from './components/History'

const TABS = [
  { id: 'plan', label: 'תוכנית', icon: '📋' },
  { id: 'workout', label: 'אימון', icon: '🏋️' },
  { id: 'history', label: 'היסטוריה', icon: '📊' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('plan')
  const [plan, setPlan] = useLocalStorage('gym_plan', null)
  const [history, setHistory] = useLocalStorage('gym_history', [])

  const addToHistory = (session) => {
    setHistory(prev => [session, ...prev])
  }

  return (
    <div dir="rtl" style={S.app}>
      <header style={S.header}>
        <span style={S.headerIcon}>🏋️</span>
        <h1 style={S.headerTitle}>מאמן כושר</h1>
      </header>

      <main style={S.main}>
        {activeTab === 'plan' && <PlanBuilder plan={plan} setPlan={setPlan} />}
        {activeTab === 'workout' && <ActiveWorkout plan={plan} addToHistory={addToHistory} />}
        {activeTab === 'history' && <History history={history} />}
      </main>

      <nav style={S.nav}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            style={{ ...S.navBtn, ...(activeTab === tab.id ? S.navBtnActive : {}) }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span style={S.navIcon}>{tab.icon}</span>
            <span style={S.navLabel}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

const S = {
  app: {
    maxWidth: 480,
    margin: '0 auto',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#0a0a0a',
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 16px 12px',
    borderBottom: '1px solid #1c1c1c',
    flexShrink: 0,
  },
  headerIcon: { fontSize: 22 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#fff',
    margin: 0,
  },
  main: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  nav: {
    display: 'flex',
    borderTop: '1px solid #1c1c1c',
    background: '#0a0a0a',
    flexShrink: 0,
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  },
  navBtn: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: '#4a4a4a',
    padding: '10px 0 8px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
  },
  navBtnActive: { color: '#e8c460' },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 11, fontWeight: 600 },
}
