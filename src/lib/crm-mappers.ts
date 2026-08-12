import type { Tables } from "@/integrations/supabase/types";
import {
  TODAY,
  EMPTY_MEETING,
  type MeetingInfo,
  type OriginKey,
  type Opportunity,
  type Priority,
  type StageId,
  type Temperature,
} from "@/lib/data";

export type CrmCompany = {
  id: string;
  name: string;
  segment: string;
  mrr: number;
  owner: string;
  opportunities: number;
  status: string;
  site: string;
  city: string;
  employees: number;
  origin: OriginKey;
  partner?: string | undefined;
};

export type CrmContact = {
  id: string;
  name: string;
  role: string;
  company: string;
  companyId: string;
  phone: string;
  whatsapp: string;
  email: string;
  linkedin: string;
  relationship: string;
  lastInteraction: string;
};

export type CrmStage = { id: string; key: string; name: string; pipelineKey: string };

export type CrmSnapshot = {
  companies: CrmCompany[];
  contacts: CrmContact[];
  opportunities: Opportunity[];
  stages: CrmStage[];
  owners: string[];
};

/** Converte "yyyy-mm-dd" (banco) para "dd/mm/yyyy" (formato usado na interface). */
export const toBR = (date: string | null): string => {
  if (!date) return "";
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
};

const daysSince = (date: string | null) =>
  date ? Math.max(0, Math.round((TODAY.getTime() - new Date(`${date}T00:00:00`).getTime()) / 86400000)) : 0;

const asArray = <T>(value: unknown, fallback: T[] = []): T[] =>
  Array.isArray(value) ? (value as T[]) : fallback;

export function mapCompany(
  row: Tables<"companies">,
  extra: { ownerName: string; opportunities: number },
): CrmCompany {
  return {
    id: row.id,
    name: row.name,
    segment: row.segment ?? "—",
    mrr: Number(row.mrr ?? 0),
    owner: extra.ownerName,
    opportunities: extra.opportunities,
    status: row.status ?? "Prospect",
    site: row.site ?? "",
    city: row.city ?? "",
    employees: row.employees ?? 0,
    origin: (row.origin ?? "outros") as OriginKey,
    partner: row.partner ?? undefined,
  };
}

export function mapContact(
  row: Tables<"contacts">,
  extra: { companyName: string },
): CrmContact {
  return {
    id: row.id,
    name: row.name,
    role: row.role ?? "—",
    company: extra.companyName,
    companyId: row.company_id ?? "",
    phone: row.phone ?? "",
    whatsapp: row.whatsapp ?? "",
    email: row.email ?? "",
    linkedin: row.linkedin ?? "",
    relationship: row.relationship ?? "Neutro",
    lastInteraction: row.last_interaction ?? "—",
  };
}

export function mapOpportunity(
  row: Tables<"opportunities">,
  extra: {
    company: Tables<"companies"> | undefined;
    contact: Tables<"contacts"> | undefined;
    stageKey: string;
    pipelineKey: string;
    ownerName: string;
  },
): Opportunity {
  return {
    id: row.id,
    title: row.title,
    company: extra.company?.name ?? "—",
    companyId: row.company_id,
    contact: extra.contact?.name ?? "—",
    contactId: row.contact_id ?? undefined,
    createdAt: row.created_at,
    linkedin: {
      url: row.linkedin_url ?? "",
      status: row.linkedin_status,
      step: row.linkedin_step,
      lastActionAt: row.linkedin_last_action_at,
      nextAction: row.linkedin_next_action,
      nextActionAt: row.linkedin_next_action_at,
    },
    value: Number(row.value ?? 0),
    stage: extra.stageKey as StageId,
    temperature: row.temperature as Temperature,
    probability: row.probability,
    health: row.health,
    daysInStage: row.days_in_stage,
    priority: row.priority as Priority,
    lastContact: toBR(row.last_contact),
    lastContactDays: daysSince(row.last_contact),
    origin: row.origin as OriginKey,
    partner: row.partner ?? undefined,
    pipelineId: extra.pipelineKey,
    custom: (row.custom ?? {}) as Record<string, string>,
    nextActivity: row.next_activity ?? "",
    nextActivityDate: toBR(row.next_activity_date),
    owner: extra.ownerName,
    closeDate: toBR(row.close_date),
    segment: row.segment ?? extra.company?.segment ?? "—",
    source: row.source ?? "",
    nextStep: row.next_step ?? "",
    summary: row.summary ?? "",
    pains: asArray<string>(row.pains),
    objections: asArray<string>(row.objections),
    suggestions: asArray<string>(row.suggestions),
    risks: asArray<string>(row.risks),
    arguments: asArray<string>(row.sales_arguments),
    timeline: asArray<Opportunity["timeline"][number]>(row.timeline),
    notes: asArray<Opportunity["notes"][number]>(row.notes),
    checklist: asArray<Opportunity["checklist"][number]>(row.checklist),
    files: asArray<Opportunity["files"][number]>(row.files),
    proposals: asArray<Opportunity["proposals"][number]>(row.proposals),
    meetings: asArray<Opportunity["meetings"][number]>(row.meetings),
    setupValue: row.setup_value === null ? null : Number(row.setup_value),
    lossReason: row.loss_reason ?? "",
    ownerLabel: row.owner_label ?? "",
    meeting: { ...EMPTY_MEETING, ...((row.meeting ?? {}) as Partial<MeetingInfo>) },
  };
}
