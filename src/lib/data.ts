export type Temperature = "Quente" | "Morno" | "Frio";
export type Priority = "Alta" | "Média" | "Baixa";

/** Estados possíveis de uma reunião. Vazio = sem informação registrada. */
export const MEETING_STATUSES = [
  "Reunião agendada",
  "Reunião realizada",
  "Reunião remarcada",
  "Reunião cancelada",
  "Sem comparecimento",
] as const;
export type MeetingStatus = (typeof MEETING_STATUSES)[number];

/** Bloco de reunião da oportunidade. Campos vazios = sem dado de origem. */
export type MeetingInfo = {
  status: string;
  date: string;
  time: string;
  owner: string;
  participants: string;
  link: string;
  agenda: string;
  insights: string;
  pains: string;
  objections: string;
  nextSteps: string;
};

export const EMPTY_MEETING: MeetingInfo = {
  status: "",
  date: "",
  time: "",
  owner: "",
  participants: "",
  link: "",
  agenda: "",
  insights: "",
  pains: "",
  objections: "",
  nextSteps: "",
};

/** Data de referência do ambiente mockado. Trocar por `new Date()` na fase de dados reais. */
export const TODAY = new Date(2026, 7, 4);

/** Converte "dd/mm/yyyy" em Date. */
export function parseBR(date: string) {
  const [d, m, y] = date.split("/").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

/** Diferença em dias entre uma data "dd/mm/yyyy" e o dia de referência. */
export function daysFromToday(date: string) {
  return Math.round((parseBR(date).getTime() - TODAY.getTime()) / 86400000);
}

export type ActivityBucket = "atrasadas" | "hoje" | "semana" | "futuras" | "concluidas";

export const ACTIVITY_BUCKETS: { id: ActivityBucket; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "atrasadas", label: "Atrasadas" },
  { id: "semana", label: "Esta semana" },
  { id: "futuras", label: "Futuras" },
  { id: "concluidas", label: "Concluídas" },
];

export type StageId =
  | "prospeccao"
  | "contato"
  | "qualificacao"
  | "diagnostico"
  | "demonstracao"
  | "proposta"
  | "negociacao"
  | "ganho"
  | "perdido";

/** Tag personalizada aplicada a uma oportunidade. */
export type TagRef = { id: string; name: string; slug: string; color: string | null };

type LegacyStageId =
  | "prospeccao"
  | "contato"
  | "qualificacao"
  | "diagnostico"
  | "demonstracao"
  | "proposta"
  | "negociacao"
  | "ganho"
  | "perdido";

export const STAGES: { id: StageId; label: string }[] = [
  { id: "prospeccao", label: "Prospecção" },
  { id: "contato", label: "Contato Inicial" },
  { id: "qualificacao", label: "Qualificação" },
  { id: "diagnostico", label: "Diagnóstico" },
  { id: "demonstracao", label: "Reuniões" },
  { id: "proposta", label: "Proposta" },
  { id: "negociacao", label: "Negociação" },
  { id: "ganho", label: "Fechado Ganho" },
  { id: "perdido", label: "Fechado Perdido" },
];

export type Opportunity = {
  id: string;
  title: string;
  company: string;
  companyId: string;
  /** Tags personalizadas associadas à oportunidade. */
  tags?: TagRef[];
  contact: string;
  contactId?: string | undefined;
  createdAt?: string | undefined;
  linkedin?:
    | {
        url: string;
        status: string;
        step: string;
        lastActionAt: string | null;
        nextAction: string | null;
        nextActionAt: string | null;
      }
    | undefined;
  value: number;
  stage: StageId;
  temperature: Temperature | "";
  probability: number;
  health: number | null;
  daysInStage: number;
  priority: Priority;
  lastContact: string;
  lastContactDays: number;
  origin: OriginKey;
  partner?: string | undefined;
  pipelineId: string;
  custom: Record<string, string>;
  nextActivity: string;
  nextActivityDate: string;
  owner: string;
  closeDate: string;
  segment: string;
  source: string;
  nextStep: string;
  summary: string;
  pains: string[];
  objections: string[];
  suggestions: string[];
  risks: string[];
  arguments: string[];
  timeline: { date: string; title: string; detail: string; type: string }[];
  notes: { author: string; date: string; text: string }[];
  checklist: { label: string; done: boolean }[];
  files: { name: string; size: string; date: string }[];
  proposals: { id: string; value: number; status: string; sent: string; expires: string }[];
  meetings: { date: string; title: string; participants: string; summary: string }[];
  /** Valor de setup (R$) — nulo quando não informado na origem. */
  setupValue?: number | null;
  /** Motivo de perda, quando existir. */
  lossReason?: string;
  /** Nome original do responsável na base de origem. */
  ownerLabel?: string;
  /** Bloco estruturado da reunião atual. */
  meeting?: MeetingInfo;
};

