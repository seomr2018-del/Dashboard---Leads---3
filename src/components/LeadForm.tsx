import { STATUSES } from '../lib/status';
import type { LeadPatch, StatusId } from '../types';
import { Field, inputClass } from './ui';

export type LeadDraft = Required<Pick<LeadPatch, 'name' | 'phone' | 'firstAttempt' | 'secondAttempt' | 'lastUpdate' | 'notes'>> & { status: StatusId | null };

export const EMPTY_DRAFT: LeadDraft = { name: '', phone: '', status: 'sent_intro', firstAttempt: '', secondAttempt: '', lastUpdate: '', notes: '' };

export function validateDraft(d: LeadDraft): string | null {
  const digits = d.phone.replace(/\D/g, '');
  if (!digits) return 'חובה להזין מספר נייד';
  if (digits.length < 9) return 'מספר הנייד קצר מדי';
  return null;
}

/** השדות תואמים אחד-לאחד לעמודות בטבלת "לידים" ב-Airtable. */
export function LeadForm({ draft, onChange }: { draft: LeadDraft; onChange: (d: LeadDraft) => void }) {
  const set = (p: Partial<LeadDraft>) => onChange({ ...draft, ...p });
  const area = (key: 'firstAttempt' | 'secondAttempt' | 'lastUpdate' | 'notes', label: string) => (
    <Field label={label}>
      <textarea rows={2} className={inputClass} value={draft[key]} onChange={(e) => set({ [key]: e.target.value })} />
    </Field>
  );
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="שם">
          <input className={inputClass} value={draft.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="נייד *">
          <input className={`${inputClass} tabular`} dir="ltr" inputMode="tel" required value={draft.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="050-123-4567" />
        </Field>
      </div>
      <Field label="סטטוס">
        <select className={inputClass} value={draft.status ?? ''} onChange={(e) => set({ status: (e.target.value || null) as StatusId | null })}>
          <option value="">ללא סטטוס</option>
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>
      {area('firstAttempt', 'ניסיון ראשון')}
      {area('secondAttempt', 'ניסיון שני')}
      {area('lastUpdate', 'עדכון אחרון')}
      {area('notes', 'הערות / תשלום')}
    </div>
  );
}
