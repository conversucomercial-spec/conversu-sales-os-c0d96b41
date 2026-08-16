import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { deleteProposal, listProposals, saveProposal } from "@/lib/proposals.functions";
import type { ProposalRecord } from "@/lib/proposals";

export const PROPOSALS_QUERY_KEY = ["proposals"] as const;

/** Propostas persistidas no banco. */
export function useProposals() {
  const fetchProposals = useServerFn(listProposals);
  const query = useQuery<ProposalRecord[]>({
    queryKey: PROPOSALS_QUERY_KEY,
    queryFn: () => fetchProposals(),
    staleTime: 20_000,
  });
  return { ...query, data: query.data ?? [] };
}

/** Criação, edição e exclusão de propostas. */
export function useProposalMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: PROPOSALS_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: ["crm"] });
  };
  const save = useServerFn(saveProposal);
  const remove = useServerFn(deleteProposal);

  return {
    save: useMutation({
      mutationFn: (input: Parameters<typeof saveProposal>[0]["data"]) => save({ data: input }),
      onSuccess: () => {
        toast.success("Proposta salva");
        invalidate();
      },
      onError: (e: Error) => toast.error("Não foi possível salvar", { description: e.message }),
    }),
    remove: useMutation({
      mutationFn: (input: { id: string }) => remove({ data: input }),
      onSuccess: () => {
        toast.success("Proposta excluída");
        invalidate();
      },
      onError: (e: Error) => toast.error("Não foi possível excluir", { description: e.message }),
    }),
  };
}
