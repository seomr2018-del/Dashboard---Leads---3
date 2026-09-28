/**
 * מנרמל מספר טלפון לפורמט בינלאומי ספרות בלבד (למשל 972541234567).
 * מטפל בפורמטים שקיימים בטבלה: "054-123-4567", "0 54-123-4567", "972 54-...", "972 054-...", "0541234567".
 * מספר זר (למשל "43 660 ...") נשאר כמו שהוא.
 */
export function normalizePhone(raw: string): string {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('9720')) return '972' + digits.slice(4);
  if (digits.startsWith('972')) return digits;
  if (digits.startsWith('0')) return '972' + digits.slice(1);
  if (digits.length === 9 && digits.startsWith('5')) return '972' + digits;
  return digits;
}

export function isIsraeliMobile(normalized: string): boolean {
  return /^9725\d{8}$/.test(normalized);
}

/** תצוגה אחידה: 054-123-4567 למספר ישראלי, +XX... לזר. */
export function formatPhone(raw: string): string {
  const n = normalizePhone(raw);
  if (!n) return '';
  if (/^972\d{8,9}$/.test(n)) {
    const local = '0' + n.slice(3);
    return local.length === 10
      ? `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`
      : `${local.slice(0, 2)}-${local.slice(2, 5)}-${local.slice(5)}`;
  }
  return '+' + n;
}

export function whatsappLink(raw: string, text?: string): string | null {
  const n = normalizePhone(raw);
  if (n.length < 8) return null;
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${n}${q}`;
}

export function telLink(raw: string): string | null {
  const n = normalizePhone(raw);
  return n ? `tel:+${n}` : null;
}

/** מחזיר מפה: טלפון מנורמל → מזהי הלידים שחולקים אותו (רק קבוצות של 2 ומעלה). */
export function findDuplicates<T extends { id: string; phone: string }>(leads: T[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const l of leads) {
    const n = normalizePhone(l.phone);
    if (!n) continue;
    groups.set(n, [...(groups.get(n) ?? []), l.id]);
  }
  for (const [k, ids] of groups) if (ids.length < 2) groups.delete(k);
  return groups;
}