export const OWNERS = [
  "Marina Duarte",
  "Rafael Lopes",
  "Camila Nunes",
  "Thiago Bastos",
  "Juliana Prado",
];

const SEGMENTS = ["SaaS", "Indústria", "Varejo", "Serviços", "Saúde", "Educação"];
const SOURCES = ["Inbound", "Outbound", "Indicação", "Evento", "Parceria", "Site"];

/** Origem comercial normalizada (mesmo formato que a API deve devolver). */
export type OriginKey = "outbound" | "inbound" | "parceiro" | "indicacao" | "outros";

export const PARTNERS = [
  "Alpha Consultoria",
  "RevOps Brasil",
  "Nucleo Digital",
  "Growth Partners",
];

const ORIGIN_BY_SOURCE: Record<string, OriginKey> = {
  Inbound: "inbound",
  Outbound: "outbound",
  "Indicação": "indicacao",
  Evento: "outros",
  Parceria: "parceiro",
  Site: "inbound",
};

export const originFromSource = (source: string): OriginKey =>
  ORIGIN_BY_SOURCE[source] ?? "outros";

const COMPANY_NAMES = [
  "Nexora Tecnologia",
  "Grupo Aurora",
  "Vetra Indústria",
  "Lumen Saúde",
  "Bright Varejo",
  "Orbita Labs",
  "Cortex Systems",
  "Vialog Transportes",
  "Solaris Energia",
  "Kaizen Educação",
  "Prisma Consultoria",
  "Fluxo Digital",
  "Atlas Alimentos",
  "Norvik Seguros",
  "Zenit Software",
  "Meridian Bank",
  "Terrano Agro",
  "Vibrant Mídia",
];

const CONTACT_NAMES = [
  "Ana Beatriz Rocha",
  "Carlos Menezes",
  "Débora Lima",
  "Eduardo Farias",
  "Fernanda Alves",
  "Gustavo Pinto",
  "Helena Castro",
  "Igor Marques",
  "Joana Ribeiro",
  "Lucas Andrade",
  "Mariana Teixeira",
  "Nelson Cardoso",
  "Patrícia Gomes",
  "Rodrigo Sales",
  "Sofia Barbosa",
  "Tiago Moura",
  "Vanessa Coelho",
  "William Duarte",
];

const ROLES = [
  "CEO",
  "Diretor Comercial",
  "Head de Vendas",
  "CFO",
  "Gerente de Operações",
  "COO",
  "Head de Marketing",
];

function seeded(i: number, mod: number) {
  return (i * 7919 + 104729) % mod;
}

export const companies = COMPANY_NAMES.map((name, i) => ({
  id: `emp-${i + 1}`,
  name,
  segment: SEGMENTS[i % SEGMENTS.length]!,
  mrr: 4000 + seeded(i, 26) * 1200,
  owner: OWNERS[i % OWNERS.length]!,
  opportunities: 1 + (i % 4),
  status: i % 5 === 0 ? "Cliente" : i % 3 === 0 ? "Em negociação" : "Prospect",
  site: `${name.split(" ")[0]!.toLowerCase()}.com.br`,
  city: ["São Paulo", "Curitiba", "Belo Horizonte", "Recife", "Porto Alegre"][i % 5]!,
  employees: [40, 120, 320, 850, 1500][i % 5]!,
  origin: originFromSource(SOURCES[i % SOURCES.length]!),
  partner:
    originFromSource(SOURCES[i % SOURCES.length]!) === "parceiro" ||
    originFromSource(SOURCES[i % SOURCES.length]!) === "indicacao"
      ? PARTNERS[i % PARTNERS.length]!
      : undefined,
}));

