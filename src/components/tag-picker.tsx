import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Tags as TagsIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { TagBadge } from "@/components/tag-badge";
import { CRM_QUERY_KEY, useCrm } from "@/hooks/use-crm";
import { TAG_COLORS, tagColorClass } from "@/lib/tags";
import { cn } from "@/lib/utils";
import {
  addOpportunityTag,
  createTag,
  deleteTag,
  removeOpportunityTag,
  setEntityTag,
} from "@/lib/tags.functions";
import type { TagRef } from "@/lib/data";

/** Seleção, criação e remoção de tags de oportunidade, empresa ou contato. */
export function TagPicker({
  opportunityId,
  entity = "opportunity",
  entityId,
  tags,
}: {
  opportunityId?: string;
  entity?: "opportunity" | "company" | "contact";
  entityId?: string;
  tags: TagRef[];
}) {
  const targetId = entity === "opportunity" ? (opportunityId ?? entityId ?? "") : (entityId ?? "");
  const { data } = useCrm();
  const queryClient = useQueryClient();
  const addTag = useServerFn(addOpportunityTag);
  const removeTag = useServerFn(removeOpportunityTag);
  const setTag = useServerFn(setEntityTag);
  const create = useServerFn(createTag);
  const remove = useServerFn(deleteTag);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEY });
  const onError = (error: Error) => toast.error(error.message);

  const apply = (tagId: string, on: boolean) => {
    if (entity !== "opportunity") {
      return setTag({ data: { entity, entityId: targetId, tagId, on } });
    }
    return on
      ? addTag({ data: { opportunityId: targetId, tagId } })
      : removeTag({ data: { opportunityId: targetId, tagId } });
  };

  const toggle = useMutation({
    mutationFn: (vars: { tagId: string; on: boolean }) => apply(vars.tagId, vars.on),
    onSuccess: refresh,
    onError,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const tag = await create({ data: { name, color } });
      await apply(tag.id, true);
    },
    onSuccess: () => {
      setName("");
      setColor(null);
      toast.success("Tag criada");
      void refresh();
    },
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Tag excluída");
      void refresh();
    },
    onError,
  });

  const selected = new Set(tags.map((t) => t.id));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          onRemove={() => toggle.mutate({ tagId: tag.id, on: false })}
        />
      ))}
      {tags.length === 0 && (
        <span className="text-xs text-muted-foreground">Nenhuma tag aplicada</span>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
            <TagsIcon className="h-3.5 w-3.5" /> Tags
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-3">
          <p className="mb-2 text-xs font-semibold">Tags do time</p>
          <div className="scroll-slim max-h-52 space-y-1 overflow-y-auto">
            {data.tags.length === 0 && (
              <p className="text-xs text-muted-foreground">Crie a primeira tag abaixo.</p>
            )}
            {data.tags.map((tag) => (
              <div key={tag.id} className="flex items-center gap-2 rounded-md px-1 py-1">
                <Checkbox
                  id={`tag-${tag.id}`}
                  checked={selected.has(tag.id)}
                  onCheckedChange={(v) => toggle.mutate({ tagId: tag.id, on: v === true })}
                />
                <label htmlFor={`tag-${tag.id}`} className="min-w-0 flex-1 cursor-pointer">
                  <TagBadge tag={tag} />
                </label>
                <button
                  type="button"
                  aria-label={`Excluir tag ${tag.name}`}
                  className="text-muted-foreground transition-colors hover:text-danger"
                  onClick={() => deleteMutation.mutate(tag.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <p className="mb-2 text-xs font-semibold">Nova tag</p>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da tag"
            className="h-8"
          />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setColor(null)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px]",
                tagColorClass(null),
                color === null && "ring-2 ring-ring",
              )}
            >
              Padrão
            </button>
            {TAG_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px]",
                  c.className,
                  color === c.value && "ring-2 ring-ring",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            className="mt-3 w-full"
            disabled={!name.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            <Plus className="h-3.5 w-3.5" /> Criar e aplicar
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
