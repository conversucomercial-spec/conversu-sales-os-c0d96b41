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
import { useActivities } from "@/hooks/use-activities";
import { useCrm } from "@/hooks/use-crm";
import {
  ACTIVITY_PRIORITIES,
  ACTIVITY_PRIORITY_LABEL,
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_LABEL,
  type ActivityRecord,
} from "@/lib/activities";

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Criação e edição de atividade/follow-up, com vínculo a empresa, contato e oportunidade. */
export function ActivityDialog({
  open,
  onOpenChange,
  activity,
  defaultOpportunityId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: ActivityRecord | null;
  defaultOpportunityId?: string;
}) {
  const { data } = useCrm();
  const { createActivity, updateActivity, isSaving } = useActivities();

  const [type, setType] = useState<string>("followup");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("media");
  const [dueAt, setDueAt] = useState("");
  const [companyId, setCompanyId] = useState("nenhuma");
  const [contactId, setContactId] = useState("nenhum");
  const [opportunityId, setOpportunityId] = useState("nenhuma");

  useEffect(() => {
    if (!open) return;
    setType(activity?.type ?? "followup");
    setTitle(activity?.title ?? "");
    setDescription(activity?.description ?? "");
    setPriority(activity?.priority ?? "media");
    setDueAt(toLocalInput(activity?.dueAt ?? null) || toLocalInput(new Date().toISOString()));
    setCompanyId(activity?.companyId ?? "nenhuma");
    setContactId(activity?.contactId ?? "nenhum");
    setOpportunityId(activity?.opportunityId ?? defaultOpportunityId ?? "nenhuma");
  }, [open, activity, defaultOpportunityId]);

  const submit = async () => {
    const iso = dueAt ? new Date(dueAt).toISOString() : null;
    if (activity) {
      await updateActivity({ id: activity.id, title, description, type, priority, dueAt: iso });
    } else {
      await createActivity({
        type,
        title,
        description,
        priority,
        dueAt: iso,
        companyId: companyId === "nenhuma" ? null : companyId,
        contactId: contactId === "nenhum" ? null : contactId,
        opportunityId: opportunityId === "nenhuma" ? null : opportunityId,
      });
    }
    onOpenChange(false);
  };

  const contacts = data.contacts.filter(
    (c) => companyId === "nenhuma" || c.companyId === companyId,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{activity ? "Editar atividade" : "Nova atividade"}</DialogTitle>
          <DialogDescription>
            Registre a próxima ação e vincule ao registro comercial correspondente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Tipo">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {ACTIVITY_TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Prioridade">
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {ACTIVITY_PRIORITY_LABEL[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Título" className="sm:col-span-2" htmlFor="activity-title">
            <Input
              id="activity-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Ligar para validar proposta"
            />
          </Field>
          <Field label="Data e hora" className="sm:col-span-2" htmlFor="activity-due">
            <Input
              id="activity-due"
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </Field>

          {!activity && (
            <>
              <Field label="Empresa">
                <Select
                  value={companyId}
                  onValueChange={(v) => {
                    setCompanyId(v);
                    setContactId("nenhum");
                  }}
                >
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
              <Field label="Contato">
                <Select value={contactId} onValueChange={setContactId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Sem contato</SelectItem>
                    {contacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Oportunidade" className="sm:col-span-2">
                <Select value={opportunityId} onValueChange={setOpportunityId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhuma">Sem oportunidade</SelectItem>
                    {data.opportunities
                      .filter((o) => companyId === "nenhuma" || o.companyId === companyId)
                      .map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </Field>
            </>
          )}

          <Field label="Descrição" className="sm:col-span-2">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Contexto, combinados e o que precisa acontecer."
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => void submit()} disabled={isSaving || !title.trim()}>
            {activity ? "Salvar" : "Criar atividade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
