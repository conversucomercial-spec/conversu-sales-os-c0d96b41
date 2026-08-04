import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Temperature } from "@/lib/data";
import { Flame, Snowflake, Thermometer, type LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate font-display text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({
  title,
  description,
  actions,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("card-surface overflow-hidden", className)}>
      {(title || actions) && (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-5 py-3.5">
          <div className="min-w-0">
            {title && <h2 className="truncate text-sm font-semibold">{title}</h2>}
            {description && (
              <p className="truncate text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  trend?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneCls = {
    default: "bg-accent text-accent-foreground",
    success: "bg-success/12 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    danger: "bg-danger/12 text-danger",
  }[tone];
  return (
    <div className="card-surface group p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <p className="min-w-0 truncate text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg", toneCls)}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-xl font-bold tracking-tight">{value}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {trend && <span className="text-xs font-semibold text-success">{trend}</span>}
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

const tempMap: Record<Temperature, { cls: string; icon: LucideIcon }> = {
  Quente: { cls: "bg-danger/10 text-danger border-danger/20", icon: Flame },
  Morno: { cls: "bg-warning/15 text-warning-foreground border-warning/30", icon: Thermometer },
  Frio: { cls: "bg-info/10 text-info border-info/20", icon: Snowflake },
};

export function TemperatureBadge({ value }: { value: Temperature }) {
  const { cls, icon: Icon } = tempMap[value];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        cls,
      )}
    >
      <Icon className="h-3 w-3" />
      {value}
    </span>
  );
}

export function Tag({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const cls = {
    neutral: "bg-secondary text-secondary-foreground border-border",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/15 text-warning-foreground border-warning/30",
    danger: "bg-danger/10 text-danger border-danger/20",
    info: "bg-info/10 text-info border-info/20",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
        cls,
      )}
    >
      {children}
    </span>
  );
}

export function HealthScore({ value, compact = false }: { value: number; compact?: boolean }) {
  const tone = value >= 75 ? "bg-success" : value >= 50 ? "bg-warning" : "bg-danger";
  return (
    <div className={cn("flex items-center gap-2", compact ? "w-20" : "w-full")}>
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground">
        {value}
      </span>
    </div>
  );
}

export function Timeline({
  items,
}: {
  items: { date: string; title: string; detail: string; type?: string }[];
}) {
  return (
    <ol className="relative space-y-5 border-l pl-5">
      {items.map((item, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[26px] top-1 grid h-3 w-3 place-items-center rounded-full border-2 border-card bg-primary" />
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{item.title}</p>
            <span className="text-[11px] text-muted-foreground">{item.date}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
        </li>
      ))}
    </ol>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
      {children}
    </p>
  );
}
