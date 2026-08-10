import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare } from "lucide-react";

import { PageHeader, EmptyState, Panel } from "@/components/kit";
import { ActivityCard } from "@/components/entity-cards";
import { FilterSelect, SearchField, Toolbar } from "@/components/toolbar";
import { useCollection } from "@/hooks/use-collection";
import { activities, OWNERS } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/tarefas")({
  head: () => ({
    meta: [
      { title: "Tarefas | Conversu Sales OS" },
      { name: "description", content: "Tarefas e follow-ups do time comercial organizados por status." },
      { property: "og:title", content: "Tarefas | Conversu Sales OS" },
      { property: "og:description", content: "Tarefas e follow-ups vinculados a empresas, contatos e oportunidades." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TarefasPage,
});

const COLUMNS = [
  { id: "Atrasada", label: "Atrasadas" },
  { id: "Pendente", label: "Pendentes" },
  { id: "Concluída", label: "Concluídas" },
] as const;

function TarefasPage() {
  const base = activities.filter((a) => a.type === "Tarefa" || a.type === "Follow-up");

  const [owner, setOwner] = useState("todos");

  const { query, setQuery, items } = useCollection({
    items: base,
    searchFields: (a) => [a.title, a.company, a.contact, a.opportunity, a.owner],
    filters: { owner: { value: owner, all: "todos", get: (a) => a.owner } },
    sortBy: (a) => a.date,
    direction: "asc",
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Tarefas" description="Tarefas e follow-ups do time, prontos para automação futura." />

      <Toolbar>
        <SearchField value={query} onChange={setQuery} placeholder="Buscar tarefa, empresa ou oportunidade…" className="flex-1" />
        <FilterSelect
          value={owner}
          onChange={setOwner}
          options={[{ value: "todos", label: "Todos os responsáveis" }, ...OWNERS.map((o) => ({ value: o, label: o }))]}
        />
      </Toolbar>

      {items.length === 0 ? (
        <EmptyState icon={CheckSquare} title="Nenhuma tarefa encontrada" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((c) => {
            const list = items.filter((a) => a.status === c.id);
            return (
              <Panel key={c.id} title={c.label} description={`${list.length} tarefa(s)`} bodyClassName="space-y-3">
                {list.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nada por aqui.</p>
                ) : (
                  list.map((a) => <ActivityCard key={a.id} activity={a} />)
                )}
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
