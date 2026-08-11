import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCrm } from "@/lib/crm.functions";
import type { CrmSnapshot } from "@/lib/crm-mappers";

export const CRM_QUERY_KEY = ["crm", "snapshot"] as const;

const EMPTY: CrmSnapshot = {
  companies: [],
  contacts: [],
  opportunities: [],
  stages: [],
  owners: [],
};

/** Dados comerciais reais (empresas, contatos e oportunidades) vindos do banco. */
export function useCrm() {
  const fetchCrm = useServerFn(listCrm);
  const query = useQuery({ queryKey: CRM_QUERY_KEY, queryFn: () => fetchCrm() });
  return { ...query, data: query.data ?? EMPTY };
}
