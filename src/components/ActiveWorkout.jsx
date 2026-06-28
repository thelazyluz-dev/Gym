import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const IMG = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/'
const REST_SEC = 90

function fmt(s) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
}

// ─── Rest timer ────────────────────────────────────────────────────────────────

function RestTimer({ seconds, onSkip, onAdd }) {
  const r = 22, circ = 2 * Math.PI * r
  const dash = circ * (seconds / REST_SEC)
  const urgent = seconds <= 10

  return (
    <div style={RT.wrap}>
      <div style={RT.inner}>
        <svg width="56" height="56" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={r} fill="none" stroke="#222" strokeWidth="4" />
          <circle cx="28" cy="28" r={r} fill="none"
            stroke={urgent ? '#ff4444' : '#e8c460'} strokeWidth="4"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dasharray 1s linear' }}
          />
          <text x="28" y="33" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700"
            style={{ fontFamily: 'inherit', animation: urgent ? 'pulse 1s infinite' : 'none' }}>
            {fmt(seconds)}
          </text>
        </svg>
        <div style={RT.label}>
          <span style={RT.title}>מנוחה</span>
          <span style={RT.sub}>בין סטים</span>
        </div>
        <div style={RT.btns}>
          <button style={RT.addBtn} onClick={() => onAdd(30)}>+30s</button>
          <button style={RT.skipBtn} onClick={onSkip}>דלג</button>
        </div>
      </div>
    </div>
  )
}

