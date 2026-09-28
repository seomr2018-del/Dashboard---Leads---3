import { describe, expect, it } from 'vitest';
import { STAGES, STATUSES, stageOf, statusFromAirtable, statusToAirtable } from './status';

// רשימת האפשרויות בשדה "סטטוס" ב-Airtable, בדיוק כפי שהן מוגדרות שם.
const AIRTABLE_CHOICES = [
  'נשלחה הודעה לתיאום שיחה',
  'קבע \\ רוצה שיחה',
  'נשלחה הקלטה \\ מלל',
  'נשלחה הודעת לחץ',
  'מתלבט עדיין \\מתייעץ',
  'מעוניין תומר לחזור אליו',
  'רוצה לחכות',
  'לא מגיב!',
  'לא מעוניין',
  'לא רלוונטי',
  'לקוח שאני לא רוצה להכניס',
  'נסגר',
];

describe('status mapping', () => {
  it('maps every Airtable choice, round-trip', () => {
    for (const choice of AIRTABLE_CHOICES) {
      const id = statusFromAirtable(choice);
      expect(id, choice).not.toBeNull();
      expect(statusToAirtable(id)).toBe(choice);
    }
    expect(STATUSES).toHaveLength(AIRTABLE_CHOICES.length);
  });

  it('returns null for unknown values', () => {
    expect(statusFromAirtable('משהו אחר')).toBeNull();
    expect(statusFromAirtable(undefined)).toBeNull();
  });

  it('assigns stages', () => {
    expect(stageOf('closed')).toBe('won');
    expect(stageOf('no_response')).toBe('paused');
    expect(stageOf(null)).toBe('new');
  });

  it('every stage default status belongs to that stage', () => {
    for (const s of STAGES) expect(stageOf(s.defaultStatus)).toBe(s.id);
  });
});
