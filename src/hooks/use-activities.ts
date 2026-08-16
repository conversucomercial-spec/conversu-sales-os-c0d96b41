import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  createActivity,
  deleteActivity,
  listActivities,
  updateActivity,
} from "@/lib/activities.functions";
import { CRM_QUERY_KEY } from "@/hooks/use-crm";
import type { ActivityRecord } from "@/lib/activities";

export const ACTIVITIES_QUERY_KEY = ["crm", "activities"] as const;

/** Atividades reais do banco + mutações com invalidação de cache. */
export function useActivities() {
  const qc = useQueryClient();
  const fetchActivities = useServerFn(listActivities);
  const create = useServerFn(createActivity);
  const update = useServerFn(updateActivity);
  const remove = useServerFn(deleteActivity);

  const query = useQuery({ queryKey: ACTIVITIES_QUERY_KEY, queryFn: () => fetchActivities() });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ACTIVITIES_QUERY_KEY });
    void qc.invalidateQueries({ queryKey: CRM_QUERY_KEY });
  };
  const fail = (e: unknown) => toast.error(e instanceof Error ? e.message : "Erro inesperado");

  const createMutation = useMutation({
    mutationFn: (data: {
      type: string;
      title: string;
      description?: string;
      priority?: string;
      dueAt?: string | null;
      companyId?: string | null;
      contactId?: string | null;
      opportunityId?: string | null;
    }) => create({ data }),
    onSuccess: () => {
      toast.success("Atividade criada");
      invalidate();
    },
    onError: fail,
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      id: string;
      title?: string;
      description?: string;
      type?: string;
      priority?: string;
      status?: string;
      dueAt?: string | null;
    }) => update({ data }),
    onSuccess: () => invalidate(),
    onError: fail,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Atividade removida");
      invalidate();
    },
    onError: fail,
  });

  const items: ActivityRecord[] = query.data ?? [];

  return {
    items,
    isLoading: query.isLoading,
    createActivity: createMutation.mutateAsync,
    updateActivity: updateMutation.mutateAsync,
    deleteActivity: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
}
