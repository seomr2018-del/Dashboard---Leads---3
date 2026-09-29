import { useCallback, useEffect, useState } from 'react';
import { airtableEnabled } from '../config';
import { DEMO_TEMPLATES, demoLeads } from '../data/demo';
import * as api from '../lib/airtable';
import type { DataSource, Lead, LeadPatch, MessageTemplate } from '../types';

interface State {
  leads: Lead[];
  templates: MessageTemplate[];
  source: DataSource;
  loading: boolean;
  error: string | null;
  syncedAt: Date | null;
}

/**
 * מקור האמת לנתוני הדאשבורד.
 * עם AIRTABLE_TOKEN (פרוקסי) או טוקן שהוזן בדפדפן – קריאה וכתיבה ל-Airtable.
 * בלי טוקן, או אם הטעינה נכשלה – נתוני דמה, ושינויים נשמרים בזיכרון בלבד.
 */
export function useLeads() {
  const [state, setState] = useState<State>({
    leads: [],
    templates: [],
    source: airtableEnabled() ? 'airtable' : 'demo',
    loading: true,
    error: null,
    syncedAt: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    if (!airtableEnabled()) {
      setState((s) => ({ ...s, leads: s.leads.length ? s.leads : demoLeads(), templates: DEMO_TEMPLATES, source: 'demo', loading: false, syncedAt: new Date() }));
      return;
    }
    try {
      const [leads, templates] = await Promise.all([api.fetchLeads(), api.fetchTemplates()]);
      setState({ leads, templates, source: 'airtable', loading: false, error: null, syncedAt: new Date() });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setState((s) => ({
        ...s,
        leads: s.leads.length ? s.leads : demoLeads(),
        templates: s.templates.length ? s.templates : DEMO_TEMPLATES,
        source: s.leads.length ? s.source : 'demo',
        loading: false,
        error: `טעינה מ-Airtable נכשלה: ${msg}`,
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** עדכון אופטימי: מציגים מיד, ומחזירים לאחור אם השמירה נכשלה. */
  const update = useCallback(
    async (id: string, patch: LeadPatch) => {
      const prev = state.leads.find((l) => l.id === id);
      if (!prev) return;
      const optimistic: Lead = { ...prev, ...patch, modifiedTime: new Date().toISOString() };
      setState((s) => ({ ...s, leads: s.leads.map((l) => (l.id === id ? optimistic : l)), error: null }));
      if (state.source !== 'airtable') return;
      try {
        const saved = await api.updateLead(id, patch);
        setState((s) => ({ ...s, leads: s.leads.map((l) => (l.id === id ? { ...saved, modifiedTime: optimistic.modifiedTime } : l)) }));
      } catch (e) {
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) => (l.id === id ? prev : l)),
          error: `השמירה נכשלה: ${e instanceof Error ? e.message : e}`,
        }));
      }
    },
    [state.leads, state.source],
  );

  const create = useCallback(
    async (patch: LeadPatch): Promise<boolean> => {
      try {
        const lead: Lead =
          state.source === 'airtable'
            ? await api.createLead(patch)
            : {
                id: `demo${Date.now()}`,
                name: '',
                phone: '',
                firstAttempt: '',
                secondAttempt: '',
                lastUpdate: '',
                notes: '',
                status: null,
                ...patch,
                createdTime: new Date().toISOString(),
              };
        setState((s) => ({ ...s, leads: [lead, ...s.leads], error: null }));
        return true;
      } catch (e) {
        setState((s) => ({ ...s, error: `יצירת הליד נכשלה: ${e instanceof Error ? e.message : e}` }));
        return false;
      }
    },
    [state.source],
  );

  const dismissError = useCallback(() => setState((s) => ({ ...s, error: null })), []);

  return { ...state, reload: load, update, create, dismissError };
}
