export const CATEGORY_HE = {
  'upper arms': 'זרועות',
  'upper legs': 'רגליים',
  'back': 'גב',
  'waist': 'בטן',
  'chest': 'חזה',
  'shoulders': 'כתפיים',
  'lower legs': 'שוק',
  'cardio': 'קרדיו',
  'lower arms': 'אמה',
  'neck': 'צוואר',
}

export const EQUIPMENT_HE = {
  'body weight': 'משקל גוף',
  'dumbbell': 'משקולות',
  'barbell': 'מוט',
  'cable': 'כבל',
  'leverage machine': 'מכונה',
  'band': 'גומי',
  'kettlebell': 'קטלבל',
  'medicine ball': 'כדור כוח',
  'rope': 'חבל',
  'stability ball': 'כדור יציבות',
  'weighted': 'משוקלל',
  'ez barbell': 'מוט EZ',
  'olympic barbell': 'מוט אולימפי',
  'smith machine': 'מכונת סמית',
  'bosu ball': 'בוסו',
  'resistance band': 'גומייה',
  'tire': 'צמיג',
  'trap bar': 'מוט טראפ',
  'wheel roller': 'גלגל בטן',
  'assisted': 'בסיוע',
  'hammer': 'פטיש',
}

// Hebrew names for exercises used in templates / popular list, keyed by id
export const EXERCISE_HE = {
  '0025': 'לחיצת חזה במוט',
  '0047': 'לחיצת חזה בשיפוע במוט',
  '3294': 'שכיבות סמיכה ארצ\'ר',
  '0308': 'פרפר עם משקולות',
  '0334': 'הרחקת כתפיים עם משקולות',
  '0086': 'לחיצת כתפיים במוט בישיבה',
  '0290': 'לחיצת כתפיים עם משקולות',
  '0060': 'סקאל קראשר (פשיטת מרפקים)',
  '0027': 'חתירה בהטיה עם מוט',
  '3293': 'מתח ארצ\'ר',
  '2330': 'פולי עליון',
  '3156': 'חתירה ביד אחת',
  '0031': 'כפיפת מרפקים במוט',
  '2407': 'כפיפת מרפקים במוט (ארם בלאסטר)',
  '0313': 'כפיפת פטיש עם משקולות',
  '0032': 'דדליפט במוט',
  '0043': 'סקוואט במוט',
  '0042': 'סקוואט קדמי במוט',
  '0102': 'סקוואט במוט',
  '0085': 'דדליפט רומני',
  '0336': 'מכרעים עם משקולות',
  '2287': 'לחיצת רגליים במכונה',
  '1372': 'הרמות עקבים במוט',
  '0972': 'כפיפות בטן אופניים',
  '3544': 'פלאנק צידי',
}

export function translateCategory(cat) {
  return CATEGORY_HE[cat] || cat
}

export function translateEquipment(eq) {
  return EQUIPMENT_HE[eq] || eq
}

// Hebrew name if we have one, otherwise the original (English) name
export function translateName(id, fallback) {
  return EXERCISE_HE[id] || fallback
}

// "תרגיל אחד" / "5 תרגילים"
export function exCount(n) {
  return n === 1 ? 'תרגיל אחד' : `${n} תרגילים`
}
