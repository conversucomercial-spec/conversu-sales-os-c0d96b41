import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { createSeller, listTeam, revokeMemberAccess, setMemberRole } from "@/lib/team.functions";

export const TEAM_QUERY_KEY = ["crm-team"] as const;

/** Lista da equipe comercial (somente administrador recebe dados). */
export function useTeam() {
  const fetchTeam = useServerFn(listTeam);
  const query = useQuery({
    queryKey: TEAM_QUERY_KEY,
    queryFn: () => fetchTeam(),
    staleTime: 30_000,
  });
  return { ...query, data: query.data ?? { isAdmin: false, members: [] } };
}

/** Ações administrativas sobre contas de vendedores. */
export function useTeamMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY });
  const create = useServerFn(createSeller);
  const setRole = useServerFn(setMemberRole);
  const revoke = useServerFn(revokeMemberAccess);

  return {
    createSeller: useMutation({
      mutationFn: (input: { email: string; fullName: string; jobTitle?: string; password?: string }) =>
        create({ data: input }),
      onSuccess: (result) => {
        toast.success(result.invited ? "Convite enviado ao vendedor" : "Conta de vendedor criada");
        invalidate();
      },
      onError: (e: Error) => toast.error("Não foi possível criar a conta", { description: e.message }),
    }),
    setRole: useMutation({
      mutationFn: (input: { userId: string; role: "gestor" | "vendedor" }) => setRole({ data: input }),
      onSuccess: () => {
        toast.success("Papel atualizado");
        invalidate();
      },
      onError: (e: Error) => toast.error("Não foi possível atualizar", { description: e.message }),
    }),
    revoke: useMutation({
      mutationFn: (input: { userId: string }) => revoke({ data: input }),
      onSuccess: () => {
        toast.success("Acesso revogado");
        invalidate();
      },
      onError: (e: Error) => toast.error("Não foi possível revogar", { description: e.message }),
    }),
  };
}
