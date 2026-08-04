import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Tag } from "@/components/kit";
import { BarValueChart, ConversionChart, DonutChart, Legend, RevenueChart } from "@/components/charts";
import {
  compact,
  funnelConversion,
  leadSources,
  lossReasons,
  monthly,
  pipelineBySegment,
  pipelineByStage,
  ranking,
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

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios | Conversu Sales OS" },
      { name: "description", content: "Dashboards de pipeline, conversão, ciclo de venda, origem, ranking e motivos de perda." },
      { property: "og:title", content: "Relatórios | Conversu Sales OS" },
      { property: "og:description", content: "Dashboards de conversão, ciclo de venda, ranking e motivos de perda." },
    ],
  }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Relatórios" description="Análises consolidadas da operação comercial" />

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Pipeline por etapa">
          <BarValueChart data={pipelineByStage} />
        </Panel>
        <Panel title="Conversão do funil">
          <ConversionChart data={funnelConversion} />
        </Panel>
        <Panel title="Tempo médio de venda (dias)">
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

      <Panel title="Ranking de vendedores" bodyClassName="p-0">
        <div className="scroll-slim overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Pipeline</TableHead>
                <TableHead>Fechado</TableHead>
                <TableHead>Negócios</TableHead>
                <TableHead>Win rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.map((r, i) => (
                <TableRow key={r.owner}>
                  <TableCell className="tabular-nums text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{r.owner}</TableCell>
                  <TableCell className="tabular-nums">{compact(r.pipeline)}</TableCell>
                  <TableCell className="tabular-nums">{compact(r.fechado)}</TableCell>
                  <TableCell className="tabular-nums">{r.negocios}</TableCell>
                  <TableCell><Tag tone={r.winRate > 55 ? "success" : "info"}>{r.winRate}%</Tag></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>
    </div>
  );
}
