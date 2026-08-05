import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

/**
 * Busca + filtros + ordenação para qualquer coleção mockada.
 * Mesmo contrato poderá ser mantido quando os dados vierem de uma API.
 */
export function useCollection<T>({
  items,
  searchFields,
  filters = {},
  sortBy,
  direction = "desc",
}: {
  items: T[];
  searchFields: (item: T) => string[];
  filters?: Record<string, { value: string; all: string; get: (item: T) => string }>;
  sortBy?: (item: T) => number | string;
  direction?: SortDirection;
}) {
  const [query, setQuery] = useState("");

  const result = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesQuery =
        !q || searchFields(item).some((f) => f.toLowerCase().includes(q));
      const matchesFilters = Object.values(filters).every(
        (f) => f.value === f.all || f.get(item) === f.value,
      );
      return matchesQuery && matchesFilters;
    });
    if (!sortBy) return filtered;
    return [...filtered].sort((a, b) => {
      const av = sortBy(a);
      const bv = sortBy(b);
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), "pt-BR");
      return direction === "asc" ? cmp : -cmp;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query, direction, sortBy, JSON.stringify(Object.values(filters).map((f) => f.value))]);

  return { query, setQuery, items: result };
}
