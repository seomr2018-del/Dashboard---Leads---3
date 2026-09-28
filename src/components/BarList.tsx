import { useState } from 'react';

export interface BarItem {
  key: string;
  label: string;
  value: number;
  /** פס אפור – לקטגוריות שמחוץ למשפך הפעיל (מושהה/אבוד). */
  muted?: boolean;
}

/**
 * תרשים עמודות אופקי: סדרה אחת, צבע אחד, ערך מוצג ליד כל פס.
 * ריחוף מציג כמות ואחוז מהסך; לחיצה מסננת את טבלת הלידים.
 */
export function BarList({ items, total, onSelect, ariaLabel }: { items: BarItem[]; total: number; onSelect?: (key: string) => void; ariaLabel: string }) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <ul className="space-y-1" aria-label={ariaLabel}>
      {items.map((item) => {
        const share = total ? item.value / total : 0;
        const active = hover === item.key;
        return (
          <li key={item.key} className="relative">
            <button
              type="button"
              onClick={() => onSelect?.(item.key)}
              onMouseEnter={() => setHover(item.key)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(item.key)}
              onBlur={() => setHover(null)}
              className={`grid w-full grid-cols-[minmax(7rem,11rem)_1fr_2.5rem] items-center gap-3 rounded-md px-1 py-1.5 text-start text-sm transition ${active ? 'bg-stone-100 dark:bg-stone-800/60' : ''}`}
              aria-label={`${item.label}: ${item.value} (${Math.round(share * 100)}%)`}
            >
              <span className="truncate text-[var(--ink-2)]">{item.label}</span>
              <span className="relative h-3 border-s border-[var(--series-muted)]">
                <span
                  className="absolute inset-y-0 start-0 rounded-e-[4px] transition-[width]"
                  style={{
                    width: `${(item.value / max) * 100}%`,
                    minWidth: item.value ? 3 : 0,
                    background: item.muted ? 'var(--series-muted)' : 'var(--series-1)',
                  }}
                />
              </span>
              <span className="tabular text-end font-medium">{item.value}</span>
            </button>
            {active && (
              <div role="tooltip" className="pointer-events-none absolute -top-9 start-40 z-10 whitespace-nowrap rounded-md bg-[var(--ink)] px-2 py-1 text-xs text-[var(--surface)] shadow-lg">
                {item.label} · <span className="tabular">{item.value}</span> לידים · <span className="tabular">{Math.round(share * 100)}%</span> מהסך
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
