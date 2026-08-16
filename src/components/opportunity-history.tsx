import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Panel } from "@/components/kit";
import { addOpportunityNote, listOpportunityEvents } from "@/lib/opportunities.functions";
import { formatDateTime } from "@/lib/activities";

const KIND_LABEL: Record<string, string> = {
  etapa: "Mudança de etapa",
  atividade: "Atividade",
  reuniao: "Reunião",
  nota: "Nota",
  proposta: "Proposta",
  campo: "Alteração de campo",
};

const eventsKey = (id: string) => ["crm", "opportunity-events", id] as const;

/** Histórico unificado da oportunidade, alimentado pelos eventos do banco. */
export function OpportunityHistory({ opportunityId }: { opportunityId: string }) {
  const fetchEvents = useServerFn(listOpportunityEvents);
  const query = useQuery({
    queryKey: eventsKey(opportunityId),
    queryFn: () => fetchEvents({ data: { opportunityId } }),
  });

  const events = query.data ?? [];

  return (
    <Panel bodyClassName="space-y-3">
      {query.isLoading && <p className="text-xs text-muted-foreground">Carregando histórico…</p>}
      {!query.isLoading && events.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Nenhum evento registrado ainda. Mudanças de etapa, atividades, reuniões e notas aparecem
          aqui.
        </p>
      )}
      {events.map((e) => (
        <div key={e.id} className="rounded-lg border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">{e.title}</p>
            <span className="text-[11px] text-muted-foreground">
              {formatDateTime(e.occurred_at)}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
            {KIND_LABEL[e.kind] ?? e.kind}
          </p>
          {e.detail && <p className="mt-1 text-xs text-muted-foreground">{e.detail}</p>}
        </div>
      ))}
    </Panel>
  );
}

/** Campo de nota livre que grava no histórico da oportunidade. */
export function OpportunityNotes({ opportunityId }: { opportunityId: string }) {
  const qc = useQueryClient();
  const save = useServerFn(addOpportunityNote);
  const [text, setText] = useState("");

  const mutation = useMutation({
    mutationFn: (value: string) => save({ data: { opportunityId, text: value } }),
    onSuccess: () => {
      setText("");
      toast.success("Nota registrada");
      void qc.invalidateQueries({ queryKey: eventsKey(opportunityId) });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erro ao salvar nota"),
  });

  return (
    <div className="space-y-4">
      <Panel title="Nova nota" bodyClassName="space-y-2">
        <Textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Registre o que aconteceu nesta negociação…"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={!text.trim() || mutation.isPending}
            onClick={() => mutation.mutate(text)}
          >
            Salvar nota
          </Button>
        </div>
      </Panel>
      <OpportunityHistory opportunityId={opportunityId} />
    </div>
  );
}
