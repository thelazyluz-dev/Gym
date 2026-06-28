import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import PlanBuilder from './components/PlanBuilder'
import ActiveWorkout from './components/ActiveWorkout'
import History from './components/History'

const TABS = [
  { id: 'plan',    label: 'תוכנית',    icon: PlanIcon },
  { id: 'workout', label: 'אימון',     icon: WorkoutIcon },
  { id: 'history', label: 'היסטוריה', icon: HistoryIcon },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('plan')
  const [plan, setPlan]         = useLocalStorage('gym_plan', null)
  const [history, setHistory]   = useLocalStorage('gym_history', [])
  const [weights, setWeights]   = useLocalStorage('gym_weights', {})

  const addToHistory = (session) => setHistory(prev => [session, ...prev])

  return (
    <div dir="rtl" style={S.app}>
      <header style={S.header}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M6.5 6.5h11M6.5 17.5h11M3 12h18M7 3v18M17 3v18" stroke="#e8c460" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <h1 style={S.title}>מאמן כושר</h1>
      </header>

      <main style={S.main}>
        {activeTab === 'plan'    && <PlanBuilder plan={plan} setPlan={setPlan} />}
        {activeTab === 'workout' && <ActiveWorkout plan={plan} history={history} weights={weights} setWeights={setWeights} addToHistory={addToHistory} />}
        {activeTab === 'history' && <History history={history} />}
      </main>

      <nav style={S.nav}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button key={id} style={S.navBtn} onClick={() => setActiveTab(id)}>
              <Icon active={active} />
              <span style={{ ...S.navLabel, color: active ? '#e8c460' : '#3a3a3a' }}>{label}</span>
              {active && <span style={S.dot} />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

function PlanIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke={active ? '#e8c460' : '#3a3a3a'} strokeWidth="1.8"/>
      <path d="M7 8h10M7 12h10M7 16h6" stroke={active ? '#e8c460' : '#3a3a3a'} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function WorkoutIcon({ active }) {
  const c = active ? '#e8c460' : '#3a3a3a'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M6 12h12M3 9h2v6H3V9zm16 0h2v6h-2V9zM8 7h1v10H8V7zm7 0h1v10h-1V7z" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function HistoryIcon({ active }) {
  const c = active ? '#e8c460' : '#3a3a3a'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 6v6l4 2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M3.5 12A8.5 8.5 0 1 0 12 3.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M3 7v5h5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
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
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '16px 20px 14px',
    borderBottom: '1px solid #161616',
    flexShrink: 0,
  },
  title: { fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' },
  main: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  nav: {
    display: 'flex',
    borderTop: '1px solid #161616',
    background: '#080808',
    flexShrink: 0,
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  },
  navBtn: {
    flex: 1,
    background: 'none',
    border: 'none',
    padding: '10px 0 6px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  navLabel: { fontSize: 10, fontWeight: 600, letterSpacing: '0.2px' },
  dot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: '#e8c460',
  },
}
