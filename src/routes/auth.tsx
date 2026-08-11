import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar | Conversu Sales OS" },
      {
        name: "description",
        content: "Acesse o Conversu Sales OS para acompanhar pipeline, forecast, metas e parceiros.",
      },
      { property: "og:title", content: "Entrar | Conversu Sales OS" },
      { property: "og:description", content: "Acesso à plataforma comercial da Conversu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
      else setChecking(false);
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard", replace: true });
        else toast.success("Conta criada. Confirme o e-mail para acessar.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível concluir.");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  };

  if (checking) return null;

  return (
    <div className="grid min-h-screen w-full bg-background lg:grid-cols-2">
      <div className="brand-gradient relative hidden flex-col justify-between p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
            <span className="font-display text-base font-extrabold">C</span>
          </div>
          <div>
            <p className="font-display text-base font-bold leading-tight">Conversu</p>
            <p className="text-xs opacity-80">Sales OS</p>
          </div>
        </div>
        <div className="max-w-md">
          <h2 className="font-display text-3xl font-bold leading-tight">
            A operação comercial inteira em um único lugar.
          </h2>
          <p className="mt-4 text-sm opacity-85">
            Pipeline configurável, forecast ponderado, metas por empresa, equipe e vendedor,
            inteligência de parceiros e playbooks por etapa.
          </p>
          <p className="font-accent mt-6 text-2xl opacity-90">previsibilidade de verdade</p>
        </div>
        <p className="text-xs opacity-70">© 2026 Conversu</p>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="brand-gradient grid h-10 w-10 place-items-center rounded-xl text-primary-foreground">
              <span className="font-display text-base font-extrabold">C</span>
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {mode === "entrar" ? "Entrar no Conversu" : "Criar sua conta"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "entrar"
              ? "Acesse a plataforma comercial da Conversu."
              : "Comece a acompanhar seu funil em minutos."}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "criar" && (
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Marina Duarte"
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail corporativo</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@empresa.com.br"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "entrar" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">ou</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full rounded-xl" onClick={google} disabled={loading}>
            Continuar com Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "entrar" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => setMode(mode === "entrar" ? "criar" : "entrar")}
            >
              {mode === "entrar" ? "Criar conta" : "Entrar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
