import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import exercises from '../data/exercises.json'
import { translateCategory, translateEquipment } from '../utils/translations'
import { POPULAR_IDS } from '../utils/templates'

const IMG = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/'
const ITEM_H = 78

const CATS = [...new Set(exercises.map(e => e.category))].sort()
const EQS  = [...new Set(exercises.map(e => e.equipment))].sort()

// ─── Virtual list ──────────────────────────────────────────────────────────────

function VirtualList({ items, onSelect }) {
  const ref = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [height, setHeight]       = useState(400)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setHeight(e.contentRect.height))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (ref.current) { ref.current.scrollTop = 0; setScrollTop(0) }
  }, [items])

  const overscan = 4
  const start = Math.max(0, Math.floor(scrollTop / ITEM_H) - overscan)
  const end   = Math.min(items.length - 1, Math.ceil((scrollTop + height) / ITEM_H) + overscan)
  const onScroll = useCallback(e => setScrollTop(e.currentTarget.scrollTop), [])

  return (
    <div ref={ref} onScroll={onScroll} style={{ overflowY: 'auto', flex: 1 }}>
      <div style={{ paddingTop: start * ITEM_H, paddingBottom: Math.max(0, (items.length - end - 1) * ITEM_H) }}>
        {items.slice(start, end + 1).map(ex => (
          <div key={ex.id} onClick={() => onSelect(ex)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid #141414', cursor: 'pointer', height: ITEM_H, boxSizing: 'border-box' }}>
            <img src={IMG + ex.image} alt={ex.name} loading="lazy"
              style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0, background: '#1a1a1a' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#f0f0f0', fontSize: 14, fontWeight: 600, marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</p>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ background: '#1e1e1e', color: '#888', fontSize: 11, padding: '2px 8px', borderRadius: 6 }}>{translateCategory(ex.category)}</span>
                <span style={{ background: '#1e1e1e', color: '#888', fontSize: 11, padding: '2px 8px', borderRadius: 6 }}>{translateEquipment(ex.equipment)}</span>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M15 18l-6-6 6-6" stroke="#2a2a2a" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Exercise detail ───────────────────────────────────────────────────────────

function Detail({ ex, onAdd, onBack }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 16px 14px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#e8c460', fontSize: 15, cursor: 'pointer', padding: 0 }}>חזרה</button>
        <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, flex: 1, margin: 0 }}>{ex.name}</p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ width: '100%', aspectRatio: '1', background: '#111', borderRadius: 16, overflow: 'hidden', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!loaded && <span style={{ color: '#333', fontSize: 28 }}>⏳</span>}
          <img src={IMG + ex.gif_url} alt={ex.name} onLoad={() => setLoaded(true)}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: loaded ? 'block' : 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{ background: '#e8c460', color: '#000', fontSize: 12, padding: '5px 13px', borderRadius: 20, fontWeight: 700 }}>{translateCategory(ex.category)}</span>
          <span style={{ background: '#e8c460', color: '#000', fontSize: 12, padding: '5px 13px', borderRadius: 20, fontWeight: 700 }}>{translateEquipment(ex.equipment)}</span>
          {ex.muscle_group && <span style={{ background: '#1e1e1e', color: '#888', fontSize: 12, padding: '5px 13px', borderRadius: 20 }}>{ex.muscle_group}</span>}
        </div>
        {ex.steps?.length > 0 && (
          <div style={{ background: '#111', borderRadius: 14, padding: 16 }}>
            <p style={{ color: '#555', fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>הוראות ביצוע</p>
            <ol dir="ltr" style={{ paddingInlineStart: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ex.steps.map((s, i) => <li key={i} style={{ color: '#ccc', fontSize: 13, lineHeight: 1.6 }}>{s}</li>)}
            </ol>
          </div>
        )}
      </div>
      <div style={{ padding: 16, borderTop: '1px solid #1a1a1a', flexShrink: 0 }}>
        <button onClick={() => onAdd(ex)}
          style={{ background: '#e8c460', border: 'none', color: '#000', borderRadius: 14, padding: '15px 0', fontSize: 16, fontWeight: 800, cursor: 'pointer', width: '100%' }}>
          הוסף לתוכנית
        </button>
      </div>
    </div>
  )
}

// ─── Chip ──────────────────────────────────────────────────────────────────────

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? '#e8c460' : '#161616',
      color: active ? '#000' : '#666',
      border: active ? 'none' : '1px solid #222',
      borderRadius: 50, padding: '7px 14px', fontSize: 12,
      fontWeight: active ? 700 : 500, whiteSpace: 'nowrap',
      flexShrink: 0, cursor: 'pointer',
    }}>{label}</button>
  )
}

// ─── Main overlay ──────────────────────────────────────────────────────────────

export default function ExerciseLibrary({ onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const [cat, setCat]       = useState('')
  const [eq, setEq]         = useState('')
  const [detail, setDetail] = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return exercises.filter(ex => {
      if (cat === '__popular__' && !POPULAR_IDS.has(ex.id)) return false
      if (cat && cat !== '__popular__' && ex.category !== cat) return false
      if (eq  && ex.equipment !== eq)  return false
      if (q && !ex.name.toLowerCase().includes(q) && !(ex.muscle_group || '').toLowerCase().includes(q)) return false
      return true
    })
  }, [search, cat, eq])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: '#0d0d0d', borderRadius: '22px 22px 0 0', width: '100%', maxWidth: 480, margin: '0 auto', height: '93vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideUp 0.25s ease' }}>
        {detail ? (
          <Detail ex={detail} onAdd={ex => { onSelect(ex); setDetail(null) }} onBack={() => setDetail(null)} />
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 16px 14px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
              <p style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>ספריית תרגילים</p>
              <button onClick={onClose}
                style={{ background: '#1a1a1a', border: 'none', color: '#666', fontSize: 17, borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Search */}
            <div style={{ padding: '12px 16px 8px', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="7" stroke="#444" strokeWidth="2"/>
                  <path d="M20 20l-3-3" stroke="#444" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input type="search" placeholder="חיפוש לפי שם או שריר..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  dir="rtl" style={{ width: '100%', background: '#161616', border: '1px solid #222', color: '#fff', borderRadius: 12, padding: '11px 40px 11px 14px', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Category chips */}
            <div style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '0 16px 10px', flexShrink: 0, msOverflowStyle: 'none' }}>
              <Chip label="הכל" active={cat === ''} onClick={() => setCat('')} />
              <Chip label="פופולרי 🔥" active={cat === '__popular__'} onClick={() => setCat(cat === '__popular__' ? '' : '__popular__')} />
              {CATS.map(c => <Chip key={c} label={translateCategory(c)} active={cat === c} onClick={() => setCat(cat === c ? '' : c)} />)}
            </div>

            {/* Equipment + count row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px 10px', flexShrink: 0 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <select value={eq} onChange={e => setEq(e.target.value)}
                  style={{ width: '100%', background: '#161616', border: '1px solid #222', color: eq ? '#fff' : '#555', borderRadius: 10, padding: '9px 12px', fontSize: 13, cursor: 'pointer', outline: 'none', appearance: 'none' }}>
                  <option value="">כל הציוד</option>
                  {EQS.map(e => <option key={e} value={e}>{translateEquipment(e)}</option>)}
                </select>
              </div>
              <span style={{ color: '#333', fontSize: 12, flexShrink: 0 }}>{filtered.length} תרגילים</span>
            </div>

            <VirtualList items={filtered} onSelect={setDetail} />
          </>
        )}
      </div>
    </div>
  )
}
