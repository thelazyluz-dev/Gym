import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const IMG = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/'
const REST_DEFAULT = 90

function fmt(s) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
}

// ─── Rest timer banner ─────────────────────────────────────────────────────────

function RestTimer({ seconds, onSkip, onAdd }) {
  const pct = seconds / REST_DEFAULT
  const r = 22, circ = 2 * Math.PI * r
  const dash = circ * pct
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
          <span style={RT.sub}>הוסף זמן?</span>
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
                <path d="M15 18l-6-6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
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

// ─── Set row ───────────────────────────────────────────────────────────────────

function SetRow({ set, si, ei, lastSet, onUpdate, onComplete }) {
  const done = !!set.done
  const inp = {
    background: done ? 'rgba(74,222,128,0.06)' : '#1a1a1a',
    border: `1px solid ${done ? 'rgba(74,222,128,0.2)' : '#242424'}`,
    color: done ? '#4ade80' : '#fff',
    borderRadius: 9, padding: '10px 4px', fontSize: 16,
    textAlign: 'center', width: '100%', outline: 'none',
    transition: 'all 0.2s',
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 40px', gap: '0 8px', marginBottom: 7, alignItems: 'center' }}>
      <span style={{ color: done ? '#4ade80' : '#444', fontSize: 13, fontWeight: 700, textAlign: 'center', transition: 'color 0.2s' }}>{si + 1}</span>
      <input type="number" inputMode="decimal" min="0" step="0.5"
        value={set.weight} disabled={done}
        onChange={e => onUpdate(ei, si, 'weight', e.target.value)}
        placeholder={lastSet?.weight || '0'} style={inp} />
      <input type="number" inputMode="numeric" min="0"
        value={set.reps} disabled={done}
        onChange={e => onUpdate(ei, si, 'reps', e.target.value)}
        placeholder={lastSet?.reps || '0'} style={inp} />
      {done ? (
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      ) : (
        <button onClick={() => onComplete(ei, si)}
          style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #2a2a2a', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
    </div>
  )
}

// ─── Exercise card ─────────────────────────────────────────────────────────────

function ExerciseCard({ ex, ei, lastSets, onUpdate, onAdd, onComplete }) {
  const doneSets = ex.sets.filter(s => s.done).length
  const allDone = doneSets === ex.sets.length && ex.sets.length > 0
  const vol = ex.sets.filter(s => s.done && s.weight && s.reps)
    .reduce((t, s) => t + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0)

  return (
    <div style={{ background: '#111', border: `1px solid ${allDone ? 'rgba(74,222,128,0.25)' : '#1e1e1e'}`, borderRadius: 18, padding: 16, transition: 'border-color 0.3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <img src={IMG + ex.image} alt={ex.name} style={{ width: 50, height: 50, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} loading="lazy" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#f0f0f0', fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{ex.name}</p>
          {lastSets.length > 0 && (
            <p style={{ color: '#e8c460', fontSize: 12, opacity: 0.7 }}>
              קודם: {lastSets[0]?.weight || '—'}ק"ג × {lastSets[0]?.reps || '—'}
            </p>
          )}
        </div>
        {vol > 0 && <span style={{ color: '#e8c460', fontSize: 18, fontWeight: 800 }}>{Math.round(vol)}<span style={{ fontSize: 10, opacity: 0.6 }}> ק"ג</span></span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 40px', gap: '0 8px', marginBottom: 6, padding: '0 2px' }}>
        {['#', 'ק"ג', 'חז׳', ''].map((h, i) => <span key={i} style={{ color: '#333', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>{h}</span>)}
      </div>

      {ex.sets.map((set, si) => (
        <SetRow key={si} set={set} si={si} ei={ei} lastSet={lastSets[si]} onUpdate={onUpdate} onComplete={onComplete} />
      ))}

      {!allDone ? (
        <button style={{ width: '100%', marginTop: 10, background: 'none', border: '1px dashed #262626', color: '#444', borderRadius: 10, padding: '9px 0', fontSize: 13, cursor: 'pointer' }}
          onClick={() => onAdd(ei)}>+ הוסף סט</button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, color: '#4ade80', fontSize: 13, fontWeight: 600, opacity: 0.85 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          הושלם · {doneSets} סטים
        </div>
      )}
    </div>
  )
}

// ─── Session view ──────────────────────────────────────────────────────────────

function SessionView({ session, history, setSession, addToHistory }) {
  const [elapsed, setElapsed]   = useState(0)
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

  const lastSession = useMemo(() => history.find(h => h.dayId === session.dayId), [history, session.dayId])
  const getLastSets = (exId) => lastSession?.exercises.find(e => e.id === exId)?.sets || []

  const volume = useMemo(() =>
    session.exercises.reduce((t, ex) =>
      t + ex.sets.filter(s => s.done && s.weight && s.reps)
        .reduce((et, s) => et + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0)
    , 0)
  , [session])

  const updateSet = useCallback((ei, si, field, val) =>
    setSession(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i !== ei ? ex : { ...ex, sets: ex.sets.map((s, j) => j !== si ? s : { ...s, [field]: val }) }
      ),
    }))
  , [setSession])

  const completeSet = useCallback((ei, si) => {
    if (session.exercises[ei].sets[si].done) return
    updateSet(ei, si, 'done', true)
    setRestLeft(REST_DEFAULT)
    if (navigator.vibrate) navigator.vibrate(15)
  }, [session, updateSet])

  const addSet = useCallback((ei) =>
    setSession(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i !== ei ? ex : { ...ex, sets: [...ex.sets, { weight: '', reps: '', done: false }] }
      ),
    }))
  , [setSession])

  const finish = () => {
    addToHistory({
      id: Date.now(),
      date: new Date().toLocaleDateString('he-IL'),
      dayId: session.dayId,
      dayLabel: session.dayLabel,
      duration: Math.round(elapsed / 60),
      volume: Math.round(volume),
      exercises: session.exercises
        .filter(ex => ex.sets.some(s => s.done || s.weight || s.reps))
        .map(ex => ({ ...ex })),
    })
    setSession(null)
  }

  const doneSets  = session.exercises.reduce((t, ex) => t + ex.sets.filter(s => s.done).length, 0)
  const totalSets = session.exercises.reduce((t, ex) => t + ex.sets.length, 0)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 12px', borderBottom: '1px solid #161616', flexShrink: 0 }}>
        <div>
          <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{session.dayLabel}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#666', fontSize: 13 }}>{fmt(elapsed)}</span>
            <span style={{ color: '#333' }}>·</span>
            <span style={{ color: '#666', fontSize: 13 }}>{doneSets}/{totalSets} סטים</span>
            {volume > 0 && <>
              <span style={{ color: '#333' }}>·</span>
              <span style={{ color: '#e8c460', fontSize: 13 }}>{Math.round(volume)} ק"ג</span>
            </>}
          </div>
        </div>
        <button onClick={() => setSession(null)}
          style={{ background: 'none', border: '1px solid #222', color: '#555', borderRadius: 10, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>
          ביטול
        </button>
      </div>

      {/* list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 120px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {session.exercises.map((ex, ei) => (
          <ExerciseCard key={ex.id + ei} ex={ex} ei={ei}
            lastSets={getLastSets(ex.id)}
            onUpdate={updateSet} onAdd={addSet} onComplete={completeSet}
          />
        ))}
        <button onClick={finish}
          style={{ background: '#e8c460', border: 'none', color: '#000', borderRadius: 16, padding: '16px 0', fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

export default function ActiveWorkout({ plan, history, addToHistory }) {
  const [session, setSession] = useLocalStorage('gym_active_session', null)
  const [justFinished, setJustFinished] = useState(false)

  if (!plan) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" opacity="0.15">
          <path d="M6 12h12M3 9h2v6H3V9zm16 0h2v6h-2V9zM8 7h1v10H8V7zm7 0h1v10h-1V7z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>אין תוכנית עדיין</p>
        <p style={{ color: '#555', fontSize: 14, textAlign: 'center', lineHeight: 1.5 }}>צור תוכנית בלשונית "תוכנית" כדי להתחיל</p>
      </div>
    )
  }

  if (session) {
    return (
      <SessionView session={session} history={history}
        setSession={setSession}
        addToHistory={s => { addToHistory(s); setJustFinished(true) }}
      />
    )
  }

  return (
    <DaySelector plan={plan} history={history}
      onStart={day => {
        setJustFinished(false)
        setSession({
          dayId: day.id, dayLabel: day.label, startedAt: Date.now(),
          exercises: day.exercises.map(ex => ({
            id: ex.id, name: ex.name, image: ex.image,
            sets: [{ weight: '', reps: '', done: false }],
          })),
        })
      }}
      justFinished={justFinished}
    />
  )
}
