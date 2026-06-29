import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const IMG = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/'

// ─── Day selector ──────────────────────────────────────────────────────────────

function DaySelector({ plan, history, onStart, justFinished }) {
  const lastFor = (dayId) => history.find(h => h.dayId === dayId)

  const nextDayIdx = useMemo(() => {
    if (!history.length) return 0
    const lastDayId = history[0].dayId
    const idx = plan.days.findIndex(d => d.id === lastDayId)
    return idx === -1 ? 0 : (idx + 1) % plan.days.length
  }, [plan, history])

  return (
    <div style={DS.wrap}>
      {justFinished && (
        <div style={DS.banner}>
          <span style={{ fontSize: 28, lineHeight: 1 }}>💪</span>
          <div>
            <p style={{ color: '#4ade80', fontSize: 16, fontWeight: 800, marginBottom: 2 }}>כל הכבוד!</p>
            <p style={{ color: '#2d5533', fontSize: 13 }}>האימון נשמר בהיסטוריה</p>
          </div>
        </div>
      )}

      <div style={DS.list}>
        {plan.days.map((day, i) => {
          const last = lastFor(day.id)
          const empty = day.exercises.length === 0
          const isNext = !empty && i === nextDayIdx

          if (isNext) return (
            <button key={day.id} onClick={() => onStart(day)} style={DS.nextCard}>
              <div style={DS.nextGlow} />
              <div style={{ ...DS.badge, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.22)' }}>
                <span style={{ color: '#4ade80', fontSize: 19, fontWeight: 900 }}>{day.id}</span>
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <p style={{ color: '#3aff7a', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', marginBottom: 4, textTransform: 'uppercase' }}>האימון הבא שלך</p>
                <p style={{ color: '#f0f0f0', fontSize: 16, fontWeight: 800, marginBottom: 3 }}>{day.label}</p>
                <p style={{ color: '#2d6040', fontSize: 12 }}>{last ? `אחרון: ${last.date}` : `${day.exercises.length} תרגילים`}</p>
              </div>
              <div style={DS.startBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 3l14 9-14 9V3z" fill="#000" />
                </svg>
                <span>התחל</span>
              </div>
            </button>
          )

          return (
            <button key={day.id}
              style={{ ...DS.dayBtn, opacity: empty ? 0.3 : 1 }}
              onClick={() => !empty && onStart(day)} disabled={empty}
            >
              <div style={DS.badge}>
                <span style={DS.badgeLetter}>{day.id}</span>
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <p style={DS.dayLabel}>{day.label}</p>
                <p style={DS.dayMeta}>{empty ? 'אין תרגילים' : last ? `אחרון: ${last.date}` : `${day.exercises.length} תרגילים`}</p>
              </div>
              {!empty && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="#252525" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const DS = {
  wrap: { flex: 1, overflowY: 'auto', padding: '20px 16px 36px' },
  banner: {
    background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.14)',
    borderRadius: 18, padding: '16px 18px', marginBottom: 20,
    display: 'flex', alignItems: 'center', gap: 14, animation: 'fadeIn 0.4s ease',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  nextCard: {
    background: 'linear-gradient(150deg, #0a1d0e 0%, #081208 100%)',
    border: '1px solid rgba(74,222,128,0.2)',
    borderRadius: 20, padding: '18px 16px',
    display: 'flex', alignItems: 'center', gap: 14,
    cursor: 'pointer', width: '100%', textAlign: 'right',
    boxShadow: '0 6px 32px rgba(74,222,128,0.07)',
    position: 'relative', overflow: 'hidden', marginBottom: 4,
  },
  nextGlow: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160,
    background: 'radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  startBtn: {
    background: '#4ade80', color: '#000', borderRadius: 12,
    padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 14, fontWeight: 800, flexShrink: 0,
  },
  dayBtn: {
    background: '#0f0f0f', border: '1px solid #181818',
    borderRadius: 16, padding: '14px 16px',
    display: 'flex', alignItems: 'center', gap: 14,
    cursor: 'pointer', width: '100%',
    transition: 'border-color 0.2s',
  },
  badge: {
    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
    background: 'rgba(232,196,96,0.07)', border: '1px solid rgba(232,196,96,0.13)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  badgeLetter: { color: '#e8c460', fontSize: 17, fontWeight: 900 },
  dayLabel: { color: '#d0d0d0', fontSize: 14, fontWeight: 600, marginBottom: 4 },
  dayMeta: { color: '#333', fontSize: 12 },
}

// ─── Exercise card ─────────────────────────────────────────────────────────────

function ExerciseCard({ ex, done, weight, prevWeight, pr, onToggle, onUpdateWeight }) {
  const [editing, setEditing] = useState(false)
  const [tempW, setTempW] = useState('')
  const setsCount = typeof ex.sets === 'number' ? ex.sets : 4
  const isNewPR = pr && weight && parseFloat(weight) > pr

  const commit = () => {
    if (tempW.trim()) onUpdateWeight(ex.id, tempW.trim())
    setEditing(false)
  }

  const borderColor = done
    ? 'rgba(74,222,128,0.18)'
    : isNewPR
      ? 'rgba(232,196,96,0.4)'
      : '#181818'

  const cardBg = done
    ? 'rgba(74,222,128,0.03)'
    : isNewPR
      ? 'rgba(232,196,96,0.04)'
      : '#111'

  return (
    <div style={{
      borderRadius: 20, border: `1px solid ${borderColor}`,
      background: cardBg, overflow: 'hidden',
      boxShadow: done
        ? '0 4px 24px rgba(74,222,128,0.06)'
        : isNewPR
          ? '0 4px 24px rgba(232,196,96,0.08)'
          : '0 2px 12px rgba(0,0,0,0.2)',
      transition: 'all 0.35s ease',
    }}>
      {/* Main content row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14 }}>
        {/* Image */}
        <div style={{
          width: 58, height: 58, borderRadius: 14, overflow: 'hidden',
          flexShrink: 0, background: '#1a1a1a',
          opacity: done ? 0.18 : 1, transition: 'opacity 0.35s',
        }}>
          <img src={IMG + ex.image} alt={ex.name} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Name + sets */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            color: done ? '#282828' : '#f0f0f0',
            fontSize: 15, fontWeight: 700, marginBottom: 7,
            textDecoration: done ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            transition: 'color 0.3s',
          }}>
            {ex.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: Math.min(setsCount, 8) }).map((_, i) => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: 2,
                  background: done ? '#1e1e1e' : '#e8c460',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
            {ex.reps && (
              <span style={{ color: done ? '#252525' : '#555', fontSize: 12, transition: 'color 0.3s' }}>
                × {ex.reps}
              </span>
            )}
          </div>
        </div>

        {/* Toggle */}
        <button onClick={() => onToggle(ex.id)} style={{
          width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
          border: done ? 'none' : '2px solid #1e1e1e',
          background: done ? '#4ade80' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.3s',
          boxShadow: done ? '0 0 22px rgba(74,222,128,0.45)' : 'none',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5"
              stroke={done ? '#000' : '#252525'}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Weight row — only shown when not done */}
      {!done && (
        <div style={{
          borderTop: '1px solid #161616', padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            {isNewPR
              ? <span style={{ color: '#c9a020', fontSize: 13, fontWeight: 700 }}>🏆 שיא אישי חדש!</span>
              : prevWeight
                ? <span style={{ color: '#333', fontSize: 12 }}>
                    קודם: <span style={{ color: '#484848', fontWeight: 600 }}>{prevWeight} ק"ג</span>
                  </span>
                : <span style={{ color: '#252525', fontSize: 12 }}>עדכן משקל</span>
            }
          </div>

          {editing ? (
            <input
              type="number" inputMode="decimal" autoFocus
              value={tempW}
              onChange={e => setTempW(e.target.value)}
              onBlur={commit}
              onKeyDown={e => e.key === 'Enter' && commit()}
              placeholder="0"
              style={{
                width: 88, background: '#161616', border: '1px solid #e8c460',
                color: '#fff', borderRadius: 10, padding: '9px 10px',
                fontSize: 17, textAlign: 'center', outline: 'none', fontWeight: 700,
              }}
            />
          ) : (
            <button onClick={() => { setTempW(weight || ''); setEditing(true) }} style={{
              background: weight ? 'rgba(232,196,96,0.1)' : '#161616',
              border: `1px solid ${weight ? 'rgba(232,196,96,0.35)' : '#222'}`,
              color: weight ? '#e8c460' : '#404040',
              borderRadius: 10, padding: '9px 18px', fontSize: 15,
              fontWeight: weight ? 800 : 500, cursor: 'pointer',
              minWidth: 88, textAlign: 'center',
              boxShadow: weight ? '0 0 12px rgba(232,196,96,0.1)' : 'none',
              transition: 'all 0.2s',
            }}>
              {weight ? `${weight} ק"ג` : '+ משקל'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Session view ──────────────────────────────────────────────────────────────

function SessionView({ session, setSession, weights, setWeights, history, addToHistory }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const prevWeights = useMemo(() => {
    const prev = history.find(h => h.dayId === session.dayId)
    if (!prev) return {}
    return Object.fromEntries(
      (prev.exercises || []).filter(e => e.weight).map(e => [e.id, e.weight])
    )
  }, [history, session.dayId])

  const prs = useMemo(() => {
    const map = {}
    history.forEach(h => {
      h.exercises?.forEach(ex => {
        if (ex.weight && ex.done !== false) {
          const w = parseFloat(ex.weight)
          if (!isNaN(w) && (!map[ex.id] || w > map[ex.id])) map[ex.id] = w
        }
      })
    })
    return map
  }, [history])

  const doneIds = new Set(session.doneIds || [])

  const toggle = useCallback((exId) => {
    setSession(prev => {
      const ids = new Set(prev.doneIds || [])
      if (ids.has(exId)) { ids.delete(exId) } else {
        ids.add(exId)
        if (navigator.vibrate) navigator.vibrate(15)
      }
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
  const allDone = doneCount === total && total > 0
  const pct = total > 0 ? (doneCount / total) * 100 : 0

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '18px 20px 0', flexShrink: 0, background: '#0a0a0a' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <p style={{ color: '#f0f0f0', fontSize: 19, fontWeight: 800, marginBottom: 5 }}>{session.dayLabel}</p>
            <p style={{
              fontSize: 13, fontWeight: 600, transition: 'color 0.3s',
              color: allDone ? '#4ade80' : '#3a3a3a',
            }}>
              {doneCount} / {total} תרגילים{allDone ? ' ✓' : ''}
            </p>
          </div>
          <button onClick={() => setSession(null)} style={{
            background: 'none', border: '1px solid #1e1e1e',
            color: '#3a3a3a', borderRadius: 12, padding: '8px 16px',
            fontSize: 13, cursor: 'pointer', marginTop: 2,
          }}>
            ביטול
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: '#111', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: 4, borderRadius: 2, width: `${pct}%`,
            background: allDone
              ? '#4ade80'
              : 'linear-gradient(90deg, #c9a020 0%, #e8c460 100%)',
            boxShadow: allDone
              ? '0 0 10px rgba(74,222,128,0.5)'
              : '0 0 8px rgba(232,196,96,0.3)',
            transition: 'width 0.5s ease, background 0.4s',
          }} />
        </div>
      </div>

      {/* Exercise list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 120px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {session.exercises.map(ex => (
          <ExerciseCard key={ex.id}
            ex={ex}
            done={doneIds.has(ex.id)}
            weight={weights[ex.id]}
            prevWeight={prevWeights[ex.id]}
            pr={prs[ex.id]}
            onToggle={toggle}
            onUpdateWeight={updateWeight}
          />
        ))}

        <button onClick={finish} style={{
          background: allDone ? '#4ade80' : '#e8c460',
          border: 'none', color: '#000',
          borderRadius: 18, padding: '18px 0',
          fontSize: 17, fontWeight: 900, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          marginTop: 6, transition: 'all 0.35s',
          boxShadow: allDone
            ? '0 6px 28px rgba(74,222,128,0.28)'
            : '0 6px 28px rgba(232,196,96,0.18)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L20 7" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {allDone ? '🎉 סיים אימון!' : 'סיים אימון'}
        </button>
      </div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function ActiveWorkout({ plan, history, weights, setWeights, addToHistory }) {
  const [session, setSession] = useLocalStorage('gym_active_session', null)
  const [justFinished, setJustFinished] = useState(false)

  const cleanSession = useMemo(() => {
    if (!session) return null
    if (session.exercises?.some(ex => Array.isArray(ex.sets))) return null
    return session
  }, [session])

  useEffect(() => {
    if (session && !cleanSession) setSession(null)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!plan) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" opacity="0.12">
          <path d="M6 12h12M3 9h2v6H3V9zm16 0h2v6h-2V9zM8 7h1v10H8V7zm7 0h1v10h-1V7z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>אין תוכנית עדיין</p>
        <p style={{ color: '#555', fontSize: 14, textAlign: 'center', lineHeight: 1.5 }}>צור תוכנית בלשונית "תוכנית" כדי להתחיל</p>
      </div>
    )
  }

  if (cleanSession) {
    return (
      <SessionView
        session={cleanSession}
        setSession={setSession}
        weights={weights}
        setWeights={setWeights}
        history={history}
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
            reps: ex.reps || '',
          })),
        })
      }}
    />
  )
}
