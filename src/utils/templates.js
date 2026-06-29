import exercises from '../data/exercises.json'

export const POPULAR_IDS = new Set([
  '0025','0047','3294','0308',       // chest
  '0027','3293','2330','3156',       // back
  '0032','0102','0085','0336','2287',// legs
  '0334','0086','0290',             // shoulders
  '0031','2407','0313','0060',       // arms
  '3544','0972',                     // core
])

export const GOALS = [
  { id: 'cut',      label: 'חיטוב',  sub: '4×12–15', desc: 'שריפת שומן',   color: '#5ee8a0', textColor: '#002b1a' },
  { id: 'bulk',     label: 'מסה',    sub: '5×8–10',  desc: 'בניית שריר',   color: '#e86060', textColor: '#fff' },
  { id: 'strength', label: 'כוח',    sub: '5×3–5',   desc: 'עצימות גבוהה', color: '#e8c460', textColor: '#1a1000' },
]

const GOAL_PARAMS = {
  cut:      { sets: 4, reps: '12–15' },
  bulk:     { sets: 5, reps: '8–10'  },
  strength: { sets: 5, reps: '3–5'   },
}

// Exercise IDs per day type and goal
const TEMPLATES = {
  push: {
    cut:      ['0025','0047','0334','0060','0308'],
    bulk:     ['0025','0047','0086','0290','0060'],
    strength: ['0025','0047','0086'],
  },
  pull: {
    cut:      ['3293','0027','2330','0031','0313'],
    bulk:     ['0027','3293','2330','2407','0313'],
    strength: ['0027','3293','2330'],
  },
  pull_legs: {
    cut:      ['0032','0043','0085','0027','3293','1372'],
    bulk:     ['0032','0043','0085','0027','3293','1372'],
    strength: ['0032','0043','0027'],
  },
  legs: {
    cut:      ['0043','0085','0336','2287','1372','0972'],
    bulk:     ['0043','0032','0085','2287','1372'],
    strength: ['0043','0032','0085'],
  },
  core: {
    cut:      ['0972','3544'],
    bulk:     ['0972','3544'],
    strength: ['0972','3544'],
  },
}

const DAY_TYPE = {
  AB:     { A: 'push', B: 'pull_legs' },
  ABC:    { A: 'push', B: 'pull', C: 'legs' },
  PPL:    { A: 'push', B: 'pull', C: 'legs', D: 'core' },
  CUSTOM: { A: 'push' },
}

export function getPopularExercises() {
  return [...POPULAR_IDS]
    .map(id => exercises.find(e => e.id === id))
    .filter(Boolean)
}

export function getTemplate(splitType, dayId, goalId) {
  const dayType = DAY_TYPE[splitType]?.[dayId] || 'push'
  const ids = TEMPLATES[dayType]?.[goalId] || []
  const { sets, reps } = GOAL_PARAMS[goalId] || GOAL_PARAMS.bulk

  return ids.map((id, i) => {
    const ex = exercises.find(e => e.id === id)
    if (!ex) return null
    return { ...ex, _pid: Date.now() + i, sets, reps }
  }).filter(Boolean)
}
