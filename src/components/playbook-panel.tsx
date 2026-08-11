import { CheckCircle2, Circle, Compass, ListChecks, MessageCircleQuestion } from "lucide-react";
import { Panel, Tag } from "@/components/kit";
import { getStageConfig } from "@/lib/config";
import type { StageId } from "@/lib/data";

function Bullets({ items, icon: Icon }: { items: string[]; icon: typeof Circle }) {
  return (
    <ul className="space-y-1.5">
      {items.map((t) => (
        <li key={t} className="flex gap-2 text-xs text-muted-foreground">
          <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

/** Critérios obrigatórios da etapa atual — o que falta para avançar. */
export function StageCriteria({
  pipelineId,
  stage,
  done = [],
}: {
  pipelineId: string;
  stage: StageId;
  done?: string[];
}) {
  const cfg = getStageConfig(pipelineId, stage);
  const missing = cfg.criteria.filter((c) => !done.includes(c));

  return (
    <Panel
      title="Critérios da etapa"
      description={cfg.label}
      actions={
        <Tag tone={missing.length ? "warning" : "success"}>
          {missing.length ? `${missing.length} pendente(s)` : "Pronto para avançar"}
        </Tag>
      }
      bodyClassName="space-y-2"
    >
      {cfg.criteria.map((c) => {
        const ok = done.includes(c);
        return (
          <div key={c} className="flex items-center gap-2.5 rounded-lg border p-2.5">
            {ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className={ok ? "text-sm text-muted-foreground line-through" : "text-sm"}>{c}</span>
          </div>
        );
      })}
    </Panel>
  );
}

/** Playbook da etapa: objetivo, perguntas, checklist, orientações e critérios de saída. */
export function PlaybookPanel({ pipelineId, stage }: { pipelineId: string; stage: StageId }) {
  const { label, playbook } = getStageConfig(pipelineId, stage);

  return (
    <Panel title="Playbook da etapa" description={label} bodyClassName="space-y-4">
      <div className="rounded-xl border bg-secondary/40 p-3.5">
        <p className="text-xs font-semibold">Objetivo</p>
        <p className="mt-1 text-xs text-muted-foreground">{playbook.objective}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-3.5">
          <p className="mb-2 text-xs font-semibold">Perguntas sugeridas</p>
          <Bullets items={playbook.questions} icon={MessageCircleQuestion} />
        </div>
        <div className="rounded-xl border p-3.5">
          <p className="mb-2 text-xs font-semibold">Checklist</p>
          <Bullets items={playbook.checklist} icon={ListChecks} />
        </div>
        <div className="rounded-xl border p-3.5">
          <p className="mb-2 text-xs font-semibold">Orientações</p>
          <Bullets items={playbook.guidance} icon={Compass} />
        </div>
        <div className="rounded-xl border p-3.5">
          <p className="mb-2 text-xs font-semibold">Critérios de saída</p>
          <Bullets items={playbook.exitCriteria} icon={CheckCircle2} />
        </div>
      </div>
    </Panel>
  );
}
