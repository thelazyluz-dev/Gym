export default function History({ history }) {
  if (!history.length) {
    return (
      <div style={S.center}>
        <span style={S.icon}>📊</span>
        <p style={S.hint}>אין היסטוריה עדיין — צא לאימון!</p>
      </div>
    )
  }

  return (
    <div style={S.container}>
      <p style={S.heading}>היסטוריית אימונים</p>
      {history.map(session => (
        <div key={session.id} style={S.card}>
          <div style={S.cardHeader}>
            <div>
              <p style={S.cardLabel}>{session.dayLabel}</p>
              <p style={S.cardDate}>{session.date}</p>
            </div>
            {!!session.duration && (
              <span style={S.duration}>{session.duration} דק׳</span>
            )}
          </div>

          {session.exercises.map((ex, i) => (
            <div key={i} style={S.exRow}>
              <p style={S.exName}>{ex.name}</p>
              <div style={S.setsList}>
                {ex.sets.map((s, j) => (
                  <span key={j} style={S.setChip}>
                    {s.weight ? `${s.weight}ק"ג` : '—'}×{s.reps || '—'}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

const S = {
  container: { flex: 1, overflowY: 'auto', padding: 16 },
  center: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 },
  icon: { fontSize: 60 },
  hint: { color: '#666', fontSize: 16, textAlign: 'center', margin: 0 },
  heading: { color: '#888', fontSize: 14, marginBottom: 14 },
  card: { background: '#111', borderRadius: 14, padding: '14px', marginBottom: 12, border: '1px solid #1e1e1e' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 12, marginBottom: 10, borderBottom: '1px solid #1c1c1c' },
  cardLabel: { color: '#f0f0f0', fontSize: 15, fontWeight: 700, margin: 0 },
  cardDate: { color: '#666', fontSize: 12, margin: '3px 0 0' },
  duration: { color: '#e8c460', fontSize: 13, fontWeight: 600 },
  exRow: { marginBottom: 10 },
  exName: { color: '#bbb', fontSize: 13, fontWeight: 500, margin: '0 0 5px' },
  setsList: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  setChip: { background: '#1a1a1a', color: '#777', fontSize: 12, padding: '3px 9px', borderRadius: 6 },
}