export const contacts = CONTACT_NAMES.map((name, i) => ({
  id: `ct-${i + 1}`,
  name,
  role: ROLES[i % ROLES.length]!,
  company: COMPANY_NAMES[i % COMPANY_NAMES.length]!,
  companyId: `emp-${(i % COMPANY_NAMES.length) + 1}`,
  phone: `+55 11 9${seeded(i, 9000) + 1000}-${seeded(i + 3, 9000) + 1000}`,
  whatsapp: `+55 11 9${seeded(i + 1, 9000) + 1000}-${seeded(i + 5, 9000) + 1000}`,
  email: `${name.split(" ")[0]!.toLowerCase()}@${COMPANY_NAMES[i % COMPANY_NAMES.length]!.split(" ")[0]!.toLowerCase()}.com.br`,
  linkedin: `linkedin.com/in/${name.toLowerCase().replace(/\s+/g, "-")}`,
  relationship: ["Forte", "Neutro", "Em construção"][i % 3]!,
  lastInteraction: `há ${1 + (i % 12)} dias`,
}));

const STAGE_DIST: StageId[] = [
  "prospeccao",
  "prospeccao",
  "contato",
  "contato",
  "qualificacao",
  "qualificacao",
  "diagnostico",
  "demonstracao",
  "demonstracao",
  "proposta",
  "proposta",
  "negociacao",
  "negociacao",
  "ganho",
  "ganho",
  "perdido",
  "qualificacao",
  "proposta",
  "negociacao",
  "demonstracao",
  "contato",
  "diagnostico",
  "ganho",
  "prospeccao",
];

const PROB: Record<StageId, number> = {
  prospeccao: 10,
  contato: 20,
  qualificacao: 35,
  diagnostico: 45,
  demonstracao: 60,
  proposta: 72,
  negociacao: 85,
  ganho: 100,
  perdido: 0,
};

