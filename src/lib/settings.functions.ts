import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json, TablesUpdate } from "@/integrations/supabase/types";
import type { CrmSettings, PipelineSetting } from "@/lib/settings";

/** Configuração comercial completa: funis, etapas, campos, listas e automações. */
export const listSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CrmSettings> => {
    const { supabase, userId } = context;
    const [pipelinesRes, stagesRes, fieldsRes, optionsRes, rulesRes, roleRes] = await Promise.all([
      supabase.from("pipelines").select("*").order("position"),
      supabase.from("stages").select("*").order("position"),
      supabase.from("custom_fields").select("*").order("position"),
      supabase.from("option_lists").select("*").order("position"),
      supabase.from("automation_rules").select("*").order("created_at"),
      supabase.rpc("has_role", { _user_id: userId, _role: "gestor" }),
    ]);

    const err =
      pipelinesRes.error ?? stagesRes.error ?? fieldsRes.error ?? optionsRes.error ?? rulesRes.error;
    if (err) throw new Error(err.message);

    const stages = stagesRes.data ?? [];
    const pipelines: PipelineSetting[] = (pipelinesRes.data ?? []).map((p) => ({
      id: p.id,
      key: p.key,
      name: p.name,
      description: p.description ?? "",
      position: p.position,
      active: p.active ?? true,
      cardFields: p.card_fields ?? [],
      stages: stages
        .filter((s) => s.pipeline_id === p.id)
        .map((s) => ({
          id: s.id,
          pipelineId: s.pipeline_id,
          key: s.key,
          name: s.name,
          position: s.position,
          probability: s.probability,
          criteria: s.criteria ?? [],
          playbook: s.playbook ?? {},
        })),
    }));

    return {
      isAdmin: roleRes.data === true,
      pipelines,
      customFields: (fieldsRes.data ?? []).map((f) => ({
        id: f.id,
        entity: f.entity as "opportunity" | "company" | "contact",
        key: f.key,
        label: f.label,
        type: f.type,
        options: f.options ?? [],
        required: f.required,
        pipelineKeys: f.pipeline_keys ?? [],
        position: f.position,
        active: f.active,
      })),
      options: (optionsRes.data ?? []).map((o) => ({
        id: o.id,
        listKey: o.list_key,
        value: o.value,
        label: o.label,
        position: o.position,
        active: o.active,
      })),
      automations: (rulesRes.data ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description ?? "",
        triggerType: r.trigger_type,
        triggerConfig: r.trigger_config ?? {},
        actionType: r.action_type,
        actionConfig: r.action_config ?? {},
        active: r.active,
      })),
    };
  });

/** Cria ou atualiza um funil. */
export const savePipeline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id?: string;
      key?: string;
      name: string;
      description?: string;
      position?: number;
      active?: boolean;
      cardFields?: string[];
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { assertGestor } = await import("@/lib/authz.server");
    await assertGestor(context.supabase, context.userId);
    const name = data.name.trim();
    if (!name) throw new Error("Informe o nome do funil");

    if (data.id) {
      const patch: TablesUpdate<"pipelines"> = { name, updated_by: context.userId };
      if (data.description !== undefined) patch.description = data.description;
      if (data.position !== undefined) patch.position = data.position;
      if (data.active !== undefined) patch.active = data.active;
      if (data.cardFields !== undefined) patch.card_fields = data.cardFields;
      const { error } = await context.supabase.from("pipelines").update(patch).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    const key =
      data.key?.trim() ||
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const { data: created, error } = await context.supabase
      .from("pipelines")
      .insert({
        key,
        name,
        description: data.description ?? "",
        position: data.position ?? 99,
        active: data.active ?? true,
        card_fields: data.cardFields ?? ["company", "value", "owner"],
        updated_by: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: created.id };
  });

/** Remove um funil sem oportunidades vinculadas. */
export const deletePipeline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { assertGestor } = await import("@/lib/authz.server");
    await assertGestor(context.supabase, context.userId);
    const { count, error: countError } = await context.supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("pipeline_id", data.id);
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0) throw new Error("Este funil tem oportunidades. Mova-as antes de excluir.");
    const { error } = await context.supabase.from("pipelines").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Cria ou atualiza uma etapa de um funil. */
