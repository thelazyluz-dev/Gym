import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const IMAGE_BASE = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/'

export default function ActiveWorkout({ plan, addToHistory }) {
  const [session, setSession] = useLocalStorage('gym_active_session', null)
  const [done, setDone] = useState(false)

  if (!plan) {
    return (
      <div style={S.center}>
        <span style={S.bigIcon}>📋</span>
        <p style={S.hint}>צור תוכנית אימון בלשונית "תוכנית"</p>
      </div>
    )
  }

  const days = plan.days || []

  const startSession = (day) => {
    if (!day.exercises.length) return
    setSession({
      dayId: day.id,
      dayLabel: day.label,
      startedAt: Date.now(),
      exercises: day.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        image: ex.image,
        sets: [{ weight: '', reps: '' }],
      })),
    })
    setDone(false)
  }

  const updateSet = (ei, si, field, val) => {
    setSession(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i !== ei ? ex : {
          ...ex,
          sets: ex.sets.map((s, j) => j !== si ? s : { ...s, [field]: val }),
        }
      ),
    }))
  }

  const addSet = (ei) => {
    setSession(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i !== ei ? ex : { ...ex, sets: [...ex.sets, { weight: '', reps: '' }] }
      ),
    }))
  }

  const removeSet = (ei, si) => {
    setSession(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i !== ei ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== si) }
      ),
    }))
  }

  const finish = () => {
    if (!session) return
    const duration = Math.round((Date.now() - session.startedAt) / 60000)
    addToHistory({
      id: Date.now(),
      date: new Date().toLocaleDateString('he-IL'),
      dayLabel: session.dayLabel,
      duration,
      exercises: session.exercises
        .filter(ex => ex.sets.some(s => s.weight !== '' || s.reps !== ''))
        .map(ex => ({ ...ex })),
    })
    setSession(null)
    setDone(true)
  }

  // Day selector
  if (!session) {
    return (
      <div style={S.container}>
        {done && (
          <div style={S.banner}>
            💪 אימון נשמר! כל הכבוד
          </div>
        )}
        <p style={S.subtitle}>בחר יום לאימון</p>
        <div style={S.dayList}>
          {days.map(day => (
            <button
              key={day.id}
              style={{ ...S.dayBtn, ...(day.exercises.length === 0 ? S.dayBtnDisabled : {}) }}
              onClick={() => startSession(day)}
              disabled={day.exercises.length === 0}
            >
              <div style={S.dayBtnInner}>
                <span style={S.dayBtnLabel}>{day.label}</span>
                <span style={S.dayBtnCount}>
                  {day.exercises.length > 0 ? `${day.exercises.length} תרגילים` : 'ריק'}
                </span>
              </div>
              <span style={S.dayBtnArrow}>›</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Active session
  return (
    <div style={S.container}>
      <div style={S.sessionTop}>
        <div>
          <p style={S.sessionDayLabel}>{session.dayLabel}</p>
          <p style={S.sessionStatus}>אימון פעיל</p>
        </div>
        <button style={S.cancelBtn} onClick={() => setSession(null)}>ביטול</button>
      </div>

      <div style={S.exerciseList}>
        {session.exercises.map((ex, ei) => (
          <div key={ex.id + ei} style={S.exCard}>
            <div style={S.exTop}>
              <img src={IMAGE_BASE + ex.image} alt={ex.name} style={S.exThumb} loading="lazy" />
              <h3 style={S.exName}>{ex.name}</h3>
            </div>

            <div style={S.setsGrid}>
              <span style={S.colHead}>#</span>
              <span style={S.colHead}>משקל (ק״ג)</span>
              <span style={S.colHead}>חזרות</span>
              <span style={S.colHead} />

              {ex.sets.map((set, si) => (
                <>
                  <span key={`n${si}`} style={S.setNum}>{si + 1}</span>
                  <input
                    key={`w${si}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={set.weight}
                    onChange={e => updateSet(ei, si, 'weight', e.target.value)}
                    style={S.setInput}
                    placeholder="0"
                  />
                  <input
                    key={`r${si}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={set.reps}
                    onChange={e => updateSet(ei, si, 'reps', e.target.value)}
                    style={S.setInput}
                    placeholder="0"
                  />
                  <button
                    key={`x${si}`}
                    style={S.removeSet}
                    onClick={() => ex.sets.length > 1 && removeSet(ei, si)}
                    disabled={ex.sets.length === 1}
                  >
                    {ex.sets.length > 1 ? '×' : ''}
                  </button>
                </>
              ))}
            </div>

            <button style={S.addSetBtn} onClick={() => addSet(ei)}>+ הוסף סט</button>
          </div>
        ))}
      </div>

      <button style={S.finishBtn} onClick={finish}>סיים אימון 🏁</button>
    </div>
  )
}

const S = {
  container: { flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 },
  center: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 },
  bigIcon: { fontSize: 60 },
  hint: { color: '#666', fontSize: 16, textAlign: 'center', margin: 0 },
  banner: { background: '#1a2a1a', border: '1px solid #2d6a2d', color: '#5cb85c', borderRadius: 12, padding: '13px 16px', fontSize: 15, textAlign: 'center' },
  subtitle: { color: '#888', fontSize: 16, margin: 0 },
  dayList: { display: 'flex', flexDirection: 'column', gap: 10 },
  dayBtn: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '15px 14px', display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' },
  dayBtnDisabled: { opacity: 0.4, cursor: 'default' },
  dayBtnInner: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 },
  dayBtnLabel: { color: '#f0f0f0', fontSize: 14, fontWeight: 600 },
  dayBtnCount: { color: '#e8c460', fontSize: 12 },
  dayBtnArrow: { color: '#444', fontSize: 22 },
  sessionTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  sessionDayLabel: { color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 },
  sessionStatus: { color: '#e8c460', fontSize: 12, margin: '3px 0 0' },
  cancelBtn: { background: 'none', border: '1px solid #2a2a2a', color: '#888', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' },
  exerciseList: { display: 'flex', flexDirection: 'column', gap: 14 },
  exCard: { background: '#111', borderRadius: 14, padding: 14, border: '1px solid #1e1e1e' },
  exTop: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  exThumb: { width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 },
  exName: { color: '#f0f0f0', fontSize: 15, fontWeight: 600, margin: 0, flex: 1 },
  setsGrid: { display: 'grid', gridTemplateColumns: '28px 1fr 1fr 28px', gap: '6px 8px', alignItems: 'center', marginBottom: 10 },
  colHead: { color: '#444', fontSize: 11, textAlign: 'center' },
  setNum: { color: '#e8c460', fontSize: 14, fontWeight: 700, textAlign: 'center' },
  setInput: { background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', borderRadius: 8, padding: '9px 6px', fontSize: 15, textAlign: 'center', width: '100%', outline: 'none' },
  removeSet: { background: 'none', border: 'none', color: '#c0392b', fontSize: 20, cursor: 'pointer', textAlign: 'center', padding: 0, lineHeight: 1 },
  addSetBtn: { background: '#1a1a1a', border: '1px dashed #2a2a2a', color: '#666', borderRadius: 8, padding: '8px 0', fontSize: 13, cursor: 'pointer', width: '100%' },
  finishBtn: { background: '#e8c460', border: 'none', color: '#000', borderRadius: 14, padding: '16px 0', fontSize: 16, fontWeight: 700, cursor: 'pointer', flexShrink: 0 },
}
