import type { Json } from "@/integrations/supabase/types";

/** Tipos e rótulos da configuração comercial editável dentro do CRM. */
export type StageSetting = {
  id: string;
  pipelineId: string;
  key: string;
  name: string;
  position: number;
  probability: number;
  criteria: string[];
  playbook: Json;
};

export type PipelineSetting = {
  id: string;
  key: string;
  name: string;
  description: string;
  position: number;
  active: boolean;
  cardFields: string[];
  stages: StageSetting[];
};

export type CustomFieldSetting = {
  id: string;
  entity: "opportunity" | "company" | "contact";
  key: string;
  label: string;
  type: string;
  options: string[];
  required: boolean;
  pipelineKeys: string[];
  position: number;
  active: boolean;
};

export type OptionSetting = {
  id: string;
  listKey: string;
  value: string;
  label: string;
  position: number;
  active: boolean;
};

export type AutomationSetting = {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  triggerConfig: Json;
  actionType: string;
  actionConfig: Json;
  active: boolean;
};

export type CrmSettings = {
  isAdmin: boolean;
  pipelines: PipelineSetting[];
  customFields: CustomFieldSetting[];
  options: OptionSetting[];
  automations: AutomationSetting[];
};

export const EMPTY_SETTINGS: CrmSettings = {
  isAdmin: false,
  pipelines: [],
  customFields: [],
  options: [],
  automations: [],
};

export const FIELD_TYPES = [
  { value: "texto", label: "Texto" },
  { value: "texto_longo", label: "Texto longo" },
  { value: "numero", label: "Número" },
  { value: "moeda", label: "Valor (R$)" },
  { value: "data", label: "Data" },
  { value: "lista", label: "Lista de opções" },
  { value: "booleano", label: "Sim / Não" },
] as const;

export const FIELD_ENTITIES = [
  { value: "opportunity", label: "Oportunidade" },
  { value: "company", label: "Empresa" },
  { value: "contact", label: "Contato" },
] as const;

/** Listas de apoio que o administrador pode editar. */
export const OPTION_LISTS = [
  { key: "origem", label: "Origens" },
  { key: "parceiro", label: "Parceiros" },
  { key: "temperatura", label: "Temperaturas" },
  { key: "prioridade", label: "Prioridades" },
  { key: "motivo_perda", label: "Motivos de perda" },
  { key: "status_reuniao", label: "Status de reunião" },
  { key: "categoria_documento", label: "Categorias de documento" },
  { key: "etapa_linkedin", label: "Etapas de cadência LinkedIn" },
] as const;

export const TRIGGER_TYPES = [
  { value: "etapa_alterada", label: "Quando a etapa mudar" },
  { value: "parada_dias", label: "Quando ficar parada por N dias" },
  { value: "reuniao_realizada", label: "Quando a reunião for realizada" },
  { value: "proposta_vencendo", label: "Quando a proposta estiver vencendo" },
  { value: "oportunidade_criada", label: "Quando a oportunidade for criada" },
] as const;

export const ACTION_TYPES = [
  { value: "notificacao", label: "Enviar notificação" },
  { value: "atividade", label: "Criar atividade" },
  { value: "campo", label: "Atualizar campo" },
] as const;

export const CARD_FIELD_OPTIONS = [
  { value: "company", label: "Empresa" },
  { value: "contact", label: "Contato" },
  { value: "value", label: "Valor" },
  { value: "owner", label: "Responsável" },
  { value: "closeDate", label: "Previsão de fechamento" },
  { value: "probability", label: "Probabilidade" },
  { value: "temperature", label: "Temperatura" },
  { value: "health", label: "Health score" },
  { value: "priority", label: "Prioridade" },
  { value: "daysInStage", label: "Dias na etapa" },
  { value: "origin", label: "Origem" },
  { value: "partner", label: "Parceiro" },
  { value: "nextActivity", label: "Próxima atividade" },
  { value: "tags", label: "Tags" },
] as const;

export const labelOf = (
  list: readonly { value: string; label: string }[],
  value: string,
  fallback = value,
) => list.find((i) => i.value === value)?.label ?? fallback;