export const saveStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id?: string;
      pipelineId: string;
      key?: string;
      name: string;
      position?: number;
      probability?: number;
      criteria?: string[];
      playbook?: Json;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { assertGestor } = await import("@/lib/authz.server");
    await assertGestor(context.supabase, context.userId);
    const name = data.name.trim();
    if (!name) throw new Error("Informe o nome da etapa");
    const probability = Math.max(0, Math.min(100, data.probability ?? 0));

    if (data.id) {
      const patch: TablesUpdate<"stages"> = { name, probability, updated_by: context.userId };
      if (data.position !== undefined) patch.position = data.position;
      if (data.criteria !== undefined) patch.criteria = data.criteria;
      if (data.playbook !== undefined) patch.playbook = data.playbook;
      const { error } = await context.supabase.from("stages").update(patch).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    const key =
      data.key?.trim() ||
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const { data: created, error } = await context.supabase
      .from("stages")
      .insert({
        pipeline_id: data.pipelineId,
        key,
        name,
        position: data.position ?? 99,
        probability,
        criteria: data.criteria ?? [],
        playbook: data.playbook ?? {},
        updated_by: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: created.id };
  });

/** Remove uma etapa sem oportunidades vinculadas. */
export const deleteStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { assertGestor } = await import("@/lib/authz.server");
    await assertGestor(context.supabase, context.userId);
    const { count, error: countError } = await context.supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("stage_id", data.id);
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0) throw new Error("Esta etapa tem oportunidades. Mova-as antes de excluir.");
    const { error } = await context.supabase.from("stages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Cria ou atualiza um campo personalizado. */
export const saveCustomField = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id?: string;
      entity: "opportunity" | "company" | "contact";
      key?: string;
      label: string;
      type: string;
      options?: string[];
      required?: boolean;
      pipelineKeys?: string[];
      position?: number;
      active?: boolean;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { assertGestor } = await import("@/lib/authz.server");
    await assertGestor(context.supabase, context.userId);
    const label = data.label.trim();
    if (!label) throw new Error("Informe o nome do campo");
    const payload = {
      entity: data.entity,
      label,
      type: data.type,
      options: data.options ?? [],
      required: data.required ?? false,
      pipeline_keys: data.pipelineKeys ?? [],
      position: data.position ?? 99,
      active: data.active ?? true,
      updated_by: context.userId,
    };

    if (data.id) {
      const { error } = await context.supabase
        .from("custom_fields")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    const key =
      data.key?.trim() ||
      label
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/(^_|_$)/g, "");
    const { data: created, error } = await context.supabase
      .from("custom_fields")
      .insert({ ...payload, key })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("Já existe um campo com esse nome nesta entidade");
      throw new Error(error.message);
    }
    return { id: created.id };
  });

/** Exclui um campo personalizado. */
export const deleteCustomField = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { assertGestor } = await import("@/lib/authz.server");
    await assertGestor(context.supabase, context.userId);
    const { error } = await context.supabase.from("custom_fields").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Cria ou atualiza um item de lista (origem, parceiro, motivo de perda…). */
export const saveOption = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id?: string;
      listKey: string;
      value?: string;
      label: string;
      position?: number;
      active?: boolean;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { assertGestor } = await import("@/lib/authz.server");
    await assertGestor(context.supabase, context.userId);
    const label = data.label.trim();
    if (!label) throw new Error("Informe o nome do item");
    const payload = {
      list_key: data.listKey,
      label,
      position: data.position ?? 99,
      active: data.active ?? true,
      updated_by: context.userId,
    };

    if (data.id) {
      const { error } = await context.supabase.from("option_lists").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    const value =
      data.value?.trim() ||
      label
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const { data: created, error } = await context.supabase
      .from("option_lists")
      .insert({ ...payload, value })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("Este item já existe na lista");
      throw new Error(error.message);
    }
    return { id: created.id };
  });

/** Exclui um item de lista. */
export const deleteOption = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { assertGestor } = await import("@/lib/authz.server");
    await assertGestor(context.supabase, context.userId);
    const { error } = await context.supabase.from("option_lists").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Cria ou atualiza uma automação comercial. */
export const saveAutomation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id?: string;
      name: string;
      description?: string;
      triggerType: string;
      triggerConfig?: Json;
      actionType: string;
      actionConfig?: Json;
      active?: boolean;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { assertGestor } = await import("@/lib/authz.server");
    await assertGestor(context.supabase, context.userId);
    const name = data.name.trim();
    if (!name) throw new Error("Informe o nome da automação");
    const payload = {
      name,
      description: data.description ?? "",
      trigger_type: data.triggerType,
      trigger_config: data.triggerConfig ?? {},
      action_type: data.actionType,
      action_config: data.actionConfig ?? {},
      active: data.active ?? true,
      updated_by: context.userId,
    };

    if (data.id) {
      const { error } = await context.supabase
        .from("automation_rules")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: created, error } = await context.supabase
      .from("automation_rules")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: created.id };
  });

/** Exclui uma automação. */
export const deleteAutomation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { assertGestor } = await import("@/lib/authz.server");
    await assertGestor(context.supabase, context.userId);
    const { error } = await context.supabase.from("automation_rules").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
