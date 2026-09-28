export type StatusId =
  | 'sent_intro'
  | 'call_scheduled'
  | 'recording_sent'
  | 'pressure_sent'
  | 'hesitating'
  | 'tomer_callback'
  | 'wants_to_wait'
  | 'no_response'
  | 'not_interested'
  | 'not_relevant'
  | 'rejected'
  | 'closed';

export type StageId = 'new' | 'engaged' | 'closing' | 'won' | 'paused' | 'lost';

export interface Lead {
  id: string;
  phone: string;
  name: string;
  firstAttempt: string;
  secondAttempt: string;
  lastUpdate: string;
  status: StatusId | null;
  notes: string;
  createdTime: string;
  /** מתעדכן בכל שמירה מהדאשבורד; ב-Airtable מחושב מ-createdTime כברירת מחדל. */
  modifiedTime?: string;
}

export type LeadPatch = Partial<
  Pick<Lead, 'name' | 'phone' | 'firstAttempt' | 'secondAttempt' | 'lastUpdate' | 'status' | 'notes'>
>;

export interface MessageTemplate {
  id: string;
  leadType: string;
  goal: string;
  stageA: string;
  stageB: string;
  extra: string;
}

export type DataSource = 'airtable' | 'demo';
