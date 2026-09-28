import type { StageId, StatusId } from '../types';

export type Tone = 'blue' | 'cyan' | 'teal' | 'orange' | 'yellow' | 'purple' | 'gray' | 'red' | 'pink' | 'green';

export interface StatusDef {
  id: StatusId;
  /** הערך המדויק כפי שהוא מופיע ב-Airtable (כולל הלוכסנים ההפוכים). */
  airtable: string;
  label: string;
  stage: StageId;
  tone: Tone;
  /** הפעולה הבאה המומלצת לנציג. */
  nextAction: string;
  /** סוג הליד בטבלת "הודעות וואטסאפ" שמתאים לשלב הזה. */
  templateType?: string;
}

// סדר המערך = סדר ההופעה בממשק (זהה לסדר האפשרויות ב-Airtable).
export const STATUSES: StatusDef[] = [
  { id: 'sent_intro', airtable: 'נשלחה הודעה לתיאום שיחה', label: 'נשלחה הודעה לתיאום שיחה', stage: 'new', tone: 'blue', nextAction: 'אם אין מענה תוך 24 שעות – לשלוח הודעת המשך', templateType: 'קיבל פניה ולא הגיב' },
  { id: 'call_scheduled', airtable: 'קבע \\ רוצה שיחה', label: 'קבע / רוצה שיחה', stage: 'engaged', tone: 'cyan', nextAction: 'לקיים את השיחה בזמן שנקבע ולעדכן את התוצאה' },
  { id: 'recording_sent', airtable: 'נשלחה הקלטה \\ מלל', label: 'נשלחה הקלטה / מלל', stage: 'engaged', tone: 'teal', nextAction: 'לבדוק אחרי 24 שעות אם שמע והאם יש שאלות', templateType: 'בוט חכם - 2' },
  { id: 'tomer_callback', airtable: 'מעוניין תומר לחזור אליו', label: 'מעוניין – תומר לחזור אליו', stage: 'engaged', tone: 'purple', nextAction: 'להעביר לתומר לשיחה חוזרת היום' },
  { id: 'pressure_sent', airtable: 'נשלחה הודעת לחץ', label: 'נשלחה הודעת לחץ', stage: 'closing', tone: 'orange', nextAction: 'לוודא קבלה ולתאם חתימה', templateType: 'לקראת סגירה' },
  { id: 'hesitating', airtable: 'מתלבט עדיין \\מתייעץ', label: 'מתלבט עדיין / מתייעץ', stage: 'closing', tone: 'yellow', nextAction: 'לברר מה מעכב ולטפל בהתנגדות', templateType: 'רוצה להתקדם - מתעכב' },
  { id: 'wants_to_wait', airtable: 'רוצה לחכות', label: 'רוצה לחכות', stage: 'paused', tone: 'gray', nextAction: 'לקבוע תזכורת לחזרה בתאריך שסוכם' },
  { id: 'no_response', airtable: 'לא מגיב!', label: 'לא מגיב!', stage: 'paused', tone: 'red', nextAction: 'לשלוח הודעת בדיקת רלוונטיות; אחרי 48 שעות – ליד קר', templateType: 'קיבל 2 פניות ולא הגיב' },
  { id: 'not_interested', airtable: 'לא מעוניין', label: 'לא מעוניין', stage: 'lost', tone: 'red', nextAction: 'אין – לסגור את הליד' },
  { id: 'not_relevant', airtable: 'לא רלוונטי', label: 'לא רלוונטי', stage: 'lost', tone: 'gray', nextAction: 'אין – לסגור את הליד' },
  { id: 'rejected', airtable: 'לקוח שאני לא רוצה להכניס', label: 'לקוח שלא רוצים להכניס', stage: 'lost', tone: 'pink', nextAction: 'אין – לא להמשיך' },
  { id: 'closed', airtable: 'נסגר', label: 'נסגר', stage: 'won', tone: 'green', nextAction: 'לוודא תשלום ולעדכן בשדה "הערות / תשלום"' },
];

