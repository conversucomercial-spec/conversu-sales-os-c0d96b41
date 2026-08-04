import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlarmClock,
  BadgeDollarSign,
  CalendarClock,
  CircleDollarSign,
  Flame,
  Layers,
  ListChecks,
  Percent,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { KpiCard, PageHeader, Panel, Tag } from "@/components/kit";
import { BarValueChart, ConversionChart, DonutChart, Legend, RevenueChart } from "@/components/charts";
import {
  compact,
  currency,
  funnelConversion,
  leadSources,
  metrics,
  monthly,
  pipelineByOwner,
  pipelineBySegment,
  pipelineByStage,
  todayItems,
} from "@/lib/data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard comercial | Conversu Sales OS" },
      {
        name: "description",
        content:
          "Visão executiva do funil: pipeline, forecast, receita, win rate e prioridades do dia.",
      },
      { property: "og:title", content: "Dashboard comercial | Conversu Sales OS" },
      {
        property: "og:description",
        content: "Visão executiva do funil: pipeline, forecast, receita, win rate e prioridades do dia.",
      },
    ],
  }),
  component: Dashboard,
});

function TodayList({
  title,
  items,
}: {
  title: string;
  items: { key: string; primary: string; secondary: string; tag?: string }[];
}) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs font-semibold">{title}</p>
      <ul className="mt-3 space-y-2.5">
        {items.map((i) => (
          <li key={i.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{i.primary}</p>
              <p className="truncate text-[11px] text-muted-foreground">{i.secondary}</p>
            </div>
            {i.tag && <Tag tone="info">{i.tag}</Tag>}
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-xs text-muted-foreground">Nada por aqui hoje.</li>
        )}
      </ul>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Terça, 4 de agosto de 2026 — visão consolidada da operação comercial"
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/pipeline">Abrir pipeline</Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Pipeline total" value={compact(metrics.pipelineTotal)} icon={Layers} trend="+12,4%" hint="vs. mês anterior" />
        <KpiCard label="Forecast ponderado" value={compact(metrics.forecast)} icon={Target} trend="+8,1%" />
        <KpiCard label="Receita prevista" value={compact(metrics.expectedRevenue)} icon={TrendingUp} hint="prob. ≥ 60%" />
        <KpiCard label="Receita fechada" value={compact(metrics.closedRevenue)} icon={CircleDollarSign} tone="success" trend="+21,0%" />
        <KpiCard label="Ticket médio" value={currency(metrics.ticket)} icon={BadgeDollarSign} />
        <KpiCard label="Win rate" value={`${metrics.winRate}%`} icon={Percent} tone="success" />
        <KpiCard label="Negociações em risco" value={metrics.atRisk} icon={Flame} tone="danger" hint="sem avanço recente" />
        <KpiCard label="Próximos fechamentos" value={metrics.nextClosings} icon={Wallet} hint="prob. ≥ 72%" />
        <KpiCard label="Atividades pendentes" value={metrics.pendingActivities} icon={ListChecks} tone="warning" />
        <KpiCard label="Reuniões hoje" value={metrics.meetingsToday} icon={CalendarClock} />
      </div>

      <Panel
        title="Hoje"
        description="O que precisa da sua atenção agora"
        actions={
          <Tag tone="warning">
            <AlarmClock className="mr-1 h-3 w-3" /> Prioridades
          </Tag>
        }
        bodyClassName="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
      >
        <TodayList
          title="Follow-ups de hoje"
          items={todayItems.followUps.map((a) => ({
            key: a.id,
            primary: a.title,
            secondary: `${a.company} · ${a.owner}`,
            tag: a.priority,
          }))}
        />
        <TodayList
          title="Propostas vencendo"
          items={todayItems.expiringProposals.map((p) => ({
            key: p.id,
            primary: `${p.company} — ${currency(p.value)}`,
            secondary: `Vence em ${p.expires}`,
            tag: p.status,
          }))}
        />
        <TodayList
          title="Negociações sem atualização"
          items={todayItems.stale.map((o) => ({
            key: o.id,
            primary: o.company,
            secondary: `${o.daysInStage} dias na etapa · ${o.owner}`,
            tag: "Parada",
          }))}
        />
        <TodayList
          title="Clientes aguardando resposta"
          items={todayItems.waiting.map((o) => ({
            key: o.id,
            primary: o.company,
            secondary: o.nextStep,
            tag: `${o.probability}%`,
          }))}
        />
        <TodayList
          title="Reuniões do dia"
          items={todayItems.meetings.map((m) => ({
            key: m.id,
            primary: m.title,
            secondary: `${m.time} · ${m.company}`,
            tag: m.status,
          }))}
        />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Pipeline por etapa" className="xl:col-span-2">
          <BarValueChart data={pipelineByStage} />
        </Panel>
        <Panel title="Origem dos leads">
          <DonutChart data={leadSources} />
          <Legend data={leadSources} />
        </Panel>
        <Panel title="Pipeline por vendedor">
          <BarValueChart data={pipelineByOwner} horizontal height={240} />
        </Panel>
        <Panel title="Pipeline por segmento">
          <BarValueChart data={pipelineBySegment} horizontal height={240} />
        </Panel>
        <Panel title="Conversão do funil">
          <ConversionChart data={funnelConversion} height={240} />
        </Panel>
        <Panel title="Receita e forecast mensal" className="xl:col-span-3">
          <RevenueChart data={monthly} />
        </Panel>
      </div>
    </div>
  );
}
