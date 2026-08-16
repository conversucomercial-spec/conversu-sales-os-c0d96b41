import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import {
  deleteAutomation,
  deleteCustomField,
  deleteOption,
  deletePipeline,
  deleteStage,
  listSettings,
  saveAutomation,
  saveCustomField,
  saveOption,
  savePipeline,
  saveStage,
} from "@/lib/settings.functions";
import { EMPTY_SETTINGS, type CrmSettings } from "@/lib/settings";

export const SETTINGS_QUERY_KEY = ["crm-settings"] as const;

/** Carrega a configuração comercial editável. */
export function useSettings() {
  const fetchSettings = useServerFn(listSettings);
  const query = useQuery<CrmSettings>({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => fetchSettings(),
    staleTime: 30_000,
  });
  return { ...query, data: query.data ?? EMPTY_SETTINGS };
}

/** Mutations de configuração com invalidação automática do cache. */
export function useSettingsMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: ["crm"] });
  };

  const build = <TInput>(fn: (args: { data: TInput }) => Promise<unknown>, success: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMutation({
      mutationFn: (input: TInput) => fn({ data: input }),
      onSuccess: () => {
        toast.success(success);
        invalidate();
      },
      onError: (e: Error) => toast.error("Não foi possível salvar", { description: e.message }),
    });

  return {
    savePipeline: build(useServerFn(savePipeline), "Funil salvo"),
    deletePipeline: build(useServerFn(deletePipeline), "Funil removido"),
    saveStage: build(useServerFn(saveStage), "Etapa salva"),
    deleteStage: build(useServerFn(deleteStage), "Etapa removida"),
    saveCustomField: build(useServerFn(saveCustomField), "Campo salvo"),
    deleteCustomField: build(useServerFn(deleteCustomField), "Campo removido"),
    saveOption: build(useServerFn(saveOption), "Item salvo"),
    deleteOption: build(useServerFn(deleteOption), "Item removido"),
    saveAutomation: build(useServerFn(saveAutomation), "Automação salva"),
    deleteAutomation: build(useServerFn(deleteAutomation), "Automação removida"),
  };
}
