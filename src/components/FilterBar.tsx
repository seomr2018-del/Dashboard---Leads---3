import { Search, X } from 'lucide-react';
import type { Filters } from '../lib/filters';
import { EMPTY_FILTERS, isFiltered } from '../lib/filters';
import { STAGES, STATUSES } from '../lib/status';
import type { StageId, StatusId } from '../types';
import { inputClass } from './ui';

const selectClass = inputClass.replace('w-full ', 'w-auto ');

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm ring-1 transition ${on ? 'bg-blue-600 text-white ring-blue-600 dark:bg-blue-500 dark:text-stone-950' : 'ring-[var(--border)] hover:bg-stone-100 dark:hover:bg-stone-800'}`}
    >
      {label}
    </button>
  );
}

export function FilterBar({ f, onChange, count }: { f: Filters; onChange: (f: Filters) => void; count: number }) {
  const set = (p: Partial<Filters>) => onChange({ ...f, ...p });
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[14rem] flex-1">
        <Search size={16} className="pointer-events-none absolute inset-y-0 start-3 my-auto text-[var(--muted)]" />
        <input className={`${inputClass} ps-9`} placeholder="חיפוש לפי שם, טלפון או טקסט…" value={f.q} onChange={(e) => set({ q: e.target.value })} aria-label="חיפוש" />
      </div>
      <select className={selectClass} value={f.stage} onChange={(e) => set({ stage: e.target.value as StageId | 'all' | 'active' })} aria-label="סינון לפי שלב">
        <option value="all">כל השלבים</option>
        <option value="active">פעילים בלבד</option>
        {STAGES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <select className={selectClass} value={f.status} onChange={(e) => set({ status: e.target.value as StatusId | 'all' })} aria-label="סינון לפי סטטוס">
        <option value="all">כל הסטטוסים</option>
        {STATUSES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <Toggle on={f.hotOnly} label="🔥 חמים" onClick={() => set({ hotOnly: !f.hotOnly })} />
      <Toggle on={f.staleOnly} label="לא עודכנו" onClick={() => set({ staleOnly: !f.staleOnly })} />
      <Toggle on={f.duplicatesOnly} label="כפולים" onClick={() => set({ duplicatesOnly: !f.duplicatesOnly })} />
      {isFiltered(f) && (
        <button className="inline-flex items-center gap-1 text-sm text-[var(--ink-2)] hover:underline" onClick={() => onChange(EMPTY_FILTERS)}>
          <X size={14} /> ניקוי
        </button>
      )}
      <span className="ms-auto text-sm text-[var(--muted)]" aria-live="polite">
        <span className="tabular">{count}</span> לידים
      </span>
    </div>
  );
}
