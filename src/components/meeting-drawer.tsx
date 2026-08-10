import { CalendarDays, Clock, Users } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Panel, Tag } from "@/components/kit";
import { AiSlot } from "@/components/kit";
import type { Meeting } from "@/lib/data";

export function MeetingDrawer({
  meeting,
  onOpenChange,
}: {
  meeting: Meeting | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={!!meeting} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="scroll-slim w-full gap-0 overflow-y-auto p-0 sm:max-w-[600px]">
        {meeting && (
          <div className="flex flex-col">
            <div className="sticky top-0 z-10 border-b bg-card/95 px-6 py-5 backdrop-blur">
              <p className="text-xs text-muted-foreground">{meeting.company}</p>
              <h2 className="truncate font-display text-lg font-bold">{meeting.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> {meeting.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {meeting.time} · {meeting.duration}
                </span>
                <Tag tone={meeting.status === "Hoje" ? "warning" : meeting.status === "Realizada" ? "success" : "info"}>
                  {meeting.status}
                </Tag>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <Panel title="Participantes" bodyClassName="space-y-2">
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Users className="mt-0.5 h-4 w-4 shrink-0" />
                  {meeting.participants}
                </p>
                <p className="text-xs text-muted-foreground">Responsável: {meeting.owner}</p>
              </Panel>

              <Panel title="Pauta">
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {meeting.agenda.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {a}
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel title="Resumo">
                <p className="text-sm leading-relaxed text-muted-foreground">{meeting.summary}</p>
              </Panel>

              <Panel title="Vínculos" bodyClassName="space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Oportunidade: </span>
                  {meeting.opportunity}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Contato: </span>
                  {meeting.contact}
                </p>
              </Panel>

              <AiSlot
                title="Resumo automático da reunião"
                description="Transcrição, próximos passos e objeções serão gerados aqui pela IA Comercial."
              />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
