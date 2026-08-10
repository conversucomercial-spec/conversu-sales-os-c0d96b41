import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/kit";
import { ActivityCard } from "@/components/entity-cards";
import { FilterSelect, SearchField, Toolbar } from "@/components/toolbar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection } from "@/hooks/use-collection";
import { ACTIVITY_BUCKETS, activities, OWNERS, type ActivityBucket } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/atividades")({
  head: () => ({
    meta: [
      { title: "Atividades | Conversu Sales OS" },
      { name: "description", content: "Ligações, WhatsApp, e-mails, follow-ups, tarefas e reuniões em uma lista única." },
      { property: "og:title", content: "Atividades | Conversu Sales OS" },
      { property: "og:description", content: "Todas as atividades comerciais com filtros por responsável, status e prioridade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AtividadesPage,
});

const TYPES = ["Ligação", "WhatsApp", "E-mail", "Follow-up", "Tarefa", "Reunião"];

function AtividadesPage() {
  const [bucket, setBucket] = useState<ActivityBucket>("hoje");
  const [owner, setOwner] = useState("todos");
  const [priority, setPriority] = useState("todas");
  const [type, setType] = useState("todos");

  const scoped = useMemo(() => activities.filter((a) => a.bucket === bucket), [bucket]);

  const { query, setQuery, items } = useCollection({
    items: scoped,
    searchFields: (a) => [a.title, a.company, a.contact, a.opportunity, a.owner],
    filters: {
      owner: { value: owner, all: "todos", get: (a) => a.owner },
      priority: { value: priority, all: "todas", get: (a) => a.priority },
      type: { value: type, all: "todos", get: (a) => a.type },
    },
    sortBy: (a) => a.date,
    direction: "asc",
  });

  const grouped = TYPES.map((t) => ({ type: t, list: items.filter((a) => a.type === t) })).filter(
    (g) => g.list.length > 0,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Atividades"
        description={`${activities.filter((a) => a.bucket === "atrasadas").length} atrasadas · ${activities.filter((a) => a.bucket === "hoje").length} para hoje`}
      />

      <Tabs value={bucket} onValueChange={(v) => setBucket(v as ActivityBucket)}>
        <TabsList className="flex w-full flex-wrap justify-start">
          {ACTIVITY_BUCKETS.map((b) => (
            <TabsTrigger key={b.id} value={b.id}>
              {b.label}
              <span className="ml-1.5 text-[11px] text-muted-foreground">
                {activities.filter((a) => a.bucket === b.id).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Toolbar>
        <SearchField value={query} onChange={setQuery} placeholder="Buscar atividade, empresa ou contato…" className="flex-1" />
        <FilterSelect
          value={type}
          onChange={setType}
          options={[{ value: "todos", label: "Todos os tipos" }, ...TYPES.map((t) => ({ value: t, label: t }))]}
        />
        <FilterSelect
          value={owner}
          onChange={setOwner}
          options={[{ value: "todos", label: "Todos os responsáveis" }, ...OWNERS.map((o) => ({ value: o, label: o }))]}
        />
        <FilterSelect
          value={priority}
          onChange={setPriority}
          options={[
            { value: "todas", label: "Todas as prioridades" },
            { value: "Alta", label: "Alta" },
            { value: "Média", label: "Média" },
            { value: "Baixa", label: "Baixa" },
          ]}
        />
      </Toolbar>

      {grouped.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Nenhuma atividade neste filtro"
          description="Ajuste os filtros ou selecione outro período para ver as atividades da equipe."
        />
      ) : (
        <div className="space-y-6">
          {grouped.map((g) => (
            <section key={g.type} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">{g.type}</h2>
                <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {g.list.length}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {g.list.map((a) => (
                  <ActivityCard key={a.id} activity={a} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
