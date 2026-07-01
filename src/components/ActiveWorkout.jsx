import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { translateName, exCount } from '../utils/translations'

const IMG = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/'

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'לילה טוב'
  if (h < 12) return 'בוקר טוב'
  if (h < 18) return 'צהריים טובים'
  return 'ערב טוב'
}

// ─── Day selector ──────────────────────────────────────────────────────────────

function DaySelector({ plan, history, onStart }) {
  const lastFor = (dayId) => history.find(h => h.dayId === dayId)

  const nextDayIdx = useMemo(() => {
    if (!history.length) return 0
    const lastDayId = history[0].dayId
    const idx = plan.days.findIndex(d => d.id === lastDayId)
    return idx === -1 ? 0 : (idx + 1) % plan.days.length
  }, [plan, history])

  return (
    <div style={DS.wrap}>
      <div style={DS.greetBox}>
        <h2 style={DS.greetTitle}>{greeting()} 💪</h2>
        <p style={DS.greetSub}>{history.length ? 'האימון הבא שלך מחכה' : 'מוכן לאימון הראשון?'}</p>
      </div>

      <div style={DS.list}>
        {plan.days.map((day, i) => {
          const last = lastFor(day.id)
          const empty = day.exercises.length === 0
          const isNext = !empty && i === nextDayIdx
          const anim = { animation: 'cardIn 0.35s ease both', animationDelay: `${i * 60}ms` }

          if (isNext) return (
            <button key={day.id} onClick={() => onStart(day)} style={{ ...DS.nextCard, ...anim }}>
              <div style={DS.nextGlow} />
              <div style={{ ...DS.badge, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.22)' }}>
                <span style={{ color: '#4ade80', fontSize: 19, fontWeight: 900 }}>{day.id}</span>
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <p style={{ color: '#3aff7a', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', marginBottom: 4, textTransform: 'uppercase' }}>האימון הבא שלך</p>
                <p style={{ color: '#f0f0f0', fontSize: 16, fontWeight: 800, marginBottom: 3 }}>{day.label}</p>
                <p style={{ color: '#2d6040', fontSize: 12 }}>{last ? `אחרון: ${last.date}` : exCount(day.exercises.length)}</p>
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
              style={{ ...DS.dayBtn, opacity: empty ? 0.3 : 1, ...anim }}
              onClick={() => !empty && onStart(day)} disabled={empty}
            >
              <div style={DS.badge}>
                <span style={DS.badgeLetter}>{day.id}</span>
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <p style={DS.dayLabel}>{day.label}</p>
                <p style={DS.dayMeta}>{empty ? 'אין תרגילים' : last ? `אחרון: ${last.date}` : exCount(day.exercises.length)}</p>
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
  wrap: { flex: 1, overflowY: 'auto', padding: '24px 16px 36px' },
  greetBox: { marginBottom: 22, paddingRight: 4 },
  greetTitle: { color: '#f5f5f5', fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 5 },
  greetSub: { color: '#484848', fontSize: 14 },
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

function ExerciseCard({ ex, idx, done, weight, prevWeight, pr, onToggle, onUpdateWeight }) {
  const [editing, setEditing] = useState(false)
  const [tempW, setTempW] = useState('')
  const setsCount = typeof ex.sets === 'number' ? ex.sets : 4
  const isNewPR = pr && weight && parseFloat(weight) > pr
  const name = translateName(ex.id, ex.name)

  const commit = () => {
    if (tempW.trim()) onUpdateWeight(ex.id, tempW.trim())
    setEditing(false)
  }

  const nudge = (delta) => {
    const base = parseFloat(tempW) || parseFloat(prevWeight) || 0
    const next = Math.max(0, Math.round((base + delta) * 2) / 2)
    setTempW(String(next))
  }

  const borderColor = done
    ? 'rgba(74,222,128,0.18)'
    : isNewPR
      ? 'rgba(232,196,96,0.45)'
      : '#181818'

  return (
    <div style={{
      borderRadius: 20, border: `1px solid ${borderColor}`,
      background: done ? 'rgba(74,222,128,0.03)' : '#111',
      overflow: 'hidden',
      boxShadow: done ? '0 4px 24px rgba(74,222,128,0.06)' : isNewPR ? '0 4px 24px rgba(232,196,96,0.1)' : 'none',
      transition: 'border-color 0.35s, background 0.35s, box-shadow 0.35s',
      display: 'flex', alignItems: 'stretch',
      animation: 'cardIn 0.35s ease both', animationDelay: `${idx * 50}ms`,
    }}>

      {/* Right (RTL start): image + info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px 14px 0', flex: 1, minWidth: 0 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, overflow: 'hidden',
          flexShrink: 0, background: '#1a1a1a',
          opacity: done ? 0.15 : 1, transition: 'opacity 0.35s',
        }}>
          <img src={IMG + ex.image} alt={name} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            color: done ? '#2a2a2a' : '#f0f0f0',
            fontSize: 14, fontWeight: 700, marginBottom: 6, lineHeight: 1.35,
            textDecoration: done ? 'line-through' : 'none',
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            transition: 'color 0.3s',
          }}>
            {name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: Math.min(setsCount, 8) }).map((_, i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: 2,
                  background: done ? '#1e1e1e' : '#e8c460',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
            <span style={{ color: done ? '#222' : '#555', fontSize: 11, transition: 'color 0.3s' }}>
              {setsCount} סטים{ex.reps ? ` × ${ex.reps}` : ''}
            </span>
            {isNewPR && !done && (
              <span style={{ color: '#c9a020', fontSize: 11, fontWeight: 700 }}>🏆 שיא!</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ width: 1, background: '#161616', flexShrink: 0, margin: '10px 0' }} />

      {/* Middle: weight block */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 10px', gap: 4, flexShrink: 0 }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <input
              type="number" inputMode="decimal" autoFocus
              value={tempW}
              onChange={e => setTempW(e.target.value)}
              onBlur={commit}
              onKeyDown={e => e.key === 'Enter' && commit()}
              placeholder={prevWeight || '0'}
              style={{
                width: 74, background: '#161616', border: '1px solid #e8c460',
                color: '#fff', borderRadius: 10, padding: '8px 6px',
                fontSize: 20, textAlign: 'center', outline: 'none', fontWeight: 800,
              }}
            />
            <div style={{ display: 'flex', gap: 5 }}>
              {[-2.5, +2.5].map(d => (
                <button key={d}
                  onPointerDown={e => e.preventDefault()}
                  onClick={() => nudge(d)}
                  style={{
                    background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e8c460',
                    borderRadius: 8, padding: '4px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  }}>
                  {d > 0 ? `+${d}` : d}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={() => { if (!done) { setTempW(weight || prevWeight || ''); setEditing(true) } }}
            style={{
              background: done
                ? 'transparent'
                : weight
                  ? 'rgba(232,196,96,0.1)'
                  : 'rgba(232,196,96,0.06)',
              border: done
                ? 'none'
                : weight
                  ? '1px solid rgba(232,196,96,0.35)'
                  : '1px dashed rgba(232,196,96,0.25)',
              borderRadius: 12, padding: '8px 10px',
              cursor: done ? 'default' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              minWidth: 66,
            }}
          >
            {weight ? (
              <>
                <span style={{ color: done ? '#2a2a2a' : '#e8c460', fontSize: 22, fontWeight: 900, lineHeight: 1, transition: 'color 0.3s' }}>
                  {weight}
                </span>
                <span style={{ color: done ? '#222' : '#555', fontSize: 10 }}>ק"ג</span>
              </>
            ) : (
              <>
                <span style={{ color: '#e8c460', fontSize: 20, lineHeight: 1, opacity: 0.5 }}>+</span>
                <span style={{ color: '#555', fontSize: 10, fontWeight: 600 }}>משקל</span>
              </>
            )}
          </button>
        )}
        {prevWeight && !done && !editing && (
          <span style={{ color: '#2a2a2a', fontSize: 9, textAlign: 'center' }}>
            קודם: {prevWeight}
          </span>
        )}
      </div>

      <div style={{ width: 1, background: '#161616', flexShrink: 0, margin: '10px 0' }} />

      {/* End: done toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px' }}>
        <button onClick={() => onToggle(ex.id)} style={{
          width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
          border: done ? 'none' : '2px solid #1e1e1e',
          background: done ? '#4ade80' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.3s, border 0.3s, box-shadow 0.3s',
          boxShadow: done ? '0 0 20px rgba(74,222,128,0.5)' : 'none',
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5"
              stroke={done ? '#000' : '#1e1e1e'}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Finish celebration ────────────────────────────────────────────────────────

function FinishOverlay({ summary, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(4,4,4,0.88)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'fadeIn 0.25s ease',
    }}>
      <div style={{
        background: 'linear-gradient(165deg, #131a14 0%, #0c0c0c 55%)',
        border: '1px solid rgba(74,222,128,0.22)',
        borderRadius: 28, padding: '34px 26px 26px',
        width: '100%', maxWidth: 340, textAlign: 'center',
        animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: '0 24px 90px rgba(74,222,128,0.1)',
      }}>
        <div style={{ fontSize: 62, lineHeight: 1.1, animation: 'floatUp 1.8s ease-in-out infinite alternate' }}>
          {summary.newPRs > 0 ? '🏆' : '💪'}
        </div>
        <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: '14px 0 4px' }}>כל הכבוד!</h2>
        <p style={{ color: '#4a6b52', fontSize: 14, marginBottom: 22 }}>
          {summary.newPRs > 0 ? `שברת ${summary.newPRs === 1 ? 'שיא אישי' : `${summary.newPRs} שיאים אישיים`}!` : 'האימון נשמר בהיסטוריה'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: summary.newPRs > 0 ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8, marginBottom: 24 }}>
          <div style={FO.stat}>
            <p style={{ ...FO.statVal, color: '#4ade80' }}>{summary.doneCount}/{summary.total}</p>
            <p style={FO.statLabel}>תרגילים</p>
          </div>
          <div style={FO.stat}>
            <p style={{ ...FO.statVal, color: '#e8c460' }}>{summary.duration}</p>
            <p style={FO.statLabel}>דקות</p>
          </div>
          {summary.newPRs > 0 && (
            <div style={{ ...FO.stat, border: '1px solid rgba(232,196,96,0.25)', background: 'rgba(232,196,96,0.05)' }}>
              <p style={{ ...FO.statVal, color: '#f0c020' }}>{summary.newPRs} 🏆</p>
              <p style={FO.statLabel}>שיאים</p>
            </div>
          )}
        </div>

        <button onClick={onClose} style={{
          background: '#4ade80', border: 'none', color: '#000',
          borderRadius: 16, padding: '15px 0', width: '100%',
          fontSize: 16, fontWeight: 900, cursor: 'pointer',
          boxShadow: '0 8px 28px rgba(74,222,128,0.25)',
        }}>
          מעולה!
        </button>
      </div>
    </div>
  )
}

const FO = {
  stat: { background: 'rgba(255,255,255,0.03)', border: '1px solid #1c1c1c', borderRadius: 14, padding: '12px 6px' },
  statVal: { fontSize: 19, fontWeight: 900, marginBottom: 3 },
  statLabel: { color: '#3a3a3a', fontSize: 10, fontWeight: 600 },
}

// ─── Session view ──────────────────────────────────────────────────────────────

function SessionView({ session, setSession, weights, setWeights, history, addToHistory }) {
  const [elapsed, setElapsed] = useState(() => Math.max(0, Math.round((Date.now() - (session.startedAt || Date.now())) / 1000)))
  const [summary, setSummary] = useState(null)
  const [cancelArmed, setCancelArmed] = useState(false)
  const cancelTimer = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => () => clearTimeout(cancelTimer.current), [])

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
    const newPRs = session.exercises.filter(ex => {
      const w = parseFloat(weights[ex.id])
      return doneIds.has(ex.id) && !isNaN(w) && prs[ex.id] && w > prs[ex.id]
    }).length
    if (navigator.vibrate) navigator.vibrate([40, 60, 80])
    setSummary({
      duration: Math.round(elapsed / 60),
      doneCount: doneIds.size,
      total: session.exercises.length,
      newPRs,
    })
  }

  const saveAndClose = () => {
    addToHistory({
      id: Date.now(),
      date: new Date().toLocaleDateString('he-IL'),
      dayId: session.dayId,
      dayLabel: session.dayLabel,
      duration: summary.duration,
      exercises: session.exercises.map(ex => ({
        id: ex.id, name: ex.name, sets: ex.sets,
        weight: weights[ex.id] || '',
        done: doneIds.has(ex.id),
      })),
    })
  }

  const cancelTap = () => {
    if (cancelArmed) { setSession(null); return }
    setCancelArmed(true)
    clearTimeout(cancelTimer.current)
    cancelTimer.current = setTimeout(() => setCancelArmed(false), 2500)
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
          <button onClick={cancelTap} style={{
            background: cancelArmed ? 'rgba(220,60,60,0.12)' : 'none',
            border: `1px solid ${cancelArmed ? 'rgba(220,60,60,0.45)' : '#1e1e1e'}`,
            color: cancelArmed ? '#e05555' : '#3a3a3a',
            borderRadius: 12, padding: '8px 16px',
            fontSize: 13, fontWeight: cancelArmed ? 700 : 400,
            cursor: 'pointer', marginTop: 2, transition: 'all 0.2s',
          }}>
            {cancelArmed ? 'בטוח? האימון יימחק' : 'ביטול'}
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
        {session.exercises.map((ex, i) => (
          <ExerciseCard key={ex.id}
            ex={ex} idx={i}
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
          marginTop: 6, transition: 'background 0.35s, box-shadow 0.35s',
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

      {summary && <FinishOverlay summary={summary} onClose={saveAndClose} />}
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function ActiveWorkout({ plan, history, weights, setWeights, addToHistory }) {
  const [session, setSession] = useLocalStorage('gym_active_session', null)

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
        addToHistory={entry => { addToHistory(entry); setSession(null) }}
      />
    )
  }

  return (
    <DaySelector
      plan={plan} history={history}
      onStart={day => {
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
