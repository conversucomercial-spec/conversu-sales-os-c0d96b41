/** Categorias de documentos comerciais anexados a empresa, oportunidade ou reunião. */
export const DOCUMENT_CATEGORIES = [
  { value: "proposta", label: "Proposta" },
  { value: "discovery", label: "Discovery" },
  { value: "ata", label: "Ata de reunião" },
  { value: "contrato", label: "Contrato" },
  { value: "apresentacao", label: "Apresentação" },
  { value: "outro", label: "Outro" },
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]["value"];

export const documentCategoryLabel = (value: string) =>
  DOCUMENT_CATEGORIES.find((c) => c.value === value)?.label ?? "Outro";

/** Tamanho legível (KB/MB) a partir de bytes. */
export function formatBytes(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
