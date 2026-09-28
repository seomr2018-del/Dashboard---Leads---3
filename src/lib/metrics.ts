import { STALE_AFTER_DAYS } from '../config';
import type { Lead, StageId, StatusId } from '../types';
import { findDuplicates, formatPhone, normalizePhone } from './phone';
import { STAGES, STATUSES, stageOf, statusDef } from './status';

const HEBREW = '֐-׿';
// "חם" כמילה שלמה (לא כחלק ממילה אחרת), "לסגור" או "מאוד מעוניין".
const HOT_RE = new RegExp(`(?:^|[^${HEBREW}])חם(?:$|[^${HEBREW}])|לסגור|מאוד מעוניין|מעוניין מאוד`);

export function leadText(l: Lead): string {
  return [l.firstAttempt, l.secondAttempt, l.lastUpdate, l.notes].filter(Boolean).join(' · ');
}

/** ליד חם: בשלב פעיל, ובטקסט מופיע "חם"/"לסגור"/"מאוד מעוניין", או שהסטטוס דורש חזרה אליו. */
export function isHot(l: Lead): boolean {
  const stage = stageOf(l.status);
  if (stage === 'won' || stage === 'lost') return false;
  if (l.status === 'tomer_callback' || l.status === 'call_scheduled') return true;
  return HOT_RE.test(leadText(l));
}

export function isPaid(l: Lead): boolean {
  return /שולם/.test(l.notes);
}

export function daysSince(iso: string | undefined, now: number = Date.now()): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : Math.floor((now - t) / 86_400_000);
}

/** ליד בשלב פעיל שלא עודכן יותר מ-STALE_AFTER_DAYS ימים. */
export function isStale(l: Lead, now: number = Date.now()): boolean {
  const stage = stageOf(l.status);
  if (!(stage === 'new' || stage === 'engaged' || stage === 'closing')) return false;
  return daysSince(l.modifiedTime ?? l.createdTime, now) > STALE_AFTER_DAYS;
}

export interface Metrics {
  total: number;
  byStatus: Record<StatusId, number>;
  noStatus: number;
  byStage: Record<StageId, number>;
  won: number;
  lost: number;
  paused: number;
  active: number;
  hot: number;
  stale: number;
  paid: number;
  missingName: number;
  duplicateGroups: number;
  duplicateLeads: number;
  /** נסגרו מתוך כלל הלידים. */
  conversionRate: number;
  /** נסגרו מתוך הלידים שהוכרעו (נסגר + אבוד). */
  winRate: number;
}

export function computeMetrics(leads: Lead[], now: number = Date.now()): Metrics {
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s.id, 0])) as Record<StatusId, number>;
  const byStage = Object.fromEntries(STAGES.map((s) => [s.id, 0])) as Record<StageId, number>;
  let noStatus = 0;
  let hot = 0;
  let stale = 0;
  let paid = 0;
  let missingName = 0;

  for (const l of leads) {
    if (l.status) byStatus[l.status]++;
    else noStatus++;
    byStage[stageOf(l.status)]++;
    if (isHot(l)) hot++;
    if (isStale(l, now)) stale++;
    if (isPaid(l)) paid++;
    if (!l.name.trim()) missingName++;
  }

  const dups = findDuplicates(leads);
  const won = byStage.won;
  const lost = byStage.lost;
  const total = leads.length;

  return {
    total,
    byStatus,
    noStatus,
    byStage,
    won,
    lost,
    paused: byStage.paused,
    active: byStage.new + byStage.engaged + byStage.closing,
    hot,
    stale,
    paid,
    missingName,
    duplicateGroups: dups.size,
    duplicateLeads: [...dups.values()].reduce((a, ids) => a + ids.length, 0),
    conversionRate: total ? won / total : 0,
    winRate: won + lost ? won / (won + lost) : 0,
  };
}

export function matchesSearch(l: Lead, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  const qDigits = query.replace(/\D/g, '');
  if (qDigits.length >= 3) {
    const n = normalizePhone(l.phone);
    const local = n.startsWith('972') ? '0' + n.slice(3) : n;
    if (n.includes(qDigits) || local.includes(qDigits)) return true;
  }
  return [l.name, leadText(l)].join(' ').toLowerCase().includes(query);
}

function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** ייצוא CSV עם BOM כדי שאקסל יציג עברית נכון. */
export function toCSV(leads: Lead[]): string {
  const header = ['שם', 'נייד', 'סטטוס', 'שלב', 'ניסיון ראשון', 'ניסיון שני', 'עדכון אחרון', 'הערות / תשלום', 'נוצר'];
  const rows = leads.map((l) => [
    l.name,
    formatPhone(l.phone),
    l.status ? statusDef(l.status).airtable : '',
    STAGES.find((s) => s.id === stageOf(l.status))!.label,
    l.firstAttempt,
    l.secondAttempt,
    l.lastUpdate,
    l.notes,
    l.createdTime.slice(0, 10),
  ]);
  return '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
}

export function relativeDays(iso: string, now: number = Date.now()): string {
  const d = daysSince(iso, now);
  return d <= 0 ? 'היום' : d === 1 ? 'אתמול' : `לפני ${d} ימים`;
}
