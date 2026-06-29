import { useMemo } from 'react'

function calcStreak(history) {
  if (!history.length) return 0
  const days = new Set(history.map(s => s.date))
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (days.has(d.toLocaleDateString('he-IL'))) streak++
    else if (i > 0) break
  }
  return streak
}

export default function History({ history }) {
  const stats = useMemo(() => ({
    total: history.length,
    streak: calcStreak(history),
  }), [history])

  const prs = useMemo(() => {
    const map = {}
    history.forEach(session => {
      session.exercises?.forEach(ex => {
        if (ex.weight && ex.done !== false) {
          const w = parseFloat(ex.weight)
          if (!isNaN(w) && (!map[ex.id] || w > map[ex.id].weight)) {
            map[ex.id] = { name: ex.name, weight: w, date: session.date }
          }
        }
      })
    })
    return Object.values(map).sort((a, b) => b.weight - a.weight)
  }, [history])

  if (!history.length) {
    return (
      <div style={S.empty}>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" opacity="0.12">
          <path d="M12 6v6l4 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.5"/>
        </svg>
        <p style={S.emptyTitle}>אין היסטוריה עדיין</p>
        <p style={S.emptyHint}>סיים אימון ראשון כדי לראות את ההתקדמות שלך</p>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      {/* Stats */}
      <div style={S.statsRow}>
        <div style={{ ...S.stat, borderTop: '2px solid rgba(74,222,128,0.35)' }}>
          <p style={{ ...S.statVal, color: '#4ade80' }}>{stats.total}</p>
          <p style={S.statLabel}>אימונים</p>
        </div>
        <div style={{ ...S.stat, borderTop: '2px solid rgba(251,146,60,0.35)' }}>
          <p style={{ ...S.statVal, color: '#fb923c' }}>{stats.streak} 🔥</p>
          <p style={S.statLabel}>רצף ימים</p>
        </div>
      </div>

      {/* Personal Records */}
      {prs.length > 0 && (
        <div style={S.prSection}>
          <p style={S.sectionLabel}>שיאים אישיים 🏆</p>
          <div style={S.prScroll}>
            {prs.slice(0, 10).map((pr, i) => (
              <div key={pr.name + i} style={S.prCard}>
                {i < 3 && <span style={S.prMedal}>{['🥇','🥈','🥉'][i]}</span>}
                <span style={S.prWeight}>{pr.weight}</span>
                <span style={S.prUnit}>ק"ג</span>
                <span style={S.prName}>{pr.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions */}
      {history.map(session => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  )
}

function SessionCard({ session }) {
  const dayLetter = session.dayId || session.dayLabel?.charAt(4) || '?'
  const total = session.exercises?.length ?? 0
  const doneCount = session.exercises?.filter(e => e.done !== false).length ?? total
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0
  const allDone = pct === 100

  return (
    <div style={S.card}>
      <div style={S.cardTop}>
        <div style={{ ...S.badge, ...(allDone ? S.badgeDone : {}) }}>
          <span style={{ ...S.badgeLetter, ...(allDone ? { color: '#4ade80' } : {}) }}>{dayLetter}</span>
        </div>
        <div style={S.cardMid}>
          <p style={S.cardLabel}>{session.dayLabel}</p>
          <p style={S.cardMeta}>{session.date}{session.duration > 0 ? ` · ${session.duration} דק׳` : ''}</p>
        </div>
        <div style={S.cardRight}>
          <p style={{ ...S.cardCount, color: allDone ? '#4ade80' : '#555' }}>{doneCount}/{total}</p>
          <p style={{ ...S.cardPct, color: allDone ? '#4ade80' : '#444' }}>{pct}%</p>
        </div>
      </div>

      <div style={S.exList}>
        {session.exercises?.map((ex, i) => (
          <div key={i} style={{ ...S.exRow, opacity: ex.done === false ? 0.35 : 1 }}>
            <span style={{ ...S.exName, textDecoration: ex.done === false ? 'line-through' : 'none' }}>{ex.name}</span>
            <div style={S.exMeta}>
              <span style={S.exSets}>{ex.sets} סטים</span>
              {ex.weight && <span style={S.exWeight}>{ex.weight} ק"ג</span>}
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div style={S.prog}>
          <div style={{ ...S.progFill, width: `${pct}%`, background: allDone ? '#4ade80' : '#e8c460' }} />
        </div>
      )}
    </div>
  )
}

const S = {
  wrap: { flex: 1, overflowY: 'auto', padding: '16px 16px 24px' },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 700 },
  emptyHint: { color: '#555', fontSize: 14, textAlign: 'center', lineHeight: 1.5 },

  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 },
  stat: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '16px 12px', textAlign: 'center' },
  statVal: { fontSize: 26, fontWeight: 900, marginBottom: 4 },
  statLabel: { color: '#555', fontSize: 11, fontWeight: 600 },

  prSection: { marginBottom: 20 },
  sectionLabel: { color: '#555', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 10 },
  prScroll: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, msOverflowStyle: 'none' },
  prCard: {
    background: '#111', border: '1px solid #1e1e1e', borderRadius: 14,
    padding: '12px 14px', flexShrink: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 76,
  },
  prMedal: { fontSize: 14, lineHeight: 1.4 },
  prWeight: { color: '#e8c460', fontSize: 22, fontWeight: 900, lineHeight: 1.1 },
  prUnit: { color: '#555', fontSize: 10 },
  prName: { color: '#666', fontSize: 10, textAlign: 'center', maxWidth: 68, lineHeight: 1.3, marginTop: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },

  card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 18, padding: 16, marginBottom: 12 },
  cardTop: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #1a1a1a' },
  badge: { width: 36, height: 36, borderRadius: 9, background: 'rgba(232,196,96,0.08)', border: '1px solid rgba(232,196,96,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  badgeDone: { background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.22)' },
  badgeLetter: { color: '#e8c460', fontSize: 14, fontWeight: 800 },
  cardMid: { flex: 1 },
  cardLabel: { color: '#f0f0f0', fontSize: 14, fontWeight: 700, marginBottom: 2 },
  cardMeta: { color: '#555', fontSize: 12 },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0 },
  cardCount: { fontSize: 13, fontWeight: 700 },
  cardPct: { fontSize: 11, fontWeight: 600 },

  exList: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 },
  exRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  exName: { color: '#bbb', fontSize: 13, fontWeight: 500 },
  exMeta: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  exSets: { color: '#444', fontSize: 12 },
  exWeight: { color: '#e8c460', fontSize: 12, fontWeight: 700 },

  prog: { height: 3, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden', marginTop: 10 },
  progFill: { height: 3, borderRadius: 2, transition: 'width 0.4s ease' },
}
