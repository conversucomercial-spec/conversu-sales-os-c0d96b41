import { parseBR, STAGES, type Opportunity } from "@/lib/data";

const sum = (list: Opportunity[]) => list.reduce((s, o) => s + o.value, 0);

/** Agregações comerciais calculadas sobre as oportunidades reais do banco. */
export function buildCrmMetrics(opportunities: Opportunity[]) {
  const open = opportunities.filter((o) => o.stage !== "ganho" && o.stage !== "perdido");
  const won = opportunities.filter((o) => o.stage === "ganho");
  const lost = opportunities.filter((o) => o.stage === "perdido");
  const owners = [...new Set(opportunities.map((o) => o.owner))];
  const segments = [...new Set(opportunities.map((o) => o.segment))];
  const sources = [...new Set(opportunities.map((o) => o.source).filter(Boolean))];
  const openStages = STAGES.filter((s) => s.id !== "ganho" && s.id !== "perdido");

  return {
    open,
    won,
    lost,
    metrics: {
      pipelineTotal: sum(open),
      forecast: Math.round(open.reduce((s, o) => s + (o.value * o.probability) / 100, 0)),
      expectedRevenue: sum(open.filter((o) => o.probability >= 60)),
      closedRevenue: sum(won),
      ticket: opportunities.length ? Math.round(sum(opportunities) / opportunities.length) : 0,
      winRate: won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : 0,
      atRisk: open.filter((o) => o.health < 55 || o.daysInStage > 18).length,
      nextClosings: open.filter((o) => o.probability >= 72).length,
    },
    valueByStage: openStages.map((s) => {
      const items = open.filter((o) => o.stage === s.id);
      return { id: s.id, label: s.label, count: items.length, value: sum(items) };
    }),
    pipelineByStage: openStages.map((s) => ({
      name: s.label,
      valor: sum(opportunities.filter((o) => o.stage === s.id)),
    })),
    pipelineByOwner: owners.map((owner) => ({
      name: owner.split(" ")[0] ?? owner,
      valor: sum(open.filter((o) => o.owner === owner)),
    })),
    pipelineBySegment: segments.map((seg) => ({
      name: seg,
      valor: sum(open.filter((o) => o.segment === seg)),
    })),
    leadSources: sources.map((src) => ({
      name: src,
      value: opportunities.filter((o) => o.source === src).length,
    })),
    noInteraction: open
      .filter((o) => o.lastContactDays >= 10)
      .sort((a, b) => b.lastContactDays - a.lastContactDays)
      .slice(0, 5),
    closingSoon: open
      .filter((o) => o.probability >= 72)
      .sort((a, b) => parseBR(a.closeDate).getTime() - parseBR(b.closeDate).getTime())
      .slice(0, 5),
    stale: open.filter((o) => o.daysInStage > 20).slice(0, 2),
  };
}

export type CrmMetrics = ReturnType<typeof buildCrmMetrics>;
