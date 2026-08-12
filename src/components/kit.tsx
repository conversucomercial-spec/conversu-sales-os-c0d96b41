import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Temperature } from "@/lib/data";
import { Flame, Snowflake, Sparkles, Thermometer, type LucideIcon } from "lucide-react";

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
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  className?: string;
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
        className,
      )}
    >
      {children}
    </span>
  );
}

export function HealthScore({
  value,
  compact = false,
}: {
  value: number | null;
  compact?: boolean;
}) {
  if (value === null) {
    return (
      <span className={cn("text-[11px] text-muted-foreground", compact && "w-20")}>—</span>
    );
  }
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

/* -------------------------------------------------------------------------
 * Biblioteca compartilhada Conversu — badges, widgets e estados
 * ---------------------------------------------------------------------- */

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  Pendente: "info",
  "Concluída": "success",
  Atrasada: "danger",
  Cliente: "success",
  "Em negociação": "warning",
  Prospect: "info",
  Enviada: "info",
  Aceita: "success",
  Vencendo: "warning",
  Recusada: "danger",
  Hoje: "warning",
  Agendada: "info",
  Realizada: "success",
  Decisor: "success",
  Influenciador: "info",
  "Usuário": "neutral",
  Forte: "success",
  Neutro: "neutral",
  "Em construção": "warning",
};

export function StatusBadge({ status }: { status: string }) {
  return <Tag tone={STATUS_TONE[status] ?? "neutral"}>{status}</Tag>;
}

export function PriorityBadge({ value }: { value: "Alta" | "Média" | "Baixa" }) {
  return (
    <Tag tone={value === "Alta" ? "danger" : value === "Média" ? "warning" : "neutral"}>
      {value}
    </Tag>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center">
      {Icon && (
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-muted-foreground">
          <Icon className="h-4.5 w-4.5" />
        </span>
      )}
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="max-w-sm text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Ações rápidas padronizadas (registrar contato, agendar, propor…). */
export function QuickActions({
  actions,
  className,
}: {
  actions: { label: string; icon: LucideIcon; onClick?: () => void; primary?: boolean }[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          className={cn(
            "focus-ring inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
            a.primary
              ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-card hover:bg-secondary",
          )}
        >
          <a.icon className="h-3.5 w-3.5" />
          {a.label}
        </button>
      ))}
    </div>
  );
}

/** Métrica compacta para listas de indicadores rápidos. */
export function MetricWidget({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "brand" | "flow" | "mind" | "danger";
}) {
  const cls = {
    default: "text-foreground",
    brand: "text-primary",
    flow: "text-flow",
    mind: "text-mind",
    danger: "text-danger",
  }[tone];
  return (
    <div className="min-w-0 rounded-xl border bg-secondary/40 px-3 py-2.5">
      <p className="truncate text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 font-display text-lg font-bold tabular-nums", cls)}>{value}</p>
      {hint && <p className="truncate text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/**
 * Widget do dashboard. Aceita `reserved` para marcar espaços destinados a
 * módulos inteligentes que serão ligados na próxima fase.
 */
export function DashboardWidget({
  title,
  description,
  icon: Icon,
  action,
  reserved = false,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  reserved?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "card-surface flex min-w-0 flex-col overflow-hidden",
        reserved && "border-dashed bg-accent/30 shadow-none",
        className,
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && (
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-lg",
                reserved ? "bg-mind/12 text-mind" : "bg-accent text-accent-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">{title}</h2>
            {description && (
              <p className="truncate text-[11px] text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className={cn("flex-1 p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Linha compacta reutilizada em todos os widgets de lista. */
export function ListRow({
  primary,
  secondary,
  meta,
  trailing,
  onClick,
}: {
  primary: string;
  secondary?: string;
  meta?: string;
  trailing?: ReactNode;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
        onClick && "focus-ring hover:bg-secondary",
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{primary}</p>
        {secondary && <p className="truncate text-[11px] text-muted-foreground">{secondary}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {meta && <span className="text-xs font-semibold tabular-nums">{meta}</span>}
        {trailing}
      </div>
    </Comp>
  );
}

/**
 * Placeholder padronizado para módulos de IA.
 * Mantém o layout final já dimensionado; basta trocar `children` pelo conteúdo real.
 */
export function AiSlot({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-mind/30 bg-mind/[0.04] p-4">
      <div className="flex items-center gap-2">
        <span className="mind-gradient grid h-6 w-6 place-items-center rounded-md text-mind-foreground">
          <Sparkles className="h-3 w-3" />
        </span>
        <p className="text-xs font-semibold text-mind">{title}</p>
        <span className="font-hand ml-auto text-sm text-mind/70">em breve</span>
      </div>
      {description && <p className="mt-2 text-xs text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}
