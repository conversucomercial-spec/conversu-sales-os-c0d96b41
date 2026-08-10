import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlarmClock,
  BadgeDollarSign,
  Bot,
  CalendarClock,
  CalendarDays,
  CircleDollarSign,
  Flame,
  Layers,
  ListChecks,
  Percent,
  RefreshCcw,
  Target,
  TrendingUp,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import {
  AiSlot,
  DashboardWidget,
  EmptyState,
  KpiCard,
  ListRow,
  MetricWidget,
  PageHeader,
  Panel,
  PriorityBadge,
  StatusBadge,
  Tag,
} from "@/components/kit";
import { BarValueChart, ConversionChart, DonutChart, Legend, RevenueChart } from "@/components/charts";
import {
  compact,
  currency,
  dashboard,
  funnelConversion,
  leadSources,
  metrics,
  monthly,
  pipelineByOwner,
  pipelineBySegment,
  pipelineByStage,
  valueByStage,
} from "@/lib/data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard comercial | Conversu Sales OS" },
      {
        name: "description",
        content:
          "Visão operacional do funil: prioridades do dia, follow-ups atrasados, negociações sem interação, forecast e receita.",
      },
      { property: "og:title", content: "Dashboard comercial | Conversu Sales OS" },
      {
        property: "og:description",
        content:
          "Prioridades do dia, follow-ups atrasados, negociações paradas, fechamentos próximos e receita.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const openTotal = valueByStage.reduce((s, v) => s + v.value, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Terça, 4 de agosto de 2026 — o que precisa da sua decisão hoje"
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

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <DashboardWidget
          title="Follow-ups atrasados"
          description="Compromissos que já venceram"
          icon={AlarmClock}
          action={<Tag tone="danger">{dashboard.overdueFollowUps.length}</Tag>}
          bodyClassName="p-2"
        >
          {dashboard.overdueFollowUps.length ? (
            <ul className="space-y-0.5">
              {dashboard.overdueFollowUps.map((a) => (
                <li key={a.id}>
                  <ListRow
                    primary={a.title}
                    secondary={`${a.company} · ${a.owner} · previsto ${a.date}`}
                    trailing={<PriorityBadge value={a.priority} />}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={AlarmClock} title="Nenhum follow-up atrasado" />
          )}
        </DashboardWidget>

        <DashboardWidget
          title="Agenda de hoje"
          description="Atividades e reuniões do dia"
          icon={CalendarDays}
          bodyClassName="p-2"
        >
          <ul className="space-y-0.5">
            {dashboard.todayActivities.map((a) => (
              <li key={a.id}>
                <ListRow
                  primary={a.title}
                  secondary={`${a.type} · ${a.company}`}
                  trailing={<StatusBadge status={a.status} />}
                />
              </li>
            ))}
            {dashboard.upcomingMeetings.map((m) => (
              <li key={m.id}>
                <ListRow
                  primary={m.title}
                  secondary={`${m.time} · ${m.company}`}
                  trailing={<StatusBadge status={m.status} />}
                />
              </li>
            ))}
          </ul>
        </DashboardWidget>

        <DashboardWidget
          title="Negociações sem interação"
          description={`Sem contato há 10 dias ou mais`}
          icon={TriangleAlert}
          action={<Tag tone="warning">{dashboard.noInteraction.length}</Tag>}
          bodyClassName="p-2"
        >
          {dashboard.noInteraction.length ? (
            <ul className="space-y-0.5">
              {dashboard.noInteraction.map((o) => (
                <li key={o.id}>
                  <ListRow
                    primary={o.company}
                    secondary={`${o.lastContactDays} dias sem contato · ${o.owner}`}
                    meta={currency(o.value)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={TriangleAlert} title="Toda a carteira está aquecida" />
          )}
        </DashboardWidget>

        <DashboardWidget
          title="Fechamentos próximos"
          description="Alta probabilidade nas próximas semanas"
          icon={Wallet}
          bodyClassName="p-2"
        >
          <ul className="space-y-0.5">
            {dashboard.closingSoon.map((o) => (
              <li key={o.id}>
                <ListRow
                  primary={o.company}
                  secondary={`${o.nextStep} · fecha em ${o.closeDate}`}
                  meta={currency(o.value)}
                  trailing={<Tag tone="success">{o.probability}%</Tag>}
                />
              </li>
            ))}
          </ul>
        </DashboardWidget>

        <DashboardWidget
          title="Renovações previstas"
          description="Contratos de clientes ativos"
          icon={RefreshCcw}
          bodyClassName="p-2"
        >
          <ul className="space-y-0.5">
            {dashboard.renewals.map((r) => (
              <li key={r.id}>
                <ListRow primary={r.company} secondary={`${r.date} · ${r.owner}`} meta={currency(r.value)} />
              </li>
            ))}
          </ul>
        </DashboardWidget>

        <DashboardWidget
          title="Alertas operacionais"
          description="Riscos detectados nas regras atuais"
          icon={Flame}
          bodyClassName="space-y-2"
        >
          {dashboard.alerts.map((a) => (
            <div key={a.id} className="rounded-lg border p-2.5">
              <div className="flex items-center gap-2">
                <Tag tone={a.tone}>{a.tone === "danger" ? "Crítico" : "Atenção"}</Tag>
                <p className="truncate text-xs font-semibold">{a.title}</p>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{a.detail}</p>
            </div>
          ))}
        </DashboardWidget>
      </div>

      <Panel title="Distribuição do funil" description="Volume e valor por etapa aberta" bodyClassName="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-7">
        {valueByStage.map((s) => (
          <MetricWidget
            key={s.id}
            label={s.label}
            value={compact(s.value)}
            hint={`${s.count} negociações · ${Math.round((s.value / (openTotal || 1)) * 100)}% do funil`}
            tone="brand"
          />
        ))}
      </Panel>

      <DashboardWidget
        title="Copiloto comercial"
        description="Espaço reservado para os módulos inteligentes da próxima fase"
        icon={Bot}
        reserved
        bodyClassName="grid gap-3 md:grid-cols-3"
      >
        <AiSlot title="Resumo do dia" description="Síntese automática das negociações que mudaram desde ontem." />
        <AiSlot title="Próximas ações sugeridas" description="Recomendações de follow-up priorizadas por chance de avanço." />
        <AiSlot title="Risco do funil" description="Detecção automática de negociações em risco e motivos prováveis." />
      </DashboardWidget>

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
