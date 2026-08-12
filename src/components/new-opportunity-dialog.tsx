import { useMemo, useState } from "react";
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
import { FilterSelect } from "@/components/toolbar";
import { ORIGINS } from "@/lib/config";
import { createOpportunity } from "@/lib/crm.functions";
import { CRM_QUERY_KEY, useCrm } from "@/hooks/use-crm";

/** Criação enxuta: empresa, contato e origem — o resto é preenchido no drawer. */
export function NewOpportunityDialog() {
  const { data } = useCrm();
  const queryClient = useQueryClient();
  const create = useServerFn(createOpportunity);
  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [contactId, setContactId] = useState("");
  const [origin, setOrigin] = useState<string>("outbound");

  const contacts = useMemo(
    () => data.contacts.filter((c) => !companyId || c.companyId === companyId),
    [data.contacts, companyId],
  );

  const mutation = useMutation({
    mutationFn: () =>
      create({
        data: { companyId, ...(contactId ? { contactId } : {}), origin },
      }),
    onSuccess: () => {
      toast.success("Oportunidade criada");
      void queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEY });
      setOpen(false);
      setCompanyId("");
      setContactId("");
    },
    onError: (e: Error) => toast.error("Não foi possível criar", { description: e.message }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" /> Nova oportunidade
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova oportunidade</DialogTitle>
          <DialogDescription>
            Informe empresa, contato e origem. O funil e a etapa inicial são definidos
            automaticamente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <FilterSelect
            value={companyId}
            onChange={(v) => {
              setCompanyId(v);
              setContactId("");
            }}
            className="w-full"
            options={[
              { value: "", label: "Selecione a empresa" },
              ...data.companies.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <FilterSelect
            value={contactId}
            onChange={setContactId}
            className="w-full"
            options={[
              { value: "", label: "Sem contato definido" },
              ...contacts.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <FilterSelect
            value={origin}
            onChange={setOrigin}
            className="w-full"
            options={ORIGINS.map((o) => ({ value: o.id, label: o.label }))}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!companyId || mutation.isPending}
          >
            Criar oportunidade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}