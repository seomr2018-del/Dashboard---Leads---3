import { describe, expect, it } from 'vitest';
import type { Lead } from '../types';
import { computeMetrics, isHot, isStale, matchesSearch, toCSV } from './metrics';
import { applyFilters, EMPTY_FILTERS } from './filters';

const NOW = Date.parse('2026-09-28T12:00:00Z');
const lead = (p: Partial<Lead>): Lead => ({
  id: Math.random().toString(36).slice(2),
  phone: '050-000-0000',
  name: '',
  firstAttempt: '',
  secondAttempt: '',
  lastUpdate: '',
  notes: '',
  status: 'sent_intro',
  createdTime: '2026-09-27T12:00:00Z',
  ...p,
});

describe('isHot', () => {
  it('detects "חם" as a word', () => expect(isHot(lead({ lastUpdate: 'עדכון: חם -מתייעץ עם אישתו' }))).toBe(true));
  it('detects "לסגור"', () => expect(isHot(lead({ lastUpdate: 'מאוד חם -לסגור!!' }))).toBe(true));
  it('ignores "חם" inside another word', () => expect(isHot(lead({ lastUpdate: 'לחם' }))).toBe(false));
  it('callback statuses are hot', () => expect(isHot(lead({ status: 'tomer_callback' }))).toBe(true));
  it('closed leads are never hot', () => expect(isHot(lead({ status: 'closed', lastUpdate: 'מאוד חם' }))).toBe(false));
});

describe('isStale', () => {
  it('active lead older than 3 days is stale', () => expect(isStale(lead({ createdTime: '2026-09-20T12:00:00Z' }), NOW)).toBe(true));
  it('recent modification clears staleness', () =>
    expect(isStale(lead({ createdTime: '2026-09-20T12:00:00Z', modifiedTime: '2026-09-28T10:00:00Z' }), NOW)).toBe(false));
  it('lost leads are never stale', () => expect(isStale(lead({ status: 'not_interested', createdTime: '2026-01-01T00:00:00Z' }), NOW)).toBe(false));
});

describe('computeMetrics', () => {
  const leads = [
    lead({ status: 'closed', notes: 'שולם' }),
    lead({ status: 'closed' }),
    lead({ status: 'not_interested' }),
    lead({ status: 'no_response', phone: '052-111-1111' }),
    lead({ status: 'pressure_sent', phone: '972 52-111-1111', name: 'דנה' }),
    lead({ status: null }),
  ];
  const m = computeMetrics(leads, NOW);

  it('counts stages', () => {
    expect(m.total).toBe(6);
    expect(m.won).toBe(2);
    expect(m.lost).toBe(1);
    expect(m.paused).toBe(1);
    expect(m.active).toBe(2); // pressure_sent + ללא סטטוס (נחשב פנייה ראשונית)
    expect(m.noStatus).toBe(1);
  });
  it('computes rates', () => {
    expect(m.conversionRate).toBeCloseTo(2 / 6);
    expect(m.winRate).toBeCloseTo(2 / 3);
  });
  it('counts paid, missing names and duplicates', () => {
    expect(m.paid).toBe(1);
    expect(m.missingName).toBe(5);
    expect(m.duplicateGroups).toBe(2); // 050-000-0000 ×4, 052-111-1111 ×2
  });
});

describe('search & filters', () => {
  const l = lead({ name: 'יוסי', phone: '972 54-000-4321', firstAttempt: 'ביקש הקלטה' });
  it('matches local phone format', () => expect(matchesSearch(l, '0540004')).toBe(true));
  it('matches text', () => expect(matchesSearch(l, 'הקלטה')).toBe(true));
  it('no match', () => expect(matchesSearch(l, 'אבי')).toBe(false));
  it('filters active stage', () => {
    const out = applyFilters([lead({ status: 'closed' }), lead({ status: 'hesitating' })], { ...EMPTY_FILTERS, stage: 'active' }, new Set(), NOW);
    expect(out.map((x) => x.status)).toEqual(['hesitating']);
  });
});

describe('toCSV', () => {
  it('starts with BOM and quotes commas', () => {
    const csv = toCSV([lead({ name: 'א, ב', status: 'closed' })]);
    expect(csv.startsWith('﻿שם,נייד')).toBe(true);
    expect(csv).toContain('"א, ב"');
    expect(csv).toContain('נסגר');
  });
});
