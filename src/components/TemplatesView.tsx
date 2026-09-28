import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import type { MessageTemplate } from '../types';
import { Card } from './ui';

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* הדפדפן חסם גישה ללוח – המשתמש יכול לסמן ולהעתיק ידנית */
    }
  };
  return (
    <div className="rounded-lg bg-stone-100 p-2.5 dark:bg-stone-800/70">
      <div className="mb-1 flex items-center justify-between text-xs text-[var(--muted)]">
        {label}
        <button onClick={copy} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-stone-200 dark:hover:bg-stone-700" aria-label={`העתקת ${label}`}>
          {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'הועתק' : 'העתקה'}
        </button>
      </div>
      <p className="whitespace-pre-line text-sm">{text}</p>
    </div>
  );
}

const botNumber = (t: MessageTemplate) => Number(t.leadType.match(/בוט חכם\s*-\s*(\d+)/)?.[1] ?? NaN);

export function TemplatesView({ templates }: { templates: MessageTemplate[] }) {
  const bot = templates.filter((t) => !Number.isNaN(botNumber(t))).sort((a, b) => botNumber(a) - botNumber(b));
  const manual = templates.filter((t) => Number.isNaN(botNumber(t)));

  const card = (t: MessageTemplate) => (
    <Card key={t.id} title={t.leadType}>
      <p className="mb-3 text-sm text-[var(--ink-2)]"><span className="font-medium">מטרה:</span> {t.goal}</p>
      <div className="space-y-2">
        {t.stageA && <CopyBlock label="הודעה שלב א׳" text={t.stageA} />}
        {t.stageB && <CopyBlock label="הודעה שלב ב׳" text={t.stageB} />}
        {t.extra && <CopyBlock label="הודעה נוספת" text={t.extra} />}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-lg font-semibold">הודעות לפי סוג ליד</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{manual.map(card)}</div>
      </section>
      {bot.length > 0 && (
        <section>
          <h2 className="mb-1 text-lg font-semibold">תסריט הבוט החכם</h2>
          <p className="mb-3 text-sm text-[var(--muted)]">שלבי הבוט לפי הסדר – מהודעת הפתיחה ועד תיאום החתימה.</p>
          <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{bot.map((t) => <li key={t.id}>{card(t)}</li>)}</ol>
        </section>
      )}
    </div>
  );
}
