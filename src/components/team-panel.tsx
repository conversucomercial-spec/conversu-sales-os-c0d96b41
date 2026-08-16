import { useState } from "react";

import { Panel, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/form-field";
import { FilterSelect } from "@/components/toolbar";
import { initials, useSession } from "@/hooks/use-session";
import { useTeam, useTeamMutations } from "@/hooks/use-team";

const EMPTY = { fullName: "", email: "", jobTitle: "", password: "" };

/** Gestão de contas de vendedores — visível apenas para o administrador. */
export function TeamPanel() {
  const { role } = useSession();
  const { data, isLoading } = useTeam();
  const { createSeller, setRole, revoke } = useTeamMutations();
  const [form, setForm] = useState(EMPTY);
  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (!data.isAdmin && role !== "gestor") {
    return (
      <Panel title="Time comercial" description="Somente o administrador gerencia contas">
        <p className="text-sm text-muted-foreground">
          Peça ao administrador da Conversu a criação ou alteração de acessos.
        </p>
      </Panel>
    );
  }

  const submit = () => {
    createSeller.mutate(
      {
        fullName: form.fullName,
        email: form.email,
        jobTitle: form.jobTitle,
        ...(form.password ? { password: form.password } : {}),
      },
      { onSuccess: () => setForm(EMPTY) },
    );
  };

  return (
    <div className="space-y-4">
      <Panel
        title="Liberar acesso de vendedor"
        description="Crie a conta com senha provisória ou envie um convite por e-mail"
        bodyClassName="space-y-3"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome completo">
            <Input value={form.fullName} onChange={(e) => set("fullName")(e.target.value)} placeholder="Marina Duarte" />
          </Field>
          <Field label="E-mail">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
              placeholder="vendedor@useconversu.com"
            />
          </Field>
          <Field label="Cargo">
            <Input
              value={form.jobTitle}
              onChange={(e) => set("jobTitle")(e.target.value)}
              placeholder="Executivo(a) comercial"
            />
          </Field>
          <Field label="Senha provisória (opcional)" hint="Sem senha, o vendedor recebe um convite por e-mail.">
            <Input
              type="password"
              value={form.password}
              onChange={(e) => set("password")(e.target.value)}
              placeholder="mínimo 8 caracteres"
            />
          </Field>
        </div>
        <Button onClick={submit} disabled={createSeller.isPending}>
          Liberar acesso
        </Button>
      </Panel>

      <Panel title="Equipe com acesso" description="Papéis e revogação de acesso" bodyClassName="space-y-2.5">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando equipe…</p>}
        {!isLoading && data.members.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada ainda.</p>
        )}
        {data.members.map((m) => (
          <div
            key={m.id}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-3"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-xs font-semibold text-accent-foreground">
              {initials(m.fullName || m.email || "C")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{m.fullName || "Sem nome"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {m.email}
                {m.jobTitle ? ` · ${m.jobTitle}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {m.role ? (
                <FilterSelect
                  value={m.role}
                  onChange={(v) => setRole.mutate({ userId: m.id, role: v as "gestor" | "vendedor" })}
                  options={[
                    { value: "vendedor", label: "Vendedor" },
                    { value: "gestor", label: "Gestor" },
                  ]}
                />
              ) : (
                <Tag tone="warning">Sem acesso</Tag>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => revoke.mutate({ userId: m.id })}
                disabled={!m.role || revoke.isPending}
              >
                Revogar
              </Button>
            </div>
          </div>
        ))}
      </Panel>
    </div>
  );
}
