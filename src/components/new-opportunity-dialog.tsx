import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/form-field";
import { FilterSelect } from "@/components/toolbar";
import { ORIGINS } from "@/lib/config";
import { PARTNERS } from "@/lib/data";
import { createOpportunity } from "@/lib/crm.functions";
import { CRM_QUERY_KEY, useCrm } from "@/hooks/use-crm";

const NONE = "__none";

const EMPTY = {
  title: "",
  companyId: NONE,
  contactId: NONE,
  origin: "outbound",
  value: "",
  stageId: NONE,
  ownerId: NONE,
  partner: NONE,
  probability: "",
  closeDate: "",
};

/**
 * Formulário único de criação de oportunidade, reutilizado no pipeline e no
 * botão global da barra superior. O título é campo de texto livre.
 */
export function NewOpportunityDialog({
  open: openProp,
  onOpenChange,
  withTrigger = true,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  withTrigger?: boolean;
} = {}) {
  const { data } = useCrm();
  const queryClient = useQueryClient();
  const create = useServerFn(createOpportunity);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    onOpenChange?.(v);
  };
  const [form, setForm] = useState(EMPTY);
  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);

  const hasCompany = form.companyId !== NONE;
  const contacts = useMemo(
    () => data.contacts.filter((c) => !hasCompany || c.companyId === form.companyId),
    [data.contacts, form.companyId, hasCompany],
  );

  const mutation = useMutation({
    mutationFn: () =>
      create({
        data: {
          companyId: form.companyId,
          origin: form.origin,
          ...(form.title.trim() ? { title: form.title.trim() } : {}),
          ...(form.contactId !== NONE ? { contactId: form.contactId } : {}),
          ...(form.stageId !== NONE ? { stageId: form.stageId } : {}),
          ...(form.ownerId !== NONE ? { ownerId: form.ownerId } : {}),
          partner: form.partner === NONE ? null : form.partner,
          value: Number(form.value) || 0,
          ...(form.probability !== "" ? { probability: Number(form.probability) } : {}),
          closeDate: form.closeDate || null,
        },
      }),
    onSuccess: () => {
      toast.success("Oportunidade criada");
      void queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEY });
      setOpen(false);
    },
    onError: (e: Error) => toast.error("Não foi possível criar", { description: e.message }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {withTrigger && (
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" /> Nova oportunidade
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova oportunidade</DialogTitle>
          <DialogDescription>
            Informe o nome da negociação e a empresa. Se a etapa não for escolhida, o funil e a
            etapa inicial são definidos automaticamente pela origem.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome da oportunidade" htmlFor="op-title" className="sm:col-span-2">
            <Input
              id="op-title"
              value={form.title}
              onChange={(e) => set("title")(e.target.value)}
              placeholder="Ex.: Conversu × Acme — automação de atendimento"
            />
          </Field>
          <Field label="Empresa">
            <FilterSelect
              value={form.companyId}
              onChange={(v) => setForm((f) => ({ ...f, companyId: v, contactId: NONE }))}
              className="w-full"
              options={[
                { value: NONE, label: "Selecione a empresa" },
                ...data.companies.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </Field>
          <Field label="Contato">
            <FilterSelect
              value={form.contactId}
              onChange={set("contactId")}
              className="w-full"
              options={[
                { value: NONE, label: "Sem contato definido" },
                ...contacts.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </Field>
          <Field label="Valor (R$)">
            <Input
              type="number"
              value={form.value}
              onChange={(e) => set("value")(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Etapa">
            <FilterSelect
              value={form.stageId}
              onChange={set("stageId")}
              className="w-full"
              options={[
                { value: NONE, label: "Definir automaticamente" },
                ...data.stages.map((s) => ({
                  value: s.id,
                  label: `${s.name} · ${s.pipelineKey}`,
                })),
              ]}
            />
          </Field>
          <Field label="Responsável">
            <FilterSelect
              value={form.ownerId}
              onChange={set("ownerId")}
              className="w-full"
              options={[
                { value: NONE, label: "Eu mesmo" },
                ...data.people.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          </Field>
          <Field label="Origem">
            <FilterSelect
              value={form.origin}
              onChange={set("origin")}
              className="w-full"
              options={ORIGINS.map((o) => ({ value: o.id, label: o.label }))}
            />
          </Field>
          <Field label="Parceiro">
            <FilterSelect
              value={form.partner}
              onChange={set("partner")}
              className="w-full"
              options={[
                { value: NONE, label: "Nenhum parceiro" },
                ...PARTNERS.map((p) => ({ value: p, label: p })),
              ]}
            />
          </Field>
          <Field label="Probabilidade (%)">
            <Input
              type="number"
              value={form.probability}
              onChange={(e) => set("probability")(e.target.value)}
              placeholder="Da etapa"
            />
          </Field>
          <Field label="Previsão de fechamento">
            <Input
              type="date"
              value={form.closeDate}
              onChange={(e) => set("closeDate")(e.target.value)}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={!hasCompany || mutation.isPending}>
            Criar oportunidade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
