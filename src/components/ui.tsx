import type { ReactNode } from 'react';
import type { StatusId } from '../types';
import { STAGE_TONE, TONE_CLASSES, stageDef, statusDef } from '../lib/status';
import type { StageId } from '../types';

export function Card({ title, action, children, className = '' }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-2xl bg-[var(--surface)] p-4 ring-1 ring-[var(--border)] sm:p-5 ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-2">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: StatusId | null }) {
  if (!status) return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ring-1 ${TONE_CLASSES.gray}`}>ללא סטטוס</span>;
  const s = statusDef(status);
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${TONE_CLASSES[s.tone]}`}>{s.label}</span>;
}

export function StageBadge({ stage }: { stage: StageId }) {
  return <span className={`inline-flex whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs ring-1 ${TONE_CLASSES[STAGE_TONE[stage]]}`}>{stageDef(stage).label}</span>;
}

export function Button({
  children,
  variant = 'secondary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-stone-950',
    secondary: 'bg-[var(--surface)] ring-1 ring-[var(--border)] hover:bg-stone-100 dark:hover:bg-stone-800',
    ghost: 'hover:bg-stone-100 dark:hover:bg-stone-800',
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export const inputClass =
  'w-full rounded-lg bg-[var(--surface)] px-3 py-2 text-sm ring-1 ring-[var(--border)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-[var(--ink-2)]">{label}</span>
      {children}
    </label>
  );
}

export const pct = (n: number) => `${Math.round(n * 100)}%`;
