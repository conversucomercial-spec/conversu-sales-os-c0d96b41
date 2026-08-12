import { cn } from "@/lib/utils";
import { tagColorClass } from "@/lib/tags";
import type { TagRef } from "@/lib/data";

/** Selo visual de uma tag personalizada. */
export function TagBadge({
  tag,
  className,
  onRemove,
}: {
  tag: TagRef;
  className?: string;
  onRemove?: () => void;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tagColorClass(tag.color),
        className,
      )}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          aria-label={`Remover tag ${tag.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-60 transition-opacity hover:opacity-100"
        >
          ×
        </button>
      )}
    </span>
  );
}
