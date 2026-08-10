/**
 * Inteligência de parceiros — métricas derivadas dos dados mockados.
 * O formato já é o que a API deve devolver (geração de demanda e de receita).
 */
import { PARTNERS, opportunities, companies, type Opportunity } from "./data";
import { ORIGINS, type OriginId } from "./config";

export type PartnerMetrics = {
  partner: string;
  /** Geração de demanda */
  leads: number;
  opportunities: number;
  conversion: number;
  pipeline: number;
  /** Geração de receita */
  wonClients: number;
  revenue: number;
  ticket: number;
  revenueShare: number;
};

const isOpen = (o: Opportunity) => o.stage !== "ganho" && o.stage !== "perdido";

const totalWonRevenue = opportunities
  .filter((o) => o.stage === "ganho")
  .reduce((s, o) => s + o.value, 0);

export const partnerMetrics: PartnerMetrics[] = PARTNERS.map((partner) => {
  const ops = opportunities.filter((o) => o.partner === partner);
  const won = ops.filter((o) => o.stage === "ganho");
  const revenue = won.reduce((s, o) => s + o.value, 0);
  const leads = ops.length + companies.filter((c) => c.partner === partner).length;
  return {
    partner,
    leads,
    opportunities: ops.length,
    conversion: ops.length ? Math.round((won.length / ops.length) * 100) : 0,
    pipeline: ops.filter(isOpen).reduce((s, o) => s + o.value, 0),
    wonClients: won.length,
    revenue,
    ticket: won.length ? Math.round(revenue / won.length) : 0,
    revenueShare: totalWonRevenue ? Math.round((revenue / totalWonRevenue) * 100) : 0,
  };
}).sort((a, b) => b.pipeline - a.pipeline);

export const partnerRevenueShare = Math.round(
  (opportunities
    .filter((o) => o.stage === "ganho" && o.partner)
    .reduce((s, o) => s + o.value, 0) /
    (totalWonRevenue || 1)) *
    100,
);

export const topPartnerByPipeline =
  [...partnerMetrics].sort((a, b) => b.pipeline - a.pipeline)[0];

export const topPartnerByRevenue =
  [...partnerMetrics].sort((a, b) => b.revenue - a.revenue)[0];

export const originBreakdown: { id: OriginId; label: string; count: number; value: number }[] =
  ORIGINS.map((o) => {
    const ops = opportunities.filter((op) => op.origin === o.id);
    return {
      id: o.id,
      label: o.label,
      count: ops.length,
      value: ops.filter(isOpen).reduce((s, op) => s + op.value, 0),
    };
  });

export const PARTNER_OPTIONS = [
  { value: "todos", label: "Todos os parceiros" },
  ...PARTNERS.map((p) => ({ value: p, label: p })),
];

export const ORIGIN_OPTIONS = [
  { value: "todas", label: "Todas as origens" },
  ...ORIGINS.map((o) => ({ value: o.id, label: o.label })),
];
