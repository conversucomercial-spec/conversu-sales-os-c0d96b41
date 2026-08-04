import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Bot, Brain, ClipboardList, Gauge, Lightbulb, Lock, MessageSquareText, Sparkle, TrendingUp } from "lucide-react";
import { PageHeader, Panel, Tag } from "@/components/kit";
import { AiInsightPanel } from "@/components/ai-panel";
import { Button } from "@/components/ui/button";
import { opportunities } from "@/lib/data";

export const Route = createFileRoute("/ia-comercial")({
  head: () => ({
    meta: [
      { title: "IA Comercial | Conversu Sales OS" },
      { name: "description", content: "Camada de inteligência comercial: resumos, riscos, próximos passos e forecast inteligente." },
      { property: "og:title", content: "IA Comercial | Conversu Sales OS" },
      { property: "og:description", content: "Resumos automáticos, riscos, próximos passos e assistente comercial." },
    ],
  }),
  component: IaPage,
});

const capabilities = [
  { icon: Brain, title: "Resumos automáticos", desc: "Síntese executiva de cada negociação a partir do histórico." },
  { icon: Lightbulb, title: "Sugestão de próximos passos", desc: "Recomendações contextuais por etapa do funil." },
  { icon: ClipboardList, title: "Geração de tarefas", desc: "Criação automática de follow-ups após interações." },
  { icon: TrendingUp, title: "Forecast inteligente", desc: "Projeção ajustada por comportamento histórico." },
  { icon: Gauge, title: "Score da oportunidade", desc: "Health score dinâmico por engajamento e velocidade." },
  { icon: AlertTriangle, title: "Negociações em risco", desc: "Alertas de estagnação e sinais de perda." },
  { icon: MessageSquareText, title: "Resumo de reuniões", desc: "Notas, decisões e próximos passos por encontro." },
  { icon: Sparkle, title: "Estratégias de negociação", desc: "Argumentos e contornos de objeção sob medida." },
  { icon: Bot, title: "Assistente comercial", desc: "Copiloto para preparar calls e responder clientes." },
];

function IaPage() {
  const op = opportunities.find((o) => o.probability >= 72) ?? opportunities[0]!;

  return (
    <div className="space-y-5">
      <PageHeader
        title="IA Comercial"
        description="Camada de inteligência preparada para ativação — arquitetura pronta, geração ainda desligada"
        actions={<Tag tone="info"><Lock className="mr-1 h-3 w-3" /> Em preparação</Tag>}
      />

      <section className="card-surface relative overflow-hidden p-6">
        <div className="brand-gradient absolute inset-x-0 top-0 h-1" />
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold">Copiloto comercial da Conversu</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Todos os componentes visuais, contratos de dados e pontos de integração já estão posicionados.
              Quando a IA for habilitada, os painéis abaixo passam a ser preenchidos automaticamente sem
              nenhuma mudança de layout.
            </p>
          </div>
          <Button disabled className="shrink-0">Ativar IA em breve</Button>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {capabilities.map((c) => (
          <div key={c.title} className="card-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground">
              <c.icon className="h-4 w-4" />
            </span>
            <p className="mt-3 text-sm font-semibold">{c.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </div>

      <AiInsightPanel op={op} />

      <Panel title="Insights comerciais" bodyClassName="grid gap-3 md:grid-cols-3">
        {[
          ["Aceleração de funil", "Negociações com demo agendada em até 7 dias fecham 34% mais rápido."],
          ["Risco concentrado", "38% do forecast está com um único responsável — distribua a carteira."],
          ["Melhor origem", "Indicações têm o maior win rate do trimestre (61%)."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-xl border bg-secondary/40 p-4">
            <p className="text-sm font-semibold">{t}</p>
            <p className="mt-1 text-xs text-muted-foreground">{d}</p>
          </div>
        ))}
      </Panel>
    </div>
  );
}
