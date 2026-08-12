import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Linkedin, Save } from "lucide-react";
import { Panel, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CADENCE_EVENTS,
  CADENCE_EVENT_LABELS,
  CADENCE_STATUS_LABELS,
  CADENCE_STEP_LABELS,
  formatDateTime,
  isOverdue,
  type CadenceEventType,
  type CadenceStatus,
  type CadenceStep,
} from "@/lib/cadence";
import { getOpportunityContext, logProspectingEvent, saveLinkedinUrl } from "@/lib/prospecting.functions";
import { CRM_QUERY_KEY } from "@/hooks/use-crm";
import type { Opportunity } from "@/lib/data";

/** Cadência de prospecção no LinkedIn — registro manual, cálculo automático da próxima ação. */
export function LinkedInPanel({ op }: { op: Opportunity }) {
  const queryClient = useQueryClient();
  const fetchContext = useServerFn(getOpportunityContext);
  const logEvent = useServerFn(logProspectingEvent);
  const saveUrl = useServerFn(saveLinkedinUrl);
  const [url, setUrl] = useState(op.linkedin?.url ?? "");

  const contextQuery = useQuery({
    queryKey: ["opportunity-context", op.id],
    queryFn: () => fetchContext({ data: { opportunityId: op.id } }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["opportunity-context", op.id] });
    void queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEY });
  };

  const eventMutation = useMutation({
    mutationFn: (type: CadenceEventType) => logEvent({ data: { opportunityId: op.id, type } }),
    onSuccess: (_, type) => {
      toast.success(`Registrado: ${CADENCE_EVENT_LABELS[type]}`);
      invalidate();
    },
    onError: (e: Error) => toast.error("Não foi possível registrar", { description: e.message }),
  });

  const urlMutation = useMutation({
    mutationFn: () => saveUrl({ data: { opportunityId: op.id, url } }),
    onSuccess: () => {
      toast.success("Perfil do LinkedIn salvo");
      invalidate();
    },
    onError: (e: Error) => toast.error("Não foi possível salvar", { description: e.message }),
  });

  const status = (op.linkedin?.status ?? "nao_iniciado") as CadenceStatus;
  const step = (op.linkedin?.step ?? "prospect_identificado") as CadenceStep;
  const nextAt = op.linkedin?.nextActionAt ?? null;
  const events = contextQuery.data?.events ?? [];

  return (
    <div className="space-y-4">
      <Panel title="Perfil no LinkedIn" bodyClassName="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="linkedin.com/in/…"
            className="pl-9"
            aria-label="URL do perfil no LinkedIn"
          />
        </div>
        <Button size="sm" onClick={() => urlMutation.mutate()} disabled={urlMutation.isPending}>
          <Save className="h-3.5 w-3.5" /> Salvar
        </Button>
      </Panel>

      <Panel title="Cadência" bodyClassName="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="info">{CADENCE_STATUS_LABELS[status]}</Tag>
          <Tag>{CADENCE_STEP_LABELS[step]}</Tag>
          <Tag tone={isOverdue(nextAt) ? "danger" : "neutral"}>
            Próxima ação: {op.linkedin?.nextAction ?? "—"} · {formatDateTime(nextAt)}
          </Tag>
        </div>
        <p className="text-xs text-muted-foreground">
          Última ação: {formatDateTime(op.linkedin?.lastActionAt ?? null)}
        </p>
        <div className="flex flex-wrap gap-2">
          {CADENCE_EVENTS.map((e) => (
            <Button
              key={e.type}
              size="sm"
              variant="outline"
              disabled={eventMutation.isPending}
              onClick={() => eventMutation.mutate(e.type)}
            >
              {e.label}
            </Button>
          ))}
        </div>
      </Panel>

      <Panel title="Histórico de prospecção" bodyClassName="space-y-2">
        {contextQuery.isLoading && <p className="text-xs text-muted-foreground">Carregando…</p>}
        {!contextQuery.isLoading && events.length === 0 && (
          <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
            Nenhuma ação registrada ainda.
          </p>
        )}
        {events.map((e) => (
          <div key={e.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
            <span className="text-sm font-medium">
              {CADENCE_EVENT_LABELS[e.type as CadenceEventType] ?? e.type}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatDateTime(e.occurredAt)} · {e.owner}
            </span>
          </div>
        ))}
      </Panel>
    </div>
  );
}