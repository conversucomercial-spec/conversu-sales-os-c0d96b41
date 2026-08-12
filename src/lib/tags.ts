import type { TagRef } from "@/lib/data";

export type TagRow = TagRef & { ownerId: string };

/** Gera um slug simples e estável a partir do nome da tag. */
export function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Paleta opcional para a cor da tag (cor é opcional por decisão de escopo). */
export const TAG_COLORS = [
  { value: "core", label: "Core", className: "bg-primary/12 text-primary border-primary/25" },
  { value: "flow", label: "Flow", className: "bg-flow/12 text-flow border-flow/25" },
  { value: "success", label: "Verde", className: "bg-success/12 text-success border-success/25" },
  { value: "warning", label: "Âmbar", className: "bg-warning/12 text-warning border-warning/25" },
  { value: "danger", label: "Vermelho", className: "bg-danger/12 text-danger border-danger/25" },
] as const;

export function tagColorClass(color: string | null | undefined) {
  return (
    TAG_COLORS.find((c) => c.value === color)?.className ??
    "bg-secondary text-muted-foreground border-border"
  );
}
