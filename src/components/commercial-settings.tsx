import { useMemo, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { Panel, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Field } from "@/components/form-field";
import { FilterSelect } from "@/components/toolbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings, useSettingsMutations } from "@/hooks/use-settings";
import {
  ACTION_TYPES,
  CARD_FIELD_OPTIONS,
  FIELD_ENTITIES,
  FIELD_TYPES,
  OPTION_LISTS,
  TRIGGER_TYPES,
  labelOf,
  type CrmSettings,
} from "@/lib/settings";

type Mutations = ReturnType<typeof useSettingsMutations>;

function PipelinesTab({ data, m }: { data: CrmSettings; m: Mutations }) {
  const [newPipeline, setNewPipeline] = useState("");
  const [newStage, setNewStage] = useState<Record<string, string>>({});

  return (
    <div className="space-y-4">
      <Panel title="Novo funil" description="Cada funil tem etapas, probabilidades e campos próprios">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={newPipeline}
            onChange={(e) => setNewPipeline(e.target.value)}
            placeholder="Ex.: Expansão de base"
          />
          <Button
            onClick={() =>
              m.savePipeline.mutate(
                { name: newPipeline, position: data.pipelines.length + 1 },
                { onSuccess: () => setNewPipeline("") },
              )
            }
            disabled={!newPipeline.trim() || m.savePipeline.isPending}
          >
            <Plus className="h-3.5 w-3.5" /> Criar funil
          </Button>
        </div>
      </Panel>

      {data.pipelines.map((p) => (
        <Panel
          key={p.id}
          title={p.name}
          description={p.description || "Sem descrição"}
          bodyClassName="space-y-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nome do funil">
              <Input
                defaultValue={p.name}
                onBlur={(e) =>
                  e.target.value.trim() !== p.name &&
                  m.savePipeline.mutate({ id: p.id, name: e.target.value })
                }
              />
            </Field>
            <Field label="Descrição">
              <Input
                defaultValue={p.description}
                onBlur={(e) =>
                  e.target.value !== p.description &&
                  m.savePipeline.mutate({ id: p.id, name: p.name, description: e.target.value })
                }
              />
            </Field>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold">Campos exibidos no card</p>
            <div className="flex flex-wrap gap-1.5">
              {CARD_FIELD_OPTIONS.map((f) => {
                const on = p.cardFields.includes(f.value);
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() =>
                      m.savePipeline.mutate({
                        id: p.id,
                        name: p.name,
                        cardFields: on
                          ? p.cardFields.filter((v) => v !== f.value)
                          : [...p.cardFields, f.value],
                      })
                    }
                  >
                    <Tag tone={on ? "info" : "neutral"}>{f.label}</Tag>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold">Etapas, probabilidade e critérios</p>
            {p.stages.map((s, i) => (
              <div key={s.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-secondary text-[11px] font-semibold">
                    {i + 1}
                  </span>
                  <Input
                    className="h-8 w-52"
                    defaultValue={s.name}
                    onBlur={(e) =>
                      e.target.value.trim() !== s.name &&
                      m.saveStage.mutate({
                        id: s.id,
                        pipelineId: p.id,
                        name: e.target.value,
                        probability: s.probability,
                      })
                    }
                  />
                  <Input
                    type="number"
                    className="h-8 w-24"
                    defaultValue={s.probability}
                    onBlur={(e) =>
                      Number(e.target.value) !== s.probability &&
                      m.saveStage.mutate({
                        id: s.id,
                        pipelineId: p.id,
                        name: s.name,
                        probability: Number(e.target.value),
                      })
                    }
                  />
                  <span className="text-xs text-muted-foreground">% de conversão</span>
                  <div className="ml-auto flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={i === 0}
                      onClick={() => {
                        const prev = p.stages[i - 1]!;
                        m.saveStage.mutate({
                          id: s.id,
                          pipelineId: p.id,
                          name: s.name,
                          position: prev.position,
                        });
                        m.saveStage.mutate({
                          id: prev.id,
                          pipelineId: p.id,
                          name: prev.name,
                          position: s.position,
                        });
                      }}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={i === p.stages.length - 1}
                      onClick={() => {
                        const next = p.stages[i + 1]!;
                        m.saveStage.mutate({
                          id: s.id,
                          pipelineId: p.id,
                          name: s.name,
                          position: next.position,
                        });
                        m.saveStage.mutate({
                          id: next.id,
                          pipelineId: p.id,
                          name: next.name,
                          position: s.position,
                        });
                      }}
                    >
                      ↓
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => m.deleteStage.mutate({ id: s.id })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  className="mt-2 min-h-16 text-xs"
                  defaultValue={s.criteria.join("\n")}
                  placeholder="Um critério de avanço por linha"
                  onBlur={(e) =>
                    m.saveStage.mutate({
                      id: s.id,
                      pipelineId: p.id,
                      name: s.name,
                      probability: s.probability,
                      criteria: e.target.value
                        .split("\n")
                        .map((v) => v.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            ))}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={newStage[p.id] ?? ""}
                onChange={(e) => setNewStage((s) => ({ ...s, [p.id]: e.target.value }))}
                placeholder="Nova etapa"
              />
              <Button
                variant="outline"
                onClick={() =>
                  m.saveStage.mutate(
                    {
                      pipelineId: p.id,
                      name: newStage[p.id] ?? "",
                      position: p.stages.length + 1,
                    },
                    { onSuccess: () => setNewStage((s) => ({ ...s, [p.id]: "" })) },
                  )
                }
                disabled={!(newStage[p.id] ?? "").trim()}
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar etapa
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => m.deletePipeline.mutate({ id: p.id })}
          >
            <Trash2 className="h-3.5 w-3.5" /> Excluir funil
          </Button>
        </Panel>
      ))}
    </div>
  );
}

function FieldsTab({ data, m }: { data: CrmSettings; m: Mutations }) {
  const [form, setForm] = useState({
    entity: "opportunity",
    label: "",
    type: "texto",
    options: "",
    required: false,
  });

  return (
    <div className="space-y-4">
      <Panel title="Novo campo personalizado" bodyClassName="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Aplicar em">
            <FilterSelect
              value={form.entity}
              onChange={(v) => setForm((f) => ({ ...f, entity: v }))}
              className="w-full"
              options={FIELD_ENTITIES.map((e) => ({ value: e.value, label: e.label }))}
            />
          </Field>
          <Field label="Nome do campo">
            <Input
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="Ex.: Ticket estimado"
            />
          </Field>
          <Field label="Tipo">
            <FilterSelect
              value={form.type}
              onChange={(v) => setForm((f) => ({ ...f, type: v }))}
              className="w-full"
              options={FIELD_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            />
          </Field>
          <Field label="Opções (uma por linha)" hint="Somente para campos do tipo lista.">
            <Textarea
              className="min-h-16"
              value={form.options}
              onChange={(e) => setForm((f) => ({ ...f, options: e.target.value }))}
            />
          </Field>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={form.required}
            onCheckedChange={(v) => setForm((f) => ({ ...f, required: v }))}
          />
          <span className="text-sm">Preenchimento obrigatório</span>
        </div>
        <Button
          onClick={() =>
            m.saveCustomField.mutate(
              {
                entity: form.entity as "opportunity" | "company" | "contact",
                label: form.label,
                type: form.type,
                required: form.required,
                options: form.options
                  .split("\n")
                  .map((v) => v.trim())
                  .filter(Boolean),
                position: data.customFields.length + 1,
              },
              { onSuccess: () => setForm((f) => ({ ...f, label: "", options: "" })) },
            )
          }
          disabled={!form.label.trim() || m.saveCustomField.isPending}
        >
          <Plus className="h-3.5 w-3.5" /> Criar campo
        </Button>
      </Panel>

      {FIELD_ENTITIES.map((entity) => {
        const fields = data.customFields.filter((f) => f.entity === entity.value);
        return (
          <Panel key={entity.value} title={`Campos de ${entity.label.toLowerCase()}`} bodyClassName="space-y-2">
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum campo personalizado ainda.</p>
            )}
            {fields.map((f) => (
              <div
                key={f.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <Input
                    className="h-8"
                    defaultValue={f.label}
                    onBlur={(e) =>
                      e.target.value.trim() !== f.label &&
                      m.saveCustomField.mutate({
                        id: f.id,
                        entity: f.entity,
                        label: e.target.value,
                        type: f.type,
                        options: f.options,
                        required: f.required,
                      })
                    }
                  />
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {labelOf(FIELD_TYPES, f.type)} · {f.key}
                    {f.required ? " · obrigatório" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={f.active}
                    onCheckedChange={(v) =>
                      m.saveCustomField.mutate({
                        id: f.id,
                        entity: f.entity,
                        label: f.label,
                        type: f.type,
                        options: f.options,
                        required: f.required,
                        active: v,
                      })
                    }
                  />
                  <Button variant="ghost" size="sm" onClick={() => m.deleteCustomField.mutate({ id: f.id })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </Panel>
        );
      })}
    </div>
  );
}

function ListsTab({ data, m }: { data: CrmSettings; m: Mutations }) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const grouped = useMemo(() => {
    const map = new Map<string, typeof data.options>();
    for (const o of data.options) map.set(o.listKey, [...(map.get(o.listKey) ?? []), o]);
    return map;
  }, [data.options]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {OPTION_LISTS.map((list) => (
        <Panel key={list.key} title={list.label} bodyClassName="space-y-2">
          {(grouped.get(list.key) ?? []).map((o) => (
            <div
              key={o.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border p-2.5"
            >
              <Input
                className="h-8"
                defaultValue={o.label}
                onBlur={(e) =>
                  e.target.value.trim() !== o.label &&
                  m.saveOption.mutate({ id: o.id, listKey: list.key, label: e.target.value })
                }
              />
              <Button variant="ghost" size="sm" onClick={() => m.deleteOption.mutate({ id: o.id })}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              className="h-8"
              value={drafts[list.key] ?? ""}
              onChange={(e) => setDrafts((d) => ({ ...d, [list.key]: e.target.value }))}
              placeholder="Novo item"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                m.saveOption.mutate(
                  {
                    listKey: list.key,
                    label: drafts[list.key] ?? "",
                    position: (grouped.get(list.key) ?? []).length + 1,
                  },
                  { onSuccess: () => setDrafts((d) => ({ ...d, [list.key]: "" })) },
                )
              }
              disabled={!(drafts[list.key] ?? "").trim()}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Panel>
      ))}
    </div>
  );
}

function AutomationsTab({ data, m }: { data: CrmSettings; m: Mutations }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    triggerType: "etapa_alterada",
    actionType: "notificacao",
  });

  return (
    <div className="space-y-4">
      <Panel title="Nova automação" description="Gatilhos e ações executados pelo CRM" bodyClassName="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome">
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex.: Alertar negociação parada"
            />
          </Field>
          <Field label="Descrição">
            <Input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </Field>
          <Field label="Quando">
            <FilterSelect
              value={form.triggerType}
              onChange={(v) => setForm((f) => ({ ...f, triggerType: v }))}
              className="w-full"
              options={TRIGGER_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            />
          </Field>
          <Field label="Então">
            <FilterSelect
              value={form.actionType}
              onChange={(v) => setForm((f) => ({ ...f, actionType: v }))}
              className="w-full"
              options={ACTION_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            />
          </Field>
        </div>
        <Button
          onClick={() =>
            m.saveAutomation.mutate(
              {
                name: form.name,
                description: form.description,
                triggerType: form.triggerType,
                actionType: form.actionType,
              },
              { onSuccess: () => setForm((f) => ({ ...f, name: "", description: "" })) },
            )
          }
          disabled={!form.name.trim() || m.saveAutomation.isPending}
        >
          <Plus className="h-3.5 w-3.5" /> Criar automação
        </Button>
      </Panel>

      <Panel title="Automações ativas" bodyClassName="space-y-2">
        {data.automations.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma automação configurada.</p>
        )}
        {data.automations.map((a) => (
          <div
            key={a.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{a.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {labelOf(TRIGGER_TYPES, a.triggerType)} → {labelOf(ACTION_TYPES, a.actionType)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={a.active}
                onCheckedChange={(v) =>
                  m.saveAutomation.mutate({
                    id: a.id,
                    name: a.name,
                    description: a.description,
                    triggerType: a.triggerType,
                    actionType: a.actionType,
                    active: v,
                  })
                }
              />
              <Button variant="ghost" size="sm" onClick={() => m.deleteAutomation.mutate({ id: a.id })}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </Panel>
    </div>
  );
}

/** Núcleo comercial configurável: funis, campos, listas e automações. */
export function CommercialSettings() {
  const { data, isLoading } = useSettings();
  const m = useSettingsMutations();

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando configuração…</p>;

  if (!data.isAdmin) {
    return (
      <Panel title="Configuração comercial" description="Somente o administrador edita funis e campos">
        <p className="text-sm text-muted-foreground">
          Os funis, campos personalizados, listas e automações são mantidos pela gestão comercial.
        </p>
      </Panel>
    );
  }

  return (
    <Tabs defaultValue="funis">
      <TabsList className="flex w-full flex-wrap justify-start">
        <TabsTrigger value="funis">Funis e etapas</TabsTrigger>
        <TabsTrigger value="campos">Campos</TabsTrigger>
        <TabsTrigger value="listas">Listas</TabsTrigger>
        <TabsTrigger value="automacoes">Automações</TabsTrigger>
      </TabsList>
      <TabsContent value="funis" className="mt-4">
        <PipelinesTab data={data} m={m} />
      </TabsContent>
      <TabsContent value="campos" className="mt-4">
        <FieldsTab data={data} m={m} />
      </TabsContent>
      <TabsContent value="listas" className="mt-4">
        <ListsTab data={data} m={m} />
      </TabsContent>
      <TabsContent value="automacoes" className="mt-4">
        <AutomationsTab data={data} m={m} />
      </TabsContent>
    </Tabs>
  );
}
