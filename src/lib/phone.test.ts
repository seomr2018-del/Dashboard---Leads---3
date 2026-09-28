import { describe, expect, it } from 'vitest';
import { findDuplicates, formatPhone, normalizePhone, whatsappLink } from './phone';

describe('normalizePhone', () => {
  // כל הפורמטים שמופיעים בפועל בעמודת "נייד" ב-Airtable
  it.each([
    ['052-000-1234', '972520001234'],
    ['0 55-000-5678', '972550005678'],
    ['972 54-000-4321', '972540004321'],
    ['972 054-000-3507', '972540003507'],
    ['0500001505', '972500001505'],
    ['43 660 0001234', '436600001234'],
    ['', ''],
  ])('%s → %s', (raw, expected) => expect(normalizePhone(raw)).toBe(expected));
});

describe('formatPhone', () => {
  it('formats Israeli mobiles locally', () => expect(formatPhone('972 54-000-4321')).toBe('054-000-4321'));
  it('keeps foreign numbers international', () => expect(formatPhone('43 660 0001234')).toBe('+436600001234'));
});

describe('whatsappLink', () => {
  it('builds wa.me link with encoded text', () => expect(whatsappLink('050-000-1001', 'היי')).toBe('https://wa.me/972500001001?text=%D7%94%D7%99%D7%99'));
  it('returns null for empty phone', () => expect(whatsappLink('')).toBeNull());
});

describe('findDuplicates', () => {
  it('groups the same number written differently', () => {
    const d = findDuplicates([
      { id: 'a', phone: '052-000-8972' },
      { id: 'b', phone: '972 52-000-8972' },
      { id: 'c', phone: '0 52-000-8972' },
      { id: 'd', phone: '050-000-0000' },
    ]);
    expect([...d.entries()]).toEqual([['972520008972', ['a', 'b', 'c']]]);
  });
});