const RT = {
  wrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    background: 'linear-gradient(transparent, #0a0a0a 20%)',
    paddingTop: 32, paddingBottom: 12, zIndex: 50,
    animation: 'slideUp 0.25s ease',
  },
  inner: {
    background: '#111', border: '1px solid #222', borderRadius: 20,
    margin: '0 16px', padding: '14px 16px',
    display: 'flex', alignItems: 'center', gap: 14,
  },
  label: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  title: { color: '#fff', fontSize: 15, fontWeight: 700 },
  sub: { color: '#555', fontSize: 12 },
  btns: { display: 'flex', gap: 8 },
  addBtn: {
    background: '#1a1a1a', border: '1px solid #333', color: '#e8c460',
    borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  skipBtn: {
    background: '#e8c460', border: 'none', color: '#000',
    borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
}

// ─── Day selector ──────────────────────────────────────────────────────────────

function DaySelector({ plan, history, onStart, justFinished }) {
  const lastFor = (dayId) => history.find(h => h.dayId === dayId)

  return (
    <div style={DS.wrap}>
      {justFinished && (
        <div style={DS.banner}>
          <span style={{ fontSize: 20 }}>💪</span>
          <span>אימון נשמר! כל הכבוד</span>
        </div>
      )}
      <p style={DS.heading}>בחר יום לאימון</p>
      <div style={DS.list}>
        {plan.days.map(day => {
          const last = lastFor(day.id)
          const empty = day.exercises.length === 0
          return (
            <button key={day.id}
              style={{ ...DS.dayBtn, ...(empty ? DS.disabled : {}) }}
              onClick={() => !empty && onStart(day)}
              disabled={empty}
            >
              <div style={DS.badge}><span style={DS.badgeLetter}>{day.id}</span></div>
              <div style={DS.mid}>
                <span style={DS.dayLabel}>{day.label}</span>
                <span style={DS.meta}>
                  {empty ? 'אין תרגילים' : last ? `אחרון: ${last.date}` : `${day.exercises.length} תרגילים`}
                </span>
              </div>
              {!empty && <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round" />
              </svg>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const DS = {
  wrap: { flex: 1, overflowY: 'auto', padding: '16px 16px 24px' },
  banner: {
    background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
    color: '#4ade80', borderRadius: 14, padding: '13px 16px', marginBottom: 20,
    display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 600,
    animation: 'fadeIn 0.3s ease',
  },
  heading: { color: '#555', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 12 },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  dayBtn: {
    background: '#111', border: '1px solid #1e1e1e', borderRadius: 16,
    padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
    cursor: 'pointer', width: '100%', textAlign: 'right',
  },
  disabled: { opacity: 0.35, cursor: 'default' },
  badge: {
    width: 38, height: 38, borderRadius: 10,
    background: 'rgba(232,196,96,0.1)', border: '1px solid rgba(232,196,96,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  badgeLetter: { color: '#e8c460', fontSize: 16, fontWeight: 800 },
  mid: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3 },
  dayLabel: { color: '#f0f0f0', fontSize: 14, fontWeight: 600 },
  meta: { color: '#555', fontSize: 12 },
}

// ─── Exercise card ─────────────────────────────────────────────────────────────

function ExerciseCard({ ex, done, weight, onToggle, onUpdateWeight }) {
  const [editing, setEditing] = useState(false)
  const [tempW, setTempW] = useState('')

  const commit = () => {
    if (tempW.trim()) onUpdateWeight(ex.id, tempW.trim())
    setEditing(false)
  }

  return (
    <div style={{
      background: done ? 'rgba(74,222,128,0.04)' : '#111',
      border: `1px solid ${done ? 'rgba(74,222,128,0.18)' : '#1e1e1e'}`,
      borderRadius: 18, padding: '14px 16px', transition: 'all 0.25s',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <button onClick={() => onToggle(ex.id)} style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        border: done ? 'none' : '2px solid #2a2a2a',
        background: done ? '#4ade80' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.2s',
      }}>
        {done && <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>}
      </button>

      <img src={IMG + ex.image} alt={ex.name}
        style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0, opacity: done ? 0.4 : 1, transition: 'opacity 0.25s' }}
        loading="lazy"
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: done ? '#555' : '#f0f0f0', fontSize: 14, fontWeight: 700, marginBottom: 2, transition: 'color 0.25s' }}>{ex.name}</p>
        <p style={{ color: '#444', fontSize: 12 }}>{ex.sets} סטים</p>
      </div>

      {editing ? (
        <input
          type="number" inputMode="decimal" autoFocus
          value={tempW}
          onChange={e => setTempW(e.target.value)}
          onBlur={commit}
          onKeyDown={e => e.key === 'Enter' && commit()}
          style={{
            width: 72, background: '#1a1a1a', border: '1px solid #e8c460',
            color: '#fff', borderRadius: 9, padding: '8px 6px',
            fontSize: 15, textAlign: 'center', outline: 'none', flexShrink: 0,
          }}
        />
      ) : (
        <button onClick={() => { setTempW(weight || ''); setEditing(true) }} style={{
          background: weight ? 'rgba(232,196,96,0.1)' : '#1a1a1a',
          border: `1px solid ${weight ? 'rgba(232,196,96,0.3)' : '#242424'}`,
          color: weight ? '#e8c460' : '#555',
          borderRadius: 9, padding: '8px 12px', fontSize: 13,
          fontWeight: weight ? 700 : 400, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          {weight ? `${weight} ק"ג` : 'משקל?'}
        </button>
      )}
    </div>
  )
}

// ─── Session view ──────────────────────────────────────────────────────────────

function SessionView({ session, setSession, weights, setWeights, addToHistory }) {
  const [elapsed, setElapsed] = useState(0)
  const [restLeft, setRestLeft] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (restLeft <= 0) return
    if (restLeft === 1 && navigator.vibrate) navigator.vibrate([80, 60, 80])
    const t = setTimeout(() => setRestLeft(r => Math.max(0, r - 1)), 1000)
    return () => clearTimeout(t)
  }, [restLeft])

  const doneIds = new Set(session.doneIds || [])

  const toggle = useCallback((exId) => {
    setSession(prev => {
      const ids = new Set(prev.doneIds || [])
      if (ids.has(exId)) {
        ids.delete(exId)
        return { ...prev, doneIds: [...ids] }
      }
      ids.add(exId)
      setRestLeft(REST_SEC)
      if (navigator.vibrate) navigator.vibrate(15)
      return { ...prev, doneIds: [...ids] }
    })
  }, [setSession])

  const updateWeight = useCallback((exId, val) => {
    setWeights(prev => ({ ...prev, [exId]: val }))
  }, [setWeights])

  const finish = () => {
    addToHistory({
      id: Date.now(),
      date: new Date().toLocaleDateString('he-IL'),
      dayId: session.dayId,
      dayLabel: session.dayLabel,
      duration: Math.round(elapsed / 60),
      exercises: session.exercises.map(ex => ({
        id: ex.id, name: ex.name, sets: ex.sets,
        weight: weights[ex.id] || '',
        done: doneIds.has(ex.id),
      })),
    })
  }

  const doneCount = doneIds.size
  const total = session.exercises.length

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 12px', borderBottom: '1px solid #161616', flexShrink: 0 }}>
        <div>
          <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{session.dayLabel}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#666', fontSize: 13 }}>{fmt(elapsed)}</span>
            <span style={{ color: '#333' }}>·</span>
            <span style={{ color: '#666', fontSize: 13 }}>{doneCount}/{total} תרגילים</span>
          </div>
        </div>
        <button onClick={() => setSession(null)}
          style={{ background: 'none', border: '1px solid #222', color: '#555', borderRadius: 10, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>
          ביטול
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 120px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {session.exercises.map(ex => (
          <ExerciseCard key={ex.id}
            ex={ex}
            done={doneIds.has(ex.id)}
            weight={weights[ex.id]}
            onToggle={toggle}
            onUpdateWeight={updateWeight}
          />
        ))}

        <button onClick={finish} style={{ background: '#e8c460', border: 'none', color: '#000', borderRadius: 16, padding: '16px 0', fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L20 7" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          סיים אימון
        </button>
      </div>

      {restLeft > 0 && (
        <RestTimer seconds={restLeft} onSkip={() => setRestLeft(0)} onAdd={s => setRestLeft(r => r + s)} />
      )}
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function ActiveWorkout({ plan, history, weights, setWeights, addToHistory }) {
  const [session, setSession] = useLocalStorage('gym_active_session', null)
  const [justFinished, setJustFinished] = useState(false)

  if (!plan) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" opacity="0.15">
          <path d="M6 12h12M3 9h2v6H3V9zm16 0h2v6h-2V9zM8 7h1v10H8V7zm7 0h1v10h-1V7z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>אין תוכנית עדיין</p>
        <p style={{ color: '#555', fontSize: 14, textAlign: 'center', lineHeight: 1.5 }}>צור תוכנית בלשונית "תוכנית" כדי להתחיל</p>
      </div>
    )
  }

  if (session) {
    return (
      <SessionView
        session={session}
        setSession={setSession}
        weights={weights}
        setWeights={setWeights}
        addToHistory={entry => { addToHistory(entry); setSession(null); setJustFinished(true) }}
      />
    )
  }

  return (
    <DaySelector
      plan={plan} history={history} justFinished={justFinished}
      onStart={day => {
        setJustFinished(false)
        setSession({
          dayId: day.id, dayLabel: day.label,
          startedAt: Date.now(), doneIds: [],
          exercises: day.exercises.map(ex => ({
            id: ex.id, name: ex.name, image: ex.image,
            sets: typeof ex.sets === 'number' ? ex.sets : 4,
          })),
        })
      }}
    />
  )
}