export const opportunities: Opportunity[] = STAGE_DIST.map((stage, i) => {
  const company = companies[i % companies.length]!;
  const contact = contacts[i % contacts.length]!;
  const value = 18000 + seeded(i, 40) * 4500;
  const health = stage === "perdido" ? 22 + seeded(i, 15) : 45 + seeded(i, 50);
  const temperature: Temperature =
    health > 78 ? "Quente" : health > 55 ? "Morno" : "Frio";
  const daysInStage = 1 + seeded(i, 28);
  const lastContactDays = 1 + seeded(i + 2, 21);
  const lastContactDate = new Date(TODAY.getTime() - lastContactDays * 86400000);
  const source = SOURCES[i % SOURCES.length]!;
  const origin = originFromSource(source);
  return {
    id: `op-${i + 1}`,
    title: `${company.name} — Implantação Conversu`,
    company: company.name,
    companyId: company.id,
    contact: contact.name,
    value,
    stage,
    temperature,
    probability: PROB[stage],
    health,
    daysInStage,
    priority: (health >= 78 || PROB[stage] >= 72 ? "Alta" : health >= 55 ? "Média" : "Baixa") as Priority,
    lastContact: `${String(lastContactDate.getDate()).padStart(2, "0")}/${String(
      lastContactDate.getMonth() + 1,
    ).padStart(2, "0")}/${lastContactDate.getFullYear()}`,
    lastContactDays,
    origin,
    partner: origin === "parceiro" || origin === "indicacao" ? PARTNERS[i % PARTNERS.length]! : undefined,
    pipelineId:
      origin === "parceiro" || origin === "indicacao"
        ? "parcerias"
        : origin === "inbound"
          ? "inbound"
          : value > 120000
            ? "enterprise"
            : "outbound",
    custom: {
      produto: ["Sales OS", "Sales OS + IA", "Enterprise"][i % 3]!,
      segmento: company.segment,
      volume: String(120 + seeded(i, 400)),
      budget: String(value),
      concorrente: ["Planilhas", "CRM legado", "Pipedrive", "HubSpot"][i % 4]!,
      crm: ["Planilhas", "Pipedrive", "HubSpot", "Nenhum"][i % 4]!,
      usuarios: String(6 + (i % 40)),
      decisor: contact.name,
      timing: ["Imediato", "30 dias", "90 dias", "Sem prazo"][i % 4]!,
      canal: ["Site", "Webinar", "Indicação", "Evento"][i % 4]!,
      comissao: "15% recorrente",
      coSelling: i % 2 === 0 ? "Sim" : "Não",
      juridico: ["Não iniciada", "Em andamento", "Concluída"][i % 3]!,
    },
    nextActivity: ["Follow-up por WhatsApp", "Call de alinhamento", "Envio de proposta", "Reunião de diagnóstico", "E-mail de retomada"][i % 5]!,
    nextActivityDate: `${String(1 + (i % 27)).padStart(2, "0")}/08/2026`,
    owner: OWNERS[i % OWNERS.length]!,
    closeDate: `${String(5 + (i % 24)).padStart(2, "0")}/${String(8 + (i % 3)).padStart(2, "0")}/2026`,
    segment: company.segment,
    source,
    nextStep: ["Validar orçamento com o CFO", "Agendar demo técnica", "Revisar escopo da proposta", "Confirmar decisor final"][i % 4]!,
    summary: `${company.name} busca estruturar o processo comercial e ganhar previsibilidade de receita. A conversa avançou com ${contact.name} (${contact.role}) e o time avalia substituir a operação atual em planilhas.`,
    pains: [
      "Falta de previsibilidade no forecast",
      "Processo comercial em planilhas",
      "Baixa visibilidade do funil pela liderança",
    ],
    objections: [
      "Preocupação com tempo de implantação",
      "Comparativo de preço com concorrente",
      "Necessidade de aprovação do board",
    ],
    suggestions: [
      "Enviar business case com ROI em 6 meses",
      "Agendar sessão técnica com o time de operações",
      "Definir data de decisão junto ao decisor",
    ],
    risks: [
      health < 55 ? "Sem interação há mais de 10 dias" : "Decisor secundário ainda não engajado",
      "Proposta próxima do vencimento",
    ],
    arguments: [
      "Redução de 30% no ciclo de vendas",
      "Forecast ponderado automático",
      "Onboarding assistido em 14 dias",
    ],
    timeline: [
      { date: "02/08/2026", title: "Proposta enviada", detail: "Documento comercial v2 enviado por e-mail.", type: "proposta" },
      { date: "28/07/2026", title: "Reunião de demonstração", detail: "Demo com time comercial e operações.", type: "reuniao" },
      { date: "21/07/2026", title: "Diagnóstico concluído", detail: "Mapeamento do funil atual e gargalos.", type: "atividade" },
      { date: "14/07/2026", title: "Contato inicial", detail: "Primeira conversa de qualificação.", type: "atividade" },
    ],
    notes: [
      { author: OWNERS[i % OWNERS.length]!, date: "02/08/2026", text: "Decisor pediu comparativo com solução atual até sexta." },
      { author: OWNERS[(i + 1) % OWNERS.length]!, date: "27/07/2026", text: "Time técnico validou integração com o ERP." },
    ],
    checklist: [
      { label: "Decisor identificado", done: true },
      { label: "Orçamento confirmado", done: i % 2 === 0 },
      { label: "Diagnóstico realizado", done: true },
      { label: "Proposta enviada", done: PROB[stage] >= 72 },
      { label: "Data de decisão definida", done: PROB[stage] >= 85 },
    ],
    files: [
      { name: "Proposta-Conversu-v2.pdf", size: "820 KB", date: "02/08/2026" },
      { name: "Diagnostico-comercial.xlsx", size: "312 KB", date: "21/07/2026" },
    ],
    proposals: [
      { id: `PR-${1000 + i}`, value, status: PROB[stage] >= 85 ? "Em negociação" : "Enviada", sent: "02/08/2026", expires: "16/08/2026" },
    ],
    meetings: [
      { date: "28/07/2026", title: "Demonstração da plataforma", participants: `${contact.name}, ${OWNERS[i % OWNERS.length]!}`, summary: "Time demonstrou interesse em forecast e automações de follow-up." },
      { date: "21/07/2026", title: "Diagnóstico comercial", participants: `${contact.name}`, summary: "Mapeados gargalos de qualificação e perda de leads." },
    ],
  };
});

