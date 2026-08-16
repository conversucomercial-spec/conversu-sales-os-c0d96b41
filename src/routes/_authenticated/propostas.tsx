import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileCheck2, FileClock, FileText, Plus } from "lucide-react";

import { KpiCard, PageHeader, Panel, Tag } from "@/components/kit";
import { ProposalDialog } from "@/components/proposal-dialog";
import { FilterSelect, SearchField, Toolbar } from "@/components/toolbar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProposals } from "@/hooks/use-proposals";
import {
  PROPOSAL_STATUSES,
  daysUntil,
  formatDate,
  proposalTone,
  type ProposalRecord,
} from "@/lib/proposals";
import { compact, currency } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/propostas")({
  head: () => ({
    meta: [
      { title: "Propostas | Conversu Sales OS" },
      {
        name: "description",
        content: "Controle de propostas enviadas, em negociação, aceitas e próximas do vencimento.",
      },
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
  { value: "30", label: "Vencendo em 30 dias" },
];

const SORTS = [
  { value: "validade", label: "Validade mais próxima" },
  { value: "recentes", label: "Mais recentes" },
  { value: "valor", label: "Maior valor" },
  { value: "empresa", label: "Empresa (A–Z)" },
];

function PropostasPage() {
  const { data: proposals, isLoading } = useProposals();
  const [status, setStatus] = useState("todos");
  const [owner, setOwner] = useState("todos");
  const [period, setPeriod] = useState("todos");
  const [sort, setSort] = useState("validade");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ProposalRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const owners = useMemo(
    () => Array.from(new Set(proposals.map((p) => p.ownerName))).sort(),
    [proposals],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = proposals.filter((p) => {
      if (status !== "todos" && p.status !== status) return false;
      if (owner !== "todos" && p.ownerName !== owner) return false;
      if (period !== "todos") {
        const d = daysUntil(p.validUntil);
        if (d === null || d < 0 || d > Number(period)) return false;
      }
      if (!q) return true;
      return [p.number, p.companyName, p.opportunityTitle, p.ownerName]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    return filtered.sort((a, b) => {
      if (sort === "valor") return b.value - a.value;
      if (sort === "empresa") return a.companyName.localeCompare(b.companyName, "pt-BR");
      if (sort === "recentes") return b.createdAt.localeCompare(a.createdAt);
      return (a.validUntil ?? "9999").localeCompare(b.validUntil ?? "9999");
    });
  }, [proposals, status, owner, period, query, sort]);

  const expiringSoon = proposals.filter((p) => {
    const d = daysUntil(p.validUntil);
    return d !== null && d >= 0 && d <= 7;
  });
  const total = proposals.reduce((s, p) => s + p.value, 0);

  const openNew = () => {
    setSelected(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Propostas"
        description={`${proposals.length} propostas registradas`}
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus className="h-3.5 w-3.5" /> Nova proposta
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Valor em propostas" value={compact(total)} icon={FileText} />
        <KpiCard
          label="Aceitas"
          value={proposals.filter((p) => p.status === "Aceita").length}
          icon={FileCheck2}
          tone="success"
        />
        <KpiCard
          label="Em negociação"
          value={proposals.filter((p) => p.status === "Em negociação").length}
          icon={FileText}
          tone="warning"
        />
        <KpiCard
          label="Vencendo em 7 dias"
          value={expiringSoon.length}
          hint={compact(expiringSoon.reduce((s, p) => s + p.value, 0))}
          icon={FileClock}
          tone="danger"
        />
      </div>

      <Toolbar>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Buscar proposta, empresa ou oportunidade…"
          className="flex-1"
        />
        <FilterSelect
          value={status}
          onChange={setStatus}
          options={[
            { value: "todos", label: "Todos os status" },
            ...PROPOSAL_STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        />
        <FilterSelect
          value={owner}
          onChange={setOwner}
          options={[
            { value: "todos", label: "Todos os responsáveis" },
            ...owners.map((o) => ({ value: o, label: o })),
          ]}
        />
        <FilterSelect value={period} onChange={setPeriod} options={PERIODS} />
        <FilterSelect value={sort} onChange={setSort} options={SORTS} />
      </Toolbar>

      <Panel bodyClassName="p-0">
        <div className="scroll-slim overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proposta</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Oportunidade</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Enviada</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-sm text-muted-foreground">
                    Carregando propostas…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-sm text-muted-foreground">
                    Nenhuma proposta encontrada. Crie a primeira em “Nova proposta”.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelected(p);
                    setDialogOpen(true);
                  }}
                >
                  <TableCell className="font-medium">{p.number}</TableCell>
                  <TableCell>{p.companyName}</TableCell>
                  <TableCell className="text-muted-foreground">{p.opportunityTitle}</TableCell>
                  <TableCell className="tabular-nums">{currency(p.value)}</TableCell>
                  <TableCell className="text-muted-foreground">{p.ownerName}</TableCell>
                  <TableCell className="tabular-nums">{formatDate(p.sentAt)}</TableCell>
                  <TableCell className="tabular-nums">{formatDate(p.validUntil)}</TableCell>
                  <TableCell>
                    <Tag tone={proposalTone(p.status)}>{p.status}</Tag>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <ProposalDialog open={dialogOpen} onOpenChange={setDialogOpen} proposal={selected} />
    </div>
  );
}
