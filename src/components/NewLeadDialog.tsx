import { X } from 'lucide-react';
import { useState } from 'react';
import type { LeadPatch } from '../types';
import { EMPTY_DRAFT, LeadForm, validateDraft } from './LeadForm';
import { Button } from './ui';

export function NewLeadDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (p: LeadPatch) => Promise<boolean> }) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateDraft(draft);
    if (err) return setError(err);
    setSaving(true);
    const ok = await onCreate(draft);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="new-lead-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={submit} className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--page)] p-5 shadow-2xl">
        <header className="mb-4 flex items-center justify-between">
          <h2 id="new-lead-title" className="text-lg font-semibold">ליד חדש</h2>
          <button type="button" className="rounded-md p-1.5 hover:bg-stone-200 dark:hover:bg-stone-800" onClick={onClose} aria-label="סגירה">
            <X size={18} />
          </button>
        </header>
        <LeadForm draft={draft} onChange={(d) => (setDraft(d), setError(null))} />
        {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" onClick={onClose}>ביטול</Button>
          <Button type="submit" variant="primary" disabled={saving}>{saving ? 'שומר…' : 'הוספה'}</Button>
        </div>
      </form>
    </div>
  );
}
