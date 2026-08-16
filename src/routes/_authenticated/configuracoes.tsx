import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bot, CalendarDays, Database, Loader2, Mail, MessageCircle, Notebook } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { initials, useSession } from "@/hooks/use-session";
import { CommercialSettings } from "@/components/commercial-settings";
import { TeamPanel } from "@/components/team-panel";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações | Conversu Sales OS" },
      { name: "description", content: "Perfil, equipe, integrações, aparência e configuração comercial da plataforma." },
      { property: "og:title", content: "Configurações | Conversu Sales OS" },
      { property: "og:description", content: "Perfil, equipe, integrações e configuração comercial." },
    ],
  }),
  component: ConfigPage,
});

const integrations = [
  { icon: Database, name: "Banco de dados", desc: "Persistência de dados e autenticação" },
  { icon: Notebook, name: "Notion", desc: "Sincronização de bases e documentos" },
  { icon: MessageCircle, name: "WhatsApp", desc: "Registro automático de conversas" },
  { icon: Mail, name: "E-mail", desc: "Captura de threads e templates" },
  { icon: CalendarDays, name: "Calendário", desc: "Agenda de reuniões bidirecional" },
  { icon: Bot, name: "IA Comercial", desc: "Resumos, score e recomendações" },
];

function ProfileTab() {
  const { user, profile, role } = useSession();
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setJobTitle(profile.job_title ?? "");
    setAvatarUrl(profile.avatar_url ?? "");
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, job_title: jobTitle, avatar_url: avatarUrl || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Não foi possível salvar o perfil.");
    else toast.success("Perfil atualizado.");
  };

  return (
    <Panel title="Perfil" description="Dados da sua conta" bodyClassName="space-y-4">
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={fullName} className="h-12 w-12 rounded-xl object-cover" />
        ) : (
          <span className="brand-gradient grid h-12 w-12 place-items-center rounded-xl text-sm font-semibold text-primary-foreground">
            {initials(fullName || user?.email || "C")}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{fullName || "Sem nome"}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <Tag tone={role === "gestor" ? "success" : "info"} className="ml-auto">
          {role === "gestor" ? "Gestor" : "Vendedor"}
        </Tag>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome completo</Label>
          <Input id="nome" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cargo">Cargo</Label>
          <Input id="cargo" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Executivo(a) comercial" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="avatar">URL do avatar</Label>
          <Input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mail">E-mail</Label>
          <Input id="mail" value={user?.email ?? ""} disabled />
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar perfil
      </Button>
    </Panel>
  );
}

function ConfigPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Configurações" description="Perfil, equipe, integrações e o núcleo comercial configurável" />

      <Tabs defaultValue="perfil">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="equipe">Equipe</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="comercial">Comercial</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="mt-4">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="equipe" className="mt-4">
          <TeamPanel />
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
        </TabsContent>

        <TabsContent value="aparencia" className="mt-4 space-y-4">
          <Panel title="Preferências de interface" bodyClassName="space-y-3">
            {[
              ["Densidade compacta nas listas", false],
              ["Mostrar Health Score nos cards", true],
              ["Animações de transição", true],
            ].map(([label, on]) => (
              <div key={label as string} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-3">
                <span className="min-w-0 truncate text-sm">{label as string}</span>
                <Switch defaultChecked={on as boolean} />
              </div>
            ))}
          </Panel>
          <Panel title="Identidade" bodyClassName="grid gap-3 sm:grid-cols-3">
            {[
              ["Core", "#3422B5"],
              ["Flow", "#E56745"],
              ["Mind", "#4C31A6"],
            ].map(([name, hex]) => (
              <div key={name} className="flex items-center gap-3 rounded-xl border p-3.5">
                <span className="h-8 w-8 rounded-lg" style={{ background: hex }} />
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-muted-foreground">{hex}</p>
                </div>
              </div>
            ))}
          </Panel>
        </TabsContent>

        <TabsContent value="comercial" className="mt-4 space-y-4">
          <CommercialSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
