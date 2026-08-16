import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Download, Link as LinkIcon, Paperclip, Trash2, Upload } from "lucide-react";
import { Panel } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/components/toolbar";
import { Tag } from "@/components/kit";
import { supabase } from "@/integrations/supabase/client";
import {
  createDocumentUpload,
  deleteDocument,
  getDocumentUrl,
  listDocuments,
  registerDocument,
} from "@/lib/documents.functions";
import {
  DOCUMENT_CATEGORIES,
  documentCategoryLabel,
  formatBytes,
} from "@/lib/documents";

type Scope = {
  companyId?: string;
  opportunityId?: string;
  meetingId?: string;
  proposalId?: string;
};

/** Anexos/documentos comerciais de uma empresa, oportunidade ou reunião. */
export function DocumentsPanel({
  scope,
  title = "Documentos e anexos",
}: {
  scope: Scope;
  title?: string;
}) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<string>("outro");
  const [filter, setFilter] = useState<string>("todas");
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const fetchDocs = useServerFn(listDocuments);
  const prepare = useServerFn(createDocumentUpload);
  const register = useServerFn(registerDocument);
  const signUrl = useServerFn(getDocumentUrl);
  const remove = useServerFn(deleteDocument);

  const key = ["documents", scope] as const;
  const { data: docs = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: () => fetchDocs({ data: scope }),
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: key });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const { path, token } = await prepare({ data: { name: file.name } });
      const { error } = await supabase.storage
        .from("documents")
        .uploadToSignedUrl(path, token, file);
      if (error) throw new Error(error.message);
      await register({
        data: {
          name: file.name,
          storagePath: path,
          mimeType: file.type,
          sizeBytes: file.size,
          category,
          companyId: scope.companyId ?? null,
          opportunityId: scope.opportunityId ?? null,
          meetingId: scope.meetingId ?? null,
          proposalId: scope.proposalId ?? null,
        },
      });
    },
    onSuccess: () => {
      toast.success("Documento enviado");
      void refresh();
    },
    onError: (e: Error) => toast.error("Falha no upload", { description: e.message }),
  });

  const addLink = useMutation({
    mutationFn: () =>
      register({
        data: {
          name: linkName.trim() || linkUrl.trim(),
          externalUrl: linkUrl.trim(),
          category,
          companyId: scope.companyId ?? null,
          opportunityId: scope.opportunityId ?? null,
          meetingId: scope.meetingId ?? null,
          proposalId: scope.proposalId ?? null,
        },
      }),
    onSuccess: () => {
      toast.success("Link anexado");
      setLinkName("");
      setLinkUrl("");
      void refresh();
    },
    onError: (e: Error) => toast.error("Não foi possível anexar", { description: e.message }),
  });

  const open = useMutation({
    mutationFn: (id: string) => signUrl({ data: { id } }),
    onSuccess: ({ url }) => window.open(url, "_blank", "noopener"),
    onError: (e: Error) => toast.error(e.message),
  });

  const destroy = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Documento excluído");
      void refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = docs.filter((d) => filter === "todas" || d.category === filter);

  return (
    <Panel
      title={title}
      description="Propostas, discovery, atas, contratos e apresentações"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            value={category}
            onChange={setCategory}
            className="w-40"
            options={DOCUMENT_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          />
          <Button size="sm" disabled={upload.isPending} onClick={() => fileRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" /> {upload.isPending ? "Enviando…" : "Enviar"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload.mutate(file);
              e.target.value = "";
            }}
          />
        </div>
      }
      bodyClassName="space-y-2.5"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={linkName}
          onChange={(e) => setLinkName(e.target.value)}
          placeholder="Nome do anexo (opcional)"
          className="sm:w-56"
        />
        <Input
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="Cole um link (Drive, Notion, PDF…)"
          className="flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => addLink.mutate()}
          disabled={!linkUrl.trim() || addLink.isPending}
        >
          <LinkIcon className="h-3.5 w-3.5" /> Anexar link
        </Button>
      </div>

      <FilterSelect
        value={filter}
        onChange={setFilter}
        className="w-full sm:w-52"
        options={[
          { value: "todas", label: "Todas as categorias" },
          ...DOCUMENT_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
        ]}
      />
      {isLoading && <p className="text-xs text-muted-foreground">Carregando documentos…</p>}
      {!isLoading && rows.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Nenhum documento anexado ainda. Envie propostas, atas ou contratos aqui.
        </p>
      )}
      {rows.map((d) => (
        <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
          <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{d.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {d.externalUrl ? "Link externo" : formatBytes(d.sizeBytes)} ·{" "}
              {new Date(d.createdAt).toLocaleDateString("pt-BR")} ·{" "}
              {d.ownerName}
            </p>
          </div>
          <Tag>{documentCategoryLabel(d.category)}</Tag>
          <Button size="icon" variant="ghost" aria-label="Baixar" onClick={() => open.mutate(d.id)}>
            <Download className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Excluir"
            onClick={() => {
              if (window.confirm(`Excluir "${d.name}"?`)) destroy.mutate(d.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </Panel>
  );
}
