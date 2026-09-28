import type { Lead, StageId, StatusId } from '../types';
import { isHot, isStale, matchesSearch } from './metrics';
import { normalizePhone } from './phone';
import { stageOf } from './status';

export interface Filters {
  q: string;
  stage: StageId | 'all' | 'active';
  status: StatusId | 'all';
  hotOnly: boolean;
  staleOnly: boolean;
  duplicatesOnly: boolean;
}

export const EMPTY_FILTERS: Filters = { q: '', stage: 'all', status: 'all', hotOnly: false, staleOnly: false, duplicatesOnly: false };

export type SortKey = 'created' | 'name' | 'status';

export function applyFilters(leads: Lead[], f: Filters, duplicatePhones: Set<string>, now = Date.now()): Lead[] {
  return leads.filter((l) => {
    const stage = stageOf(l.status);
    if (f.stage === 'active' && !(stage === 'new' || stage === 'engaged' || stage === 'closing')) return false;
    if (f.stage !== 'all' && f.stage !== 'active' && stage !== f.stage) return false;
    if (f.status !== 'all' && l.status !== f.status) return false;
    if (f.hotOnly && !isHot(l)) return false;
    if (f.staleOnly && !isStale(l, now)) return false;
    if (f.duplicatesOnly && !duplicatePhones.has(normalizePhone(l.phone))) return false;
    return matchesSearch(l, f.q);
  });
}

export function isFiltered(f: Filters): boolean {
  return JSON.stringify(f) !== JSON.stringify(EMPTY_FILTERS);
}
