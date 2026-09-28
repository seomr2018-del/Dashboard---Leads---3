import { Lightbulb, MessageCircle, Phone, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { relativeDays } from '../lib/metrics';
import { formatPhone, telLink, whatsappLink } from '../lib/phone';
import { stageOf, statusDef } from '../lib/status';
import type { Lead, LeadPatch, MessageTemplate } from '../types';
import { LeadForm, type LeadDraft, validateDraft } from './LeadForm';
import { Button, StageBadge, StatusBadge, inputClass } from './ui';

function toDraft(l: Lead): LeadDraft {
  const { name, phone, status, firstAttempt, secondAttempt, lastUpdate, notes } = l;
  return { name, phone, status, firstAttempt, secondAttempt, lastUpdate, notes };
}

function diff(before: LeadDraft, after: LeadDraft): LeadPatch {
  const out: LeadPatch = {};
  for (const k of Object.keys(after) as (keyof LeadDraft)[]) {
    if (before[k] !== after[k]) (out as Record<string, unknown>)[k] = after[k];
  }
  return out;
}

const templateText = (t: MessageTemplate) => [t.stageA, t.stageB, t.extra].filter(Boolean).join('\n\n');

export function LeadDrawer({ lead, templates, onClose, onSave }: { lead: Lead; templates: MessageTemplate[]; onClose: () => void; onSave: (id: string, p: LeadPatch) => void }) {
  const [draft, setDraft] = useState(() => toDraft(lead));
  const [error, setError] = useState<string | null>(null);
  const suggestedType = lead.status ? statusDef(lead.status).templateType : undefined;
  const usable = useMemo(() => templates.filter((t) => templateText(t)), [templates]);
  const [templateId, setTemplateId] = useState(() => usable.find((t) => t.leadType === suggestedType)?.id ?? '');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const patch = diff(toDraft(lead), draft);
  const dirty = Object.keys(patch).length > 0;
  const tpl = usable.find((t) => t.id === templateId);
  const wa = whatsappLink(lead.phone, tpl ? templateText(tpl) : undefined);
  const tel = telLink(lead.phone);

  const save = () => {
    const err = validateDraft(draft);
    if (err) return setError(err);
    onSave(lead.id, patch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="lead-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-lg flex-col bg-[var(--page)] shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-[var(--grid)] p-4">
          <div>
            <h2 id="lead-title" className="text-lg font-semibold">{lead.name || 'ליד ללא שם'}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
              <span className="tabular" dir="ltr">{formatPhone(lead.phone)}</span>
              <StatusBadge status={lead.status} />
              <StageBadge stage={stageOf(lead.status)} />
              <span>נוצר {relativeDays(lead.createdTime)}</span>
            </div>
          </div>
          <button className="rounded-md p-1.5 hover:bg-stone-200 dark:hover:bg-stone-800" onClick={onClose} aria-label="סגירה">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {lead.status && (
            <div className="flex gap-2 rounded-xl bg-blue-50 p-3 text-sm text-blue-900 ring-1 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-100 dark:ring-blue-900">
              <Lightbulb size={16} className="mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">הצעד הבא</div>
                {statusDef(lead.status).nextAction}
              </div>
            </div>
          )}

          <section className="space-y-2 rounded-xl bg-[var(--surface)] p-3 ring-1 ring-[var(--border)]">
            <h3 className="text-sm font-semibold">פנייה מהירה</h3>
            <select className={inputClass} value={templateId} onChange={(e) => setTemplateId(e.target.value)} aria-label="תבנית הודעה">
              <option value="">הודעה ריקה</option>
              {usable.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.leadType}{t.leadType === suggestedType ? ' (מומלץ)' : ''} – {t.goal}
                </option>
              ))}
            </select>
            {tpl && <p className="whitespace-pre-line rounded-lg bg-stone-100 p-2 text-sm text-[var(--ink-2)] dark:bg-stone-800">{templateText(tpl)}</p>}
            <div className="flex gap-2">
              {wa && (
                <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700">
                  <MessageCircle size={16} /> פתיחה בוואטסאפ
                </a>
              )}
              {tel && (
                <a href={tel} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm ring-1 ring-[var(--border)] hover:bg-stone-100 dark:hover:bg-stone-800">
                  <Phone size={16} /> חיוג
                </a>
              )}
            </div>
          </section>

          <LeadForm draft={draft} onChange={(d) => (setDraft(d), setError(null))} />
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        </div>

        <footer className="flex justify-end gap-2 border-t border-[var(--grid)] p-4">
          <Button onClick={onClose}>ביטול</Button>
          <Button variant="primary" disabled={!dirty} onClick={save}>
            שמירה
          </Button>
        </footer>
      </aside>
    </div>
  );
}
