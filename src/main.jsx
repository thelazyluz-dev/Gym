import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Migrate stale session data from old format (sets was array, not number)
try {
  const raw = localStorage.getItem('gym_active_session')
  if (raw) {
    const s = JSON.parse(raw)
    if (s?.exercises?.some(ex => Array.isArray(ex.sets))) {
      localStorage.removeItem('gym_active_session')
    }
  }
} catch {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
