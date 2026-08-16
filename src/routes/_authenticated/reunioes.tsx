import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock, Users } from "lucide-react";

import { KpiCard, PageHeader, Panel, Tag, EmptyState } from "@/components/kit";
import { MeetingDrawer } from "@/components/meeting-drawer";
import { FilterSelect, SearchField, Toolbar } from "@/components/toolbar";
import { useCollection } from "@/hooks/use-collection";
import { meetings, OWNERS, type Meeting } from "@/lib/data";
import { PeriodFilter, usePeriodRange, type PeriodValue } from "@/components/period-filter";
import { inPeriodOrUndated, parseBRDate } from "@/lib/period";

export const Route = createFileRoute("/_authenticated/reunioes")({
  head: () => ({
    meta: [
      { title: "Reuniões | Conversu Sales OS" },
      {
        name: "description",
        content: "Agenda comercial com demonstrações, diagnósticos e follow-ups executivos.",
      },
      { property: "og:title", content: "Reuniões | Conversu Sales OS" },
      {
        property: "og:description",
        content: "Agenda comercial de demos, diagnósticos e follow-ups.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReunioesPage,
});

function ReunioesPage() {
  const [owner, setOwner] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [period, setPeriod] = useState<PeriodValue>({ id: "ano" });
  const range = usePeriodRange(period);

  const { query, setQuery, items } = useCollection({
    items: meetings,
    searchFields: (m) => [m.title, m.company, m.contact, m.owner, m.opportunity],
    filters: {
      owner: { value: owner, all: "todos", get: (m) => m.owner },
      status: { value: status, all: "todos", get: (m) => m.status },
    },
    sortBy: (m) => `${m.date.split("/").reverse().join("-")} ${m.time}`,
    direction: "asc",
  });

  const inRange = items.filter((m) => inPeriodOrUndated(parseBRDate(m.date), range));
  const days = [...new Set(inRange.map((m) => m.date))];

  return (
    <div className="space-y-5">
      <PageHeader title="Reuniões" description="Agenda comercial da equipe" />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          label="Reuniões hoje"
          value={meetings.filter((m) => m.status === "Hoje").length}
          icon={CalendarDays}
          tone="warning"
        />
        <KpiCard
          label="Agendadas"
          value={meetings.filter((m) => m.status === "Agendada").length}
          icon={Clock}
        />
        <KpiCard
          label="Realizadas"
          value={meetings.filter((m) => m.status === "Realizada").length}
          icon={Users}
          tone="success"
        />
      </div>

      <Toolbar>
        <PeriodFilter value={period} onChange={setPeriod} />
      </Toolbar>

      <Toolbar>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Buscar reunião, empresa ou contato…"
          className="flex-1"
        />
        <FilterSelect
          value={owner}
          onChange={setOwner}
          options={[
            { value: "todos", label: "Todos os responsáveis" },
            ...OWNERS.map((o) => ({ value: o, label: o })),
          ]}
        />
        <FilterSelect
          value={status}
          onChange={setStatus}
          options={[
            { value: "todos", label: "Todos os status" },
            { value: "Hoje", label: "Hoje" },
            { value: "Agendada", label: "Agendada" },
            { value: "Realizada", label: "Realizada" },
          ]}
        />
      </Toolbar>

      {days.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhuma reunião encontrada"
          description="Ajuste os filtros para ver a agenda."
        />
      ) : (
        <div className="space-y-5">
          {days.map((day) => (
            <Panel
              key={day}
              title={day}
              description={`${inRange.filter((m) => m.date === day).length} reunião(ões)`}
              bodyClassName="divide-y p-0"
            >
              {inRange
                .filter((m) => m.date === day)
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className="focus-ring grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-secondary"
                  >
                    <span className="w-14 shrink-0 font-display text-sm font-bold tabular-nums">
                      {m.time}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{m.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {m.company} · {m.participants}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {m.opportunity}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {m.owner}
                      </span>
                      <Tag
                        tone={
                          m.status === "Hoje"
                            ? "warning"
                            : m.status === "Realizada"
                              ? "success"
                              : "info"
                        }
                      >
                        {m.status}
                      </Tag>
                    </span>
                  </button>
                ))}
            </Panel>
          ))}
        </div>
      )}

      <MeetingDrawer meeting={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
