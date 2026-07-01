import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import PlanBuilder from './components/PlanBuilder'
import ActiveWorkout from './components/ActiveWorkout'
import History from './components/History'
import Onboarding from './components/Onboarding'

const TABS = [
  { id: 'plan',    label: 'תוכנית',    icon: PlanIcon },
  { id: 'workout', label: 'אימון',     icon: WorkoutIcon },
  { id: 'history', label: 'היסטוריה', icon: HistoryIcon },
]

const Header = () => (
  <header style={S.header}>
    <div style={S.headerIcon}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M6 12h12M3 9h2v6H3V9zm16 0h2v6h-2V9zM8 7h1v10H8V7zm7 0h1v10h-1V7z"
          stroke="#e8c460" strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
    </div>
    <h1 style={S.title}>מאמן כושר</h1>
  </header>
)

export default function App() {
  // Returning users land on the workout tab — that's the daily use case.
  // New users see onboarding anyway, which sets the tab on completion.
  const [activeTab, setActiveTab] = useState('workout')
  const [plan, setPlan]         = useLocalStorage('gym_plan', null)
  const [history, setHistory]   = useLocalStorage('gym_history', [])
  const [weights, setWeights]   = useLocalStorage('gym_weights', {})

  const addToHistory = (session) => setHistory(prev => [session, ...prev])

  // Onboarding: show until user has a plan
  if (!plan) {
    return (
      <div dir="rtl" style={S.app}>
        <Header />
        <Onboarding onComplete={(newPlan, tab) => {
          setPlan(newPlan)
          if (tab) setActiveTab(tab)
        }} />
      </div>
    )
  }

  return (
    <div dir="rtl" style={S.app}>
      <Header />

      <main style={S.main}>
        {activeTab === 'plan'    && <PlanBuilder plan={plan} setPlan={setPlan} onReset={() => setPlan(null)} />}
        {activeTab === 'workout' && <ActiveWorkout plan={plan} history={history} weights={weights} setWeights={setWeights} addToHistory={addToHistory} />}
        {activeTab === 'history' && <History history={history} />}
      </main>

      <nav style={S.nav}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button key={id} style={S.navBtn} onClick={() => setActiveTab(id)}>
              <div style={{ ...S.navPill, ...(active ? S.navPillOn : {}) }}>
                <Icon active={active} />
              </div>
              <span style={{ ...S.navLabel, color: active ? '#e8c460' : '#484848' }}>{label}</span>
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
    padding: '14px 18px 13px',
    borderBottom: '1px solid #141414',
    flexShrink: 0,
    background: 'linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%)',
  },
  headerIcon: {
    width: 34, height: 34, borderRadius: 10,
    background: 'rgba(232,196,96,0.1)', border: '1px solid rgba(232,196,96,0.18)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.4px' },
  main: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  nav: {
    display: 'flex',
    borderTop: '1px solid #111',
    background: '#060606',
    flexShrink: 0,
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  },
  navBtn: {
    flex: 1,
    background: 'none',
    border: 'none',
    padding: '10px 0 12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  navPill: { padding: '6px 18px', borderRadius: 14, transition: 'background 0.2s' },
  navPillOn: { background: 'rgba(232,196,96,0.11)', boxShadow: '0 0 12px rgba(232,196,96,0.08)' },
  navLabel: { fontSize: 10, fontWeight: 600, letterSpacing: '0.3px' },
}