export interface StageDef {
  id: StageId;
  label: string;
  description: string;
  /** הסטטוס שנקבע כשגוררים ליד לעמודה הזו בלוח. */
  defaultStatus: StatusId;
  /** שלבים פעילים משתתפים במשפך; מושהה/אבוד מוצגים בנפרד. */
  active: boolean;
}

export const STAGES: StageDef[] = [
  { id: 'new', label: 'פנייה ראשונית', description: 'נשלחה הודעה, טרם נוצר קשר', defaultStatus: 'sent_intro', active: true },
  { id: 'engaged', label: 'בשיחה', description: 'יש קשר – שיחה, הקלטה או חזרה של תומר', defaultStatus: 'call_scheduled', active: true },
  { id: 'closing', label: 'לקראת סגירה', description: 'הודעת לחץ או מתלבט', defaultStatus: 'pressure_sent', active: true },
  { id: 'won', label: 'נסגר', description: 'עסקה נסגרה', defaultStatus: 'closed', active: true },
  { id: 'paused', label: 'תקוע / מושהה', description: 'לא מגיב או רוצה לחכות', defaultStatus: 'no_response', active: false },
  { id: 'lost', label: 'אבוד', description: 'לא מעוניין, לא רלוונטי או נפסל', defaultStatus: 'not_interested', active: false },
];

const byId = new Map(STATUSES.map((s) => [s.id, s]));
const byAirtable = new Map(STATUSES.map((s) => [s.airtable, s]));
const stageById = new Map(STAGES.map((s) => [s.id, s]));

export function statusDef(id: StatusId): StatusDef {
  return byId.get(id)!;
}

export function stageDef(id: StageId): StageDef {
  return stageById.get(id)!;
}

/** ממיר ערך סטטוס מ-Airtable למזהה פנימי. ערך לא מוכר → null (יוצג "ללא סטטוס"). */
export function statusFromAirtable(value: unknown): StatusId | null {
  if (typeof value !== 'string') return null;
  return byAirtable.get(value)?.id ?? byAirtable.get(value.trim())?.id ?? null;
}

export function statusToAirtable(id: StatusId | null): string | null {
  return id ? statusDef(id).airtable : null;
}

export function stageOf(status: StatusId | null): StageId {
  return status ? statusDef(status).stage : 'new';
}

// כל הצבעים במקום אחד. תמיד מוצגים יחד עם טקסט – אף פעם לא צבע לבד.
export const TONE_CLASSES: Record<Tone, string> = {
  blue: 'bg-blue-50 text-blue-800 ring-blue-200 dark:bg-blue-950/60 dark:text-blue-200 dark:ring-blue-800',
  cyan: 'bg-cyan-50 text-cyan-800 ring-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-200 dark:ring-cyan-800',
  teal: 'bg-teal-50 text-teal-800 ring-teal-200 dark:bg-teal-950/60 dark:text-teal-200 dark:ring-teal-800',
  orange: 'bg-orange-50 text-orange-800 ring-orange-200 dark:bg-orange-950/60 dark:text-orange-200 dark:ring-orange-800',
  yellow: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:ring-amber-800',
  purple: 'bg-violet-50 text-violet-800 ring-violet-200 dark:bg-violet-950/60 dark:text-violet-200 dark:ring-violet-800',
  gray: 'bg-stone-100 text-stone-700 ring-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700',
  red: 'bg-red-50 text-red-800 ring-red-200 dark:bg-red-950/60 dark:text-red-200 dark:ring-red-800',
  pink: 'bg-pink-50 text-pink-800 ring-pink-200 dark:bg-pink-950/60 dark:text-pink-200 dark:ring-pink-800',
  green: 'bg-green-50 text-green-800 ring-green-200 dark:bg-green-950/60 dark:text-green-200 dark:ring-green-800',
};

export const STAGE_TONE: Record<StageId, Tone> = {
  new: 'blue',
  engaged: 'teal',
  closing: 'orange',
  won: 'green',
  paused: 'yellow',
  lost: 'gray',
};
