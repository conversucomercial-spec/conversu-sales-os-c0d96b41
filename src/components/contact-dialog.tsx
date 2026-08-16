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
import type { CrmContact } from "@/lib/crm-mappers";

const RELATIONSHIPS = ["Forte", "Neutro", "Frio"];
const INFLUENCES = ["Alta", "Média", "Baixa"];

/** Cadastro e edição de contato, sempre ligado a uma empresa da base. */
export function ContactDialog({
  open,
  onOpenChange,
  contact,
  defaultCompanyId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: CrmContact | null;
  defaultCompanyId?: string;
}) {
  const { data } = useCrm();
  const { contact: mutations } = useCrmMutations();
  const [form, setForm] = useState({
    name: "",
    companyId: "nenhuma",
    role: "",
    email: "",
    phone: "",
    whatsapp: "",
    linkedin: "",
    relationship: "Neutro",
    influence: "Média",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      name: contact?.name ?? "",
      companyId: contact?.companyId || defaultCompanyId || "nenhuma",
      role: contact?.role === "—" ? "" : (contact?.role ?? ""),
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
      whatsapp: contact?.whatsapp ?? "",
      linkedin: contact?.linkedin ?? "",
      relationship: contact?.relationship ?? "Neutro",
      influence: "Média",
    });
  }, [open, contact, defaultCompanyId]);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    const payload = {
      name: form.name,
      companyId: form.companyId === "nenhuma" ? null : form.companyId,
      role: form.role,
      email: form.email,
      phone: form.phone,
      whatsapp: form.whatsapp,
      linkedin: form.linkedin,
      relationship: form.relationship,
      influence: form.influence,
    };
    if (contact) await mutations.update.mutateAsync({ id: contact.id, ...payload });
    else await mutations.create.mutateAsync(payload);
    onOpenChange(false);
  };

  const saving = mutations.create.isPending || mutations.update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{contact ? "Editar contato" : "Novo contato"}</DialogTitle>
          <DialogDescription>Pessoa de contato vinculada a uma empresa.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome" className="sm:col-span-2">
            <Input value={form.name} onChange={(e) => set("name")(e.target.value)} />
          </Field>
          <Field label="Empresa">
            <Select value={form.companyId} onValueChange={set("companyId")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Sem empresa</SelectItem>
                {data.companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Cargo">
            <Input value={form.role} onChange={(e) => set("role")(e.target.value)} />
          </Field>
          <Field label="E-mail">
            <Input value={form.email} onChange={(e) => set("email")(e.target.value)} />
          </Field>
          <Field label="Telefone">
            <Input value={form.phone} onChange={(e) => set("phone")(e.target.value)} />
          </Field>
          <Field label="WhatsApp">
            <Input value={form.whatsapp} onChange={(e) => set("whatsapp")(e.target.value)} />
          </Field>
          <Field label="LinkedIn">
            <Input value={form.linkedin} onChange={(e) => set("linkedin")(e.target.value)} />
          </Field>
          <Field label="Relacionamento">
            <Select value={form.relationship} onValueChange={set("relationship")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Influência">
            <Select value={form.influence} onValueChange={set("influence")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INFLUENCES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => void submit()} disabled={saving || !form.name.trim()}>
            {contact ? "Salvar" : "Criar contato"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
