/**
 * Núcleo configurável do Conversu Sales OS.
 *
 * Tudo aqui é mock, mas o formato já é o que a API deve devolver:
 * pipelines, etapas, campos do card, campos customizados, critérios
 * obrigatórios, playbooks e metas. As telas nunca assumem etapas fixas —
 * elas leem sempre do pipeline ativo.
 */
import type { StageId } from "./data";

export type OriginId = "outbound" | "inbound" | "parceiro" | "indicacao" | "outros";

export const ORIGINS: { id: OriginId; label: string }[] = [
  { id: "outbound", label: "Outbound" },
  { id: "inbound", label: "Inbound" },
  { id: "parceiro", label: "Parceiro" },
  { id: "indicacao", label: "Indicação" },
  { id: "outros", label: "Outros" },
];

export const originLabel = (id: OriginId) =>
  ORIGINS.find((o) => o.id === id)?.label ?? "Outros";

/** Campos que podem ser exibidos no card do Kanban. */
export type CardFieldId =
  | "company"
  | "contact"
  | "value"
  | "owner"
  | "closeDate"
  | "probability"
  | "temperature"
  | "health"
  | "priority"
  | "daysInStage"
  | "origin"
  | "partner"
  | "lastActivity"
  | "nextActivity"
  | "tags";

export const CARD_FIELD_LABELS: Record<CardFieldId, string> = {
  company: "Empresa",
  contact: "Contato",
  value: "Valor",
  owner: "Responsável",
  closeDate: "Previsão de fechamento",
  probability: "Probabilidade",
  temperature: "Temperatura",
  health: "Health score",
  priority: "Prioridade",
  daysInStage: "Dias na etapa",
  origin: "Origem",
  partner: "Parceiro",
  lastActivity: "Última atividade",
  nextActivity: "Próxima atividade",
  tags: "Tags",
};

export type CustomFieldType = "texto" | "numero" | "moeda" | "selecao";

export type CustomFieldDef = {
  id: string;
  label: string;
  type: CustomFieldType;
  options?: string[];
};

export type Playbook = {
  objective: string;
  questions: string[];
  checklist: string[];
  guidance: string[];
  exitCriteria: string[];
};

export type StageConfig = {
  id: StageId;
  label: string;
  probability: number;
  /** Critérios obrigatórios para sair desta etapa. */
  criteria: string[];
  playbook: Playbook;
};

export type PipelineConfig = {
  id: string;
  name: string;
  description: string;
  stages: StageConfig[];
  cardFields: CardFieldId[];
  customFields: CustomFieldDef[];
};

const playbook = (
  objective: string,
  questions: string[],
  checklist: string[],
  guidance: string[],
  exitCriteria: string[],
): Playbook => ({ objective, questions, checklist, guidance, exitCriteria });

