/**
 * Lógica comercial que define em qual funil uma nova oportunidade entra.
 * Nunca assume o primeiro funil global: parte da origem e do porte da conta.
 */
const ORIGIN_PIPELINE: Record<string, string> = {
  outbound: "outbound",
  inbound: "inbound",
  parceiro: "parcerias",
  indicacao: "parcerias",
  outros: "outbound",
};

/** Contas deste porte entram no funil Enterprise, independentemente da origem. */
export const ENTERPRISE_EMPLOYEES = 500;

export function pipelineKeyForOrigin(origin: string, employees = 0): string {
  if (employees >= ENTERPRISE_EMPLOYEES) return "enterprise";
  return ORIGIN_PIPELINE[origin] ?? "outbound";
}
