import { AlertTriangle, CheckCircle2, Flame, PhoneOff, Users, Workflow } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Metrics } from '../lib/metrics';
import { pct } from './ui';

function Tile({ icon, label, value, sub, onClick }: { icon: ReactNode; label: string; value: ReactNode; sub?: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl bg-[var(--surface)] p-4 text-start ring-1 ring-[var(--border)] transition hover:ring-blue-400 focus-visible:outline-2 focus-visible:outline-blue-500"
    >
      <div className="flex items-center gap-2 text-sm text-[var(--ink-2)]">
        <span className="text-[var(--muted)]">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      {sub && <div className="mt-1 text-xs text-[var(--muted)]">{sub}</div>}
    </button>
  );
}

export type KpiKey = 'all' | 'active' | 'hot' | 'won' | 'paused' | 'lost';

export function KpiTiles({ m, onSelect }: { m: Metrics; onSelect: (k: KpiKey) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <Tile icon={<Users size={16} />} label="סה״כ לידים" value={m.total} sub={m.missingName ? `${m.missingName} בלי שם` : undefined} onClick={() => onSelect('all')} />
      <Tile icon={<Workflow size={16} />} label="בתהליך פעיל" value={m.active} sub={m.stale ? `${m.stale} לא עודכנו מעל 3 ימים` : 'כולם עודכנו לאחרונה'} onClick={() => onSelect('active')} />
      <Tile icon={<Flame size={16} />} label="חמים לטיפול" value={m.hot} sub="לחזור אליהם היום" onClick={() => onSelect('hot')} />
      <Tile icon={<CheckCircle2 size={16} />} label="נסגרו" value={m.won} sub={`המרה ${pct(m.conversionRate)} · ${m.paid} שולמו`} onClick={() => onSelect('won')} />
      <Tile icon={<PhoneOff size={16} />} label="תקועים / מושהים" value={m.paused} sub={`${m.byStatus.no_response} לא מגיבים`} onClick={() => onSelect('paused')} />
      <Tile icon={<AlertTriangle size={16} />} label="אבודים" value={m.lost} sub={`שיעור זכייה מההוכרעו ${pct(m.winRate)}`} onClick={() => onSelect('lost')} />
    </div>
  );
}