const BASE_STAGES: StageConfig[] = [
  {
    id: "prospeccao",
    label: "Prospecção",
    probability: 10,
    criteria: ["Empresa qualificada pelo ICP", "Contato identificado"],
    playbook: playbook(
      "Confirmar que a conta pertence ao perfil ideal e encontrar o contato certo.",
      ["A empresa tem time comercial estruturado?", "Quem responde pela meta de receita?"],
      ["Pesquisar a conta", "Mapear decisores", "Definir gancho de abordagem"],
      ["Priorize contas com dor de previsibilidade.", "Use casos do mesmo segmento na primeira mensagem."],
      ["Contato válido registrado", "Cadência de abordagem iniciada"],
    ),
  },
  {
    id: "contato",
    label: "Contato Inicial",
    probability: 20,
    criteria: ["Primeira resposta obtida", "Canal de comunicação definido"],
    playbook: playbook(
      "Gerar a primeira conversa real e agendar a qualificação.",
      ["Como vocês acompanham o funil hoje?", "O que motivou a resposta agora?"],
      ["Registrar interação", "Agendar call de qualificação"],
      ["Reduza o atrito: proponha 15 minutos.", "Traga um dado de mercado no primeiro contato."],
      ["Reunião de qualificação agendada"],
    ),
  },
  {
    id: "qualificacao",
    label: "Qualificação",
    probability: 35,
    criteria: ["Dor principal mapeada", "Decisor identificado", "Faixa de investimento validada"],
    playbook: playbook(
      "Entender dor, impacto, processo de decisão e orçamento.",
      ["Qual o custo de continuar como está?", "Quem participa da decisão?", "Existe orçamento previsto?"],
      ["Preencher dores", "Registrar decisor", "Validar faixa de budget"],
      ["Quantifique a dor em número antes de falar de produto."],
      ["Dor, decisor e budget registrados"],
    ),
  },
  {
    id: "diagnostico",
    label: "Diagnóstico",
    probability: 45,
    criteria: ["Processo atual mapeado", "Métricas de referência coletadas"],
    playbook: playbook(
      "Mapear o processo comercial atual e os gargalos mensuráveis.",
      ["Quantas oportunidades entram por mês?", "Qual a taxa de conversão por etapa?"],
      ["Registrar métricas atuais", "Documentar gargalos", "Alinhar critérios de sucesso"],
      ["Traga o diagnóstico por escrito — ele vira o argumento da proposta."],
      ["Diagnóstico compartilhado com o cliente"],
    ),
  },
  {
    id: "demonstracao",
    label: "Demonstração",
    probability: 60,
    criteria: ["Demo realizada com o decisor", "Objeções registradas"],
    playbook: playbook(
      "Mostrar a solução conectada às dores mapeadas no diagnóstico.",
      ["O que precisa acontecer para isso ser aprovado?", "Falta alguém ver esta demonstração?"],
      ["Realizar demo", "Registrar objeções", "Definir próximo passo com data"],
      ["Demonstre apenas o que resolve as dores registradas."],
      ["Próximo passo com data definida"],
    ),
  },
  {
    id: "proposta",
    label: "Proposta",
    probability: 72,
    criteria: ["Proposta enviada", "Validade acordada", "Escopo confirmado"],
    playbook: playbook(
      "Formalizar escopo, investimento e prazo com validade clara.",
      ["O documento contempla tudo que foi combinado?", "Qual a data de decisão?"],
      ["Enviar proposta", "Confirmar recebimento", "Agendar leitura conjunta"],
      ["Nunca envie proposta sem agendar a conversa de leitura."],
      ["Data de decisão registrada"],
    ),
  },
  {
    id: "negociacao",
    label: "Negociação",
    probability: 85,
    criteria: ["Condições comerciais alinhadas", "Aprovação do decisor final", "Data de assinatura definida"],
    playbook: playbook(
      "Fechar condições, remover a última objeção e definir a assinatura.",
      ["Falta algo para assinar esta semana?", "Quem assina o contrato?"],
      ["Alinhar condições", "Enviar contrato", "Definir kickoff"],
      ["Troque desconto por contrapartida: prazo, volume ou case."],
      ["Contrato enviado para assinatura"],
    ),
  },
  {
    id: "ganho",
    label: "Fechado Ganho",
    probability: 100,
    criteria: ["Contrato assinado", "Kickoff agendado"],
    playbook: playbook(
      "Garantir transição limpa para a implantação.",
      ["Quem será o ponto focal na implantação?"],
      ["Registrar contrato", "Agendar kickoff", "Passar contexto ao CS"],
      ["Comemore com o cliente e já defina a primeira entrega."],
      ["Kickoff realizado"],
    ),
  },
  {
    id: "perdido",
    label: "Fechado Perdido",
    probability: 0,
    criteria: ["Motivo de perda registrado"],
    playbook: playbook(
      "Registrar o aprendizado e definir quando retomar.",
      ["O que faria vocês reconsiderarem?", "Quando faz sentido retomar?"],
      ["Registrar motivo", "Definir data de retomada"],
      ["Perda sem motivo registrado não vira aprendizado."],
      ["Motivo e data de retomada registrados"],
    ),
  },
];

const pick = (ids: StageId[]) =>
  ids.map((id) => BASE_STAGES.find((s) => s.id === id)!).filter(Boolean);