export type Activity = {
  id: string;
  type: string;
  title: string;
  company: string;
  companyId: string;
  contact: string;
  opportunity: string;
  opportunityId: string;
  owner: string;
  status: "Pendente" | "Concluída" | "Atrasada";
  priority: Priority;
  date: string;
  notes: string;
  bucket: ActivityBucket;
};

export const activities: Activity[] = Array.from({ length: 26 }, (_, i) => {
  const op = opportunities[i % opportunities.length]!;
  const date = `${String(1 + (i % 28)).padStart(2, "0")}/08/2026`;
  const delta = daysFromToday(date);
  const status = (i % 7 === 0 ? "Concluída" : delta < 0 ? "Atrasada" : "Pendente") as Activity["status"];
  const bucket: ActivityBucket =
    status === "Concluída"
      ? "concluidas"
      : delta < 0
        ? "atrasadas"
        : delta === 0
          ? "hoje"
          : delta <= 7
            ? "semana"
            : "futuras";
  return {
    id: `at-${i + 1}`,
    type: ["Ligação", "WhatsApp", "E-mail", "Follow-up", "Tarefa", "Reunião"][i % 6]!,
    title: [
      "Retomar contato com decisor",
      "Enviar case de sucesso",
      "Confirmar presença na demo",
      "Revisar proposta comercial",
      "Atualizar próxima etapa",
      "Alinhamento técnico",
    ][i % 6]!,
    company: op.company,
    companyId: op.companyId,
    contact: op.contact,
    opportunity: op.title,
    opportunityId: op.id,
    owner: op.owner,
    status,
    priority: (["Alta", "Média", "Baixa"] as Priority[])[i % 3]!,
    date,
    notes: [
      "Decisor pediu retorno após reunião de diretoria.",
      "Enviar material antes das 12h.",
      "Confirmar participação do time técnico.",
      "Checar condição comercial com o financeiro.",
    ][i % 4]!,
    bucket,
  };
});

export const meetings = Array.from({ length: 14 }, (_, i) => {
  const op = opportunities[i % opportunities.length]!;
  return {
    id: `rn-${i + 1}`,
    title: ["Demonstração da plataforma", "Diagnóstico comercial", "Apresentação de proposta", "Kickoff de implantação", "Follow-up executivo"][i % 5]!,
    company: op.company,
    contact: op.contact,
    owner: op.owner,
    date: `${String(3 + (i % 14)).padStart(2, "0")}/08/2026`,
    time: `${String(9 + (i % 8)).padStart(2, "0")}:00`,
    duration: `${30 + (i % 3) * 15} min`,
    status: i % 4 === 0 ? "Hoje" : i % 3 === 0 ? "Realizada" : "Agendada",
    opportunity: op.title,
    opportunityId: op.id,
    participants: [op.contact, op.owner, i % 2 === 0 ? "Equipe técnica Conversu" : "Diretoria"].join(", "),
    agenda: [
      "Contexto e objetivos do cliente",
      "Demonstração do fluxo comercial",
      "Impacto esperado e próximos passos",
    ],
    summary:
      i % 3 === 0
        ? "Cliente validou o ganho de previsibilidade e pediu proposta com escopo de implantação."
        : "Reunião ainda não realizada — resumo será registrado ao final.",
  };
});

