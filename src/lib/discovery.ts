/** Modelo do Discovery vinculado à oportunidade (Empresa → Oportunidade → Discovery). */
export type DiscoveryStatus = "nao_iniciado" | "em_andamento" | "realizado" | "validado";

export const DISCOVERY_STATUS: { id: DiscoveryStatus; label: string }[] = [
  { id: "nao_iniciado", label: "Não iniciado" },
  { id: "em_andamento", label: "Em andamento" },
  { id: "realizado", label: "Realizado" },
  { id: "validado", label: "Validado" },
];

export type DiscoveryRecord = {
  status: string;
  objective: string;
  currentScenario: string;
  pains: string;
  volume: string;
  team: string;
  channels: string;
  journeys: string;
  processes: string;
  integrations: string;
  systems: string;
  bottlenecks: string;
  impacts: string;
  opportunitiesFound: string;
  conversuFit: string;
  validatedScope: string;
  nextSteps: string;
};

export type DiscoveryField = { id: keyof Omit<DiscoveryRecord, "status">; label: string; rows?: number };

export const DISCOVERY_FIELDS: DiscoveryField[] = [
  { id: "objective", label: "Objetivo da operação" },
  { id: "currentScenario", label: "Cenário atual" },
  { id: "pains", label: "Principais dores" },
  { id: "volume", label: "Volume de atendimentos", rows: 2 },
  { id: "team", label: "Equipe", rows: 2 },
  { id: "channels", label: "Canais", rows: 2 },
  { id: "journeys", label: "Jornadas" },
  { id: "processes", label: "Processos" },
  { id: "integrations", label: "Integrações", rows: 2 },
  { id: "systems", label: "Sistemas utilizados", rows: 2 },
  { id: "bottlenecks", label: "Gargalos" },
  { id: "impacts", label: "Impactos" },
  { id: "opportunitiesFound", label: "Oportunidades identificadas" },
  { id: "conversuFit", label: "Como a Conversu pode atuar" },
  { id: "validatedScope", label: "Escopo validado" },
  { id: "nextSteps", label: "Próximos passos" },
];

export const EMPTY_DISCOVERY: DiscoveryRecord = {
  status: "nao_iniciado",
  objective: "",
  currentScenario: "",
  pains: "",
  volume: "",
  team: "",
  channels: "",
  journeys: "",
  processes: "",
  integrations: "",
  systems: "",
  bottlenecks: "",
  impacts: "",
  opportunitiesFound: "",
  conversuFit: "",
  validatedScope: "",
  nextSteps: "",
};

export type DiscoveryDocument = {
  id: string;
  name: string;
  date: string | null;
  url: string | null;
  kind: string;
};
