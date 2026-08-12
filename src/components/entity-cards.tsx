import { Building2, CalendarClock, Clock3, Mail, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HealthScore,
  PriorityBadge,
  StatusBadge,
  Tag,
  TemperatureBadge,
} from "@/components/kit";
import {
  currency,
  isStale,
  type Activity,
  type CompanyRow,
  type ContactRow,
  type Opportunity,
} from "@/lib/data";

const cardBase =
  "card-surface focus-ring w-full min-w-0 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]";

const Line = ({
  icon: Icon,
  children,
}: {
  icon: typeof User;
  children: React.ReactNode;
}) => (
  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
    <Icon className="h-3 w-3 shrink-0" />
    <span className="truncate">{children}</span>
  </p>
);

export function OpportunityCard({
  op,
  onClick,
  draggable,
  onDragStart,
  onDragEnd,
  dragging,
}: {
  op: Opportunity;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  dragging?: boolean;
}) {
  const stale = isStale(op);
  return (
    <div
      role="button"
      tabIndex={0}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        cardBase,
        "cursor-grab active:cursor-grabbing",
        stale && "border-l-[3px] border-l-flow",
        dragging && "opacity-40",
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <p className="truncate text-sm font-semibold">{op.company}</p>
        <PriorityBadge value={op.priority} />
      </div>
      <p className="mt-1.5 font-display text-base font-bold tabular-nums">{currency(op.value)}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <TemperatureBadge value={op.temperature} />
        <Tag tone="info">{op.probability}%</Tag>
        <Tag tone={op.daysInStage > 18 ? "danger" : "neutral"}>{op.daysInStage}d na etapa</Tag>
        {op.source && <Tag>{op.source}</Tag>}
        {op.meeting?.status && <Tag tone="warning">{op.meeting.status}</Tag>}
        {op.lossReason && <Tag tone="danger">{op.lossReason}</Tag>}
      </div>
      <div className="mt-2.5">
        <HealthScore value={op.health} />
      </div>
      <div className="mt-2.5 space-y-1 border-t pt-2">
        <Line icon={Clock3}>
          {stale ? (
            <span className="font-semibold text-flow">
              sem contato há {op.lastContactDays} dias
            </span>
          ) : (
            `Último contato ${op.lastContact}`
          )}
        </Line>
        <Line icon={CalendarClock}>
          {op.nextActivity} · {op.nextActivityDate}
        </Line>
        <Line icon={User}>{op.owner}</Line>
      </div>
    </div>
  );
}

export function CompanyCard({ company, onClick }: { company: CompanyRow; onClick?: () => void }) {
  return (
    <button className={cardBase} onClick={onClick}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{company.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {company.segment} · {company.city}
          </p>
        </div>
        <StatusBadge status={company.status} />
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-secondary/60 py-1.5">
          <p className="text-[10px] text-muted-foreground">Contatos</p>
          <p className="text-sm font-semibold tabular-nums">{company.contactsCount}</p>
        </div>
        <div className="rounded-lg bg-secondary/60 py-1.5">
          <p className="text-[10px] text-muted-foreground">Oport.</p>
          <p className="text-sm font-semibold tabular-nums">{company.opportunitiesCount}</p>
        </div>
        <div className="rounded-lg bg-secondary/60 py-1.5">
          <p className="text-[10px] text-muted-foreground">Em negoc.</p>
          <p className="text-sm font-semibold tabular-nums">{currency(company.openValue)}</p>
        </div>
      </div>
      <div className="mt-2.5 space-y-1 border-t pt-2">
        <Line icon={User}>{company.owner}</Line>
        <Line icon={CalendarClock}>
          {company.nextActivity} · {company.nextActivityDate}
        </Line>
      </div>
    </button>
  );
}

export function ContactCard({ contact, onClick }: { contact: ContactRow; onClick?: () => void }) {
  return (
    <button className={cardBase} onClick={onClick}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{contact.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{contact.role}</p>
        </div>
        <StatusBadge status={contact.influence} />
      </div>
      <div className="mt-2.5 space-y-1 border-t pt-2">
        <Line icon={Building2}>{contact.company}</Line>
        <Line icon={Mail}>{contact.email}</Line>
        <Line icon={Phone}>{contact.phone}</Line>
        <Line icon={Clock3}>Última interação {contact.lastInteraction}</Line>
      </div>
    </button>
  );
}

export function ActivityCard({ activity, onClick }: { activity: Activity; onClick?: () => void }) {
  return (
    <button className={cardBase} onClick={onClick}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{activity.title}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {activity.type} · {activity.company}
          </p>
        </div>
        <PriorityBadge value={activity.priority} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <StatusBadge status={activity.status} />
        <Tag>{activity.date}</Tag>
      </div>
      <div className="mt-2.5 space-y-1 border-t pt-2">
        <Line icon={User}>{activity.owner}</Line>
        <Line icon={Building2}>{activity.opportunity}</Line>
      </div>
    </button>
  );
}
