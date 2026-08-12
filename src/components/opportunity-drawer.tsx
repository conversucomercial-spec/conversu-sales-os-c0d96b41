import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { HealthScore, Panel, Tag, TemperatureBadge, Timeline } from "@/components/kit";
import { AiInsightPanel } from "@/components/ai-panel";
import { PlaybookPanel, StageCriteria } from "@/components/playbook-panel";
import { LinkedInPanel } from "@/components/linkedin-panel";
import { DiscoveryPanel } from "@/components/discovery-panel";
import { MeetingPanel } from "@/components/meeting-panel";
import { TagPicker } from "@/components/tag-picker";
import { getPipeline, originLabel } from "@/lib/config";
import { currency, STAGES, type Opportunity } from "@/lib/data";
import { CalendarDays, FileText, Paperclip, PhoneCall, Users } from "lucide-react";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border bg-secondary/40 px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  );
}

export function OpportunityDrawer({
  op,
  onOpenChange,
}: {
  op: Opportunity | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={!!op} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-[720px] scroll-slim"
      >
        {op && (
          <div className="flex flex-col">
            <div className="sticky top-0 z-10 border-b bg-card/95 px-6 py-5 backdrop-blur">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{op.company}</p>
                  <h2 className="truncate font-display text-lg font-bold">{op.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Tag tone="info">{STAGES.find((s) => s.id === op.stage)?.label}</Tag>
                    <TemperatureBadge value={op.temperature} />
                    <Tag>{op.probability}% de chance</Tag>
                    <Tag tone={op.daysInStage > 18 ? "danger" : "neutral"}>
                      {op.daysInStage} dias na etapa
                    </Tag>
                    {op.meeting?.status && <Tag tone="warning">{op.meeting.status}</Tag>}
                    {op.lossReason && <Tag tone="danger">Perda: {op.lossReason}</Tag>}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-xl font-bold">{currency(op.value)}</p>
                  <p className="text-[11px] text-muted-foreground">Fecha em {op.closeDate}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm">
                  <PhoneCall className="h-3.5 w-3.5" /> Registrar contato
                </Button>
                <Button size="sm" variant="outline">
                  <CalendarDays className="h-3.5 w-3.5" /> Agendar reunião
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="h-3.5 w-3.5" /> Nova proposta
                </Button>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid gap-2.5 sm:grid-cols-3">
                <Field label="Empresa" value={op.company} />
                <Field label="Contato principal" value={op.contact} />
                <Field label="Responsável" value={op.owner} />
                <Field label="Valor" value={currency(op.value)} />
                <Field label="Previsão de fechamento" value={op.closeDate} />
                <Field label="Próximo passo" value={op.nextStep} />
                <Field
                  label="Setup (R$)"
                  value={op.setupValue === null || op.setupValue === undefined ? "—" : currency(op.setupValue)}
                />
                <Field label="Motivo de perda" value={op.lossReason || "—"} />
                <Field label="Responsável (origem)" value={op.ownerLabel || "—"} />
              </div>

              <Panel title="Tags" description="Marcadores personalizados desta oportunidade">
                <TagPicker opportunityId={op.id} tags={op.tags ?? []} />
              </Panel>

              <Panel title="Resumo executivo" bodyClassName="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{op.summary}</p>
                <div>
                  <p className="mb-1.5 text-xs font-semibold">Health Score</p>
                  <HealthScore value={op.health} />
                </div>
              </Panel>

              <Tabs defaultValue="timeline">
                <TabsList className="flex w-full flex-wrap justify-start">
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="prospeccao">Prospecção / LinkedIn</TabsTrigger>
                  <TabsTrigger value="discovery">Discovery</TabsTrigger>
                  <TabsTrigger value="notas">Notas</TabsTrigger>
                  <TabsTrigger value="atividades">Atividades</TabsTrigger>
                  <TabsTrigger value="reunioes">Reuniões</TabsTrigger>
                  <TabsTrigger value="propostas">Propostas</TabsTrigger>
                  <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
                  <TabsTrigger value="checklist">Checklist</TabsTrigger>
                  <TabsTrigger value="playbook">Playbook</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="mt-4">
                  <Panel>
                    <Timeline items={op.timeline} />
                  </Panel>
                </TabsContent>

                <TabsContent value="prospeccao" className="mt-4">
                  <LinkedInPanel op={op} />
                </TabsContent>

                <TabsContent value="discovery" className="mt-4">
                  <DiscoveryPanel op={op} />
                </TabsContent>

                <TabsContent value="notas" className="mt-4">
                  <Panel bodyClassName="space-y-3">
                    {op.notes.map((n, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold">{n.author}</p>
                          <span className="text-[11px] text-muted-foreground">{n.date}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{n.text}</p>
                      </div>
                    ))}
                  </Panel>
                </TabsContent>

                <TabsContent value="atividades" className="mt-4">
                  <Panel bodyClassName="space-y-3">
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <PhoneCall className="h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{op.nextActivity}</p>
                        <p className="text-xs text-muted-foreground">
                          {op.nextActivityDate} · {op.owner}
                        </p>
                      </div>
                      <Tag tone="warning">Pendente</Tag>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">Alinhamento com decisor</p>
                        <p className="text-xs text-muted-foreground">Concluída · {op.owner}</p>
                      </div>
                      <Tag tone="success">Concluída</Tag>
                    </div>
                  </Panel>
                </TabsContent>

                <TabsContent value="reunioes" className="mt-4">
                  <div className="space-y-4">
                  <MeetingPanel op={op} />
                  <Panel bodyClassName="space-y-3">
                    {op.meetings.map((m, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium">{m.title}</p>
                          <span className="text-[11px] text-muted-foreground">{m.date}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{m.participants}</p>
                        <Separator className="my-2" />
                        <p className="text-xs text-muted-foreground">{m.summary}</p>
                      </div>
                    ))}
                  </Panel>
                  </div>
                </TabsContent>

                <TabsContent value="propostas" className="mt-4">
                  <Panel bodyClassName="space-y-3">
                    {op.proposals.map((p) => (
                      <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                        <FileText className="h-4 w-4 text-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{p.id}</p>
                          <p className="text-xs text-muted-foreground">
                            Enviada {p.sent} · vence {p.expires}
                          </p>
                        </div>
                        <span className="text-sm font-semibold">{currency(p.value)}</span>
                        <Tag tone="info">{p.status}</Tag>
                      </div>
                    ))}
                  </Panel>
                </TabsContent>

                <TabsContent value="arquivos" className="mt-4">
                  <Panel bodyClassName="space-y-3">
                    {op.files.map((f) => (
                      <div key={f.name} className="flex items-center gap-3 rounded-lg border p-3">
                        <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{f.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {f.size} · {f.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </Panel>
                </TabsContent>

                <TabsContent value="checklist" className="mt-4">
                  <Panel bodyClassName="space-y-3">
                    {op.checklist.map((c) => (
                      <label key={c.label} className="flex items-center gap-3 rounded-lg border p-3">
                        <Checkbox checked={c.done} />
                        <span className="text-sm">{c.label}</span>
                      </label>
                    ))}
                  </Panel>
                </TabsContent>
                <TabsContent value="playbook" className="mt-4 space-y-4">
                  <StageCriteria
                    pipelineId={op.pipelineId}
                    stage={op.stage}
                    done={op.checklist.filter((c) => c.done).map((c) => c.label)}
                  />
                  <PlaybookPanel pipelineId={op.pipelineId} stage={op.stage} />
                </TabsContent>
              </Tabs>

              <Panel
                title="Informações do pipeline"
                description={getPipeline(op.pipelineId).name}
                bodyClassName="grid gap-2.5 sm:grid-cols-3"
              >
                <Field label="Origem" value={originLabel(op.origin)} />
                <Field label="Parceiro" value={op.partner ?? "—"} />
                <Field label="Última interação" value={`${op.lastContact} (${op.lastContactDays}d)`} />
                {getPipeline(op.pipelineId).customFields.map((f) => (
                  <Field key={f.id} label={f.label} value={op.custom[f.id] ?? "—"} />
                ))}
              </Panel>

              <AiInsightPanel op={op} />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
