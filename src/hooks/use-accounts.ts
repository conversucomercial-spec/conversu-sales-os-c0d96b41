import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  createCompany,
  createContact,
  deleteCompany,
  deleteContact,
  updateCompany,
  updateContact,
} from "@/lib/accounts.functions";
import { deleteOpportunity, updateOpportunity } from "@/lib/opportunities.functions";
import { CRM_QUERY_KEY } from "@/hooks/use-crm";
import { ACTIVITIES_QUERY_KEY } from "@/hooks/use-activities";

type Fn<T> = (input: T) => Promise<unknown>;

/** Mutações de escrita de empresas, contatos e oportunidades. */
export function useCrmMutations() {
  const qc = useQueryClient();
  const fns = {
    createCompany: useServerFn(createCompany),
    updateCompany: useServerFn(updateCompany),
    deleteCompany: useServerFn(deleteCompany),
    createContact: useServerFn(createContact),
    updateContact: useServerFn(updateContact),
    deleteContact: useServerFn(deleteContact),
    updateOpportunity: useServerFn(updateOpportunity),
    deleteOpportunity: useServerFn(deleteOpportunity),
  };

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: CRM_QUERY_KEY });
    void qc.invalidateQueries({ queryKey: ACTIVITIES_QUERY_KEY });
  };

  const run = <T>(fn: Fn<{ data: T }>, success: string) =>
    useMutation({
      mutationFn: (data: T) => fn({ data }),
      onSuccess: () => {
        toast.success(success);
        invalidate();
      },
      onError: (e: unknown) =>
        toast.error(e instanceof Error ? e.message : "Não foi possível salvar"),
    });

  return {
    company: {
      create: run<Parameters<typeof createCompany>[0]["data"]>(fns.createCompany, "Empresa criada"),
      update: run<Parameters<typeof updateCompany>[0]["data"]>(
        fns.updateCompany,
        "Empresa atualizada",
      ),
      remove: run<Parameters<typeof deleteCompany>[0]["data"]>(
        fns.deleteCompany,
        "Empresa excluída",
      ),
    },
    contact: {
      create: run<Parameters<typeof createContact>[0]["data"]>(fns.createContact, "Contato criado"),
      update: run<Parameters<typeof updateContact>[0]["data"]>(
        fns.updateContact,
        "Contato atualizado",
      ),
      remove: run<Parameters<typeof deleteContact>[0]["data"]>(
        fns.deleteContact,
        "Contato excluído",
      ),
    },
    opportunity: {
      update: run<Parameters<typeof updateOpportunity>[0]["data"]>(
        fns.updateOpportunity,
        "Oportunidade atualizada",
      ),
      remove: run<Parameters<typeof deleteOpportunity>[0]["data"]>(
        fns.deleteOpportunity,
        "Oportunidade excluída",
      ),
    },
  };
}
