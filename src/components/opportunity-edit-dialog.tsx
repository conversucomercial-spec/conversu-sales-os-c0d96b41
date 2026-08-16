import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/form-field";
import { useCrmMutations } from "@/hooks/use-accounts";
import { useCrm } from "@/hooks/use-crm";
import type { Opportunity } from "@/lib/data";

const TEMPERATURES = ["Quente", "Morno", "Frio"];
const PRIORITIES = ["Alta", "Média", "Baixa"];

/** Converte "dd/mm/aaaa" da interface para o formato de campo de data. */
const toISODate = (br: string) => {
  if (!br) return "";
  const [d, m, y] = br.split("/");
  return d && m && y ? `${y}-${m}-${d}` : "";
};

/** Edição completa dos campos comerciais da oportunidade. */
export function OpportunityEditDialog({
  open,
  onOpenChange,
  op,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  op: Opportunity;
}) {
  const { data } = useCrm();
  const { opportunity } = useCrmMutations();
  const [form, setForm] = useState({
    title: "",
    value: "0",
    setupValue: "",
    probability: "0",
    health: "",
    temperature: "Morno",
    priority: "Média",
    closeDate: "",
    nextStep: "",
    lossReason: "",
    summary: "",
    contactId: "nenhum",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      title: op.title,
      value: String(op.value ?? 0),
      setupValue: op.setupValue === null || op.setupValue === undefined ? "" : String(op.setupValue),
      probability: String(op.probability ?? 0),
      health: op.health === null || op.health === undefined ? "" : String(op.health),
      temperature: op.temperature,
      priority: op.priority,
      closeDate: toISODate(op.closeDate),
      nextStep: op.nextStep ?? "",
      lossReason: op.lossReason ?? "",
      summary: op.summary ?? "",
      contactId: op.contactId ?? "nenhum",
    });
  }, [open, op]);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    await opportunity.update.mutateAsync({
      id: op.id,
      title: form.title,
      value: Number(form.value) || 0,
      setupValue: form.setupValue === "" ? null : Number(form.setupValue),
      probability: Math.max(0, Math.min(100, Number(form.probability) || 0)),
      health: form.health === "" ? null : Number(form.health),
      temperature: form.temperature,
      priority: form.priority,
      closeDate: form.closeDate || null,
      nextStep: form.nextStep,
      lossReason: form.lossReason,
      summary: form.summary,
      contactId: form.contactId === "nenhum" ? null : form.contactId,
    });
    onOpenChange(false);
  };

  const contacts = data.contacts.filter((c) => c.companyId === op.companyId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar oportunidade</DialogTitle>
          <DialogDescription>{op.company}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Título" className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => set("title")(e.target.value)} />
          </Field>
          <Field label="Valor (R$)">
            <Input type="number" value={form.value} onChange={(e) => set("value")(e.target.value)} />
          </Field>
          <Field label="Setup (R$)">
            <Input type="number" value={form.setupValue} onChange={(e) => set("setupValue")(e.target.value)} placeholder="—" />
          </Field>
          <Field label="Probabilidade (%)">
            <Input type="number" value={form.probability} onChange={(e) => set("probability")(e.target.value)} />
          </Field>
          <Field label="Health score (0-100)">
            <Input type="number" value={form.health} onChange={(e) => set("health")(e.target.value)} placeholder="—" />
          </Field>
          <Field label="Temperatura">
            <Select value={form.temperature} onValueChange={set("temperature")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TEMPERATURES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Prioridade">
            <Select value={form.priority} onValueChange={set("priority")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Previsão de fechamento">
            <Input type="date" value={form.closeDate} onChange={(e) => set("closeDate")(e.target.value)} />
          </Field>
          <Field label="Contato principal">
            <Select value={form.contactId} onValueChange={set("contactId")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Sem contato</SelectItem>
                {contacts.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Próximo passo" className="sm:col-span-2">
            <Input value={form.nextStep} onChange={(e) => set("nextStep")(e.target.value)} />
          </Field>
          <Field label="Motivo de perda" className="sm:col-span-2">
            <Input value={form.lossReason} onChange={(e) => set("lossReason")(e.target.value)} placeholder="Preencher apenas em caso de perda" />
          </Field>
          <Field label="Resumo executivo" className="sm:col-span-2">
            <Textarea rows={3} value={form.summary} onChange={(e) => set("summary")(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => void submit()} disabled={opportunity.update.isPending}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
