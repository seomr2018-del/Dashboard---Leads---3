import { Flame } from 'lucide-react';
import { useState } from 'react';
import { isHot } from '../lib/metrics';
import { formatPhone } from '../lib/phone';
import { STAGE_TONE, STAGES, TONE_CLASSES, stageDef, stageOf } from '../lib/status';
import type { Lead, LeadPatch, StageId } from '../types';
import { StatusBadge } from './ui';

/**
 * לוח לפי שלבים. גרירת כרטיס לעמודה אחרת קובעת את סטטוס ברירת המחדל של השלב
 * (אפשר לדייק את הסטטוס אחר כך בחלון הליד).
 */
export function KanbanBoard({ leads, onOpen, onUpdate }: { leads: Lead[]; onOpen: (id: string) => void; onUpdate: (id: string, p: LeadPatch) => void }) {
  const [over, setOver] = useState<StageId | null>(null);

  const drop = (stage: StageId, id: string) => {
    const lead = leads.find((l) => l.id === id);
    if (lead && stageOf(lead.status) !== stage) onUpdate(id, { status: stageDef(stage).defaultStatus });
    setOver(null);
  };

  return (
    <div className="grid auto-cols-[minmax(15rem,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2">
      {STAGES.map((stage) => {
        const items = leads.filter((l) => stageOf(l.status) === stage.id);
        return (
          <section
            key={stage.id}
            aria-label={stage.label}
            onDragOver={(e) => (e.preventDefault(), setOver(stage.id))}
            onDragLeave={() => setOver((o) => (o === stage.id ? null : o))}
            onDrop={(e) => drop(stage.id, e.dataTransfer.getData('text/plain'))}
            className={`flex max-h-[70vh] flex-col rounded-2xl bg-stone-100/70 p-2 ring-1 ring-[var(--border)] dark:bg-stone-900 ${over === stage.id ? 'ring-2 ring-blue-500' : ''}`}
          >
            <header className="flex items-center justify-between px-1 pb-2">
              <span className={`rounded-md px-2 py-0.5 text-sm font-semibold ring-1 ${TONE_CLASSES[STAGE_TONE[stage.id]]}`}>{stage.label}</span>
              <span className="tabular text-sm text-[var(--muted)]">{items.length}</span>
            </header>
            <p className="px-1 pb-2 text-xs text-[var(--muted)]">{stage.description}</p>
            <ul className="flex-1 space-y-2 overflow-y-auto">
              {items.map((l) => (
                <li key={l.id}>
                  <button
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', l.id)}
                    onClick={() => onOpen(l.id)}
                    className="w-full cursor-grab rounded-xl bg-[var(--surface)] p-3 text-start ring-1 ring-[var(--border)] hover:ring-blue-400 active:cursor-grabbing"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 font-medium">
                        {isHot(l) && <Flame size={14} className="text-orange-500" aria-label="ליד חם" />}
                        {l.name || 'ללא שם'}
                      </span>
                      <span className="tabular text-xs text-[var(--muted)]" dir="ltr">{formatPhone(l.phone)}</span>
                    </div>
                    <div className="mt-2"><StatusBadge status={l.status} /></div>
                    {(l.lastUpdate || l.secondAttempt || l.firstAttempt) && (
                      <p className="mt-2 line-clamp-2 text-xs text-[var(--ink-2)]">{l.lastUpdate || l.secondAttempt || l.firstAttempt}</p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
