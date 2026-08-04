import { createFileRoute } from "@tanstack/react-router";
import { FileCheck2, FileClock, FileText } from "lucide-react";
import { KpiCard, PageHeader, Panel, Tag } from "@/components/kit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { compact, currency, proposals } from "@/lib/data";

export const Route = createFileRoute("/propostas")({
  head: () => ({
    meta: [
      { title: "Propostas | Conversu Sales OS" },
      { name: "description", content: "Controle de propostas enviadas, em negociação, aceitas e próximas do vencimento." },
      { property: "og:title", content: "Propostas | Conversu Sales OS" },
      { property: "og:description", content: "Controle de propostas comerciais e status de negociação." },
    ],
  }),
  component: PropostasPage,
});

function PropostasPage() {
  const total = proposals.reduce((s, p) => s + p.value, 0);
  return (
    <div className="space-y-5">
      <PageHeader title="Propostas" description={`${proposals.length} propostas ativas`} />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Valor em propostas" value={compact(total)} icon={FileText} />
        <KpiCard label="Aceitas" value={proposals.filter((p) => p.status === "Aceita").length} icon={FileCheck2} tone="success" />
        <KpiCard label="Vencendo" value={proposals.filter((p) => p.status === "Vencendo").length} icon={FileClock} tone="warning" />
      </div>

      <Panel bodyClassName="p-0">
        <div className="scroll-slim overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proposta</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Enviada</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id}</TableCell>
                  <TableCell>{p.company}</TableCell>
                  <TableCell className="tabular-nums">{currency(p.value)}</TableCell>
                  <TableCell className="text-muted-foreground">{p.owner}</TableCell>
                  <TableCell className="tabular-nums">{p.sent}</TableCell>
                  <TableCell className="tabular-nums">{p.expires}</TableCell>
                  <TableCell>
                    <Tag
                      tone={
                        p.status === "Aceita" ? "success" : p.status === "Recusada" ? "danger" : p.status === "Vencendo" ? "warning" : "info"
                      }
                    >
                      {p.status}
                    </Tag>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>
    </div>
  );
}
