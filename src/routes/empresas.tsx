import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageHeader, Panel, Tag } from "@/components/kit";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeline } from "@/components/kit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { companies, contacts, currency, opportunities } from "@/lib/data";

export const Route = createFileRoute("/empresas")({
  head: () => ({
    meta: [
      { title: "Empresas | Conversu Sales OS" },
      { name: "description", content: "Base de empresas com segmento, MRR potencial, responsável e oportunidades." },
      { property: "og:title", content: "Empresas | Conversu Sales OS" },
      { property: "og:description", content: "Base de empresas com segmento, MRR potencial e oportunidades." },
    ],
  }),
  component: EmpresasPage,
});

type Company = (typeof companies)[number];

function EmpresasPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Company | null>(null);

  const rows = useMemo(
    () => companies.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const companyOps = selected ? opportunities.filter((o) => o.companyId === selected.id) : [];
  const companyContacts = selected ? contacts.filter((c) => c.companyId === selected.id) : [];

  return (
    <div className="space-y-5">
      <PageHeader title="Empresas" description={`${rows.length} contas na base comercial`} />

      <Panel bodyClassName="p-0">
        <div className="relative border-b p-3">
          <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar empresa"
            className="pl-9"
          />
        </div>
        <div className="scroll-slim overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>MRR potencial</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Oportunidades</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell><Tag>{c.segment}</Tag></TableCell>
                  <TableCell className="tabular-nums">{currency(c.mrr)}</TableCell>
                  <TableCell className="text-muted-foreground">{c.owner}</TableCell>
                  <TableCell className="tabular-nums">{c.opportunities}</TableCell>
                  <TableCell>
                    <Tag tone={c.status === "Cliente" ? "success" : c.status === "Em negociação" ? "warning" : "info"}>
                      {c.status}
                    </Tag>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="scroll-slim w-full overflow-y-auto p-0 sm:max-w-[620px]">
          {selected && (
            <div className="space-y-5 p-6">
              <div>
                <p className="text-xs text-muted-foreground">{selected.segment} · {selected.city}</p>
                <h2 className="font-display text-xl font-bold">{selected.name}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Tag tone="info">{selected.status}</Tag>
                  <Tag>{selected.employees} colaboradores</Tag>
                  <Tag tone="success">MRR {currency(selected.mrr)}</Tag>
                </div>
              </div>

              <Tabs defaultValue="resumo">
                <TabsList className="flex w-full flex-wrap justify-start">
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="contatos">Contatos</TabsTrigger>
                  <TabsTrigger value="oportunidades">Oportunidades</TabsTrigger>
                  <TabsTrigger value="historico">Histórico</TabsTrigger>
                  <TabsTrigger value="reunioes">Reuniões</TabsTrigger>
                  <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="mt-4">
                  <Panel bodyClassName="grid gap-2.5 sm:grid-cols-2">
                    {[
                      ["Responsável", selected.owner],
                      ["Site", selected.site],
                      ["Cidade", selected.city],
                      ["Oportunidades abertas", String(companyOps.length)],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-lg border bg-secondary/40 px-3 py-2">
                        <p className="text-[11px] text-muted-foreground">{k}</p>
                        <p className="truncate text-sm font-medium">{v}</p>
                      </div>
                    ))}
                  </Panel>
                </TabsContent>

                <TabsContent value="contatos" className="mt-4">
                  <Panel bodyClassName="space-y-2.5">
                    {companyContacts.map((c) => (
                      <div key={c.id} className="rounded-lg border p-3">
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.role} · {c.email}</p>
                      </div>
                    ))}
                  </Panel>
                </TabsContent>

                <TabsContent value="oportunidades" className="mt-4">
                  <Panel bodyClassName="space-y-2.5">
                    {companyOps.map((o) => (
                      <div key={o.id} className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{o.title}</p>
                          <p className="text-xs text-muted-foreground">{o.owner} · {o.probability}%</p>
                        </div>
                        <span className="text-sm font-semibold">{currency(o.value)}</span>
                      </div>
                    ))}
                  </Panel>
                </TabsContent>

                <TabsContent value="historico" className="mt-4">
                  <Panel>
                    <Timeline items={companyOps[0]?.timeline ?? []} />
                  </Panel>
                </TabsContent>

                <TabsContent value="reunioes" className="mt-4">
                  <Panel bodyClassName="space-y-2.5">
                    {(companyOps[0]?.meetings ?? []).map((m, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <p className="text-sm font-medium">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.date} · {m.participants}</p>
                      </div>
                    ))}
                  </Panel>
                </TabsContent>

                <TabsContent value="arquivos" className="mt-4">
                  <Panel bodyClassName="space-y-2.5">
                    {(companyOps[0]?.files ?? []).map((f) => (
                      <div key={f.name} className="rounded-lg border p-3">
                        <p className="text-sm font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{f.size} · {f.date}</p>
                      </div>
                    ))}
                  </Panel>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
