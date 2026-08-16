/** Tipos e rótulos das atividades/follow-ups reais do CRM. */
export const ACTIVITY_TYPES = [
  "ligacao",
  "whatsapp",
  "email",
  "followup",
  "tarefa",
  "reuniao",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  ligacao: "Ligação",
  whatsapp: "WhatsApp",
  email: "E-mail",
  followup: "Follow-up",
  tarefa: "Tarefa",
  reuniao: "Reunião",
};

export const ACTIVITY_PRIORITIES = ["alta", "media", "baixa"] as const;
export type ActivityPriority = (typeof ACTIVITY_PRIORITIES)[number];
export const ACTIVITY_PRIORITY_LABEL: Record<ActivityPriority, "Alta" | "Média" | "Baixa"> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export type ActivityStatus = "pendente" | "concluida" | "cancelada";

export type ActivityRecord = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  priority: ActivityPriority;
  status: ActivityStatus;
  dueAt: string | null;
  completedAt: string | null;
  companyId: string | null;
  contactId: string | null;
  opportunityId: string | null;
  ownerId: string;
  ownerName: string;
  companyName: string;
  contactName: string;
  opportunityTitle: string;
};

export type ActivityBucketId = "atrasadas" | "hoje" | "semana" | "futuras" | "concluidas";

export const ACTIVITY_BUCKET_LIST: { id: ActivityBucketId; label: string }[] = [
  { id: "atrasadas", label: "Atrasadas" },
  { id: "hoje", label: "Hoje" },
  { id: "semana", label: "Esta semana" },
  { id: "futuras", label: "Futuras" },
  { id: "concluidas", label: "Concluídas" },
];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Classifica a atividade em atrasada / hoje / semana / futura / concluída. */
export function activityBucket(a: ActivityRecord, now = new Date()): ActivityBucketId {
  if (a.status !== "pendente") return "concluidas";
  if (!a.dueAt) return "futuras";
  const due = startOfDay(new Date(a.dueAt));
  const today = startOfDay(now);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return "atrasadas";
  if (diff === 0) return "hoje";
  if (diff <= 7) return "semana";
  return "futuras";
}

export const formatDateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Sem data";
