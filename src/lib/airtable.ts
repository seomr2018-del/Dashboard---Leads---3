import { AIRTABLE } from '../config';
import type { Lead, LeadPatch, MessageTemplate } from '../types';
import { statusFromAirtable, statusToAirtable } from './status';

// כל הבקשות עוברות דרך הפרוקסי /api/airtable (vite.config.ts), שמוסיף את הטוקן בצד השרת.
const API = '/api/airtable';
const F = AIRTABLE.leads.fields;
const T = AIRTABLE.templates.fields;

type Fields = Record<string, unknown>;
interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: Fields;
}

export class AirtableError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}/${AIRTABLE.baseId}/${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    let msg = `Airtable ${res.status}`;
    try {
      const body = await res.json();
      msg = body?.error?.message ?? body?.error?.type ?? msg;
    } catch {
      /* גוף לא JSON */
    }
    throw new AirtableError(msg, res.status);
  }
  return res.json() as Promise<T>;
}

/** שולף את כל הרשומות (Airtable מחזיר עד 100 בעמוד, ממשיכים עם offset). */
async function listAll(tableId: string, params: Record<string, string> = {}): Promise<AirtableRecord[]> {
  const out: AirtableRecord[] = [];
  let offset: string | undefined;
  do {
    const qs = new URLSearchParams({ pageSize: '100', returnFieldsByFieldId: 'true', ...params });
    if (offset) qs.set('offset', offset);
    const page = await request<{ records: AirtableRecord[]; offset?: string }>(`${tableId}?${qs}`);
    out.push(...page.records);
    offset = page.offset;
  } while (offset);
  return out;
}

const str = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));

export function recordToLead(r: AirtableRecord): Lead {
  const f = r.fields;
  return {
    id: r.id,
    phone: str(f[F.phone]),
    name: str(f[F.name]),
    firstAttempt: str(f[F.firstAttempt]),
    secondAttempt: str(f[F.secondAttempt]),
    lastUpdate: str(f[F.lastUpdate]),
    status: statusFromAirtable(f[F.status]),
    notes: str(f[F.notes]),
    createdTime: r.createdTime,
  };
}

export function patchToFields(patch: LeadPatch): Fields {
  const out: Fields = {};
  if ('phone' in patch) out[F.phone] = patch.phone;
  if ('name' in patch) out[F.name] = patch.name;
  if ('firstAttempt' in patch) out[F.firstAttempt] = patch.firstAttempt;
  if ('secondAttempt' in patch) out[F.secondAttempt] = patch.secondAttempt;
  if ('lastUpdate' in patch) out[F.lastUpdate] = patch.lastUpdate;
  if ('notes' in patch) out[F.notes] = patch.notes;
  if ('status' in patch) out[F.status] = statusToAirtable(patch.status ?? null);
  return out;
}

// הקישור הישיר האמיתי שיצרנו מ-Google Sheets
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1st1rn0gZVpdcNLOR41CuBkqgMZhV-NB5YbD5Nxl8qzI/export?format=csv';

export async function fetchLeads(): Promise<Lead[]> {
    try {
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        
        const rows = parseCSV(csvText);
        
        return rows.map((row, index) => ({
            id: String(index + 1),
            phone: row['נייד'] || '',
            name: row['שם'] || '',
            firstAttempt: row['ניסיון ראשון'] || '',
            secondAttempt: row['ניסיון שני'] || '',
            lastUpdate: row['עדכון אחרון'] || '',
            status: row['סטטוס'] || '',
            notes: '', 
            createdTime: new Date().toISOString()
        }));
    } catch (error) {
        console.error("שגיאה בטעינת הנתונים מ-Google Sheets:", error);
        return [];
    }
}

// פונקציית עזר לפירוק שורות ה-CSV ותמיכה בכותרות בעברית
function parseCSV(csv: string) {
    const lines = csv.split("\n");
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"(.*)"$/, '$1').replace(/^\ufeff/, ''));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const currentline = lines[i].split(",");
        const obj: Record<string, string> = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j] ? currentline[j].trim().replace(/^"(.*)"$/, '$1') : '';
        }
        result.push(obj);
    }
    return result;
}
