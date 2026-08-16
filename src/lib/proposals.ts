/** Modelo e rótulos das propostas comerciais. */
export type ProposalItem = { label: string; qty: number; unit: number };

export type ProposalRecord = {
  id: string;
  number: string;
  status: string;
  value: number;
  setupValue: number;
  discount: number;
  validUntil: string | null;
  sentAt: string | null;
  decidedAt: string | null;
  terms: string;
  notes: string;
  items: ProposalItem[];
  opportunityId: string;
  opportunityTitle: string;
  companyId: string | null;
  companyName: string;
  ownerName: string;
  createdAt: string;
};

export const PROPOSAL_STATUSES = [
  "Enviada",
  "Em negociação",
  "Aceita",
  "Recusada",
  "Vencida",
] as const;

export const proposalTone = (status: string) =>
  status === "Aceita"
    ? "success"
    : status === "Recusada"
      ? "danger"
      : status === "Vencida"
        ? "warning"
        : "info";

/** Dias até a validade; negativo quando já venceu. */
export const daysUntil = (iso: string | null) => {
  if (!iso) return null;
  const target = new Date(`${iso}T23:59:59`);
  return Math.ceil((target.getTime() - Date.now()) / 86400000);
};

export const formatDate = (iso: string | null) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR") : "—";
