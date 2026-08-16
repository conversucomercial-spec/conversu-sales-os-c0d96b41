import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/form-field";
import { FilterSelect } from "@/components/toolbar";
import { DocumentsPanel } from "@/components/documents-panel";
import { useCrm } from "@/hooks/use-crm";
import { useProposalMutations } from "@/hooks/use-proposals";
import { PROPOSAL_STATUSES, type ProposalRecord } from "@/lib/proposals";

const EMPTY = {
  opportunityId: "",
  number: "",
  status: "Enviada",
  value: "",
  setupValue: "",
  discount: "",
  validUntil: "",
  sentAt: "",
  terms: "",
  notes: "",
};

/** Criação e edição de proposta, com anexos (PDF ou link) vinculados. */
export function ProposalDialog({
  open,
  onOpenChange,
  proposal,
  defaultOpportunityId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal?: ProposalRecord | null;
  defaultOpportunityId?: string;
}) {
  const { data } = useCrm();
  const { save, remove } = useProposalMutations();
  const [form, setForm] = useState(EMPTY);
  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (!open) return;
    setForm(
      proposal
        ? {
            opportunityId: proposal.opportunityId,
            number: proposal.number,
            status: proposal.status,
            value: String(proposal.value),
            setupValue: String(proposal.setupValue),
            discount: String(proposal.discount),
            validUntil: proposal.validUntil ?? "",
            sentAt: proposal.sentAt ?? "",
            terms: proposal.terms,
            notes: proposal.notes,
          }
        : { ...EMPTY, opportunityId: defaultOpportunityId ?? "" },
    );
  }, [open, proposal, defaultOpportunityId]);

  const submit = () =>
    save.mutate(
      {
        ...(proposal ? { id: proposal.id } : {}),
        opportunityId: form.opportunityId,
        number: form.number,
        status: form.status,
        value: Number(form.value) || 0,
        setupValue: Number(form.setupValue) || 0,
        discount: Number(form.discount) || 0,
        validUntil: form.validUntil || null,
        sentAt: form.sentAt || null,
        terms: form.terms,
        notes: form.notes,
      },
      { onSuccess: () => onOpenChange(false) },
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{proposal ? `Proposta ${proposal.number}` : "Nova proposta"}</DialogTitle>
          <DialogDescription>
            Vincule a proposta à oportunidade e anexe o PDF ou o link do documento.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Oportunidade" className="sm:col-span-2">
            <FilterSelect
              value={form.opportunityId}
              onChange={set("opportunityId")}
              className="w-full"
              options={[
                { value: "", label: "Selecione a oportunidade" },
                ...data.opportunities.map((o) => ({
                  value: o.id,
                  label: `${o.title} · ${o.company}`,
                })),
              ]}
            />
          </Field>
          <Field label="Número">
            <Input value={form.number} onChange={(e) => set("number")(e.target.value)} placeholder="Gerado automaticamente" />
          </Field>
          <Field label="Status">
            <FilterSelect
              value={form.status}
              onChange={set("status")}
              className="w-full"
              options={PROPOSAL_STATUSES.map((s) => ({ value: s, label: s }))}
            />
          </Field>
          <Field label="Valor recorrente (R$)">
            <Input type="number" value={form.value} onChange={(e) => set("value")(e.target.value)} />
          </Field>
          <Field label="Setup (R$)">
            <Input type="number" value={form.setupValue} onChange={(e) => set("setupValue")(e.target.value)} />
          </Field>
          <Field label="Desconto (%)">
            <Input type="number" value={form.discount} onChange={(e) => set("discount")(e.target.value)} />
          </Field>
          <Field label="Enviada em">
            <Input type="date" value={form.sentAt} onChange={(e) => set("sentAt")(e.target.value)} />
          </Field>
          <Field label="Validade">
            <Input type="date" value={form.validUntil} onChange={(e) => set("validUntil")(e.target.value)} />
          </Field>
          <Field label="Condições comerciais" className="sm:col-span-2">
            <Textarea value={form.terms} onChange={(e) => set("terms")(e.target.value)} className="min-h-20" />
          </Field>
          <Field label="Observações" className="sm:col-span-2">
            <Textarea value={form.notes} onChange={(e) => set("notes")(e.target.value)} className="min-h-16" />
          </Field>
        </div>

        {proposal && (
          <DocumentsPanel
            scope={{
              proposalId: proposal.id,
              ...(proposal.companyId ? { companyId: proposal.companyId } : {}),
            }}
            title="Anexos da proposta"
          />
        )}

        <DialogFooter className="gap-2">
          {proposal && (
            <Button
              variant="ghost"
              className="mr-auto text-destructive"
              onClick={() => remove.mutate({ id: proposal.id }, { onSuccess: () => onOpenChange(false) })}
            >
              Excluir
            </Button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!form.opportunityId || save.isPending}>
            Salvar proposta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
