import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CircleDollarSign, Layers, Percent, Target } from "lucide-react";
import { KpiCard, PageHeader, Panel, Tag, EmptyState } from "@/components/kit";
import { BarValueChart, ConversionChart, RevenueChart } from "@/components/charts";
import { FilterSelect, Toolbar } from "@/components/toolbar";
import { ForecastScenarios, scenarioLabel, scenarioOf } from "@/components/forecast-scenarios";
import { PARTNER_OPTIONS, ORIGIN_OPTIONS } from "@/lib/partners";
import {
  DEFAULT_PERIOD,
  PeriodFilter,
  usePeriodRange,
  type PeriodValue,
} from "@/components/period-filter";
import { inPeriodOrUndated, parseBRDate } from "@/lib/period";
import { compact, currency, funnelConversion, monthly } from "@/lib/data";
import { useCrm } from "@/hooks/use-crm";
import { buildCrmMetrics } from "@/lib/crm-metrics";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/forecast")({
  head: () => ({
    meta: [
      { title: "Forecast | Conversu Sales OS" },
      {
        name: "description",
        content:
          "Cenários comprometido, provável e otimista, forecast por responsável e fechamentos do mês.",
      },
      { property: "og:title", content: "Forecast | Conversu Sales OS" },
      {
        property: "og:description",
        content: "Cenários de forecast, projeção por responsável e fechamentos previstos.",
      },
    ],
  }),
  component: ForecastPage,
});

function ForecastPage() {
  const { data } = useCrm();
  const opportunities = data.opportunities;
  const metrics = useMemo(() => buildCrmMetrics(opportunities).metrics, [opportunities]);
  const [partner, setPartner] = useState("todos");
  const [origin, setOrigin] = useState("todas");
  const [period, setPeriod] = useState<PeriodValue>(DEFAULT_PERIOD);
  const range = usePeriodRange(period);

  const open = useMemo(
    () =>
      opportunities.filter(
        (o) =>
          o.stage !== "ganho" &&
          o.stage !== "perdido" &&
          (partner === "todos" || (partner === "sem" ? !o.partner : o.partner === partner)) &&
          (origin === "todas" || o.origin === origin) &&
          inPeriodOrUndated(parseBRDate(o.closeDate), range),
      ),
    [opportunities, partner, origin, range],
  );

  const byOwner = useMemo(() => {
    const map = new Map<string, number>();
    open.forEach((o) =>
      map.set(o.owner, (map.get(o.owner) ?? 0) + (o.value * o.probability) / 100),
    );
    return [...map.entries()]
      .map(([name, valor]) => ({ name, valor: Math.round(valor) }))
      .sort((a, b) => b.valor - a.valor);
  }, [open]);

  const weighted = Math.round(open.reduce((s, o) => s + (o.value * o.probability) / 100, 0));
  const pipeline = open.reduce((s, o) => s + o.value, 0);
  const avgProb = Math.round(open.reduce((s, o) => s + o.probability, 0) / (open.length || 1));

  const closing = [...open].sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Forecast"
        description="Projeção de receita ponderada por cenário, responsável e origem"
      />

      <Toolbar>
        <PeriodFilter value={period} onChange={setPeriod} />
        <FilterSelect value={partner} onChange={setPartner} options={PARTNER_OPTIONS} />
        <FilterSelect value={origin} onChange={setOrigin} options={ORIGIN_OPTIONS} />
        <span className="text-xs text-muted-foreground sm:ml-auto">
          {open.length} negociações abertas
        </span>
      </Toolbar>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Receita prevista"
          value={compact(metrics.expectedRevenue)}
          icon={CircleDollarSign}
        />
        <KpiCard
          label="Forecast ponderado"
          value={compact(weighted)}
          icon={Target}
          tone="success"
        />
        <KpiCard label="Pipeline aberto" value={compact(pipeline)} icon={Layers} />
        <KpiCard label="Probabilidade média" value={`${avgProb}%`} icon={Percent} />
      </div>

      <ForecastScenarios ops={open} />

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Receita x forecast" className="xl:col-span-2">
          <RevenueChart data={monthly} height={300} />
        </Panel>
        <Panel title="Forecast por responsável">
          {byOwner.length ? (
            <BarValueChart data={byOwner} horizontal height={300} />
          ) : (
            <EmptyState
              title="Sem dados"
              description="Nenhuma negociação aberta para os filtros."
            />
          )}
        </Panel>
        <Panel title="Conversão por etapa" className="xl:col-span-3">
          <ConversionChart data={funnelConversion} />
        </Panel>
      </div>

      <Panel title="Fechamentos previstos para o mês" bodyClassName="p-0">
        {closing.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Nenhum fechamento previsto"
              description="Ajuste os filtros de parceiro ou origem."
            />
          </div>
        ) : (
          <div className="scroll-slim overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oportunidade</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Prob.</TableHead>
                  <TableHead>Cenário</TableHead>
                  <TableHead>Ponderado</TableHead>
                  <TableHead>Fechamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {closing.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.company}</TableCell>
                    <TableCell className="text-muted-foreground">{o.owner}</TableCell>
                    <TableCell className="tabular-nums">{currency(o.value)}</TableCell>
                    <TableCell>
                      <Tag tone={o.probability >= 85 ? "success" : "info"}>{o.probability}%</Tag>
                    </TableCell>
                    <TableCell>
                      <Tag
                        tone={
                          scenarioOf(o) === "comprometido"
                            ? "success"
                            : scenarioOf(o) === "provavel"
                              ? "info"
                              : "neutral"
                        }
                      >
                        {scenarioLabel(scenarioOf(o))}
                      </Tag>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {currency(Math.round((o.value * o.probability) / 100))}
                    </TableCell>
                    <TableCell className="tabular-nums">{o.closeDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>
    </div>
  );
}
