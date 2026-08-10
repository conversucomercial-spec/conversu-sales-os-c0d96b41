import { currency } from "@/lib/data";
import { goalProgress, type GoalGroup, type GoalMetric } from "@/lib/config";
import { Panel } from "@/components/kit";
import { cn } from "@/lib/utils";

const fmt = (m: GoalMetric, v: number) =>
  m.format === "moeda" ? currency(v) : v.toLocaleString("pt-BR");

function MetricRow({ metric }: { metric: GoalMetric }) {
  const { progress, forecastProgress, gap } = goalProgress(metric);
  const positive = gap <= 0;
  return (
    <div className="min-w-0 py-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
        <p className="truncate text-sm font-medium">{metric.label}</p>
        <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {fmt(metric, metric.actual)} / {fmt(metric, metric.target)}
        </p>
      </div>
      <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-mind/30"
          style={{ width: `${forecastProgress}%` }}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            progress >= 100 ? "bg-success" : progress >= 60 ? "bg-primary" : "bg-flow",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span>Realizado {progress}%</span>
        <span>Forecast {fmt(metric, metric.forecast)}</span>
        <span className={positive ? "font-semibold text-success" : "font-semibold text-danger"}>
          Gap {positive ? "—" : fmt(metric, gap)}
        </span>
      </div>
    </div>
  );
}

export function GoalCard({ group }: { group: GoalGroup }) {
  return (
    <Panel title={group.name} description={group.subtitle} bodyClassName="divide-y p-4">
      {group.metrics.map((m) => (
        <MetricRow key={m.id} metric={m} />
      ))}
    </Panel>
  );
}