export const PIPELINES: PipelineConfig[] = [
  {
    id: "outbound",
    name: "Outbound",
    description: "Prospecção ativa conduzida pelo time comercial",
    stages: BASE_STAGES,
    cardFields: [
      "company",
      "value",
      "priority",
      "temperature",
      "probability",
      "health",
      "daysInStage",
      "origin",
      "lastActivity",
      "nextActivity",
      "owner",
    ],
    customFields: [
      { id: "produto", label: "Produto", type: "selecao", options: ["Sales OS", "Sales OS + IA", "Enterprise"] },
      { id: "segmento", label: "Segmento", type: "texto" },
      { id: "volume", label: "Volume de leads/mês", type: "numero" },
      { id: "budget", label: "Budget informado", type: "moeda" },
      { id: "concorrente", label: "Concorrente", type: "texto" },
      { id: "crm", label: "CRM atual", type: "texto" },
      { id: "usuarios", label: "Usuários previstos", type: "numero" },
      { id: "decisor", label: "Decisor", type: "texto" },
      { id: "timing", label: "Timing de decisão", type: "selecao", options: ["Imediato", "30 dias", "90 dias", "Sem prazo"] },
    ],
  },
  {
    id: "inbound",
    name: "Inbound",
    description: "Demanda gerada por marketing e site",
    stages: pick(["contato", "qualificacao", "demonstracao", "proposta", "negociacao", "ganho", "perdido"]),
    cardFields: ["company", "value", "temperature", "probability", "origin", "nextActivity", "owner"],
    customFields: [
      { id: "produto", label: "Produto", type: "selecao", options: ["Sales OS", "Sales OS + IA"] },
      { id: "canal", label: "Canal de entrada", type: "texto" },
      { id: "timing", label: "Timing de decisão", type: "selecao", options: ["Imediato", "30 dias", "90 dias"] },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Contas complexas com ciclo longo e múltiplos decisores",
    stages: pick([
      "prospeccao",
      "qualificacao",
      "diagnostico",
      "demonstracao",
      "proposta",
      "negociacao",
      "ganho",
      "perdido",
    ]),
    cardFields: [
      "company",
      "contact",
      "value",
      "priority",
      "probability",
      "health",
      "daysInStage",
      "closeDate",
      "owner",
    ],
    customFields: [
      { id: "produto", label: "Produto", type: "selecao", options: ["Enterprise", "Enterprise + IA"] },
      { id: "usuarios", label: "Usuários previstos", type: "numero" },
      { id: "decisor", label: "Decisor", type: "texto" },
      { id: "juridico", label: "Revisão jurídica", type: "selecao", options: ["Não iniciada", "Em andamento", "Concluída"] },
    ],
  },
  {
    id: "parcerias",
    name: "Parcerias",
    description: "Oportunidades originadas por parceiros e indicações",
    stages: pick(["contato", "qualificacao", "proposta", "negociacao", "ganho", "perdido"]),
    cardFields: ["company", "value", "partner", "origin", "probability", "nextActivity", "owner"],
    customFields: [
      { id: "produto", label: "Produto", type: "selecao", options: ["Sales OS", "Sales OS + IA"] },
      { id: "comissao", label: "Comissão do parceiro", type: "texto" },
      { id: "coSelling", label: "Co-selling", type: "selecao", options: ["Sim", "Não"] },
    ],
  },
];

export const DEFAULT_PIPELINE_ID = PIPELINES[0]!.id;

export const getPipeline = (id: string) =>
  PIPELINES.find((p) => p.id === id) ?? PIPELINES[0]!;

export const getStageConfig = (pipelineId: string, stageId: StageId) =>
  getPipeline(pipelineId).stages.find((s) => s.id === stageId) ??
  BASE_STAGES.find((s) => s.id === stageId)!;

/* ------------------------------------------------------------------ */
/* Metas comerciais — Empresa, Equipe e Vendedor                       */
/* ------------------------------------------------------------------ */

export type GoalLevel = "empresa" | "equipe" | "vendedor";

export type GoalPeriod = "2026-07" | "2026-08" | "2026-Q3";

export const GOAL_PERIODS: { id: GoalPeriod; label: string }[] = [
  { id: "2026-07", label: "Julho / 2026" },
  { id: "2026-08", label: "Agosto / 2026" },
  { id: "2026-Q3", label: "3º trimestre / 2026" },
];

export type GoalMetric = {
  id: string;
  label: string;
  format: "moeda" | "numero";
  target: number;
  actual: number;
  forecast: number;
};

export type GoalGroup = {
  id: string;
  level: GoalLevel;
  name: string;
  subtitle: string;
  period: GoalPeriod;
  metrics: GoalMetric[];
};

const metric = (
  id: string,
  label: string,
  format: GoalMetric["format"],
  target: number,
  actual: number,
  forecast: number,
): GoalMetric => ({ id, label, format, target, actual, forecast });

export const GOALS: GoalGroup[] = [
  {
    id: "goal-empresa",
    level: "empresa",
    name: "Conversu",
    subtitle: "Meta consolidada da operação",
    period: "2026-08",
    metrics: [
      metric("receita", "Receita", "moeda", 620000, 398000, 545000),
      metric("mrr", "MRR novo", "moeda", 84000, 51500, 73000),
      metric("ganhos", "Contratos ganhos", "numero", 18, 11, 16),
      metric("pipeline", "Pipeline criado", "moeda", 1800000, 1240000, 1660000),
    ],
  },
  {
    id: "goal-equipe-hunters",
    level: "equipe",
    name: "Equipe Hunters",
    subtitle: "Marina Duarte, Rafael Lopes, Camila Nunes",
    period: "2026-08",
    metrics: [
      metric("receita", "Receita", "moeda", 380000, 246000, 331000),
      metric("reunioes", "Reuniões realizadas", "numero", 72, 48, 66),
      metric("oportunidades", "Oportunidades criadas", "numero", 54, 37, 49),
      metric("propostas", "Propostas enviadas", "numero", 30, 19, 27),
      metric("ganhos", "Negócios ganhos", "numero", 11, 7, 10),
    ],
  },
  {
    id: "goal-equipe-farmers",
    level: "equipe",
    name: "Equipe Farmers",
    subtitle: "Thiago Bastos, Juliana Prado",
    period: "2026-08",
    metrics: [
      metric("receita", "Receita", "moeda", 240000, 152000, 214000),
      metric("reunioes", "Reuniões realizadas", "numero", 40, 29, 38),
      metric("oportunidades", "Oportunidades criadas", "numero", 26, 18, 24),
      metric("propostas", "Propostas enviadas", "numero", 16, 11, 15),
      metric("ganhos", "Negócios ganhos", "numero", 7, 4, 6),
    ],
  },
];

export const SELLER_GOALS: GoalGroup[] = [
  ["Marina Duarte", 140000, 98000, 128000, 26, 18, 12],
  ["Rafael Lopes", 120000, 74000, 108000, 22, 15, 10],
  ["Camila Nunes", 120000, 74000, 95000, 22, 15, 10],
  ["Thiago Bastos", 130000, 86000, 118000, 24, 16, 11],
  ["Juliana Prado", 110000, 66000, 96000, 20, 13, 9],
].map(([name, target, actual, forecast, leads, reunioes, propostas]) => ({
  id: `goal-${String(name).toLowerCase().replace(/\s+/g, "-")}`,
  level: "vendedor" as const,
  name: String(name),
  subtitle: "Meta individual do mês",
  period: "2026-08" as const,
  metrics: [
    metric("receita", "Receita", "moeda", Number(target), Number(actual), Number(forecast)),
    metric("leads", "Leads trabalhados", "numero", Number(leads) * 3, Math.round(Number(leads) * 2.1), Number(leads) * 3),
    metric("reunioes", "Reuniões realizadas", "numero", Number(reunioes), Math.round(Number(reunioes) * 0.68), Number(reunioes)),
    metric("oportunidades", "Oportunidades criadas", "numero", Number(leads), Math.round(Number(leads) * 0.7), Number(leads)),
    metric("propostas", "Propostas enviadas", "numero", Number(propostas), Math.round(Number(propostas) * 0.62), Number(propostas)),
    metric("ganhos", "Negócios ganhos", "numero", Math.round(Number(propostas) / 2), Math.round(Number(propostas) / 3), Math.round(Number(propostas) / 2)),
  ],
}));

export const ALL_GOALS: GoalGroup[] = [...GOALS, ...SELLER_GOALS];

export const goalProgress = (m: GoalMetric) => ({
  progress: Math.min(100, Math.round((m.actual / (m.target || 1)) * 100)),
  forecastProgress: Math.min(100, Math.round((m.forecast / (m.target || 1)) * 100)),
  gap: m.target - m.forecast,
});