export const proposals = opportunities.slice(0, 12).map((o, i) => ({
  id: `PR-${2000 + i}`,
  company: o.company,
  companyId: o.companyId,
  opportunity: o.title,
  opportunityId: o.id,
  value: o.value,
  owner: o.owner,
  status: ["Enviada", "Em negociação", "Aceita", "Vencendo", "Recusada"][i % 5]!,
  sent: `${String(1 + (i % 20)).padStart(2, "0")}/08/2026`,
  expires: `${String(5 + (i % 18)).padStart(2, "0")}/08/2026`,
  items: [
    { label: "Licença Conversu Sales OS", qty: 6 + (i % 30), unit: Math.round(o.value * 0.55 / (6 + (i % 30))) },
    { label: "Implantação assistida", qty: 1, unit: Math.round(o.value * 0.3) },
    { label: "Treinamento do time comercial", qty: 1, unit: Math.round(o.value * 0.15) },
  ],
  conditions: {
    payment: ["Mensal", "Trimestral", "Anual antecipado"][i % 3]!,
    term: ["12 meses", "24 meses"][i % 2]!,
    discount: `${(i % 4) * 5}%`,
    setup: i % 2 === 0 ? "Incluso" : "Cobrado à parte",
  },
  history: [
    { date: `${String(1 + (i % 20)).padStart(2, "0")}/08/2026`, event: "Proposta enviada por e-mail" },
    { date: `${String(2 + (i % 20)).padStart(2, "0")}/08/2026`, event: "Cliente confirmou recebimento" },
    { date: `${String(3 + (i % 20)).padStart(2, "0")}/08/2026`, event: "Leitura conjunta agendada" },
  ],
}));

export type Meeting = (typeof meetings)[number];
export type Proposal = (typeof proposals)[number];

export const currency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const compact = (v: number) =>
  `R$ ${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k`;

const open = opportunities.filter((o) => o.stage !== "ganho" && o.stage !== "perdido");
const won = opportunities.filter((o) => o.stage === "ganho");
const lost = opportunities.filter((o) => o.stage === "perdido");

export const metrics = {
  pipelineTotal: open.reduce((s, o) => s + o.value, 0),
  forecast: Math.round(open.reduce((s, o) => s + (o.value * o.probability) / 100, 0)),
  expectedRevenue: open
    .filter((o) => o.probability >= 60)
    .reduce((s, o) => s + o.value, 0),
  closedRevenue: won.reduce((s, o) => s + o.value, 0),
  ticket: Math.round(
    opportunities.reduce((s, o) => s + o.value, 0) / opportunities.length,
  ),
  winRate: Math.round((won.length / (won.length + lost.length)) * 100),
  atRisk: open.filter((o) => (o.health !== null && o.health < 55) || o.daysInStage > 18).length,
  nextClosings: open.filter((o) => o.probability >= 72).length,
  pendingActivities: activities.filter((a) => a.status !== "Concluída").length,
  meetingsToday: meetings.filter((m) => m.status === "Hoje").length,
};

export const pipelineByStage = STAGES.filter(
  (s) => s.id !== "ganho" && s.id !== "perdido",
).map((s) => ({
  name: s.label,
  valor: opportunities.filter((o) => o.stage === s.id).reduce((a, o) => a + o.value, 0),
}));

export const pipelineByOwner = OWNERS.map((owner) => ({
  name: owner.split(" ")[0]!,
  valor: open.filter((o) => o.owner === owner).reduce((a, o) => a + o.value, 0),
}));

export const pipelineBySegment = SEGMENTS.map((seg) => ({
  name: seg,
  valor: open.filter((o) => o.segment === seg).reduce((a, o) => a + o.value, 0),
}));

export const leadSources = SOURCES.map((src) => ({
  name: src,
  value: opportunities.filter((o) => o.source === src).length,
}));

export const funnelConversion = STAGES.filter((s) => s.id !== "perdido").map((s, i) => ({
  name: s.label,
  taxa: Math.max(8, 100 - i * 11),
}));

export const monthly = [
  { name: "Mar", receita: 268000, forecast: 310000 },
  { name: "Abr", receita: 312000, forecast: 340000 },
  { name: "Mai", receita: 289000, forecast: 355000 },
  { name: "Jun", receita: 374000, forecast: 390000 },
  { name: "Jul", receita: 421000, forecast: 430000 },
  { name: "Ago", receita: 268000, forecast: 465000 },
  { name: "Set", receita: 0, forecast: 498000 },
  { name: "Out", receita: 0, forecast: 540000 },
];

