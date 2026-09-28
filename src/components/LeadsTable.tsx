import { ArrowDownUp, Copy, Flame, MessageCircle, Phone } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { SortKey } from '../lib/filters';
import { isHot, relativeDays } from '../lib/metrics';
import { formatPhone, normalizePhone, telLink, whatsappLink } from '../lib/phone';
import { STATUSES, stageOf } from '../lib/status';
import type { Lead } from '../types';
import { StageBadge, StatusBadge } from './ui';

const statusOrder = new Map(STATUSES.map((s, i) => [s.id, i]));

export function LeadsTable({ leads, duplicatePhones, onOpen }: { leads: Lead[]; duplicatePhones: Set<string>; onOpen: (id: string) => void }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'created', dir: -1 });

  const rows = useMemo(() => {
    const cmp: Record<SortKey, (a: Lead, b: Lead) => number> = {
      created: (a, b) => a.createdTime.localeCompare(b.createdTime),
      name: (a, b) => (a.name || '￿').localeCompare(b.name || '￿', 'he'),
      status: (a, b) => (statusOrder.get(a.status!) ?? 99) - (statusOrder.get(b.status!) ?? 99),
    };
    return [...leads].sort((a, b) => cmp[sort.key](a, b) * sort.dir);
  }, [leads, sort]);

  const th = (key: SortKey, label: string) => (
    <th scope="col" className="px-3 py-2 font-medium" aria-sort={sort.key === key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
      <button className="inline-flex items-center gap-1 hover:text-[var(--ink)]" onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }))}>
        {label} <ArrowDownUp size={12} />
      </button>
    </th>
  );

  if (rows.length === 0) {
    return <p className="rounded-2xl bg-[var(--surface)] p-8 text-center text-[var(--muted)] ring-1 ring-[var(--border)]">לא נמצאו לידים שמתאימים לסינון.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-[var(--surface)] ring-1 ring-[var(--border)]">
      <table className="w-full min-w-[56rem] text-sm">
        <thead className="border-b border-[var(--grid)] text-start text-xs text-[var(--ink-2)]">
          <tr className="text-start [&>th]:text-start">
            {th('name', 'שם')}
            <th scope="col" className="px-3 py-2 font-medium">נייד</th>
            {th('status', 'סטטוס')}
            <th scope="col" className="px-3 py-2 font-medium">שלב</th>
            <th scope="col" className="px-3 py-2 font-medium">עדכון אחרון</th>
            <th scope="col" className="px-3 py-2 font-medium">הערות / תשלום</th>
            {th('created', 'נוצר')}
            <th scope="col" className="px-3 py-2 font-medium"><span className="sr-only">פעולות</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--grid)]">
          {rows.map((l) => {
            const wa = whatsappLink(l.phone);
            const tel = telLink(l.phone);
            const dup = duplicatePhones.has(normalizePhone(l.phone));
            const latest = l.lastUpdate || l.secondAttempt || l.firstAttempt;
            return (
              <tr key={l.id} className="cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/40" onClick={() => onOpen(l.id)}>
                <td className="px-3 py-2.5">
                  <button className="flex items-center gap-1.5 text-start font-medium hover:underline" onClick={(e) => (e.stopPropagation(), onOpen(l.id))}>
                    {isHot(l) && <Flame size={14} className="shrink-0 text-orange-500" aria-label="ליד חם" />}
                    {l.name || <span className="font-normal text-[var(--muted)]">ללא שם</span>}
                  </button>
                </td>
                <td className="px-3 py-2.5">
                  <span className="tabular inline-flex items-center gap-1 whitespace-nowrap" dir="ltr">
                    {formatPhone(l.phone)}
                    {dup && <Copy size={12} className="text-amber-600" aria-label="מספר כפול" />}
                  </span>
                </td>
                <td className="px-3 py-2.5"><StatusBadge status={l.status} /></td>
                <td className="px-3 py-2.5"><StageBadge stage={stageOf(l.status)} /></td>
                <td className="max-w-[16rem] truncate px-3 py-2.5 text-[var(--ink-2)]" title={latest}>{latest}</td>
                <td className="max-w-[12rem] truncate px-3 py-2.5 text-[var(--ink-2)]" title={l.notes}>{l.notes}</td>
                <td className="tabular whitespace-nowrap px-3 py-2.5 text-[var(--muted)]">{relativeDays(l.createdTime)}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {wa && (
                      <a href={wa} target="_blank" rel="noreferrer" className="rounded-md p-1.5 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950" aria-label="שליחת וואטסאפ">
                        <MessageCircle size={16} />
                      </a>
                    )}
                    {tel && (
                      <a href={tel} className="rounded-md p-1.5 text-[var(--ink-2)] hover:bg-stone-100 dark:hover:bg-stone-800" aria-label="חיוג">
                        <Phone size={16} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
