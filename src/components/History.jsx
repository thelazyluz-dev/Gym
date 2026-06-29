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
        <div style={S.emptyIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" opacity="0.4">
            <path d="M12 6v6l4 2" stroke="#e8c460" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="9" stroke="#e8c460" strokeWidth="1.8"/>
          </svg>
        </div>
        <p style={S.emptyTitle}>אין היסטוריה עדיין</p>
        <p style={S.emptyHint}>סיים אימון ראשון כדי לראות את ההתקדמות שלך</p>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      {/* Stats */}
      <div style={S.statsRow}>
        <div style={S.statCard}>
          <div style={{ ...S.statGlow, background: 'rgba(74,222,128,0.08)' }} />
          <p style={{ ...S.statVal, color: '#4ade80' }}>{stats.total}</p>
          <p style={S.statLabel}>אימונים</p>
        </div>
        <div style={S.statCard}>
          <div style={{ ...S.statGlow, background: 'rgba(251,146,60,0.08)' }} />
          <p style={{ ...S.statVal, color: '#fb923c' }}>{stats.streak}</p>
          <p style={S.statLabel}>רצף 🔥</p>
        </div>
      </div>

      {/* Personal Records */}
      {prs.length > 0 && (
        <div style={S.prSection}>
          <p style={S.sectionLabel}>שיאים אישיים 🏆</p>
          <div style={S.prScroll}>
            {prs.slice(0, 10).map((pr, i) => (
              <div key={pr.name + i} style={{
                ...S.prCard,
                borderColor: i === 0 ? 'rgba(255,215,0,0.25)' : i === 1 ? 'rgba(192,192,192,0.2)' : i === 2 ? 'rgba(205,127,50,0.2)' : '#1a1a1a',
                background: i === 0 ? 'rgba(255,215,0,0.04)' : i === 1 ? 'rgba(192,192,192,0.03)' : '#0f0f0f',
              }}>
                {i < 3 && <span style={S.prMedal}>{['🥇','🥈','🥉'][i]}</span>}
                <span style={{ ...S.prWeight, color: i === 0 ? '#f0c020' : i === 1 ? '#ccc' : '#e8c460' }}>{pr.weight}</span>
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

  const accentColor = allDone ? '#4ade80' : pct >= 50 ? '#e8c460' : '#555'

  return (
    <div style={{ ...S.card, borderLeftColor: allDone ? 'rgba(74,222,128,0.3)' : 'rgba(232,196,96,0.12)' }}>
      <div style={S.cardTop}>
        <div style={{ ...S.badge, background: allDone ? 'rgba(74,222,128,0.08)' : 'rgba(232,196,96,0.07)', border: `1px solid ${allDone ? 'rgba(74,222,128,0.2)' : 'rgba(232,196,96,0.14)'}` }}>
          <span style={{ ...S.badgeLetter, color: allDone ? '#4ade80' : '#e8c460' }}>{dayLetter}</span>
        </div>
        <div style={S.cardMid}>
          <p style={S.cardLabel}>{session.dayLabel}</p>
          <p style={S.cardMeta}>
            {session.date}
            {session.duration > 0 && <span style={{ color: '#2a2a2a' }}> · {session.duration} דק׳</span>}
          </p>
        </div>
        <div style={S.cardRight}>
          <p style={{ ...S.cardCount, color: accentColor }}>{doneCount}/{total}</p>
          <p style={{ ...S.cardPct, color: allDone ? '#4ade80' : '#333' }}>{pct}%</p>
        </div>
      </div>

      <div style={S.exList}>
        {session.exercises?.map((ex, i) => (
          <div key={i} style={{ ...S.exRow, opacity: ex.done === false ? 0.28 : 1 }}>
            <span style={{ ...S.exName, textDecoration: ex.done === false ? 'line-through' : 'none' }}>
              {ex.name}
            </span>
            <div style={S.exMeta}>
              <span style={S.exSets}>{ex.sets}×</span>
              {ex.weight && <span style={S.exWeight}>{ex.weight} ק"ג</span>}
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div style={S.prog}>
          <div style={{
            ...S.progFill,
            width: `${pct}%`,
            background: allDone
              ? 'linear-gradient(90deg, #3aff6a, #4ade80)'
              : 'linear-gradient(90deg, #c9a020, #e8c460)',
            boxShadow: allDone ? '0 0 6px rgba(74,222,128,0.4)' : 'none',
          }} />
        </div>
      )}
    </div>
  )
}

const S = {
  wrap: { flex: 1, overflowY: 'auto', padding: '16px 16px 28px' },
  empty: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32,
  },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 20,
    background: 'rgba(232,196,96,0.06)', border: '1px solid rgba(232,196,96,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { color: '#f0f0f0', fontSize: 18, fontWeight: 700 },
  emptyHint: { color: '#3a3a3a', fontSize: 14, textAlign: 'center', lineHeight: 1.6, maxWidth: 240 },

  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 },
  statCard: {
    background: '#0f0f0f', border: '1px solid #181818', borderRadius: 16,
    padding: '18px 12px', textAlign: 'center',
    position: 'relative', overflow: 'hidden',
  },
  statGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '16px 16px 0 0',
  },
  statVal: { fontSize: 30, fontWeight: 900, marginBottom: 4, letterSpacing: '-1px' },
  statLabel: { color: '#3a3a3a', fontSize: 11, fontWeight: 600 },

  prSection: { marginBottom: 20 },
  sectionLabel: { color: '#333', fontSize: 11, fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 10 },
  prScroll: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 },
  prCard: {
    background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 14,
    padding: '12px 14px', flexShrink: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 76,
    transition: 'all 0.2s',
  },
  prMedal: { fontSize: 14, lineHeight: 1.4, marginBottom: 2 },
  prWeight: { color: '#e8c460', fontSize: 22, fontWeight: 900, lineHeight: 1.1 },
  prUnit: { color: '#333', fontSize: 10, marginBottom: 4 },
  prName: {
    color: '#444', fontSize: 10, textAlign: 'center', maxWidth: 68,
    lineHeight: 1.3, overflow: 'hidden',
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
  },

  card: {
    background: '#0f0f0f', border: '1px solid #181818',
    borderLeft: '2px solid rgba(232,196,96,0.12)',
    borderRadius: 18, padding: '14px 16px', marginBottom: 10,
    animation: 'fadeIn 0.3s ease',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #161616' },
  badge: { width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  badgeLetter: { fontSize: 14, fontWeight: 800 },
  cardMid: { flex: 1 },
  cardLabel: { color: '#e0e0e0', fontSize: 14, fontWeight: 700, marginBottom: 3 },
  cardMeta: { color: '#3a3a3a', fontSize: 12 },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 },
  cardCount: { fontSize: 13, fontWeight: 700 },
  cardPct: { fontSize: 11, fontWeight: 600 },

  exList: { display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 10 },
  exRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  exName: { color: '#888', fontSize: 13, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  exMeta: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  exSets: { color: '#2e2e2e', fontSize: 12 },
  exWeight: { color: '#c9a020', fontSize: 12, fontWeight: 700 },

  prog: { height: 3, background: '#161616', borderRadius: 2, overflow: 'hidden' },
  progFill: { height: 3, borderRadius: 2, transition: 'width 0.5s ease' },
}
