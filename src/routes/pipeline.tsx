import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Filter, Search, User } from "lucide-react";
import { PageHeader, HealthScore, Tag, TemperatureBadge } from "@/components/kit";
import { OpportunityDrawer } from "@/components/opportunity-drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { compact, currency, opportunities, OWNERS, STAGES, type Opportunity } from "@/lib/data";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline de vendas | Conversu Sales OS" },
      {
        name: "description",
        content: "Kanban comercial com temperatura, probabilidade, health score e próximos passos.",
      },
      { property: "og:title", content: "Pipeline de vendas | Conversu Sales OS" },
      {
        property: "og:description",
        content: "Kanban comercial com temperatura, health score e próximas atividades.",
      },
    ],
  }),
  component: PipelinePage,
});

function Card({ op, onClick }: { op: Opportunity; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card-surface w-full p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]"
    >
      <p className="truncate text-sm font-semibold">{op.company}</p>
      <p className="truncate text-[11px] text-muted-foreground">{op.contact}</p>
      <p className="mt-2 font-display text-base font-bold">{currency(op.value)}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <TemperatureBadge value={op.temperature} />
        <Tag tone="info">{op.probability}%</Tag>
        <Tag tone={op.daysInStage > 18 ? "danger" : "neutral"}>{op.daysInStage}d</Tag>
      </div>
      <div className="mt-2.5">
        <HealthScore value={op.health} />
      </div>
      <div className="mt-2.5 space-y-1 border-t pt-2 text-[11px] text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <CalendarClock className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {op.nextActivity} · {op.nextActivityDate}
          </span>
        </p>
        <p className="flex items-center gap-1.5">
          <User className="h-3 w-3 shrink-0" />
          <span className="truncate">{op.owner}</span>
        </p>
      </div>
    </button>
  );
}

function PipelinePage() {
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState("todos");
  const [temp, setTemp] = useState("todas");

  const filtered = useMemo(
    () =>
      opportunities.filter(
        (o) =>
          (owner === "todos" || o.owner === owner) &&
          (temp === "todas" || o.temperature === temp) &&
          (o.company.toLowerCase().includes(query.toLowerCase()) ||
            o.contact.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, owner, temp],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pipeline"
        description={`${filtered.length} oportunidades · ${compact(
          filtered.reduce((s, o) => s + o.value, 0),
        )} em jogo`}
      />

      <div className="card-surface grid grid-cols-1 gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar por empresa ou contato"
            className="pl-9"
          />
        </div>
        <Select value={owner} onValueChange={setOwner}>
          <SelectTrigger className="w-full sm:w-52">
            <Filter className="h-3.5 w-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os responsáveis</SelectItem>
            {OWNERS.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={temp} onValueChange={setTemp}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas temperaturas</SelectItem>
            <SelectItem value="Quente">Quente</SelectItem>
            <SelectItem value="Morno">Morno</SelectItem>
            <SelectItem value="Frio">Frio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="scroll-slim -mx-1 overflow-x-auto pb-3">
        <div className="flex min-w-max gap-3 px-1">
          {STAGES.map((stage) => {
            const items = filtered.filter((o) => o.stage === stage.id);
            const total = items.reduce((s, o) => s + o.value, 0);
            return (
              <div key={stage.id} className="flex w-[286px] shrink-0 flex-col rounded-2xl bg-secondary/50 p-2.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-1.5 pb-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{stage.label}</p>
                    <p className="text-[11px] text-muted-foreground">{compact(total)}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {items.map((op) => (
                    <Card key={op.id} op={op} onClick={() => setSelected(op)} />
                  ))}
                  {items.length === 0 && (
                    <p className="rounded-xl border border-dashed p-4 text-center text-[11px] text-muted-foreground">
                      Sem oportunidades
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <OpportunityDrawer op={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
