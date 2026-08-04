import { Sparkle, Lock } from "lucide-react";
import { Panel, Tag } from "@/components/kit";
import type { Opportunity } from "@/lib/data";

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border bg-secondary/40 p-3.5">
      <p className="text-xs font-semibold">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((t) => (
          <li key={t} className="flex gap-2 text-xs text-muted-foreground">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AiInsightPanel({ op }: { op: Opportunity }) {
  return (
    <Panel
      title="IA Comercial"
      description="Camada preparada — geração automática será ativada em breve"
      actions={
        <Tag tone="info">
          <Lock className="mr-1 h-3 w-3" /> Preview
        </Tag>
      }
      bodyClassName="space-y-3"
    >
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-accent/60 p-3.5">
        <span className="brand-gradient grid h-8 w-8 shrink-0 place-items-center rounded-lg text-primary-foreground">
          <Sparkle className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold">Resumo da negociação</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{op.summary}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Block title="Principais dores" items={op.pains} />
        <Block title="Objeções" items={op.objections} />
        <Block title="Próximos passos sugeridos" items={op.suggestions} />
        <Block title="Riscos" items={op.risks} />
        <Block title="Argumentos comerciais" items={op.arguments} />
        <div className="rounded-xl border bg-secondary/40 p-3.5">
          <p className="text-xs font-semibold">Chance de fechamento</p>
          <p className="mt-2 font-display text-2xl font-bold">{op.probability}%</p>
          <p className="text-[11px] text-muted-foreground">
            Score automático baseado em engajamento, etapa e histórico.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-3.5">
          <p className="text-xs font-semibold">Resumo das reuniões</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {op.meetings[0]?.summary}
          </p>
        </div>
        <div className="rounded-xl border p-3.5">
          <p className="text-xs font-semibold">Resumo das propostas</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {op.proposals.length} proposta(s) — status {op.proposals[0]?.status}, validade{" "}
            {op.proposals[0]?.expires}.
          </p>
        </div>
      </div>
    </Panel>
  );
}
