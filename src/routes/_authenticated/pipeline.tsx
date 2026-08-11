import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Filter, LayoutGrid, Rows3 } from "lucide-react";
import { PageHeader, EmptyState, Tag, PriorityBadge, HealthScore, TemperatureBadge } from "@/components/kit";
import { OpportunityCard } from "@/components/entity-cards";
import { SearchField, FilterSelect, Toolbar } from "@/components/toolbar";
import { OpportunityDrawer } from "@/components/opportunity-drawer";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  compact,
  currency,
  STAGES,
  type Opportunity,
  type StageId,
} from "@/lib/data";
import { useCrm, CRM_QUERY_KEY } from "@/hooks/use-crm";
import { moveOpportunityStage } from "@/lib/crm.functions";

export const Route = createFileRoute("/_authenticated/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline de vendas | Conversu Sales OS" },
      {
        name: "description",
        content:
          "Kanban comercial com arraste entre etapas, temperatura, probabilidade, health score e próximos passos.",
      },
      { property: "og:title", content: "Pipeline de vendas | Conversu Sales OS" },
      {
        property: "og:description",
        content: "Kanban comercial com arraste entre etapas, health score e próximas atividades.",
      },
    ],
  }),
  component: PipelinePage,
});

function PipelinePage() {
  const { data, isLoading } = useCrm();
  const queryClient = useQueryClient();
  const moveStage = useServerFn(moveOpportunityStage);
  /** Cópia local para feedback imediato no arraste; sincronizada com o banco. */
  const [items, setItems] = useState<Opportunity[]>([]);
  useEffect(() => setItems(data.opportunities), [data.opportunities]);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState("todos");
  const [temp, setTemp] = useState("todas");
  const [priority, setPriority] = useState("todas");
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<StageId | null>(null);

  const owners = data.owners;

  const mutation = useMutation({
    mutationFn: (vars: { id: string; stageKey: StageId }) =>
      moveStage({ data: { id: vars.id, stageKey: vars.stageKey } }),
    onError: (error: Error) => {
      toast.error("Não foi possível mover a oportunidade", { description: error.message });
      void queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEY });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEY }),
  });

  const filtered = useMemo(
    () =>
      items.filter(
        (o) =>
          (owner === "todos" || o.owner === owner) &&
          (temp === "todas" || o.temperature === temp) &&
          (priority === "todas" || o.priority === priority) &&
          (o.company.toLowerCase().includes(query.toLowerCase()) ||
            o.contact.toLowerCase().includes(query.toLowerCase()) ||
            o.title.toLowerCase().includes(query.toLowerCase())),
      ),
    [items, query, owner, temp, priority],
  );

  const moveTo = (stage: StageId) => {
    if (!dragId) return;
    const current = items.find((o) => o.id === dragId);
    setItems((prev) =>
      prev.map((o) => (o.id === dragId ? { ...o, stage, daysInStage: 0 } : o)),
    );
    if (current && current.stage !== stage) mutation.mutate({ id: dragId, stageKey: stage });
    setDragId(null);
    setOverStage(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pipeline"
        description={
          isLoading
            ? "Carregando oportunidades…"
            : `${filtered.length} oportunidades · ${compact(
                filtered.reduce((s, o) => s + o.value, 0),
              )} em jogo`
        }
        actions={
          <div className="flex rounded-lg border p-0.5">
            <Button
              size="sm"
              variant={view === "kanban" ? "secondary" : "ghost"}
              onClick={() => setView("kanban")}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Kanban
            </Button>
            <Button
              size="sm"
              variant={view === "lista" ? "secondary" : "ghost"}
              onClick={() => setView("lista")}
            >
              <Rows3 className="h-3.5 w-3.5" /> Lista
            </Button>
          </div>
        }
      />

      <Toolbar>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Filtrar por empresa, contato ou negociação"
          className="flex-1"
        />
        <FilterSelect
          value={owner}
          onChange={setOwner}
          options={[
            { value: "todos", label: "Todos os responsáveis" },
            ...owners.map((o) => ({ value: o, label: o })),
          ]}
        />
        <FilterSelect
          value={temp}
          onChange={setTemp}
          className="sm:w-44"
          options={[
            { value: "todas", label: "Todas temperaturas" },
            { value: "Quente", label: "Quente" },
            { value: "Morno", label: "Morno" },
            { value: "Frio", label: "Frio" },
          ]}
        />
        <FilterSelect
          value={priority}
          onChange={setPriority}
          className="sm:w-40"
          options={[
            { value: "todas", label: "Todas prioridades" },
            { value: "Alta", label: "Alta" },
            { value: "Média", label: "Média" },
            { value: "Baixa", label: "Baixa" },
          ]}
        />
      </Toolbar>

      {view === "kanban" ? (
        <div className="scroll-slim -mx-1 overflow-x-auto pb-3">
          <div className="flex min-w-max gap-3 px-1">
            {STAGES.map((stage) => {
              const stageItems = filtered.filter((o) => o.stage === stage.id);
              const total = stageItems.reduce((s, o) => s + o.value, 0);
              return (
                <div
                  key={stage.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOverStage(stage.id);
                  }}
                  onDragLeave={() => setOverStage((s) => (s === stage.id ? null : s))}
                  onDrop={() => moveTo(stage.id)}
                  className={`flex w-[286px] shrink-0 flex-col rounded-2xl bg-secondary/50 p-2.5 transition-colors ${
                    overStage === stage.id ? "bg-accent ring-2 ring-primary/40" : ""
                  }`}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-1.5 pb-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{stage.label}</p>
                      <p className="text-[11px] text-muted-foreground">{compact(total)}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold">
                      {stageItems.length}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {stageItems.map((op) => (
                      <OpportunityCard
                        key={op.id}
                        op={op}
                        draggable
                        dragging={dragId === op.id}
                        onDragStart={() => setDragId(op.id)}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverStage(null);
                        }}
                        onClick={() => setSelected(op)}
                      />
                    ))}
                    {stageItems.length === 0 && (
                      <p className="rounded-xl border border-dashed p-4 text-center text-[11px] text-muted-foreground">
                        Arraste uma oportunidade para cá
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="scroll-slim overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Temperatura</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Último contato</TableHead>
                  <TableHead>Responsável</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow
                    key={o.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(o)}
                  >
                    <TableCell className="font-medium">{o.company}</TableCell>
                    <TableCell>
                      <Tag tone="info">{STAGES.find((s) => s.id === o.stage)?.label}</Tag>
                    </TableCell>
                    <TableCell className="tabular-nums">{currency(o.value)}</TableCell>
                    <TableCell><PriorityBadge value={o.priority} /></TableCell>
                    <TableCell><TemperatureBadge value={o.temperature} /></TableCell>
                    <TableCell className="w-40"><HealthScore value={o.health} /></TableCell>
                    <TableCell className="tabular-nums">{o.lastContact}</TableCell>
                    <TableCell className="text-muted-foreground">{o.owner}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filtered.length === 0 && (
            <EmptyState icon={Filter} title="Nenhuma oportunidade encontrada" description="Ajuste a busca ou os filtros aplicados." />
          )}
        </div>
      )}

      <OpportunityDrawer op={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
