import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Handshake, Trophy } from "lucide-react";
import { PageHeader, Panel, Tag } from "@/components/kit";
import { BarValueChart, ConversionChart, DonutChart, Legend, RevenueChart } from "@/components/charts";
import { FilterSelect, Toolbar } from "@/components/toolbar";
import { GoalCard } from "@/components/goal-card";
import {
  ORIGIN_OPTIONS,
  PARTNER_OPTIONS,
  originBreakdown,
  partnerMetrics,
  partnerRevenueShare,
  topPartnerByPipeline,
  topPartnerByRevenue,
} from "@/lib/partners";
import { GOALS } from "@/lib/config";
import {
  compact,
  currency,
  funnelConversion,
  leadSources,
  lossReasons,
  monthly,
  pipelineBySegment,
  pipelineByStage,
  salesCycle,
} from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios | Conversu Sales OS" },
      { name: "description", content: "Motivos de perda, ciclo de venda, performance das metas e inteligência de parceiros." },
      { property: "og:title", content: "Relatórios | Conversu Sales OS" },
      { property: "og:description", content: "Conversão, ciclo de venda, metas e inteligência de parceiros." },
    ],
  }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const [partner, setPartner] = useState("todos");
  const [origin, setOrigin] = useState("todas");

  const partners = useMemo(
    () => partnerMetrics.filter((p) => partner === "todos" || p.partner === partner),
    [partner],
  );
  const origins = useMemo(
    () => originBreakdown.filter((o) => origin === "todas" || o.id === origin),
    [origin],
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Relatórios" description="Análises consolidadas da operação comercial e dos parceiros" />

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Pipeline por etapa">
          <BarValueChart data={pipelineByStage} />
        </Panel>
        <Panel title="Conversão do funil">
          <ConversionChart data={funnelConversion} />
        </Panel>
        <Panel title="Ciclo médio de vendas (dias)">
          <BarValueChart data={salesCycle.map((s) => ({ name: s.name, valor: s.dias }))} horizontal height={240} />
        </Panel>
        <Panel title="Origem dos leads">
          <DonutChart data={leadSources} />
          <Legend data={leadSources} />
        </Panel>
        <Panel title="Segmentos">
          <BarValueChart data={pipelineBySegment} horizontal height={240} />
        </Panel>
        <Panel title="Motivos de perda">
          <DonutChart data={lossReasons} />
          <Legend data={lossReasons} />
        </Panel>
        <Panel title="Receita e forecast" className="xl:col-span-2">
          <RevenueChart data={monthly} />
        </Panel>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-base font-bold">Performance das metas</h2>
        <div className="grid gap-3 lg:grid-cols-3">
          {GOALS.map((g) => (
            <GoalCard key={g.id} group={g} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Handshake className="h-4 w-4 text-primary" />
          <h2 className="font-display text-base font-bold">Inteligência de parceiros</h2>
        </div>

        <Toolbar>
          <FilterSelect value={partner} onChange={setPartner} options={PARTNER_OPTIONS} />
          <FilterSelect value={origin} onChange={setOrigin} options={ORIGIN_OPTIONS} />
        </Toolbar>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="card-surface p-4">
            <p className="text-xs text-muted-foreground">Receita originada por parceiros</p>
            <p className="mt-1 font-display text-2xl font-bold">{partnerRevenueShare}%</p>
          </div>
          <div className="card-surface p-4">
            <p className="text-xs text-muted-foreground">Maior pipeline</p>
            <p className="mt-1 flex items-center gap-2 font-display text-lg font-bold">
              <Trophy className="h-4 w-4 text-flow" /> {topPartnerByPipeline?.partner ?? "—"}
            </p>
            <p className="text-[11px] text-muted-foreground">{compact(topPartnerByPipeline?.pipeline ?? 0)} em aberto</p>
          </div>
          <div className="card-surface p-4">
            <p className="text-xs text-muted-foreground">Maior receita</p>
            <p className="mt-1 flex items-center gap-2 font-display text-lg font-bold">
              <Trophy className="h-4 w-4 text-success" /> {topPartnerByRevenue?.partner ?? "—"}
            </p>
            <p className="text-[11px] text-muted-foreground">{compact(topPartnerByRevenue?.revenue ?? 0)} ganhos</p>
          </div>
        </div>

        <Panel title="Geração de demanda por parceiro" bodyClassName="p-0">
          <div className="scroll-slim overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Oportunidades</TableHead>
                  <TableHead>Conversão</TableHead>
                  <TableHead>Pipeline aberto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((p) => (
                  <TableRow key={p.partner}>
                    <TableCell className="font-medium">{p.partner}</TableCell>
                    <TableCell className="tabular-nums">{p.leads}</TableCell>
                    <TableCell className="tabular-nums">{p.opportunities}</TableCell>
                    <TableCell><Tag tone={p.conversion >= 40 ? "success" : "info"}>{p.conversion}%</Tag></TableCell>
                    <TableCell className="tabular-nums">{currency(p.pipeline)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Panel>

        <Panel title="Geração de receita por parceiro" bodyClassName="p-0">
          <div className="scroll-slim overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Clientes ganhos</TableHead>
                  <TableHead>Receita</TableHead>
                  <TableHead>Ticket médio</TableHead>
                  <TableHead>% da receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((p) => (
                  <TableRow key={p.partner}>
                    <TableCell className="font-medium">{p.partner}</TableCell>
                    <TableCell className="tabular-nums">{p.wonClients}</TableCell>
                    <TableCell className="tabular-nums">{currency(p.revenue)}</TableCell>
                    <TableCell className="tabular-nums">{currency(p.ticket)}</TableCell>
                    <TableCell><Tag tone={p.revenueShare >= 15 ? "success" : "neutral"}>{p.revenueShare}%</Tag></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Panel>

        <Panel title="Pipeline por origem" bodyClassName="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {origins.map((o) => (
            <div key={o.id} className="rounded-xl border bg-secondary/40 p-3.5">
              <p className="text-xs font-semibold">{o.label}</p>
              <p className="mt-1 font-display text-lg font-bold">{compact(o.value)}</p>
              <p className="text-[11px] text-muted-foreground">{o.count} oportunidades</p>
            </div>
          ))}
        </Panel>
      </section>
    </div>
  );
}