export const lossReasons = [
  { name: "Preço", value: 34 },
  { name: "Timing", value: 22 },
  { name: "Concorrente", value: 19 },
  { name: "Sem budget", value: 15 },
  { name: "Sem resposta", value: 10 },
];

export const salesCycle = OWNERS.map((o, i) => ({
  name: o.split(" ")[0]!,
  dias: 28 + ((i * 9) % 26),
}));

export const ranking = OWNERS.map((owner, i) => {
  const ops = opportunities.filter((o) => o.owner === owner);
  return {
    owner,
    pipeline: ops.filter((o) => o.stage !== "ganho" && o.stage !== "perdido").reduce((a, o) => a + o.value, 0),
    fechado: ops.filter((o) => o.stage === "ganho").reduce((a, o) => a + o.value, 0),
    negocios: ops.length,
    winRate: 38 + ((i * 13) % 34),
  };
}).sort((a, b) => b.fechado - a.fechado);

export const todayItems = {
  followUps: activities.filter((a) => a.type === "Follow-up").slice(0, 4),
  expiringProposals: proposals.filter((p) => p.status === "Vencendo" || p.status === "Enviada").slice(0, 4),
  stale: open.filter((o) => o.daysInStage > 15).slice(0, 4),
  waiting: open.filter((o) => o.probability >= 72).slice(0, 4),
  meetings: meetings.slice(0, 4),
};
/* -------------------------------------------------------------------------
 * Camada de seleção (view-models)
 * Toda a UI consome estes seletores em vez de recalcular regras nas telas.
 * Na próxima fase basta trocar a origem dos dados mantendo estas assinaturas.
 * ---------------------------------------------------------------------- */

export const STALE_DAYS = 10;

export const isStale = (o: Opportunity) => o.lastContactDays >= STALE_DAYS;

/** Passos que ainda faltam para a oportunidade avançar de etapa. */
export const pendingSteps = (o: Opportunity) =>
  o.checklist.filter((c) => !c.done).map((c) => c.label);

export const openOpportunities = open;
export const wonOpportunities = won;

export type CompanyRow = (typeof companies)[number] & {
  contactsCount: number;
  opportunitiesCount: number;
  openValue: number;
  lastInteraction: string;
  nextActivity: string;
  nextActivityDate: string;
  note: string;
  summary: string;
};

export const companyRows: CompanyRow[] = companies.map((c, i) => {
  const ops = opportunities.filter((o) => o.companyId === c.id);
  const openOps = ops.filter((o) => o.stage !== "ganho" && o.stage !== "perdido");
  const ref = openOps[0] ?? ops[0];
  return {
    ...c,
    contactsCount: contacts.filter((ct) => ct.companyId === c.id).length,
    opportunitiesCount: ops.length,
    openValue: openOps.reduce((s, o) => s + o.value, 0),
    lastInteraction: ref?.lastContact ?? "—",
    nextActivity: ref?.nextActivity ?? "Sem atividade agendada",
    nextActivityDate: ref?.nextActivityDate ?? "—",
    note: [
      "Conta prioritária do trimestre.",
      "Decisão depende do board.",
      "Expansão prevista para o próximo ciclo.",
      "Relacionamento aquecido via indicação.",
    ][i % 4]!,
    summary: `${c.name} está em ${openOps.length} negociação(ões) ativa(s) conduzidas por ${c.owner}, com potencial de ${currency(
      openOps.reduce((s, o) => s + o.value, 0),
    )} em receita.`,
  };
});

export type ContactRow = (typeof contacts)[number] & {
  influence: "Decisor" | "Influenciador" | "Usuário";
  owner: string;
  nextActivity: string;
  nextActivityDate: string;
};

export const contactRows: ContactRow[] = contacts.map((c, i) => {
  const op = opportunities.find((o) => o.companyId === c.companyId);
  return {
    ...c,
    influence: (["Decisor", "Influenciador", "Usuário"] as const)[i % 3]!,
    owner: op?.owner ?? OWNERS[i % OWNERS.length]!,
    nextActivity: op?.nextActivity ?? "Sem atividade agendada",
    nextActivityDate: op?.nextActivityDate ?? "—",
  };
});

