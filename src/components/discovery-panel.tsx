import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { FileText, Plus, Save } from "lucide-react";
import { Panel, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FilterSelect } from "@/components/toolbar";
import {
  DISCOVERY_FIELDS,
  DISCOVERY_STATUS,
  EMPTY_DISCOVERY,
  type DiscoveryRecord,
} from "@/lib/discovery";
import {
  getOpportunityContext,
  saveDiscovery,
  saveDiscoveryDocument,
} from "@/lib/prospecting.functions";
import type { Opportunity } from "@/lib/data";

/** Discovery estruturado da oportunidade + atas/documentos vinculados. */
export function DiscoveryPanel({ op }: { op: Opportunity }) {
  const queryClient = useQueryClient();
  const fetchContext = useServerFn(getOpportunityContext);
  const persist = useServerFn(saveDiscovery);
  const persistDoc = useServerFn(saveDiscoveryDocument);

  const contextQuery = useQuery({
    queryKey: ["opportunity-context", op.id],
    queryFn: () => fetchContext({ data: { opportunityId: op.id } }),
  });

  const [form, setForm] = useState<DiscoveryRecord>(EMPTY_DISCOVERY);
  useEffect(() => {
    if (contextQuery.data?.discovery) setForm(contextQuery.data.discovery);
  }, [contextQuery.data?.discovery]);

  const [doc, setDoc] = useState({ name: "", date: "", url: "" });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["opportunity-context", op.id] });

  const saveMutation = useMutation({
    mutationFn: () => persist({ data: { opportunityId: op.id, discovery: form } }),
    onSuccess: () => {
      toast.success("Discovery salvo");
      void invalidate();
    },
    onError: (e: Error) => toast.error("Não foi possível salvar", { description: e.message }),
  });

  const docMutation = useMutation({
    mutationFn: () =>
      persistDoc({
        data: { opportunityId: op.id, name: doc.name, date: doc.date, url: doc.url },
      }),
    onSuccess: () => {
      toast.success("Documento vinculado");
      setDoc({ name: "", date: "", url: "" });
      void invalidate();
    },
    onError: (e: Error) => toast.error("Não foi possível vincular", { description: e.message }),
  });

  const documents = contextQuery.data?.documents ?? [];

  return (
    <div className="space-y-4">
      <Panel
        title="Discovery"
        description="Preencha conforme a conversa evolui — salve por blocos."
        actions={
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="h-3.5 w-3.5" /> Salvar
          </Button>
        }
        bodyClassName="space-y-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            value={form.status}
            onChange={(status) => setForm((f) => ({ ...f, status }))}
            options={DISCOVERY_STATUS.map((s) => ({ value: s.id, label: s.label }))}
            className="w-full sm:w-56"
          />
          <Tag tone="info">
            {DISCOVERY_STATUS.find((s) => s.id === form.status)?.label ?? "Não iniciado"}
          </Tag>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {DISCOVERY_FIELDS.map((field) => (
            <label key={field.id} className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">{field.label}</span>
              <Textarea
                rows={field.rows ?? 3}
                value={form[field.id]}
                onChange={(e) => setForm((f) => ({ ...f, [field.id]: e.target.value }))}
              />
            </label>
          ))}
        </div>
      </Panel>

      <Panel title="Atas e documentos" bodyClassName="space-y-3">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px_minmax(0,1fr)_auto]">
          <Input
            value={doc.name}
            onChange={(e) => setDoc((d) => ({ ...d, name: e.target.value }))}
            placeholder="Nome do documento"
            aria-label="Nome do documento"
          />
          <Input
            type="date"
            value={doc.date}
            onChange={(e) => setDoc((d) => ({ ...d, date: e.target.value }))}
            aria-label="Data do documento"
          />
          <Input
            value={doc.url}
            onChange={(e) => setDoc((d) => ({ ...d, url: e.target.value }))}
            placeholder="Link (opcional)"
            aria-label="Link do documento"
          />
          <Button
            size="sm"
            onClick={() => docMutation.mutate()}
            disabled={docMutation.isPending || !doc.name.trim()}
          >
            <Plus className="h-3.5 w-3.5" /> Vincular
          </Button>
        </div>
        {documents.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
            Nenhuma ata vinculada.
          </p>
        ) : (
          documents.map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-lg border p-3">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.date ?? "Sem data"}</p>
              </div>
              {d.url && (
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-primary underline"
                >
                  Abrir
                </a>
              )}
            </div>
          ))
        )}
      </Panel>
    </div>
  );
}