/**
 * Camada única de períodos para métricas e filtros.
 *
 * Todas as telas devem usar estas funções para interpretar "hoje", "este mês"
 * etc., garantindo o mesmo recorte em qualquer lugar. Sempre baseado na data
 * real do usuário (fuso local), nunca em data fixa de mock.
 */

export type PeriodId =
  | "hoje"
  | "semana"
  | "mes"
  | "trimestre"
  | "semestre"
  | "ano"
  | "personalizado";

export type PeriodRange = { start: Date; end: Date; id: PeriodId; label: string };

export const PERIODS: { id: PeriodId; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "semana", label: "Esta semana" },
  { id: "mes", label: "Este mês" },
  { id: "trimestre", label: "Trimestre" },
  { id: "semestre", label: "Semestre" },
  { id: "ano", label: "Ano" },
  { id: "personalizado", label: "Período personalizado" },
];

export const periodLabel = (id: PeriodId) => PERIODS.find((p) => p.id === id)?.label ?? "Período";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

/** Resolve o intervalo [início, fim] de um período. Semana começa na segunda-feira. */
export function resolvePeriod(
  id: PeriodId,
  custom?: { start?: string | undefined; end?: string | undefined },
  now: Date = new Date(),
): PeriodRange {
  const label = periodLabel(id);
  const y = now.getFullYear();
  const m = now.getMonth();

  switch (id) {
    case "hoje":
      return { id, label, start: startOfDay(now), end: endOfDay(now) };
    case "semana": {
      const weekday = (now.getDay() + 6) % 7; // segunda = 0
      const start = startOfDay(new Date(y, m, now.getDate() - weekday));
      return { id, label, start, end: endOfDay(new Date(start.getTime() + 6 * 86400000)) };
    }
    case "mes":
      return { id, label, start: new Date(y, m, 1), end: endOfDay(new Date(y, m + 1, 0)) };
    case "trimestre": {
      const q = Math.floor(m / 3) * 3;
      return { id, label, start: new Date(y, q, 1), end: endOfDay(new Date(y, q + 3, 0)) };
    }
    case "semestre": {
      const s = m < 6 ? 0 : 6;
      return { id, label, start: new Date(y, s, 1), end: endOfDay(new Date(y, s + 6, 0)) };
    }
    case "ano":
      return { id, label, start: new Date(y, 0, 1), end: endOfDay(new Date(y, 11, 31)) };
    case "personalizado": {
      const start = custom?.start ? new Date(`${custom.start}T00:00:00`) : new Date(y, m, 1);
      const end = custom?.end ? new Date(`${custom.end}T23:59:59.999`) : endOfDay(now);
      return { id, label, start, end };
    }
  }
}

/** Verifica se uma data (ISO, Date ou nulo) cai dentro do período. */
export function inPeriod(date: string | Date | null | undefined, range: PeriodRange): boolean {
  if (!date) return false;
  const t = (typeof date === "string" ? new Date(date) : date).getTime();
  return Number.isFinite(t) && t >= range.start.getTime() && t <= range.end.getTime();
}

/** Rótulo legível do intervalo, para exibir junto às métricas. */
export function formatRange(range: PeriodRange): string {
  const fmt = (d: Date) => d.toLocaleDateString("pt-BR");
  return range.start.toDateString() === range.end.toDateString()
    ? fmt(range.start)
    : `${fmt(range.start)} – ${fmt(range.end)}`;
}
