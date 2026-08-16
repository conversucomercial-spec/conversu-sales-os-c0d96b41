import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ListChecks, Pencil, Plus, Trash2, Undo2 } from "lucide-react";

import { PageHeader, EmptyState, Panel, PriorityBadge, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { FilterSelect, SearchField, Toolbar } from "@/components/toolbar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityDialog } from "@/components/activity-dialog";
import { useActivities } from "@/hooks/use-activities";
import { useCrm } from "@/hooks/use-crm";
import { DEFAULT_PERIOD, PeriodFilter, usePeriodRange, type PeriodValue } from "@/components/period-filter";
import { inPeriodOrUndated } from "@/lib/period";
import {
  ACTIVITY_BUCKET_LIST,
  ACTIVITY_PRIORITY_LABEL,
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_LABEL,
  activityBucket,
  formatDateTime,
  type ActivityBucketId,
  type ActivityRecord,
} from "@/lib/activities";

export const Route = createFileRoute("/_authenticated/atividades")({
  head: () => ({
    meta: [
      { title: "Atividades | Conversu Sales OS" },
      {
        name: "description",
        content: "Ligações, WhatsApp, e-mails, follow-ups, tarefas e reuniões em uma lista única.",
      },
      { property: "og:title", content: "Atividades | Conversu Sales OS" },
      {
        property: "og:description",
        content: "Todas as atividades comerciais com filtros por responsável, status e prioridade.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AtividadesPage,
});

function ActivityRow({
  activity,
  onToggle,
  onEdit,
  onDelete,
}: {
  activity: ActivityRecord;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const done = activity.status === "concluida";
  return (
    <div className="card-surface flex flex-wrap items-center gap-3 p-3">
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${done ? "line-through opacity-60" : ""}`}>
          {activity.title}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {activity.companyName} · {activity.contactName} · {activity.ownerName}
        </p>
        {activity.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{activity.description}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag>{formatDateTime(activity.dueAt)}</Tag>
        <PriorityBadge value={ACTIVITY_PRIORITY_LABEL[activity.priority]} />
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          aria-label={done ? "Reabrir" : "Concluir"}
          onClick={onToggle}
        >
          {done ? <Undo2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" aria-label="Editar" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" aria-label="Excluir" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function AtividadesPage() {
  const { items, isLoading, updateActivity, deleteActivity } = useActivities();
  const { data } = useCrm();
  const [bucket, setBucket] = useState<ActivityBucketId>("hoje");
  const [owner, setOwner] = useState("todos");
  const [priority, setPriority] = useState("todas");
  const [type, setType] = useState("todos");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<PeriodValue>({ id: "ano" });
  const range = usePeriodRange(period);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityRecord | null>(null);

  const countByBucket = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const a of items) {
      const b = activityBucket(a);
      acc[b] = (acc[b] ?? 0) + 1;
    }
    return acc;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((a) => activityBucket(a) === bucket)
      .filter((a) => owner === "todos" || a.ownerName === owner)
      .filter((a) => priority === "todas" || a.priority === priority)
      .filter((a) => type === "todos" || a.type === type)
      .filter((a) => inPeriodOrUndated(a.dueAt ? new Date(a.dueAt) : null, range))
      .filter(
        (a) =>
          !q ||
          [a.title, a.companyName, a.contactName, a.opportunityTitle, a.ownerName]
            .join(" ")
            .toLowerCase()
            .includes(q),
      )
      .sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""));
  }, [items, bucket, owner, priority, type, query, range]);

  const grouped = ACTIVITY_TYPES.map((t) => ({
    type: t,
    list: filtered.filter((a) => a.type === t),
  })).filter((g) => g.list.length > 0);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Atividades"
        description={
          isLoading
            ? "Carregando atividades…"
            : `${countByBucket["atrasadas"] ?? 0} atrasadas · ${countByBucket["hoje"] ?? 0} para hoje`
        }
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> Nova atividade
          </Button>
        }
      />

      <Tabs value={bucket} onValueChange={(v) => setBucket(v as ActivityBucketId)}>
        <TabsList className="flex w-full flex-wrap justify-start">
          {ACTIVITY_BUCKET_LIST.map((b) => (
            <TabsTrigger key={b.id} value={b.id}>
              {b.label}
              <span className="ml-1.5 text-[11px] text-muted-foreground">
                {countByBucket[b.id] ?? 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Toolbar>
        <PeriodFilter value={period} onChange={setPeriod} />
      </Toolbar>

      <Toolbar>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Buscar atividade, empresa ou contato…"
          className="flex-1"
        />
        <FilterSelect
          value={type}
          onChange={setType}
          options={[
            { value: "todos", label: "Todos os tipos" },
            ...ACTIVITY_TYPES.map((t) => ({ value: t, label: ACTIVITY_TYPE_LABEL[t] })),
          ]}
        />
        <FilterSelect
          value={owner}
          onChange={setOwner}
          options={[
            { value: "todos", label: "Todos os responsáveis" },
            ...data.people.map((p) => ({ value: p.name, label: p.name })),
          ]}
        />
        <FilterSelect
          value={priority}
          onChange={setPriority}
          options={[
            { value: "todas", label: "Todas as prioridades" },
            { value: "alta", label: "Alta" },
            { value: "media", label: "Média" },
            { value: "baixa", label: "Baixa" },
          ]}
        />
      </Toolbar>

      {grouped.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title={
            items.length === 0 ? "Nenhuma atividade registrada" : "Nenhuma atividade neste filtro"
          }
          description={
            items.length === 0
              ? "Crie a primeira atividade e vincule à empresa, ao contato ou à oportunidade."
              : "Ajuste os filtros ou selecione outro período."
          }
          action={
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" /> Nova atividade
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {grouped.map((g) => (
            <section key={g.type} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">{ACTIVITY_TYPE_LABEL[g.type]}</h2>
                <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {g.list.length}
                </span>
              </div>
              <Panel bodyClassName="space-y-2.5">
                {g.list.map((a) => (
                  <ActivityRow
                    key={a.id}
                    activity={a}
                    onToggle={() =>
                      void updateActivity({
                        id: a.id,
                        status: a.status === "concluida" ? "pendente" : "concluida",
                      })
                    }
                    onEdit={() => {
                      setEditing(a);
                      setDialogOpen(true);
                    }}
                    onDelete={() => void deleteActivity(a.id)}
                  />
                ))}
              </Panel>
            </section>
          ))}
        </div>
      )}

      <ActivityDialog open={dialogOpen} onOpenChange={setDialogOpen} activity={editing} />
    </div>
  );
}
