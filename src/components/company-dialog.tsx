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
import { ORIGINS } from "@/lib/config";
import type { CrmCompany } from "@/lib/crm-mappers";

const STATUS = ["Prospect", "Em negociação", "Cliente", "Inativo"];

/** Cadastro e edição de empresa. */
export function CompanyDialog({
  open,
  onOpenChange,
  company,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: CrmCompany | null;
}) {
  const { company: mutations } = useCrmMutations();
  const [form, setForm] = useState({
    name: "",
    segment: "",
    status: "Prospect",
    city: "",
    site: "",
    mrr: "0",
    employees: "0",
    origin: "outbound",
    partner: "",
    note: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      name: company?.name ?? "",
      segment: company?.segment === "—" ? "" : (company?.segment ?? ""),
      status: company?.status ?? "Prospect",
      city: company?.city ?? "",
      site: company?.site ?? "",
      mrr: String(company?.mrr ?? 0),
      employees: String(company?.employees ?? 0),
      origin: company?.origin ?? "outbound",
      partner: company?.partner ?? "",
      note: "",
    });
  }, [open, company]);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    const payload = {
      name: form.name,
      segment: form.segment || "—",
      status: form.status,
      city: form.city,
      site: form.site,
      mrr: Number(form.mrr) || 0,
      employees: Number(form.employees) || 0,
      origin: form.origin,
      partner: form.partner,
      note: form.note,
    };
    if (company) await mutations.update.mutateAsync({ id: company.id, ...payload });
    else await mutations.create.mutateAsync(payload);
    onOpenChange(false);
  };

  const saving = mutations.create.isPending || mutations.update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{company ? "Editar empresa" : "Nova empresa"}</DialogTitle>
          <DialogDescription>Dados cadastrais da conta na sua carteira.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome" className="sm:col-span-2">
            <Input value={form.name} onChange={(e) => set("name")(e.target.value)} />
          </Field>
          <Field label="Segmento">
            <Input value={form.segment} onChange={(e) => set("segment")(e.target.value)} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={set("status")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Cidade">
            <Input value={form.city} onChange={(e) => set("city")(e.target.value)} />
          </Field>
          <Field label="Site">
            <Input value={form.site} onChange={(e) => set("site")(e.target.value)} />
          </Field>
          <Field label="MRR potencial (R$)">
            <Input type="number" value={form.mrr} onChange={(e) => set("mrr")(e.target.value)} />
          </Field>
          <Field label="Colaboradores">
            <Input
              type="number"
              value={form.employees}
              onChange={(e) => set("employees")(e.target.value)}
            />
          </Field>
          <Field label="Origem">
            <Select value={form.origin} onValueChange={set("origin")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORIGINS.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Parceiro">
            <Input value={form.partner} onChange={(e) => set("partner")(e.target.value)} />
          </Field>
          <Field label="Observações" className="sm:col-span-2">
            <Textarea rows={3} value={form.note} onChange={(e) => set("note")(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => void submit()} disabled={saving || !form.name.trim()}>
            {company ? "Salvar" : "Criar empresa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
