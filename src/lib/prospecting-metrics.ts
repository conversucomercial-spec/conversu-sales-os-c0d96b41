import type { Opportunity } from "@/lib/data";
import type { CadenceEventType } from "@/lib/cadence";
import { inPeriod, type PeriodRange } from "@/lib/period";

export type ProspectingEvent = {
  id: string;
  opportunityId: string;
  companyId: string | null;
  channel: string;
  type: CadenceEventType | string;
  note: string;
  occurredAt: string;
  owner: string;
};

const rate = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

/**
 * Métricas do canal de prospecção (LinkedIn), calculadas sobre eventos reais.
 * Filtráveis por período e responsável — prontas para as telas de resultados.
 */
export function buildProspectingMetrics(
  events: ProspectingEvent[],
  opportunities: Opportunity[],
  options: { range?: PeriodRange | undefined; owner?: string | undefined; channel?: string } = {},
) {
  const { range, owner, channel = "linkedin" } = options;

  const scoped = events.filter(
    (e) =>
      (channel === "todos" || e.channel === channel) &&
      (!owner || owner === "todos" || e.owner === owner) &&
      (!range || inPeriod(e.occurredAt, range)),
  );
  const ops = opportunities.filter((o) => !owner || owner === "todos" || o.owner === owner);
  const opsInPeriod = range ? ops.filter((o) => inPeriod(o.createdAt, range)) : ops;

  const count = (type: CadenceEventType) => scoped.filter((e) => e.type === type).length;

  const companiesProspected = new Set(
    scoped.map((e) => e.companyId ?? e.opportunityId),
  ).size;
  const connectionsSent = count("conexao_enviada");
  const connectionsAccepted = count("conexao_aceita");
  const messagesSent = count("mensagem_enviada");
  const followUps = count("follow_up");
  const replies = count("respondeu");
  const leads = new Set(scoped.filter((e) => e.type === "respondeu").map((e) => e.opportunityId)).size;
  const meetings = new Set(scoped.filter((e) => e.type === "reuniao").map((e) => e.opportunityId)).size;
  const noInterest = count("sem_interesse");
  const noReply = count("sem_resposta");

  return {
    events: scoped,
    companiesProspected,
    connectionsSent,
    connectionsAccepted,
    messagesSent,
    followUps,
    replies,
    leads,
    meetings,
    noInterest,
    noReply,
    opportunitiesCreated: opsInPeriod.length,
    closedWon: opsInPeriod.filter((o) => o.stage === "ganho").length,
    rates: {
      acceptance: rate(connectionsAccepted, connectionsSent),
      reply: rate(replies, messagesSent),
      leadConversion: rate(leads, companiesProspected),
      meetingConversion: rate(meetings, leads),
    },
  };
}

export type ProspectingMetrics = ReturnType<typeof buildProspectingMetrics>;
