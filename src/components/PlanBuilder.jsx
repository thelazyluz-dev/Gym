import { useState } from 'react'
import { SPLIT_CONFIGS } from '../utils/splits'
import ExerciseLibrary from './ExerciseLibrary'
import { getTemplate, GOALS } from '../utils/templates'
const IMG = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/'
const SPLIT_KEYS = Object.keys(SPLIT_CONFIGS)
const SPLIT_DESCS = {
  AB:     'חזה+כתפיים / גב+רגליים',
  ABC:    'חזה / גב+זרועות / רגליים',
  PPL:    'דחיפה / משיכה / רגליים / קרדיו',
  CUSTOM: 'בנה את התוכנית בעצמך',
}

export default function PlanBuilder({ plan, setPlan, onReset }) {
  const [expanded, setExpanded] = useState(null)
  const [adding, setAdding]     = useState(null)
  const [editing, setEditing]   = useState(null)

  const changeSplit = (key) => {
    const cfg = SPLIT_CONFIGS[key]
    const days = cfg.days.map(d => {
      const prev = plan?.days?.find(x => x.id === d.id)
      return prev ? { ...d, exercises: prev.exercises } : { ...d }
    })
    setPlan({ splitType: key, days })
  }

  const addExercise = (dayId, ex) => {
    setPlan(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id !== dayId ? d : { ...d, exercises: [...d.exercises, { ...ex, _pid: Date.now(), sets: 4 }] }
      ),
    }))
    setAdding(null)
  }

  const updateSets = (dayId, pid, delta) => {
    setPlan(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id !== dayId ? d : { ...d, exercises: d.exercises.map(e =>
          e._pid !== pid ? e : { ...e, sets: Math.max(1, (e.sets || 4) + delta) }
        )}
      ),
    }))
  }

  const removeExercise = (dayId, pid) => {
    setPlan(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id !== dayId ? d : { ...d, exercises: d.exercises.filter(e => e._pid !== pid) }
      ),
    }))
  }

  const renameDay = (dayId, label) => {
    setPlan(prev => ({ ...prev, days: prev.days.map(d => d.id === dayId ? { ...d, label } : d) }))
  }

  const addDay = () => {
    const taken = new Set(plan.days.map(d => d.id))
    const id = 'ABCDEFGHIJ'.split('').find(c => !taken.has(c)) || `${plan.days.length + 1}`
    setPlan(prev => ({ ...prev, days: [...prev.days, { id, label: `יום ${id}`, exercises: [] }] }))
  }

  const removeDay = (id) => {
    setPlan(prev => ({ ...prev, days: prev.days.filter(d => d.id !== id) }))
    if (expanded === id) setExpanded(null)
  }

  const applyTemplate = (dayId, goalId) => {
    const exs = getTemplate(plan.splitType, dayId, goalId)
    if (!exs.length) return
    setPlan(prev => ({
      ...prev,
      days: prev.days.map(d => d.id !== dayId ? d : { ...d, exercises: exs }),
    }))
  }

  // ── No plan: split picker ──────────────────────────────────────────────────

  if (!plan) {
    return (
      <div style={S.empty}>
        <div style={S.emptyTop}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" opacity="0.3">
            <path d="M6 12h12M3 9h2v6H3V9zm16 0h2v6h-2V9zM8 7h1v10H8V7zm7 0h1v10h-1V7z"
              stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p style={S.emptyTitle}>בחר חלוקת אימון</p>
          <p style={S.emptyHint}>ניתן לשנות בכל עת</p>
        </div>
        <div style={S.splitGrid}>
          {SPLIT_KEYS.map(key => (
            <button key={key} style={S.splitCard} onClick={() => changeSplit(key)}>
              <span style={S.splitDays}>{SPLIT_CONFIGS[key].days.length}</span>
              <span style={S.splitLabel}>{SPLIT_CONFIGS[key].label}</span>
              <span style={S.splitDesc}>{SPLIT_DESCS[key]}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Plan view ──────────────────────────────────────────────────────────────

  return (
    <div style={S.wrap}>
      {/* Split chips */}
      <div style={S.chipsRow}>
        {SPLIT_KEYS.map(k => (
          <button key={k}
            style={{ ...S.chip, ...(plan.splitType === k ? S.chipActive : {}) }}
            onClick={() => changeSplit(k)}>
            {SPLIT_CONFIGS[k].days.length}d
          </button>
        ))}
        <span style={S.splitName}>{SPLIT_CONFIGS[plan.splitType]?.label}</span>
        <button style={S.resetBtn} onClick={onReset}>אפס</button>
      </div>

      {/* Days */}
      <div style={S.days}>
        {plan.days.map(day => {
          const open = expanded === day.id
          const isCustom = plan.splitType === 'CUSTOM'
          return (
            <div key={day.id} style={S.dayCard}>
              {/* header */}
              <div style={S.dayHead} onClick={() => setExpanded(open ? null : day.id)}>
                <div style={S.dayBadge}><span style={S.dayLetter}>{day.id}</span></div>
                <div style={S.dayInfo}>
                  {editing === day.id ? (
                    <input autoFocus value={day.label}
                      onChange={e => renameDay(day.id, e.target.value)}
                      onBlur={() => setEditing(null)}
                      onClick={e => e.stopPropagation()}
                      style={S.editInput} />
                  ) : (
                    <span style={S.dayLabelTxt}>{day.label}</span>
                  )}
                  <span style={S.dayCount}>{day.exercises.length} תרגילים</span>
                </div>
                <div style={S.dayActions} onClick={e => e.stopPropagation()}>
                  {isCustom && <>
                    <button style={S.iconBtn} onClick={() => setEditing(day.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#555" strokeWidth="2" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#555" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                    <button style={S.iconBtn} onClick={() => removeDay(day.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </>}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                    <path d="M6 9l6 6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>

              {/* body */}
              {open && (
                <div style={S.dayBody}>
                  {day.exercises.length === 0 ? (
                    <div style={S.emptyDay}>
                      <p style={S.noEx}>בחר מטרה כדי לקבל תוכנית מומלצת</p>
                      <div style={S.goalRow}>
                        {GOALS.map(g => (
                          <button key={g.id} style={{ ...S.goalBtn, background: g.color, color: g.textColor }}
                            onClick={() => applyTemplate(day.id, g.id)}>
                            <span style={S.goalLabel}>{g.label}</span>
                            <span style={S.goalSub}>{g.sub}</span>
                            <span style={S.goalDesc}>{g.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : day.exercises.map(ex => (
                      <div key={ex._pid} style={S.exRow}>
                        <img src={IMG + ex.image} alt={ex.name} style={S.exThumb} loading="lazy" />
                        <div style={S.exInfo}>
                          <span style={S.exName}>{ex.name}</span>
                          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                            {ex.reps && <span style={S.exReps}>{ex.reps} חזרות</span>}
                            {ex.category && <span style={S.exCat}>{ex.category}</span>}
                          </div>
                        </div>
                        <div style={S.stepper} onClick={e => e.stopPropagation()}>
                          <button style={S.stepBtn} onClick={() => updateSets(day.id, ex._pid, -1)}>−</button>
                          <div style={S.stepCenter}>
                            <span style={S.stepNum}>{ex.sets || 4}</span>
                            <span style={S.stepLabel}>סטים</span>
                          </div>
                          <button style={S.stepBtn} onClick={() => updateSets(day.id, ex._pid, +1)}>+</button>
                        </div>
                        <button style={S.removeBtn} onClick={() => removeExercise(day.id, ex._pid)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    ))
                  }
                  <button style={S.addExBtn} onClick={() => setAdding(day.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/></svg>
                    הוסף / שנה תרגיל
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {plan.splitType === 'CUSTOM' && (
          <button style={S.addDayBtn} onClick={addDay}>+ הוסף יום</button>
        )}
      </div>

      {adding && (
        <ExerciseLibrary
          onSelect={ex => addExercise(adding, ex)}
          onClose={() => setAdding(null)}
        />
      )}
    </div>
  )
}

const S = {
  wrap: { flex: 1, overflowY: 'auto', padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 0 },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 },
  emptyTop: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: 800 },
  emptyHint: { color: '#555', fontSize: 14 },
  splitGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' },
  splitCard: {
    background: '#111', border: '1px solid #1e1e1e', borderRadius: 18,
    padding: '20px 16px', cursor: 'pointer', textAlign: 'center',
    display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center',
  },
  splitDays: { color: '#e8c460', fontSize: 32, fontWeight: 900, lineHeight: 1 },
  splitLabel: { color: '#888', fontSize: 12, lineHeight: 1.4 },
  splitDesc: { color: '#3a3a3a', fontSize: 11, lineHeight: 1.4, textAlign: 'center' },

  chipsRow: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18, flexWrap: 'nowrap', overflowX: 'auto' },
  chip: { background: '#1a1a1a', border: '1px solid #222', color: '#666', borderRadius: 50, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 },
  chipActive: { background: 'rgba(232,196,96,0.12)', border: '1px solid rgba(232,196,96,0.35)', color: '#e8c460' },
  splitName: { color: '#333', fontSize: 12, flexShrink: 0 },

  days: { display: 'flex', flexDirection: 'column', gap: 10 },
  dayCard: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 18, overflow: 'hidden' },
  dayHead: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', userSelect: 'none' },
  dayBadge: { width: 36, height: 36, borderRadius: 9, background: 'rgba(232,196,96,0.1)', border: '1px solid rgba(232,196,96,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  dayLetter: { color: '#e8c460', fontSize: 15, fontWeight: 800 },
  dayInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  dayLabelTxt: { color: '#f0f0f0', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  dayCount: { color: '#555', fontSize: 11 },
  dayActions: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  editInput: { background: '#1a1a1a', border: '1px solid #e8c460', color: '#fff', borderRadius: 7, padding: '4px 8px', fontSize: 14, outline: 'none', width: '100%' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  dayBody: { padding: '0 16px 16px', borderTop: '1px solid #181818' },
  emptyDay: { paddingTop: 12 },
  noEx: { color: '#555', fontSize: 12, textAlign: 'center', marginBottom: 10 },
  goalRow: { display: 'flex', gap: 8, marginBottom: 4 },
  goalBtn: { flex: 1, border: 'none', borderRadius: 14, padding: '14px 6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
  goalLabel: { fontSize: 16, fontWeight: 900, lineHeight: 1 },
  goalSub: { fontSize: 12, fontWeight: 700, opacity: 0.85 },
  goalDesc: { fontSize: 10, opacity: 0.65 },
  exRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #161616' },
  exThumb: { width: 42, height: 42, borderRadius: 8, objectFit: 'cover', flexShrink: 0 },
  exInfo: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 },
  exName: { color: '#ddd', fontSize: 13, marginBottom: 3 },
  exReps: { color: '#444', fontSize: 11 },
  exCat: { color: '#2a2a2a', fontSize: 10, background: '#1a1a1a', borderRadius: 5, padding: '1px 6px' },
  stepper: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  stepBtn: { width: 28, height: 28, borderRadius: 7, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e8c460', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
  stepCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 30 },
  stepNum: { color: '#ccc', fontSize: 15, fontWeight: 800, lineHeight: 1 },
  stepLabel: { color: '#333', fontSize: 9, fontWeight: 600 },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  addExBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    background: '#e8c460', border: 'none', color: '#000',
    borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', width: '100%', marginTop: 12,
  },
  addDayBtn: { background: 'none', border: '1px dashed #222', color: '#555', borderRadius: 18, padding: 16, fontSize: 14, cursor: 'pointer', width: '100%', textAlign: 'center', marginTop: 4 },
  resetBtn: { background: 'none', border: '1px solid #2a2a2a', color: '#444', borderRadius: 50, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, marginRight: 'auto' },
}
