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

  if (!history.length) {
    return (
      <div style={S.empty}>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" opacity="0.15">
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
      <div style={S.statsRow}>
        <div style={S.stat}>
          <p style={S.statVal}>{stats.total}</p>
          <p style={S.statLabel}>אימונים</p>
        </div>
        <div style={S.stat}>
          <p style={S.statVal}>{stats.streak}🔥</p>
          <p style={S.statLabel}>רצף ימים</p>
        </div>
      </div>

      {history.map(session => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  )
}

function SessionCard({ session }) {
  const dayLetter = session.dayId || session.dayLabel?.charAt(4) || '?'
  const doneCount = session.exercises?.filter(e => e.done !== false).length ?? session.exercises?.length ?? 0

  return (
    <div style={S.card}>
      <div style={S.cardTop}>
        <div style={S.badge}>
          <span style={S.badgeLetter}>{dayLetter}</span>
        </div>
        <div style={S.cardMid}>
          <p style={S.cardLabel}>{session.dayLabel}</p>
          <p style={S.cardMeta}>{session.date}{session.duration > 0 ? ` · ${session.duration} דק׳` : ''}</p>
        </div>
        <p style={S.cardCount}>{doneCount}/{session.exercises?.length ?? 0}</p>
      </div>

      <div style={S.exList}>
        {session.exercises?.map((ex, i) => (
          <div key={i} style={{ ...S.exRow, opacity: ex.done === false ? 0.4 : 1 }}>
            <span style={S.exName}>{ex.name}</span>
            <div style={S.exMeta}>
              <span style={S.exSets}>{ex.sets} סטים</span>
              {ex.weight && <span style={S.exWeight}>{ex.weight} ק"ג</span>}
            </div>
          </div>
        ))}
      </div>
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
  statVal: { color: '#e8c460', fontSize: 24, fontWeight: 800, marginBottom: 4 },
  statLabel: { color: '#555', fontSize: 11, fontWeight: 600 },

  card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 18, padding: 16, marginBottom: 12 },
  cardTop: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #1a1a1a' },
  badge: { width: 36, height: 36, borderRadius: 9, background: 'rgba(232,196,96,0.1)', border: '1px solid rgba(232,196,96,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  badgeLetter: { color: '#e8c460', fontSize: 14, fontWeight: 800 },
  cardMid: { flex: 1 },
  cardLabel: { color: '#f0f0f0', fontSize: 14, fontWeight: 700, marginBottom: 2 },
  cardMeta: { color: '#555', fontSize: 12 },
  cardCount: { color: '#555', fontSize: 13, fontWeight: 600, flexShrink: 0 },

  exList: { display: 'flex', flexDirection: 'column', gap: 8 },
  exRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, transition: 'opacity 0.2s' },
  exName: { color: '#bbb', fontSize: 13, fontWeight: 500 },
  exMeta: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  exSets: { color: '#444', fontSize: 12 },
  exWeight: { color: '#e8c460', fontSize: 12, fontWeight: 700 },
}
