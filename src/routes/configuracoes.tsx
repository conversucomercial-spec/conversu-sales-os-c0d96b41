import { createFileRoute } from "@tanstack/react-router";
import { Building2, Bot, CalendarDays, Database, Mail, MessageCircle, Notebook, Users } from "lucide-react";
import { PageHeader, Panel, Tag } from "@/components/kit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OWNERS, STAGES } from "@/lib/data";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações | Conversu Sales OS" },
      { name: "description", content: "Configure equipe, etapas do funil, preferências e integrações futuras da plataforma." },
      { property: "og:title", content: "Configurações | Conversu Sales OS" },
      { property: "og:description", content: "Equipe, etapas do funil, preferências e integrações da plataforma." },
    ],
  }),
  component: ConfigPage,
});

const integrations = [
  { icon: Database, name: "Supabase / PostgreSQL", desc: "Persistência de dados e autenticação" },
  { icon: Notebook, name: "Notion", desc: "Sincronização de bases e documentos" },
  { icon: MessageCircle, name: "WhatsApp", desc: "Registro automático de conversas" },
  { icon: Mail, name: "E-mail", desc: "Captura de threads e templates" },
  { icon: CalendarDays, name: "Calendário", desc: "Agenda de reuniões bidirecional" },
  { icon: Bot, name: "IA Comercial", desc: "Resumos, score e recomendações" },
];

function ConfigPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Configurações" description="Preferências da operação comercial e integrações" />

      <Tabs defaultValue="geral">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="funil">Funil</TabsTrigger>
          <TabsTrigger value="equipe">Equipe</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-4 space-y-4">
          <Panel title="Organização" bodyClassName="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Nome da empresa</Label>
              <Input defaultValue="Conversu" />
            </div>
            <div className="space-y-1.5">
              <Label>Moeda padrão</Label>
              <Input defaultValue="BRL (R$)" />
            </div>
            <div className="space-y-1.5">
              <Label>Meta mensal de receita</Label>
              <Input defaultValue="R$ 500.000" />
            </div>
            <div className="space-y-1.5">
              <Label>Fuso horário</Label>
              <Input defaultValue="America/Sao_Paulo" />
            </div>
          </Panel>
          <Panel title="Preferências" bodyClassName="space-y-3">
            {[
              ["Alertas de negociação em risco", true],
              ["Resumo diário por e-mail", true],
              ["Criar follow-up automático após reunião", false],
            ].map(([label, on]) => (
              <div key={label as string} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-3">
                <span className="min-w-0 truncate text-sm">{label as string}</span>
                <Switch defaultChecked={on as boolean} />
              </div>
            ))}
          </Panel>
        </TabsContent>

        <TabsContent value="funil" className="mt-4">
          <Panel title="Etapas do pipeline" bodyClassName="space-y-2.5">
            {STAGES.map((s, i) => (
              <div key={s.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-3">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-secondary text-[11px] font-semibold">{i + 1}</span>
                <span className="min-w-0 truncate text-sm font-medium">{s.label}</span>
                <Tag tone={s.id === "ganho" ? "success" : s.id === "perdido" ? "danger" : "info"}>
                  {s.id === "ganho" ? "Ganho" : s.id === "perdido" ? "Perdido" : "Ativa"}
                </Tag>
              </div>
            ))}
          </Panel>
        </TabsContent>

        <TabsContent value="equipe" className="mt-4">
          <Panel title="Time comercial" bodyClassName="space-y-2.5">
            {OWNERS.map((o, i) => (
              <div key={o} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-xs font-semibold text-accent-foreground">
                  {o.split(" ").map((n) => n[0]).join("")}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{o}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {i === 0 ? "Head de Vendas" : "Executivo(a) comercial"}
                  </p>
                </div>
                <Tag tone={i === 0 ? "success" : "neutral"}>{i === 0 ? "Admin" : "Vendedor"}</Tag>
              </div>
            ))}
          </Panel>
        </TabsContent>

        <TabsContent value="integracoes" className="mt-4">
          <Panel title="Integrações" description="Prontas para conexão nas próximas fases" bodyClassName="grid gap-3 sm:grid-cols-2">
            {integrations.map((i) => (
              <div key={i.name} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-3.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary">
                  <i.icon className="h-4 w-4 text-primary" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{i.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{i.desc}</p>
                </div>
                <Switch disabled />
              </div>
            ))}
          </Panel>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" /> CRM próprio
            <Users className="ml-3 h-3.5 w-3.5" /> Times e permissões — roadmap
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
