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

export function translateCategory(cat) {
  return CATEGORY_HE[cat] || cat
}

export function translateEquipment(eq) {
  return EQUIPMENT_HE[eq] || eq
}
