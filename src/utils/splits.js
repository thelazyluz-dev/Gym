export const SPLIT_CONFIGS = {
  AB: {
    label: 'A/B – שני ימים',
    days: [
      { id: 'A', label: 'יום A – חזה / כתפיים / זרועות', exercises: [] },
      { id: 'B', label: 'יום B – גב / רגליים', exercises: [] },
    ],
  },
  ABC: {
    label: 'A/B/C – שלושה ימים',
    days: [
      { id: 'A', label: 'יום A – חזה / כתפיים', exercises: [] },
      { id: 'B', label: 'יום B – גב / זרועות', exercises: [] },
      { id: 'C', label: 'יום C – רגליים / בטן', exercises: [] },
    ],
  },
  PPL: {
    label: 'Push / Pull / Legs – ארבעה ימים',
    days: [
      { id: 'A', label: 'יום A – דחיפה', exercises: [] },
      { id: 'B', label: 'יום B – משיכה', exercises: [] },
      { id: 'C', label: 'יום C – רגליים', exercises: [] },
      { id: 'D', label: 'יום D – קרדיו / בטן', exercises: [] },
    ],
  },
  CUSTOM: {
    label: 'מותאם אישית',
    days: [
      { id: 'A', label: 'יום A', exercises: [] },
    ],
  },
}
