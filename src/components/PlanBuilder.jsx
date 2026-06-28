import { useState, lazy, Suspense } from 'react'
import { SPLIT_CONFIGS } from '../utils/splits'

const ExerciseLibrary = lazy(() => import('./ExerciseLibrary'))

const IMAGE_BASE = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/'
const SPLIT_KEYS = Object.keys(SPLIT_CONFIGS)

export default function PlanBuilder({ plan, setPlan }) {
  const [expandedDay, setExpandedDay] = useState(null)
  const [addingToDay, setAddingToDay] = useState(null)
  const [editingDay, setEditingDay] = useState(null)

  const changeSplit = (key) => {
    const config = SPLIT_CONFIGS[key]
    const newDays = config.days.map(d => {
      const existing = plan?.days?.find(x => x.id === d.id)
      return existing ? { ...d, exercises: existing.exercises } : { ...d }
    })
    setPlan({ splitType: key, days: newDays })
  }

  const addExercise = (dayId, ex) => {
    setPlan(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId
          ? { ...d, exercises: [...d.exercises, { ...ex, _pid: Date.now() }] }
          : d
      ),
    }))
    setAddingToDay(null)
  }

  const removeExercise = (dayId, pid) => {
    setPlan(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.filter(e => e._pid !== pid) }
          : d
      ),
    }))
  }

  const renameDay = (dayId, label) => {
    setPlan(prev => ({
      ...prev,
      days: prev.days.map(d => d.id === dayId ? { ...d, label } : d),
    }))
  }

  const addDay = () => {
    const taken = new Set(plan.days.map(d => d.id))
    const nextId = 'ABCDEFGHIJ'.split('').find(c => !taken.has(c)) || `${plan.days.length + 1}`
    setPlan(prev => ({
      ...prev,
      days: [...prev.days, { id: nextId, label: `יום ${nextId}`, exercises: [] }],
    }))
  }

  const removeDay = (dayId) => {
    setPlan(prev => ({ ...prev, days: prev.days.filter(d => d.id !== dayId) }))
    if (expandedDay === dayId) setExpandedDay(null)
  }

  if (!plan) {
    return (
      <div style={S.empty}>
        <div style={S.emptyIcon}>🏋️</div>
        <p style={S.emptyText}>בחר סוג חלוקה כדי להתחיל</p>
        <div style={S.splitGrid}>
          {SPLIT_KEYS.map(key => (
            <button key={key} style={S.splitCard} onClick={() => changeSplit(key)}>
              {SPLIT_CONFIGS[key].label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={S.container}>
      {/* Split selector */}
      <div style={S.splitRow}>
        <span style={S.splitLabel}>חלוקה</span>
        <div style={S.selectWrap}>
          <select style={S.select} value={plan.splitType} onChange={e => changeSplit(e.target.value)}>
            {SPLIT_KEYS.map(k => (
              <option key={k} value={k}>{SPLIT_CONFIGS[k].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Days */}
      <div style={S.daysList}>
        {plan.days.map(day => {
          const isOpen = expandedDay === day.id
          return (
            <div key={day.id} style={S.dayCard}>
              <div style={S.dayHeader} onClick={() => setExpandedDay(isOpen ? null : day.id)}>
                {editingDay === day.id ? (
                  <input
                    style={S.labelInput}
                    value={day.label}
                    onChange={e => renameDay(day.id, e.target.value)}
                    onBlur={() => setEditingDay(null)}
                    onClick={e => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <span style={S.dayLabel}>{day.label}</span>
                )}
                <div style={S.dayMeta}>
                  <span style={S.exCount}>{day.exercises.length} תרגילים</span>
                  {plan.splitType === 'CUSTOM' && (
                    <>
                      <button style={S.iconBtn} onClick={e => { e.stopPropagation(); setEditingDay(day.id) }}>✏️</button>
                      <button style={S.iconBtn} onClick={e => { e.stopPropagation(); removeDay(day.id) }}>🗑️</button>
                    </>
                  )}
                  <span style={{ ...S.chevron, transform: isOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
                </div>
              </div>

              {isOpen && (
                <div style={S.dayBody}>
                  {day.exercises.length === 0 && (
                    <p style={S.noEx}>אין תרגילים — הוסף מהספרייה</p>
                  )}
                  {day.exercises.map(ex => (
                    <div key={ex._pid} style={S.exRow}>
                      <img src={IMAGE_BASE + ex.image} alt={ex.name} style={S.exThumb} loading="lazy" />
                      <span style={S.exName}>{ex.name}</span>
                      <button style={S.removeBtn} onClick={() => removeExercise(day.id, ex._pid)}>×</button>
                    </div>
                  ))}
                  <button style={S.addExBtn} onClick={() => setAddingToDay(day.id)}>
                    + הוסף תרגיל
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

      {addingToDay && (
        <Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8c460', fontSize: 16 }}>טוען...</div>}>
          <ExerciseLibrary
            onSelect={ex => addExercise(addingToDay, ex)}
            onClose={() => setAddingToDay(null)}
          />
        </Suspense>
      )}
    </div>
  )
}

const S = {
  container: { flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 0 },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  emptyIcon: { fontSize: 64 },
  emptyText: { color: '#888', fontSize: 17, textAlign: 'center', margin: 0 },
  splitGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', marginTop: 8 },
  splitCard: { background: '#111', border: '1px solid #2a2a2a', color: '#e8e8e8', borderRadius: 14, padding: '18px 12px', fontSize: 13, cursor: 'pointer', textAlign: 'center', lineHeight: 1.4 },
  splitRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 },
  splitLabel: { color: '#888', fontSize: 14, flexShrink: 0 },
  selectWrap: { flex: 1 },
  select: { width: '100%', background: '#111', border: '1px solid #2a2a2a', color: '#fff', borderRadius: 9, padding: '9px 12px', fontSize: 14, cursor: 'pointer', outline: 'none' },
  daysList: { display: 'flex', flexDirection: 'column', gap: 10 },
  dayCard: { background: '#111', borderRadius: 14, overflow: 'hidden', border: '1px solid #1e1e1e' },
  dayHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 14px', cursor: 'pointer', userSelect: 'none', gap: 10 },
  dayLabel: { color: '#f0f0f0', fontSize: 14, fontWeight: 600, flex: 1 },
  labelInput: { flex: 1, background: '#1a1a1a', border: '1px solid #e8c460', color: '#fff', borderRadius: 6, padding: '4px 8px', fontSize: 14, outline: 'none' },
  dayMeta: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  exCount: { color: '#e8c460', fontSize: 12 },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 2, fontSize: 15, lineHeight: 1 },
  chevron: { color: '#555', fontSize: 11, display: 'inline-block', transition: 'transform 0.2s' },
  dayBody: { padding: '2px 14px 14px', borderTop: '1px solid #1c1c1c' },
  noEx: { color: '#444', fontSize: 13, textAlign: 'center', padding: '14px 0', margin: 0 },
  exRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #181818' },
  exThumb: { width: 44, height: 44, borderRadius: 7, objectFit: 'cover', flexShrink: 0 },
  exName: { color: '#ddd', fontSize: 13, flex: 1 },
  removeBtn: { background: 'none', border: 'none', color: '#c0392b', fontSize: 22, cursor: 'pointer', padding: '0 2px', lineHeight: 1 },
  addExBtn: { background: '#e8c460', border: 'none', color: '#000', borderRadius: 10, padding: '11px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%', marginTop: 10 },
  addDayBtn: { background: 'none', border: '1px dashed #333', color: '#666', borderRadius: 14, padding: 16, fontSize: 14, cursor: 'pointer', width: '100%', textAlign: 'center', marginTop: 4 },
}
