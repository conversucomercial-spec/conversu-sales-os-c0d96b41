import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock, Users } from "lucide-react";
import { KpiCard, PageHeader, Panel, Tag } from "@/components/kit";
import { meetings } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/reunioes")({
  head: () => ({
    meta: [
      { title: "Reuniões | Conversu Sales OS" },
      { name: "description", content: "Agenda comercial com demonstrações, diagnósticos e follow-ups executivos." },
      { property: "og:title", content: "Reuniões | Conversu Sales OS" },
      { property: "og:description", content: "Agenda comercial de demos, diagnósticos e follow-ups." },
    ],
  }),
  component: ReunioesPage,
});

function ReunioesPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Reuniões" description="Agenda comercial da semana" />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Reuniões hoje" value={meetings.filter((m) => m.status === "Hoje").length} icon={CalendarDays} />
        <KpiCard label="Agendadas" value={meetings.filter((m) => m.status === "Agendada").length} icon={Clock} />
        <KpiCard label="Realizadas" value={meetings.filter((m) => m.status === "Realizada").length} icon={Users} tone="success" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {meetings.map((m) => (
          <Panel key={m.id} bodyClassName="space-y-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{m.title}</p>
                <p className="truncate text-xs text-muted-foreground">{m.company} · {m.contact}</p>
              </div>
              <Tag tone={m.status === "Hoje" ? "warning" : m.status === "Realizada" ? "success" : "info"}>{m.status}</Tag>
            </div>
            <div className="flex flex-wrap gap-2 border-t pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{m.date}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{m.time} · {m.duration}</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{m.owner}</span>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
