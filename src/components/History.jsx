import { useMemo } from 'react'

function formatVol(kg) {
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${kg}ק"ג`
}

export default function History({ history }) {
  // Find all-time max weight per exercise for PR detection
  const allTimeMax = useMemo(() => {
    const maxes = {}
    history.forEach(s => s.exercises.forEach(ex => {
      const w = Math.max(...ex.sets.map(s => parseFloat(s.weight) || 0))
      if (!maxes[ex.id] || w > maxes[ex.id]) maxes[ex.id] = w
    }))
    return maxes
  }, [history])

  // Summary stats
  const stats = useMemo(() => {
    const totalSessions = history.length
    const totalVol = history.reduce((t, s) => t + (s.volume || 0), 0)
    const streak = calcStreak(history)
    return { totalSessions, totalVol, streak }
  }, [history])

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
      {/* Stats bar */}
      <div style={S.statsRow}>
        <StatCard value={stats.totalSessions} label="אימונים" />
        <StatCard value={formatVol(stats.totalVol)} label="נפח כולל" />
        <StatCard value={`${stats.streak}🔥`} label="רצף ימים" />
      </div>

      {/* Sessions */}
      {history.map(session => (
        <SessionCard key={session.id} session={session} allTimeMax={allTimeMax} />
      ))}
    </div>
  )
}

function StatCard({ value, label }) {
  return (
    <div style={S.stat}>
      <p style={S.statVal}>{value}</p>
      <p style={S.statLabel}>{label}</p>
    </div>
  )
}

function SessionCard({ session, allTimeMax }) {
  const hasVolume = session.volume > 0

  return (
    <div style={S.card}>
      {/* Card header */}
      <div style={S.cardTop}>
        <div style={S.cardLeft}>
          <span style={S.cardBadge}>{session.dayLabel?.charAt(4) || '?'}</span>
        </div>
        <div style={S.cardMid}>
          <p style={S.cardLabel}>{session.dayLabel}</p>
          <p style={S.cardMeta}>{session.date}</p>
        </div>
        <div style={S.cardRight}>
          {hasVolume && <p style={S.cardVol}>{formatVol(session.volume)}</p>}
          {session.duration > 0 && <p style={S.cardDur}>{session.duration} דק׳</p>}
        </div>
      </div>

      {/* Exercises */}
      <div style={S.exList}>
        {session.exercises?.map((ex, i) => {
          const maxW = Math.max(...(ex.sets || []).map(s => parseFloat(s.weight) || 0))
          const isPR = maxW > 0 && allTimeMax[ex.id] === maxW

          return (
            <div key={i} style={S.exRow}>
              <div style={S.exLeft}>
                <p style={S.exName}>{ex.name}</p>
                <div style={S.setChips}>
                  {(ex.sets || []).map((s, j) => (
                    <span key={j} style={S.chip}>
                      {s.weight ? `${s.weight}ק"ג` : '—'}×{s.reps || '—'}
                    </span>
                  ))}
                </div>
              </div>
              {isPR && (
                <span style={S.pr}>🏆 שיא</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function calcStreak(history) {
  if (!history.length) return 0
  const days = new Set(history.map(s => s.date))
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('he-IL')
    if (days.has(key)) streak++
    else if (i > 0) break
  }
  return streak
}

const S = {
  wrap: { flex: 1, overflowY: 'auto', padding: '16px 16px 24px' },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 700 },
  emptyHint: { color: '#555', fontSize: 14, textAlign: 'center', lineHeight: 1.5 },

  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 },
  stat: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '14px 12px', textAlign: 'center' },
  statVal: { color: '#e8c460', fontSize: 20, fontWeight: 800, marginBottom: 4 },
  statLabel: { color: '#555', fontSize: 11, fontWeight: 600 },

  card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 18, padding: 16, marginBottom: 12 },
  cardTop: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #1a1a1a' },
  cardLeft: { flexShrink: 0 },
  cardBadge: { width: 34, height: 34, borderRadius: 9, background: 'rgba(232,196,96,0.1)', border: '1px solid rgba(232,196,96,0.2)', color: '#e8c460', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardMid: { flex: 1 },
  cardLabel: { color: '#f0f0f0', fontSize: 14, fontWeight: 700, marginBottom: 2 },
  cardMeta: { color: '#555', fontSize: 12 },
  cardRight: { textAlign: 'left', flexShrink: 0 },
  cardVol: { color: '#e8c460', fontSize: 15, fontWeight: 800 },
  cardDur: { color: '#555', fontSize: 12, marginTop: 2 },

  exList: { display: 'flex', flexDirection: 'column', gap: 10 },
  exRow: { display: 'flex', alignItems: 'flex-start', gap: 8 },
  exLeft: { flex: 1 },
  exName: { color: '#bbb', fontSize: 13, fontWeight: 600, marginBottom: 5 },
  setChips: { display: 'flex', gap: 5, flexWrap: 'wrap' },
  chip: { background: '#1a1a1a', color: '#666', fontSize: 11, padding: '3px 8px', borderRadius: 6 },
  pr: { color: '#e8c460', fontSize: 12, fontWeight: 700, flexShrink: 0, paddingTop: 1 },
}
