import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Panel, Tag, AiSlot } from "@/components/kit";
import { currency, type Proposal } from "@/lib/data";

const tone = (status: string) =>
  status === "Aceita" ? "success" : status === "Recusada" ? "danger" : status === "Vencendo" ? "warning" : "info";

export function ProposalDrawer({
  proposal,
  onOpenChange,
}: {
  proposal: Proposal | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={!!proposal} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="scroll-slim w-full gap-0 overflow-y-auto p-0 sm:max-w-[640px]">
        {proposal && (
          <div className="flex flex-col">
            <div className="sticky top-0 z-10 border-b bg-card/95 px-6 py-5 backdrop-blur">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{proposal.company}</p>
                  <h2 className="truncate font-display text-lg font-bold">Proposta {proposal.id}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Tag tone={tone(proposal.status)}>{proposal.status}</Tag>
                    <Tag>Enviada {proposal.sent}</Tag>
                    <Tag tone="warning">Vence {proposal.expires}</Tag>
                  </div>
                </div>
                <p className="shrink-0 font-display text-xl font-bold">{currency(proposal.value)}</p>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <Panel title="Itens da proposta" bodyClassName="space-y-2">
                {proposal.items.map((it) => (
                  <div key={it.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{it.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {it.qty}× {currency(it.unit)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{currency(it.qty * it.unit)}</span>
                  </div>
                ))}
              </Panel>

              <Panel title="Condições comerciais">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {[
                    ["Pagamento", proposal.conditions.payment],
                    ["Vigência", proposal.conditions.term],
                    ["Desconto", proposal.conditions.discount],
                    ["Setup", proposal.conditions.setup],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border bg-secondary/40 px-3 py-2">
                      <p className="text-[11px] text-muted-foreground">{label}</p>
                      <p className="truncate text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Histórico" bodyClassName="space-y-2">
                {proposal.history.map((h) => (
                  <div key={h.event} className="flex items-start gap-3 rounded-lg border p-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <p className="text-sm">{h.event}</p>
                      <p className="text-[11px] text-muted-foreground">{h.date}</p>
                    </div>
                  </div>
                ))}
              </Panel>

              <Panel title="Vínculos" bodyClassName="space-y-1.5">
                <p className="text-sm">
                  <span className="text-muted-foreground">Oportunidade: </span>
                  {proposal.opportunity}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Responsável: </span>
                  {proposal.owner}
                </p>
              </Panel>

              <AiSlot
                title="Resumo da proposta"
                description="A IA vai resumir escopo, riscos de aprovação e argumentos de fechamento."
              />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
