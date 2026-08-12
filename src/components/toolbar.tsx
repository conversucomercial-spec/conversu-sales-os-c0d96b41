import type { ReactNode } from "react";
import { Search, Tags as TagsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TagBadge } from "@/components/tag-badge";
import type { TagRef } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SearchField({
  value,
  onChange,
  placeholder = "Buscar…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}

export function FilterSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full sm:w-52", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Barra padrão de busca + filtros usada em todas as listas. */
export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("card-surface flex flex-col gap-2 p-3 sm:flex-row sm:items-center", className)}>
      {children}
    </div>
  );
}

/**
 * Filtro por tags: seleção múltipla com lógica "qualquer uma" (OU) ou "todas" (E).
 * Sem seleção, não filtra nada.
 */
export function TagFilter({
  tags,
  selected,
  onSelectedChange,
  mode,
  onModeChange,
  className,
}: {
  tags: TagRef[];
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
  mode: "any" | "all";
  onModeChange: (mode: "any" | "all") => void;
  className?: string;
}) {
  const toggle = (id: string) =>
    onSelectedChange(
      selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id],
    );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-between sm:w-48", className)}>
          <span className="flex items-center gap-2 truncate">
            <TagsIcon className="h-4 w-4 text-muted-foreground" />
            {selected.length === 0 ? "Todas as tags" : `${selected.length} tag(s)`}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <div className="mb-2 flex rounded-lg border p-0.5">
          <Button
            size="sm"
            className="flex-1"
            variant={mode === "any" ? "secondary" : "ghost"}
            onClick={() => onModeChange("any")}
          >
            Qualquer
          </Button>
          <Button
            size="sm"
            className="flex-1"
            variant={mode === "all" ? "secondary" : "ghost"}
            onClick={() => onModeChange("all")}
          >
            Todas
          </Button>
        </div>
        <div className="scroll-slim max-h-56 space-y-1 overflow-y-auto">
          {tags.length === 0 && (
            <p className="text-xs text-muted-foreground">Nenhuma tag criada ainda.</p>
          )}
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-2 px-1 py-1">
              <Checkbox
                id={`filter-tag-${tag.id}`}
                checked={selected.includes(tag.id)}
                onCheckedChange={() => toggle(tag.id)}
              />
              <label htmlFor={`filter-tag-${tag.id}`} className="cursor-pointer">
                <TagBadge tag={tag} />
              </label>
            </div>
          ))}
        </div>
        {selected.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="mt-2 w-full"
            onClick={() => onSelectedChange([])}
          >
            Limpar seleção
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
