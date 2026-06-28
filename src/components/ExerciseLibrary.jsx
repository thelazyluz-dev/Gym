import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import exercises from '../data/exercises.json'
import { translateCategory, translateEquipment, CATEGORY_HE, EQUIPMENT_HE } from '../utils/translations'

const IMAGE_BASE = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/'
const ITEM_H = 82

const ALL_CATEGORIES = [...new Set(exercises.map(e => e.category))].sort()
const ALL_EQUIPMENT = [...new Set(exercises.map(e => e.equipment))].sort()

// ─── Virtual list ─────────────────────────────────────────────────────────────

function VirtualList({ items, onSelect }) {
  const ref = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [height, setHeight] = useState(400)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setHeight(e.contentRect.height))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Reset scroll when list changes
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = 0
      setScrollTop(0)
    }
  }, [items])

  const overscan = 4
  const start = Math.max(0, Math.floor(scrollTop / ITEM_H) - overscan)
  const end = Math.min(items.length - 1, Math.ceil((scrollTop + height) / ITEM_H) + overscan)

  const onScroll = useCallback(e => setScrollTop(e.currentTarget.scrollTop), [])

  return (
    <div ref={ref} onScroll={onScroll} style={LS.container}>
      <div style={{ paddingTop: start * ITEM_H, paddingBottom: Math.max(0, (items.length - end - 1) * ITEM_H) }}>
        {items.slice(start, end + 1).map(ex => (
          <ExerciseRow key={ex.id} exercise={ex} onClick={onSelect} />
        ))}
      </div>
    </div>
  )
}

function ExerciseRow({ exercise, onClick }) {
  return (
    <div style={LS.row} onClick={() => onClick(exercise)}>
      <img
        src={IMAGE_BASE + exercise.image}
        alt={exercise.name}
        style={LS.thumb}
        loading="lazy"
      />
      <div style={LS.info}>
        <span style={LS.name}>{exercise.name}</span>
        <div style={LS.tags}>
          <span style={LS.tag}>{translateCategory(exercise.category)}</span>
          <span style={LS.tag}>{translateEquipment(exercise.equipment)}</span>
        </div>
      </div>
      <span style={LS.chevron}>›</span>
    </div>
  )
}

const LS = {
  container: { overflowY: 'auto', flex: 1 },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 16px',
    borderBottom: '1px solid #181818',
    cursor: 'pointer',
    height: ITEM_H,
    boxSizing: 'border-box',
  },
  thumb: { width: 58, height: 58, borderRadius: 8, objectFit: 'cover', flexShrink: 0 },
  info: { flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 },
  name: { color: '#e8e8e8', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tags: { display: 'flex', gap: 6 },
  tag: { background: '#222', color: '#888', fontSize: 11, padding: '2px 8px', borderRadius: 4 },
  chevron: { color: '#333', fontSize: 22, flexShrink: 0 },
}

// ─── Exercise detail ───────────────────────────────────────────────────────────

function ExerciseDetail({ exercise, onAdd, onBack }) {
  const [gifLoaded, setGifLoaded] = useState(false)

  return (
    <div style={DS.wrap}>
      <div style={DS.header}>
        <button style={DS.back} onClick={onBack}>חזרה</button>
        <h2 style={DS.title}>{exercise.name}</h2>
      </div>
      <div style={DS.body}>
        <div style={DS.gifBox}>
          {!gifLoaded && <div style={DS.placeholder}>⏳</div>}
          <img
            src={IMAGE_BASE + exercise.gif_url}
            alt={exercise.name}
            style={{ ...DS.gif, display: gifLoaded ? 'block' : 'none' }}
            onLoad={() => setGifLoaded(true)}
          />
        </div>
        <div style={DS.tags}>
          <span style={DS.tagGold}>{translateCategory(exercise.category)}</span>
          <span style={DS.tagGold}>{translateEquipment(exercise.equipment)}</span>
          {exercise.muscle_group && <span style={DS.tagGray}>{exercise.muscle_group}</span>}
        </div>
        {exercise.steps?.length > 0 && (
          <div style={DS.steps}>
            <p style={DS.stepsTitle}>הוראות ביצוע</p>
            <ol dir="ltr" style={DS.ol}>
              {exercise.steps.map((s, i) => <li key={i} style={DS.li}>{s}</li>)}
            </ol>
          </div>
        )}
      </div>
      <div style={DS.footer}>
        <button style={DS.addBtn} onClick={() => onAdd(exercise)}>הוסף לתוכנית</button>
      </div>
    </div>
  )
}

