import { useState } from 'react'
import { SPLIT_CONFIGS } from '../utils/splits'
import { getTemplate, GOALS } from '../utils/templates'

const FREQ = [
  { split: 'AB',  n: 2, label: '2 ימים',  desc: 'A/B — חזה, גב ורגליים' },
  { split: 'ABC', n: 3, label: '3 ימים',  desc: 'A/B/C — שלוש קבוצות שרירים' },
  { split: 'PPL', n: 4, label: '4 ימים',  desc: 'Push / Pull / Legs + קרדיו' },
]

function buildPlan(splitKey, goalId) {
  const cfg = SPLIT_CONFIGS[splitKey]
  return {
    splitType: splitKey,
    days: cfg.days.map(d => ({
      ...d,
      exercises: getTemplate(splitKey, d.id, goalId),
    })),
  }
}

function Dots({ total, current }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          height: 6, borderRadius: 3,
          width: i === current ? 20 : 6,
          background: i <= current ? '#e8c460' : '#1e1e1e',
          transition: 'all 0.3s',
        }} />
      ))}
    </div>
  )
}

export default function Onboarding({ onComplete }) {
  const [step, setStep]     = useState(0)
  const [level, setLevel]   = useState(null)
  const [split, setSplit]   = useState(null)
  const [goalId, setGoalId] = useState(null)

  // ── Step 0: level ──────────────────────────────────────────────────────────
  if (step === 0) return (
    <div style={S.screen}>
      <div style={S.hero}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
          <path d="M6 12h12M3 9h2v6H3V9zm16 0h2v6h-2V9zM8 7h1v10H8V7zm7 0h1v10h-1V7z"
            stroke="#e8c460" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <h1 style={S.heroTitle}>ברוכים הבאים!</h1>
        <p style={S.heroSub}>מה רמת הניסיון שלך בחדר כושר?</p>
      </div>
      <div style={S.twoCol}>
        {[
          { key: 'beginner', emoji: '🌱', name: 'מתחיל',  hint: 'אדריך אותך ואציע תוכנית מותאמת אישית' },
          { key: 'advanced', emoji: '💪', name: 'מתקדם',  hint: 'יודע מה לעשות, רוצה לעקוב אחרי ההתקדמות' },
        ].map(lv => (
          <button key={lv.key} style={S.levelCard}
            onClick={() => { setLevel(lv.key); setStep(1) }}>
            <span style={S.bigEmoji}>{lv.emoji}</span>
            <span style={S.levelName}>{lv.name}</span>
            <span style={S.levelHint}>{lv.hint}</span>
          </button>
        ))}
      </div>
    </div>
  )

  // ── Step 1: frequency ──────────────────────────────────────────────────────
  if (step === 1) return (
    <div style={S.screen}>
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={() => setStep(0)}>חזרה</button>
        <Dots total={2} current={0} />
        <div style={{ width: 46 }} />
      </div>
      <h2 style={S.question}>כמה ימים בשבוע<br/>תוכל להתאמן?</h2>
      <div style={S.optList}>
        {FREQ.map(f => (
          <button key={f.split} style={S.optCard}
            onClick={() => { setSplit(f.split); setStep(2) }}>
            <span style={S.optNum}>{f.n}</span>
            <div style={S.optText}>
              <span style={S.optLabel}>{f.label}</span>
              <span style={S.optDesc}>{f.desc}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  )

  // ── Step 2: goal ───────────────────────────────────────────────────────────
  if (step === 2) return (
    <div style={S.screen}>
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={() => setStep(1)}>חזרה</button>
        <Dots total={2} current={1} />
        <div style={{ width: 46 }} />
      </div>
      <h2 style={S.question}>מה המטרה שלך?</h2>
      <div style={S.optList}>
        {GOALS.map(g => (
          <button key={g.id}
            style={{ ...S.goalCard, background: g.color, color: g.textColor }}
            onClick={() => {
              setGoalId(g.id)
              if (level === 'beginner') {
                onComplete(buildPlan(split, g.id), 'workout')
              } else {
                setStep(3)
              }
            }}>
            <div style={S.goalInfo}>
              <span style={S.goalName}>{g.label}</span>
              <span style={S.goalSets}>{g.sub}</span>
              <span style={S.goalDescT}>{g.desc}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6"
                stroke={g.textColor === '#fff' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}
                strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  )

  // ── Step 3 (advanced): confirm ─────────────────────────────────────────────
  return (
    <div style={S.screen}>
      <button style={{ ...S.backBtn, alignSelf: 'flex-start', marginBottom: 0 }} onClick={() => setStep(2)}>חזרה</button>
      <div style={{ ...S.hero, flex: 1 }}>
        <span style={{ fontSize: 64, lineHeight: 1.2 }}>🎉</span>
        <h2 style={S.heroTitle}>הכל מוכן!</h2>
        <p style={S.heroSub}>יצרנו תוכנית אימון מותאמת אישית בשבילך</p>
      </div>
      <div style={S.confirmBtns}>
        <button style={S.primaryBtn}
          onClick={() => onComplete(buildPlan(split, goalId), 'workout')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L20 7" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          השתמש בתוכנית המומלצת
        </button>
        <button style={S.secondaryBtn}
          onClick={() => {
            const cfg = SPLIT_CONFIGS[split]
            onComplete({ splitType: split, days: cfg.days.map(d => ({ ...d })) }, 'plan')
          }}>
          אני רוצה לבנות את התוכנית בעצמי
        </button>
      </div>
    </div>
  )
}

const S = {
  screen: {
    flex: 1, display: 'flex', flexDirection: 'column',
    padding: '20px 20px 36px', overflowY: 'auto',
    animation: 'fadeIn 0.25s ease',
  },

  hero: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 10, paddingTop: 40, paddingBottom: 36, textAlign: 'center',
  },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: 900 },
  heroSub: { color: '#666', fontSize: 15, lineHeight: 1.6, maxWidth: 260 },

  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 24, flexShrink: 0,
  },
  backBtn: {
    background: 'none', border: 'none', color: '#e8c460',
    fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0,
  },

  question: { color: '#fff', fontSize: 22, fontWeight: 800, textAlign: 'center', lineHeight: 1.4, marginBottom: 20 },

  twoCol: { display: 'flex', gap: 12 },
  levelCard: {
    flex: 1, background: '#111', border: '1px solid #1e1e1e',
    borderRadius: 22, padding: '26px 12px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 8, textAlign: 'center',
  },
  bigEmoji: { fontSize: 42, lineHeight: 1.1 },
  levelName: { color: '#f0f0f0', fontSize: 17, fontWeight: 800 },
  levelHint: { color: '#555', fontSize: 12, lineHeight: 1.5 },

  optList: { display: 'flex', flexDirection: 'column', gap: 10 },
  optCard: {
    background: '#111', border: '1px solid #1e1e1e', borderRadius: 16,
    padding: '14px 16px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 14,
  },
  optNum: { color: '#e8c460', fontSize: 34, fontWeight: 900, flexShrink: 0, minWidth: 36, textAlign: 'center' },
  optText: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'right' },
  optLabel: { color: '#f0f0f0', fontSize: 15, fontWeight: 700 },
  optDesc: { color: '#555', fontSize: 12 },

  goalCard: {
    border: 'none', borderRadius: 16, padding: '16px 18px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 12,
  },
  goalInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'right' },
  goalName: { fontSize: 18, fontWeight: 900 },
  goalSets: { fontSize: 13, fontWeight: 700, opacity: 0.85 },
  goalDescT: { fontSize: 11, opacity: 0.65 },

  confirmBtns: { display: 'flex', flexDirection: 'column', gap: 12 },
  primaryBtn: {
    background: '#e8c460', border: 'none', color: '#000',
    borderRadius: 16, padding: '16px 0', fontSize: 16, fontWeight: 800,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  secondaryBtn: {
    background: 'none', border: '1px solid #242424', color: '#666',
    borderRadius: 16, padding: '14px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
}
