import { Copy, Flame, MessageCircle, UserX } from 'lucide-react';
import type { Metrics } from '../lib/metrics';
import { isHot, isStale, leadText } from '../lib/metrics';
import { formatPhone, whatsappLink } from '../lib/phone';
import { STAGES, STATUSES, stageOf, statusDef } from '../lib/status';
import type { Filters } from '../lib/filters';
import { EMPTY_FILTERS } from '../lib/filters';
import type { Lead, StageId, StatusId } from '../types';
import { BarList } from './BarList';
import { KpiTiles, type KpiKey } from './KpiTiles';
import { Card, StatusBadge, pct } from './ui';

interface Props {
  leads: Lead[];
  metrics: Metrics;
  duplicates: Map<string, string[]>;
  onFilter: (f: Filters) => void;
  onOpen: (id: string) => void;
}

const KPI_FILTERS: Record<KpiKey, Partial<Filters>> = {
  all: {},
  active: { stage: 'active' },
  hot: { hotOnly: true },
  won: { stage: 'won' },
  paused: { stage: 'paused' },
  lost: { stage: 'lost' },
};

export function Overview({ leads, metrics: m, duplicates, onFilter, onOpen }: Props) {
  const go = (p: Partial<Filters>) => onFilter({ ...EMPTY_FILTERS, ...p });
  const now = Date.now();

  // סדר עדיפויות: חזרה של תומר / שיחה שנקבעה → לקראת סגירה → שאר החמים.
  const priority = (l: Lead) => (l.status === 'tomer_callback' || l.status === 'call_scheduled' ? 0 : stageOf(l.status) === 'closing' ? 1 : 2);
  const hot = leads.filter(isHot).sort((a, b) => priority(a) - priority(b));
  const stale = leads.filter((l) => isStale(l, now));
  const byId = new Map(leads.map((l) => [l.id, l]));

  return (
    <div className="space-y-4">
      <KpiTiles m={m} onSelect={(k) => go(KPI_FILTERS[k])} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="משפך מכירה לפי שלב" action={<span className="text-xs text-[var(--muted)]">המרה כוללת {pct(m.conversionRate)}</span>}>
          <BarList
            ariaLabel="מספר לידים בכל שלב"
            total={m.total}
            items={STAGES.map((s) => ({ key: s.id, label: s.label, value: m.byStage[s.id], muted: !s.active }))}
            onSelect={(k) => go({ stage: k as StageId })}
          />
          <p className="mt-3 text-xs text-[var(--muted)]">כחול – שלבים פעילים במשפך · אפור – מחוץ למשפך. לחיצה על שורה מסננת את טבלת הלידים.</p>
        </Card>

        <Card title="פילוח לפי סטטוס">
          <BarList
            ariaLabel="מספר לידים בכל סטטוס"
            total={m.total}
            items={STATUSES.map((s) => ({ key: s.id, label: s.label, value: m.byStatus[s.id], muted: s.stage === 'lost' || s.stage === 'paused' })).sort((a, b) => b.value - a.value)}
            onSelect={(k) => go({ status: k as StatusId })}
          />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title={
            <span className="flex items-center gap-2">
              <Flame size={18} className="text-orange-500" /> לטיפול היום
            </span>
          }
          action={
            <button className="text-sm text-blue-600 hover:underline dark:text-blue-400" onClick={() => go({ hotOnly: true })}>
              כל החמים ({hot.length})
            </button>
          }
        >
          {hot.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">אין לידים חמים כרגע.</p>
          ) : (
            <ul className="divide-y divide-[var(--grid)]">
              {hot.slice(0, 8).map((l) => {
                const wa = whatsappLink(l.phone);
                return (
                  <li key={l.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                    <button className="min-w-0 flex-1 text-start" onClick={() => onOpen(l.id)}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{l.name || 'ללא שם'}</span>
                        <span className="tabular text-sm text-[var(--muted)]" dir="ltr">
                          {formatPhone(l.phone)}
                        </span>
                        <StatusBadge status={l.status} />
                      </div>
                      <div className="mt-0.5 truncate text-sm text-[var(--ink-2)]">
                        {l.status ? statusDef(l.status).nextAction : ''} {leadText(l) && <span className="text-[var(--muted)]">· {leadText(l)}</span>}
                      </div>
                    </button>
                    {wa && (
                      <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-green-700 ring-1 ring-green-200 hover:bg-green-50 dark:text-green-400 dark:ring-green-900 dark:hover:bg-green-950" aria-label={`וואטסאפ ל-${l.name || formatPhone(l.phone)}`}>
                        <MessageCircle size={14} /> וואטסאפ
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="איכות נתונים ומעקב">
          <ul className="space-y-3 text-sm">
            <li>
              <button className="flex w-full items-center justify-between gap-2 text-start hover:underline" onClick={() => go({ staleOnly: true })}>
                <span>לידים פעילים שלא עודכנו מעל 3 ימים</span>
                <span className="tabular font-semibold">{stale.length}</span>
              </button>
            </li>
            <li>
              <button className="flex w-full items-center justify-between gap-2 text-start hover:underline" onClick={() => go({ duplicatesOnly: true })}>
                <span className="flex items-center gap-1.5">
                  <Copy size={14} /> מספרים כפולים
                </span>
                <span className="tabular font-semibold">
                  {m.duplicateGroups} ({m.duplicateLeads} רשומות)
                </span>
              </button>
              {duplicates.size > 0 && (
                <ul className="mt-2 space-y-1 ps-5 text-xs text-[var(--ink-2)]">
                  {[...duplicates.entries()].slice(0, 5).map(([phone, ids]) => (
                    <li key={phone} dir="rtl">
                      <span className="tabular" dir="ltr">
                        {formatPhone(phone)}
                      </span>{' '}
                      – {ids.map((id) => byId.get(id)?.name || 'ללא שם').join(', ')}
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <UserX size={14} /> לידים בלי שם
              </span>
              <span className="tabular font-semibold">{m.missingName}</span>
            </li>
            {m.noStatus > 0 && (
              <li className="flex items-center justify-between gap-2">
                <span>לידים בלי סטטוס</span>
                <span className="tabular font-semibold">{m.noStatus}</span>
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
