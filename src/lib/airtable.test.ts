import { describe, expect, it } from 'vitest';
import { AIRTABLE } from '../config';
import { patchToFields, recordToLead } from './airtable';

const F = AIRTABLE.leads.fields;

describe('Airtable mapping', () => {
  it('maps a record (fields keyed by field ID) to a Lead', () => {
    const lead = recordToLead({
      id: 'rec123',
      createdTime: '2026-09-23T16:54:08.000Z',
      fields: { [F.phone]: '052-000-1234', [F.name]: 'ישראל', [F.status]: 'נשלחה הודעת לחץ', [F.firstAttempt]: 'דיברתי איתו' },
    });
    expect(lead).toMatchObject({ id: 'rec123', phone: '052-000-1234', name: 'ישראל', status: 'pressure_sent', firstAttempt: 'דיברתי איתו', notes: '' });
  });

  it('writes only the fields that changed, status as the Airtable choice name', () => {
    expect(patchToFields({ status: 'call_scheduled', notes: 'שולם' })).toEqual({ [F.status]: 'קבע \\ רוצה שיחה', [F.notes]: 'שולם' });
  });
});
