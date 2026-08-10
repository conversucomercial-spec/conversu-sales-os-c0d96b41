import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileCheck2, FileClock, FileText } from "lucide-react";

import { KpiCard, PageHeader, Panel, Tag } from "@/components/kit";
import { ProposalDrawer } from "@/components/proposal-drawer";
import { FilterSelect, SearchField, Toolbar } from "@/components/toolbar";
import { useCollection } from "@/hooks/use-collection";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { compact, currency, daysFromToday, OWNERS, proposals, type Proposal } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/propostas")({
  head: () => ({
    meta: [
      { title: "Propostas | Conversu Sales OS" },
      { name: "description", content: "Controle de propostas enviadas, em negociação, aceitas e próximas do vencimento." },
      { property: "og:title", content: "Propostas | Conversu Sales OS" },
      { property: "og:description", content: "Controle de propostas comerciais e status de negociação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PropostasPage,
});

const PERIODS = [
  { value: "todos", label: "Todos os períodos" },
  { value: "7", label: "Vencendo em 7 dias" },
  { value: "15", label: "Vencendo em 15 dias" },
];

function PropostasPage() {
  const [status, setStatus] = useState("todos");
  const [owner, setOwner] = useState("todos");
  const [period, setPeriod] = useState("todos");
  const [selected, setSelected] = useState<Proposal | null>(null);

  const expiringSoon = proposals.filter((p) => {
    const d = daysFromToday(p.expires);
    return d >= 0 && d <= 7;
  });

  const { query, setQuery, items } = useCollection({
    items: proposals,
    searchFields: (p) => [p.id, p.company, p.opportunity, p.owner],
    filters: {
      status: { value: status, all: "todos", get: (p) => p.status },
      owner: { value: owner, all: "todos", get: (p) => p.owner },
    },
    sortBy: (p) => p.expires.split("/").reverse().join("-"),
    direction: "asc",
  });

  const rows =
    period === "todos"
      ? items
      : items.filter((p) => {
          const d = daysFromToday(p.expires);
          return d >= 0 && d <= Number(period);
        });

  const total = proposals.reduce((s, p) => s + p.value, 0);

  return (
    <div className="space-y-5">
      <PageHeader title="Propostas" description={`${proposals.length} propostas ativas`} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Valor em propostas" value={compact(total)} icon={FileText} />
        <KpiCard label="Aceitas" value={proposals.filter((p) => p.status === "Aceita").length} icon={FileCheck2} tone="success" />
        <KpiCard label="Em negociação" value={proposals.filter((p) => p.status === "Em negociação").length} icon={FileText} tone="warning" />
        <KpiCard
          label="Vencendo em 7 dias"
          value={expiringSoon.length}
          hint={compact(expiringSoon.reduce((s, p) => s + p.value, 0))}
          icon={FileClock}
          tone="danger"
        />
      </div>

      <Toolbar>
        <SearchField value={query} onChange={setQuery} placeholder="Buscar proposta, empresa ou oportunidade…" className="flex-1" />
        <FilterSelect
          value={status}
          onChange={setStatus}
          options={[
            { value: "todos", label: "Todos os status" },
            ...["Enviada", "Em negociação", "Aceita", "Vencendo", "Recusada"].map((s) => ({ value: s, label: s })),
          ]}
        />
        <FilterSelect
          value={owner}
          onChange={setOwner}
          options={[{ value: "todos", label: "Todos os responsáveis" }, ...OWNERS.map((o) => ({ value: o, label: o }))]}
        />
        <FilterSelect value={period} onChange={setPeriod} options={PERIODS} />
      </Toolbar>

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
              {rows.map((p) => (
                <TableRow key={p.id} className="cursor-pointer" onClick={() => setSelected(p)}>
                  <TableCell className="font-medium">{p.id}</TableCell>
                  <TableCell>{p.company}</TableCell>
                  <TableCell className="tabular-nums">{currency(p.value)}</TableCell>
                  <TableCell className="text-muted-foreground">{p.owner}</TableCell>
                  <TableCell className="tabular-nums">{p.sent}</TableCell>
                  <TableCell className="tabular-nums">{p.expires}</TableCell>
                  <TableCell>
                    <Tag
                      tone={
                        p.status === "Aceita"
                          ? "success"
                          : p.status === "Recusada"
                            ? "danger"
                            : p.status === "Vencendo"
                              ? "warning"
                              : "info"
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

      <ProposalDrawer proposal={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
