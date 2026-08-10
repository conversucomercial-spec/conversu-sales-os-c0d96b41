import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Linkedin, Mail, MessageCircle, Phone, Search } from "lucide-react";
import { PageHeader, Panel, Tag, Timeline } from "@/components/kit";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { contacts, opportunities } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/contatos")({
  head: () => ({
    meta: [
      { title: "Contatos | Conversu Sales OS" },
      { name: "description", content: "Todos os contatos comerciais com cargo, canais e histórico de relacionamento." },
      { property: "og:title", content: "Contatos | Conversu Sales OS" },
      { property: "og:description", content: "Contatos com cargo, canais de contato e histórico de relacionamento." },
    ],
  }),
  component: ContatosPage,
});

type Contact = (typeof contacts)[number];

function ContatosPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Contact | null>(null);

  const rows = useMemo(
    () =>
      contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.company.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Contatos" description={`${rows.length} pessoas mapeadas nas contas`} />

      <Panel bodyClassName="p-0">
        <div className="relative border-b p-3">
          <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar contato ou empresa" className="pl-9" />
        </div>
        <div className="scroll-slim overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contato</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Relacionamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id} className="cursor-pointer" onClick={() => setSelected(c)}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.role}</TableCell>
                  <TableCell>{c.company}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{c.phone}</TableCell>
                  <TableCell>
                    <Tag tone={c.relationship === "Forte" ? "success" : c.relationship === "Neutro" ? "neutral" : "warning"}>
                      {c.relationship}
                    </Tag>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="scroll-slim w-full overflow-y-auto p-0 sm:max-w-[560px]">
          {selected && (
            <div className="space-y-5 p-6">
              <div>
                <p className="text-xs text-muted-foreground">{selected.company}</p>
                <h2 className="font-display text-xl font-bold">{selected.name}</h2>
                <p className="text-sm text-muted-foreground">{selected.role}</p>
              </div>
              <Panel title="Canais" bodyClassName="space-y-2.5">
                {[
                  [Phone, "Telefone", selected.phone],
                  [MessageCircle, "WhatsApp", selected.whatsapp],
                  [Mail, "E-mail", selected.email],
                  [Linkedin, "LinkedIn", selected.linkedin],
                ].map(([Icon, label, value]) => {
                  const I = Icon as typeof Phone;
                  return (
                    <div key={label as string} className="flex items-center gap-3 rounded-lg border p-3">
                      <I className="h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">{label as string}</p>
                        <p className="truncate text-sm font-medium">{value as string}</p>
                      </div>
                    </div>
                  );
                })}
              </Panel>
              <Panel title="Relacionamento" bodyClassName="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Tag tone="success">{selected.relationship}</Tag>
                  <Tag>Última interação {selected.lastInteraction}</Tag>
                </div>
              </Panel>
              <Panel title="Histórico">
                <Timeline items={opportunities[0]!.timeline} />
              </Panel>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