const DS = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%' },
  header: { display: 'flex', alignItems: 'center', gap: 12, padding: '18px 16px 12px', borderBottom: '1px solid #1c1c1c' },
  back: { background: 'none', border: 'none', color: '#e8c460', fontSize: 15, cursor: 'pointer', padding: 0, flexShrink: 0 },
  title: { color: '#fff', fontSize: 17, fontWeight: 700, margin: 0, flex: 1 },
  body: { flex: 1, overflowY: 'auto', padding: 16 },
  gifBox: { width: '100%', aspectRatio: '1', background: '#111', borderRadius: 12, overflow: 'hidden', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  placeholder: { color: '#555', fontSize: 30 },
  gif: { width: '100%', height: '100%', objectFit: 'contain' },
  tags: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 },
  tagGold: { background: '#e8c460', color: '#000', fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600 },
  tagGray: { background: '#222', color: '#aaa', fontSize: 12, padding: '4px 12px', borderRadius: 20 },
  steps: { background: '#111', borderRadius: 12, padding: '14px 16px' },
  stepsTitle: { color: '#888', fontSize: 13, fontWeight: 600, marginBottom: 10 },
  ol: { paddingInlineStart: 18, display: 'flex', flexDirection: 'column', gap: 8 },
  li: { color: '#ccc', fontSize: 13, lineHeight: 1.55 },
  footer: { padding: 16, borderTop: '1px solid #1c1c1c' },
  addBtn: { background: '#e8c460', border: 'none', color: '#000', borderRadius: 12, padding: '14px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer', width: '100%' },
}

// ─── Library overlay ───────────────────────────────────────────────────────────

export default function ExerciseLibrary({ onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('')
  const [eq, setEq] = useState('')
  const [detail, setDetail] = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return exercises.filter(ex => {
      if (cat && ex.category !== cat) return false
      if (eq && ex.equipment !== eq) return false
      if (q && !ex.name.toLowerCase().includes(q) && !(ex.muscle_group || '').toLowerCase().includes(q)) return false
      return true
    })
  }, [search, cat, eq])

  const handleAdd = (ex) => { onSelect(ex) }

  return (
    <div style={OV.overlay}>
      <div style={OV.sheet}>
        {detail ? (
          <ExerciseDetail exercise={detail} onAdd={handleAdd} onBack={() => setDetail(null)} />
        ) : (
          <>
            <div style={OV.header}>
              <h2 style={OV.title}>ספריית תרגילים</h2>
              <button style={OV.closeBtn} onClick={onClose}>✕</button>
            </div>
            <div style={OV.searchRow}>
              <input
                type="search"
                placeholder="חיפוש לפי שם או שריר..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={OV.searchInput}
                dir="rtl"
              />
            </div>
            <div style={OV.filterRow}>
              <div style={OV.selectWrap}>
                <select value={cat} onChange={e => setCat(e.target.value)} style={OV.select}>
                  <option value="">כל הקטגוריות</option>
                  {ALL_CATEGORIES.map(c => (
                    <option key={c} value={c}>{translateCategory(c)}</option>
                  ))}
                </select>
              </div>
              <div style={OV.selectWrap}>
                <select value={eq} onChange={e => setEq(e.target.value)} style={OV.select}>
                  <option value="">כל הציוד</option>
                  {ALL_EQUIPMENT.map(e => (
                    <option key={e} value={e}>{translateEquipment(e)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={OV.count}>{filtered.length} תרגילים</div>
            <VirtualList items={filtered} onSelect={setDetail} />
          </>
        )}
      </div>
    </div>
  )
}

const OV = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'flex-end' },
  sheet: { background: '#0d0d0d', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, margin: '0 auto', height: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 16px 12px', borderBottom: '1px solid #1c1c1c', flexShrink: 0 },
  title: { color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 },
  closeBtn: { background: '#1a1a1a', border: 'none', color: '#888', fontSize: 17, borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  searchRow: { padding: '10px 16px 6px', flexShrink: 0 },
  searchInput: { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', borderRadius: 10, padding: '10px 14px', fontSize: 15, outline: 'none', boxSizing: 'border-box' },
  filterRow: { display: 'flex', gap: 8, padding: '0 16px 8px', flexShrink: 0 },
  selectWrap: { flex: 1, position: 'relative' },
  select: { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', borderRadius: 8, padding: '8px 10px', fontSize: 13, cursor: 'pointer', outline: 'none' },
  count: { color: '#444', fontSize: 12, padding: '0 16px 6px', flexShrink: 0 },
}