/** Histórico de alterações da oportunidade (auditoria). */
export const opportunityHistory = (o: Opportunity) => [
  { date: o.timeline[0]?.date ?? "02/08/2026", title: "Etapa alterada", detail: `Movida para ${STAGES.find((s) => s.id === o.stage)?.label}.` },
  { date: "29/07/2026", title: "Valor atualizado", detail: `Valor ajustado para ${currency(o.value)}.` },
  { date: "24/07/2026", title: "Responsável definido", detail: `${o.owner} assumiu a condução.` },
  { date: "14/07/2026", title: "Oportunidade criada", detail: `Origem: ${o.source}.` },
];

/** Widgets operacionais do dashboard. */
export const dashboard = {
  overdueFollowUps: activities.filter((a) => a.bucket === "atrasadas").slice(0, 5),
  todayActivities: activities.filter((a) => a.bucket === "hoje").slice(0, 5),
  upcomingMeetings: meetings.filter((m) => m.status !== "Realizada").slice(0, 5),
  noInteraction: open.filter(isStale).sort((a, b) => b.lastContactDays - a.lastContactDays).slice(0, 5),
  closingSoon: open
    .filter((o) => o.probability >= 72)
    .sort((a, b) => parseBR(a.closeDate).getTime() - parseBR(b.closeDate).getTime())
    .slice(0, 5),
  renewals: companyRows
    .filter((c) => c.status === "Cliente")
    .slice(0, 4)
    .map((c, i) => ({
      id: c.id,
      company: c.name,
      value: c.mrr * 12,
      date: `${String(12 + i * 4).padStart(2, "0")}/09/2026`,
      owner: c.owner,
    })),
  alerts: [
    ...open.filter((o) => o.daysInStage > 20).slice(0, 2).map((o) => ({
      id: `al-stage-${o.id}`,
      tone: "danger" as const,
      title: `${o.company} parada há ${o.daysInStage} dias`,
      detail: `Etapa ${STAGES.find((s) => s.id === o.stage)?.label} sem avanço.`,
    })),
    ...proposals.filter((p) => p.status === "Vencendo").slice(0, 2).map((p) => ({
      id: `al-prop-${p.id}`,
      tone: "warning" as const,
      title: `Proposta ${p.id} vencendo`,
      detail: `${p.company} · vence em ${p.expires}.`,
    })),
    ...activities.filter((a) => a.bucket === "atrasadas" && a.priority === "Alta").slice(0, 2).map((a) => ({
      id: `al-act-${a.id}`,
      tone: "danger" as const,
      title: `${a.type} atrasada — ${a.company}`,
      detail: `${a.title} · previsto ${a.date}.`,
    })),
  ],
};

export const valueByStage = STAGES.filter((s) => s.id !== "ganho" && s.id !== "perdido").map((s) => {
  const items = open.filter((o) => o.stage === s.id);
  return {
    id: s.id,
    label: s.label,
    count: items.length,
    value: items.reduce((a, o) => a + o.value, 0),
  };
});

export type SearchEntity = "Empresa" | "Contato" | "Oportunidade" | "Atividade";

export type SearchResult = {
  id: string;
  entity: SearchEntity;
  title: string;
  subtitle: string;
  to: string;
};

export const searchIndex: SearchResult[] = [
  ...opportunities.map((o) => ({
    id: o.id,
    entity: "Oportunidade" as const,
    title: o.title,
    subtitle: `${currency(o.value)} · ${o.owner}`,
    to: "/pipeline",
  })),
  ...companyRows.map((c) => ({
    id: c.id,
    entity: "Empresa" as const,
    title: c.name,
    subtitle: `${c.segment} · ${c.owner}`,
    to: "/empresas",
  })),
  ...contactRows.map((c) => ({
    id: c.id,
    entity: "Contato" as const,
    title: c.name,
    subtitle: `${c.role} · ${c.company}`,
    to: "/contatos",
  })),
  ...activities.map((a) => ({
    id: a.id,
    entity: "Atividade" as const,
    title: a.title,
    subtitle: `${a.type} · ${a.company} · ${a.date}`,
    to: "/atividades",
  })),
];
