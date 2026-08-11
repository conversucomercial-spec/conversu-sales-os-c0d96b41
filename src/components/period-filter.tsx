import { useMemo } from "react";
import { CalendarRange } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/components/toolbar";
import { formatRange, resolvePeriod, PERIODS, type PeriodId, type PeriodRange } from "@/lib/period";

export type PeriodValue = { id: PeriodId; start?: string; end?: string };

export const DEFAULT_PERIOD: PeriodValue = { id: "mes" };

/** Resolve o intervalo a partir do valor controlado do seletor. */
export function usePeriodRange(value: PeriodValue): PeriodRange {
  return useMemo(
    () => resolvePeriod(value.id, { start: value.start, end: value.end }),
    [value.id, value.start, value.end],
  );
}

/** Seletor de período reutilizável em todas as telas com métricas. */
export function PeriodFilter({
  value,
  onChange,
  className,
}: {
  value: PeriodValue;
  onChange: (v: PeriodValue) => void;
  className?: string;
}) {
  const range = usePeriodRange(value);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          value={value.id}
          onChange={(id) => onChange({ ...value, id: id as PeriodId })}
          options={PERIODS.map((p) => ({ value: p.id, label: p.label }))}
          className="w-full sm:w-56"
        />
        {value.id === "personalizado" && (
          <>
            <Input
              type="date"
              value={value.start ?? ""}
              onChange={(e) => onChange({ ...value, start: e.target.value })}
              className="w-full sm:w-40"
              aria-label="Início do período"
            />
            <Input
              type="date"
              value={value.end ?? ""}
              onChange={(e) => onChange({ ...value, end: e.target.value })}
              className="w-full sm:w-40"
              aria-label="Fim do período"
            />
          </>
        )}
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarRange className="h-3.5 w-3.5" />
          {formatRange(range)}
        </span>
      </div>
    </div>
  );
}
