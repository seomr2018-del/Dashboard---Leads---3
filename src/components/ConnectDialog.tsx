import { X } from 'lucide-react';
import { useState } from 'react';
import { setBrowserToken } from '../config';
import { Button, Field, inputClass } from './ui';

/** הזנת טוקן Airtable באתר הסטטי. הטוקן נשמר ב-localStorage של הדפדפן הזה בלבד. */
export function ConnectDialog({ onClose, onConnected }: { onClose: () => void; onConnected: () => void }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = token.trim();
    if (!/^pat[A-Za-z0-9]+\.[A-Za-z0-9]+$/.test(t)) return setError('הטוקן צריך להתחיל ב-pat ולהכיל נקודה (Personal Access Token).');
    setBrowserToken(t);
    onConnected();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="connect-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={submit} className="relative w-full max-w-lg rounded-2xl bg-[var(--page)] p-5 shadow-2xl">
        <header className="mb-4 flex items-center justify-between">
          <h2 id="connect-title" className="text-lg font-semibold">חיבור ל-Airtable</h2>
          <button type="button" className="rounded-md p-1.5 hover:bg-stone-200 dark:hover:bg-stone-800" onClick={onClose} aria-label="סגירה">
            <X size={18} />
          </button>
        </header>
        <Field label="Personal Access Token">
          <input
            className={inputClass}
            dir="ltr"
            type="password"
            autoComplete="off"
            placeholder="patXXXXXXXX.XXXXXXXX"
            value={token}
            onChange={(e) => (setToken(e.target.value), setError(null))}
            autoFocus
          />
        </Field>
        <p className="mt-2 text-xs text-[var(--muted)]">
          הטוקן נשמר רק בדפדפן הזה (localStorage) ונשלח ישירות ל-Airtable. הוא לא נשמר בקוד או בריפו. במחשב משותף – התנתקו בסיום.
        </p>
        {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" onClick={onClose}>ביטול</Button>
          <Button type="submit" variant="primary">התחברות</Button>
        </div>
      </form>
    </div>
  );
}
