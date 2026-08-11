import { Panel, Tag } from "@/components/kit";
import { compact, type Opportunity } from "@/lib/data";

export type ScenarioId = "comprometido" | "provavel" | "otimista";

export const SCENARIOS: { id: ScenarioId; label: string; hint: string; min: number }[] = [
  { id: "comprometido", label: "Comprometido", hint: "Probabilidade ≥ 80%", min: 80 },
  { id: "provavel", label: "Provável", hint: "Probabilidade 50–79%", min: 50 },
  { id: "otimista", label: "Otimista", hint: "Probabilidade < 50%", min: 0 },
];

export const scenarioOf = (o: Opportunity): ScenarioId =>
  o.probability >= 80 ? "comprometido" : o.probability >= 50 ? "provavel" : "otimista";

export const scenarioLabel = (id: ScenarioId) => SCENARIOS.find((s) => s.id === id)!.label;

export function ForecastScenarios({ ops }: { ops: Opportunity[] }) {
  const total = ops.reduce((s, o) => s + o.value, 0) || 1;

  return (
    <Panel
      title="Cenários de forecast"
      description="Distribuição do pipeline aberto por nível de confiança"
      bodyClassName="grid gap-3 md:grid-cols-3"
    >
      {SCENARIOS.map((s) => {
        const list = ops.filter((o) => scenarioOf(o) === s.id);
        const value = list.reduce((acc, o) => acc + o.value, 0);
        const weighted = list.reduce((acc, o) => acc + (o.value * o.probability) / 100, 0);
        const share = Math.round((value / total) * 100);
        return (
          <div key={s.id} className="rounded-xl border bg-secondary/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{s.label}</p>
              <Tag tone={s.id === "comprometido" ? "success" : s.id === "provavel" ? "info" : "neutral"}>
                {list.length} neg.
              </Tag>
            </div>
            <p className="mt-2 font-display text-2xl font-bold">{compact(value)}</p>
            <p className="text-[11px] text-muted-foreground">
              Ponderado {compact(Math.round(weighted))} · {s.hint}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
              <div className="brand-gradient h-full rounded-full" style={{ width: `${share}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{share}% do pipeline aberto</p>
          </div>
        );
      })}
    </Panel>
  );
}
