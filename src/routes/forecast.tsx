import { createFileRoute } from "@tanstack/react-router";
import { CircleDollarSign, Layers, Percent, Target } from "lucide-react";
import { KpiCard, PageHeader, Panel, Tag } from "@/components/kit";
import { BarValueChart, ConversionChart, RevenueChart } from "@/components/charts";
import {
  compact,
  currency,
  funnelConversion,
  metrics,
  monthly,
  opportunities,
  pipelineByOwner,
} from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/forecast")({
  head: () => ({
    meta: [
      { title: "Forecast | Conversu Sales OS" },
      { name: "description", content: "Receita prevista, forecast ponderado e fechamentos do mês com projeção futura." },
      { property: "og:title", content: "Forecast | Conversu Sales OS" },
      { property: "og:description", content: "Receita prevista, forecast ponderado e projeção dos próximos meses." },
    ],
  }),
  component: ForecastPage,
});

function ForecastPage() {
  const closing = opportunities
    .filter((o) => o.stage !== "ganho" && o.stage !== "perdido" && o.probability >= 60)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-5">
      <PageHeader title="Forecast" description="Projeção de receita ponderada pela probabilidade de cada negociação" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Receita prevista" value={compact(metrics.expectedRevenue)} icon={CircleDollarSign} />
        <KpiCard label="Forecast ponderado" value={compact(metrics.forecast)} icon={Target} tone="success" trend="+8,1%" />
        <KpiCard label="Pipeline aberto" value={compact(metrics.pipelineTotal)} icon={Layers} />
        <KpiCard label="Probabilidade média" value={`${Math.round(closing.reduce((s, o) => s + o.probability, 0) / (closing.length || 1))}%`} icon={Percent} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Receita x forecast" className="xl:col-span-2">
          <RevenueChart data={monthly} height={300} />
        </Panel>
        <Panel title="Forecast por vendedor">
          <BarValueChart data={pipelineByOwner} horizontal height={300} />
        </Panel>
        <Panel title="Conversão por etapa" className="xl:col-span-3">
          <ConversionChart data={funnelConversion} height={260} />
        </Panel>
      </div>

      <Panel title="Fechamentos previstos para o mês" bodyClassName="p-0">
        <div className="scroll-slim overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Oportunidade</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Prob.</TableHead>
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
                  <TableCell><Tag tone={o.probability >= 85 ? "success" : "info"}>{o.probability}%</Tag></TableCell>
                  <TableCell className="tabular-nums">{currency(Math.round((o.value * o.probability) / 100))}</TableCell>
                  <TableCell className="tabular-nums">{o.closeDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>
    </div>
  );
}
