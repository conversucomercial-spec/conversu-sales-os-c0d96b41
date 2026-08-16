import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Linkedin, Mail, MessageCircle, Pencil, Phone, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader, Panel, Tag, Timeline } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactDialog } from "@/components/contact-dialog";
import { useCrmMutations } from "@/hooks/use-accounts";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCrm } from "@/hooks/use-crm";
import { FilterSelect, TagFilter, Toolbar } from "@/components/toolbar";
import { TagPicker } from "@/components/tag-picker";
import type { CrmContact } from "@/lib/crm-mappers";

export const Route = createFileRoute("/_authenticated/contatos")({
  head: () => ({
    meta: [
      { title: "Contatos | Conversu Sales OS" },
      {
        name: "description",
        content: "Todos os contatos comerciais com cargo, canais e histórico de relacionamento.",
      },
      { property: "og:title", content: "Contatos | Conversu Sales OS" },
      {
        property: "og:description",
        content: "Contatos com cargo, canais de contato e histórico de relacionamento.",
      },
    ],
  }),
  component: ContatosPage,
});

function ContatosPage() {
  const { data, isLoading } = useCrm();
  const contacts = data.contacts;
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CrmContact | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CrmContact | null>(null);
  const [sort, setSort] = useState("az");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [tagMode, setTagMode] = useState<"any" | "all">("any");
  const { contact: contactMutations } = useCrmMutations();

  const removeContact = async (contact: CrmContact) => {
    if (!window.confirm(`Excluir o contato ${contact.name}?`)) return;
    await contactMutations.remove.mutateAsync({ id: contact.id });
    setSelected(null);
  };

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    return contacts
      .filter((c) => {
        const ids = (c.tags ?? []).map((t) => t.id);
        const tagOk =
          tagIds.length === 0 ||
          (tagMode === "all" ? tagIds.every((id) => ids.includes(id)) : tagIds.some((id) => ids.includes(id)));
        return (
          tagOk &&
          (c.name.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q))
        );
      })
      .sort((a, b) =>
        sort === "az"
          ? a.name.localeCompare(b.name, "pt-BR")
          : b.name.localeCompare(a.name, "pt-BR"),
      );
  }, [contacts, query, sort, tagIds, tagMode]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contatos"
        description={
          isLoading ? "Carregando contatos…" : `${rows.length} pessoas mapeadas nas contas`
        }
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Novo contato
          </Button>
        }
      />

      <Toolbar>
        <FilterSelect
          value={sort}
          onChange={setSort}
          className="sm:w-48"
          options={[
            { value: "az", label: "Nome A → Z" },
            { value: "za", label: "Nome Z → A" },
          ]}
        />
        <TagFilter
          tags={data.tags}
          selected={tagIds}
          onSelectedChange={setTagIds}
          mode={tagMode}
          onModeChange={setTagMode}
        />
      </Toolbar>

      <Panel bodyClassName="p-0">
        <div className="relative border-b p-3">
          <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar contato ou empresa"
            className="pl-9"
          />
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
                    <Tag
                      tone={
                        c.relationship === "Forte"
                          ? "success"
                          : c.relationship === "Neutro"
                            ? "neutral"
                            : "warning"
                      }
                    >
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
        <SheetContent
          side="right"
          className="scroll-slim w-full overflow-y-auto p-0 sm:max-w-[560px]"
        >
          {selected && (
            <div className="space-y-5 p-6">
              <div>
                <p className="text-xs text-muted-foreground">{selected.company}</p>
                <h2 className="font-display text-xl font-bold">{selected.name}</h2>
                <p className="text-sm text-muted-foreground">{selected.role}</p>
                <div className="mt-3">
                  <TagPicker entity="contact" entityId={selected.id} tags={selected.tags ?? []} />
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(selected);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" /> Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void removeContact(selected)}>
                    <Trash2 className="h-4 w-4" /> Excluir
                  </Button>
                </div>
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
                    <div
                      key={label as string}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
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
                <Timeline
                  items={
                    data.opportunities.find((o) => o.companyId === selected.companyId)?.timeline ??
                    []
                  }
                />
              </Panel>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ContactDialog open={formOpen} onOpenChange={setFormOpen} contact={editing} />
    </div>
  );
}
