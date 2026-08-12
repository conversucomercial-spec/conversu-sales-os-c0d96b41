import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Panel, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FilterSelect } from "@/components/toolbar";
import { saveMeeting } from "@/lib/crm.functions";
import { EMPTY_MEETING, MEETING_STATUSES, type MeetingInfo, type Opportunity } from "@/lib/data";

const TEXT_FIELDS: { id: keyof MeetingInfo; label: string; rows?: number }[] = [
  { id: "agenda", label: "Pauta" },
  { id: "insights", label: "Insights" },
  { id: "pains", label: "Dores" },
  { id: "objections", label: "Objeções" },
  { id: "nextSteps", label: "Próximos passos" },
];

/** Bloco de reunião da oportunidade — sem dados de origem, os campos ficam vazios. */
export function MeetingPanel({ op }: { op: Opportunity }) {
  const queryClient = useQueryClient();
  const persist = useServerFn(saveMeeting);
  const [form, setForm] = useState<MeetingInfo>({ ...EMPTY_MEETING, ...(op.meeting ?? {}) });

  useEffect(() => {
    setForm({ ...EMPTY_MEETING, ...(op.meeting ?? {}) });
  }, [op.id, op.meeting]);

  const mutation = useMutation({
    mutationFn: () => persist({ data: { id: op.id, meeting: { ...form } } }),
    onSuccess: () => {
      toast.success("Reunião salva");
      void queryClient.invalidateQueries({ queryKey: ["crm"] });
    },
    onError: (e: Error) => toast.error("Não foi possível salvar", { description: e.message }),
  });

  const set = (patch: Partial<MeetingInfo>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <Panel
      title="Reunião"
      description="Preencha apenas o que existir — campos vazios são esperados."
      actions={
        <Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          <Save className="h-3.5 w-3.5" /> Salvar
        </Button>
      }
      bodyClassName="space-y-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          value={form.status || "—"}
          onChange={(status) => set({ status: status === "—" ? "" : status })}
          options={[
            { value: "—", label: "Sem status" },
            ...MEETING_STATUSES.map((s) => ({ value: s, label: s })),
          ]}
          className="w-full sm:w-56"
        />
        {form.status && <Tag tone="info">{form.status}</Tag>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Data</span>
          <Input type="date" value={form.date} onChange={(e) => set({ date: e.target.value })} />
        </label>
        <label className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Horário</span>
          <Input type="time" value={form.time} onChange={(e) => set({ time: e.target.value })} />
        </label>
        <label className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Responsável</span>
          <Input value={form.owner} onChange={(e) => set({ owner: e.target.value })} />
        </label>
        <label className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Participantes</span>
          <Input
            value={form.participants}
            onChange={(e) => set({ participants: e.target.value })}
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-[11px] font-medium text-muted-foreground">Link</span>
          <Input value={form.link} onChange={(e) => set({ link: e.target.value })} />
        </label>
        {TEXT_FIELDS.map((field) => (
          <label key={field.id} className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">{field.label}</span>
            <Textarea
              rows={field.rows ?? 3}
              value={form[field.id]}
              onChange={(e) => set({ [field.id]: e.target.value } as Partial<MeetingInfo>)}
            />
          </label>
        ))}
      </div>
    </Panel>
  );
}
