/**
 * Máquina de cadência de prospecção no LinkedIn.
 *
 * Regras determinísticas, sem automação externa: o usuário executa a ação no
 * LinkedIn e registra o evento aqui; o CRM calcula a etapa, a próxima ação e o
 * vencimento. Aceite de conexão NUNCA vira lead — lead exige resposta.
 */

export type CadenceEventType =
  | "conexao_enviada"
  | "conexao_aceita"
  | "mensagem_enviada"
  | "follow_up"
  | "reuniao"
  | "sem_resposta"
  | "respondeu"
  | "sem_interesse";

export type CadenceStep =
  | "prospect_identificado"
  | "conexao_enviada"
  | "conexao_aceita"
  | "mensagem_enviada"
  | "follow_up_1"
  | "follow_up_2"
  | "respondeu_lead"
  | "reuniao_marcada"
  | "sem_interesse";

export type CadenceStatus = "nao_iniciado" | "em_cadencia" | "lead" | "reuniao" | "encerrado";

export const CADENCE_EVENTS: { type: CadenceEventType; label: string }[] = [
  { type: "conexao_enviada", label: "Conexão enviada" },
  { type: "conexao_aceita", label: "Conexão aceita" },
  { type: "mensagem_enviada", label: "Mensagem enviada" },
  { type: "follow_up", label: "Follow-up" },
  { type: "reuniao", label: "Reunião" },
  { type: "sem_resposta", label: "Sem resposta" },
  { type: "respondeu", label: "Respondeu / Lead" },
  { type: "sem_interesse", label: "Sem interesse" },
];

export const CADENCE_EVENT_LABELS: Record<CadenceEventType, string> = Object.fromEntries(
  CADENCE_EVENTS.map((e) => [e.type, e.label]),
) as Record<CadenceEventType, string>;

export const CADENCE_STEP_LABELS: Record<CadenceStep, string> = {
  prospect_identificado: "Prospect identificado",
  conexao_enviada: "Conexão enviada",
  conexao_aceita: "Conexão aceita",
  mensagem_enviada: "Mensagem enviada",
  follow_up_1: "Follow-up 1",
  follow_up_2: "Follow-up 2",
  respondeu_lead: "Respondeu / Lead",
  reuniao_marcada: "Reunião marcada",
  sem_interesse: "Sem interesse",
};

export const CADENCE_STATUS_LABELS: Record<CadenceStatus, string> = {
  nao_iniciado: "Não iniciado",
  em_cadencia: "Em cadência",
  lead: "Lead",
  reuniao: "Reunião marcada",
  encerrado: "Encerrado",
};

export const CADENCE_FLOW: CadenceStep[] = [
  "prospect_identificado",
  "conexao_enviada",
  "conexao_aceita",
  "mensagem_enviada",
  "follow_up_1",
  "follow_up_2",
  "respondeu_lead",
  "reuniao_marcada",
];

export type CadenceState = {
  status: CadenceStatus;
  step: CadenceStep;
  lastActionAt: string | null;
  nextAction: string | null;
  nextActionAt: string | null;
};

export const INITIAL_CADENCE: CadenceState = {
  status: "nao_iniciado",
  step: "prospect_identificado",
  lastActionAt: null,
  nextAction: null,
  nextActionAt: null,
};

const addDays = (from: Date, days: number) =>
  new Date(from.getTime() + days * 86400000).toISOString();

/** Aplica um evento à cadência e devolve o novo estado (etapa, próxima ação e vencimento). */
export function applyCadenceEvent(
  current: Pick<CadenceState, "step">,
  type: CadenceEventType,
  occurredAt: Date = new Date(),
): CadenceState {
  const at = occurredAt.toISOString();
  const base = { lastActionAt: at };

  switch (type) {
    case "conexao_enviada":
      return {
        ...base,
        status: "em_cadencia",
        step: "conexao_enviada",
        nextAction: "Verificar aceite da conexão",
        nextActionAt: addDays(occurredAt, 3),
      };
    case "conexao_aceita":
      return {
        ...base,
        status: "em_cadencia",
        step: "conexao_aceita",
        nextAction: "Enviar mensagem de abordagem",
        nextActionAt: addDays(occurredAt, 1),
      };
    case "mensagem_enviada":
      return {
        ...base,
        status: "em_cadencia",
        step: "mensagem_enviada",
        nextAction: "Follow-up 1",
        nextActionAt: addDays(occurredAt, 4),
      };
    case "follow_up": {
      const next: CadenceStep =
        current.step === "follow_up_1" || current.step === "follow_up_2"
          ? "follow_up_2"
          : "follow_up_1";
      return {
        ...base,
        status: "em_cadencia",
        step: next,
        nextAction: next === "follow_up_1" ? "Follow-up 2" : "Avaliar encerramento ou nutrição",
        nextActionAt: addDays(occurredAt, next === "follow_up_1" ? 4 : 5),
      };
    }
    case "sem_resposta":
      return {
        ...base,
        status: "em_cadencia",
        step: current.step === "prospect_identificado" ? "conexao_enviada" : current.step,
        nextAction: "Novo follow-up",
        nextActionAt: addDays(occurredAt, 5),
      };
    case "respondeu":
      return {
        ...base,
        status: "lead",
        step: "respondeu_lead",
        nextAction: "Agendar reunião de discovery",
        nextActionAt: addDays(occurredAt, 2),
      };
    case "reuniao":
      return {
        ...base,
        status: "reuniao",
        step: "reuniao_marcada",
        nextAction: "Conduzir a reunião e registrar o discovery",
        nextActionAt: addDays(occurredAt, 2),
      };
    case "sem_interesse":
      return {
        ...base,
        status: "encerrado",
        step: "sem_interesse",
        nextAction: null,
        nextActionAt: null,
      };
  }
}

/** Formata data/hora ISO no padrão brasileiro curto. */
export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const isOverdue = (iso: string | null) => !!iso && new Date(iso).getTime() < Date.now();
