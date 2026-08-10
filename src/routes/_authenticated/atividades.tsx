import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, Mail, MessageCircle, PhoneCall, RefreshCcw, Square } from "lucide-react";
import { PageHeader, Panel, Tag } from "@/components/kit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { activities, OWNERS } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/atividades")({
  head: () => ({
    meta: [
      { title: "Atividades | Conversu Sales OS" },
      { name: "description", content: "Ligações, WhatsApp, e-mails, follow-ups, tarefas e reuniões em uma lista única." },
      { property: "og:title", content: "Atividades | Conversu Sales OS" },
      { property: "og:description", content: "Todas as atividades comerciais com filtros por responsável, status e prioridade." },
    ],
  }),
  component: AtividadesPage,
});

const icons: Record<string, typeof PhoneCall> = {
  "Ligação": PhoneCall,
  WhatsApp: MessageCircle,
  "E-mail": Mail,
  "Follow-up": RefreshCcw,
  Tarefa: Square,
  "Reunião": CalendarDays,
};

function AtividadesPage() {
  const [owner, setOwner] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [priority, setPriority] = useState("todas");

  const rows = useMemo(
    () =>
      activities.filter(
        (a) =>
          (owner === "todos" || a.owner === owner) &&
          (status === "todos" || a.status === status) &&
          (priority === "todas" || a.priority === priority),
      ),
    [owner, status, priority],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Atividades"
        description={`${rows.length} atividades · ${activities.filter((a) => a.status === "Atrasada").length} atrasadas`}
      />

      <div className="card-surface grid gap-2 p-3 sm:grid-cols-3">
        <Select value={owner} onValueChange={setOwner}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os responsáveis</SelectItem>
            {OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Concluída">Concluída</SelectItem>
            <SelectItem value="Atrasada">Atrasada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as prioridades</SelectItem>
            <SelectItem value="Alta">Alta</SelectItem>
            <SelectItem value="Média">Média</SelectItem>
            <SelectItem value="Baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Panel bodyClassName="p-0">
        <div className="scroll-slim overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atividade</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => {
                const Icon = icons[a.type] ?? CheckCircle2;
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-primary" />
                        {a.title}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{a.type}</TableCell>
                    <TableCell>{a.company}</TableCell>
                    <TableCell className="text-muted-foreground">{a.contact}</TableCell>
                    <TableCell className="text-muted-foreground">{a.owner}</TableCell>
                    <TableCell className="tabular-nums">{a.date}</TableCell>
                    <TableCell>
                      <Tag tone={a.priority === "Alta" ? "danger" : a.priority === "Média" ? "warning" : "neutral"}>
                        {a.priority}
                      </Tag>
                    </TableCell>
                    <TableCell>
                      <Tag tone={a.status === "Concluída" ? "success" : a.status === "Atrasada" ? "danger" : "info"}>
                        {a.status}
                      </Tag>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Panel>
    </div>
  );
}
