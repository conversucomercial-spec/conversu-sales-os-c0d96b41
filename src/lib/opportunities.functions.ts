import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { TablesUpdate } from "@/integrations/supabase/types";

/** Edição completa dos campos comerciais da oportunidade, com registro no histórico. */
export const updateOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id: string;
      title?: string;
      value?: number;
      setupValue?: number | null;
      probability?: number;
      temperature?: string;
      priority?: string;
      health?: number | null;
      closeDate?: string | null;
      nextStep?: string;
      lossReason?: string;
      summary?: string;
      contactId?: string | null;
      ownerId?: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: before, error: beforeError } = await supabase
      .from("opportunities")
      .select("id, title, value, close_date, probability, temperature, priority, owner_id")
      .eq("id", data.id)
      .maybeSingle();
    if (beforeError) throw new Error(beforeError.message);
    if (!before) throw new Error("Oportunidade não encontrada ou sem permissão");

    const patch: TablesUpdate<"opportunities"> = {};
    if (data.title !== undefined) patch["title"] = data.title;
    if (data.value !== undefined) patch["value"] = data.value;
    if (data.setupValue !== undefined) patch["setup_value"] = data.setupValue;
    if (data.probability !== undefined) patch["probability"] = data.probability;
    if (data.temperature !== undefined) patch["temperature"] = data.temperature;
    if (data.priority !== undefined) patch["priority"] = data.priority;
    if (data.health !== undefined) patch["health"] = data.health;
    if (data.closeDate !== undefined) patch["close_date"] = data.closeDate || null;
    if (data.nextStep !== undefined) patch["next_step"] = data.nextStep;
    if (data.lossReason !== undefined) patch["loss_reason"] = data.lossReason;
    if (data.summary !== undefined) patch["summary"] = data.summary;
    if (data.contactId !== undefined) patch["contact_id"] = data.contactId || null;
    if (data.ownerId !== undefined) patch["owner_id"] = data.ownerId;

    const { error } = await supabase.from("opportunities").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);

    const changes: string[] = [];
    if (data.value !== undefined && Number(before.value) !== data.value)
      changes.push(`valor: ${before.value} → ${data.value}`);
    if (data.closeDate !== undefined && (before.close_date ?? "") !== (data.closeDate ?? ""))
      changes.push(`fechamento: ${before.close_date ?? "—"} → ${data.closeDate || "—"}`);
    if (data.probability !== undefined && before.probability !== data.probability)
      changes.push(`probabilidade: ${before.probability}% → ${data.probability}%`);
    if (data.temperature !== undefined && before.temperature !== data.temperature)
      changes.push(`temperatura: ${before.temperature} → ${data.temperature}`);
    if (data.ownerId !== undefined && before.owner_id !== data.ownerId)
      changes.push("responsável alterado");

    if (changes.length > 0) {
      await supabase.from("opportunity_events").insert({
        opportunity_id: data.id,
        kind: "campo",
        title: "Oportunidade atualizada",
        detail: changes.join(" · "),
        owner_id: userId,
      });
    }
    return { ok: true };
  });

/** Exclui a oportunidade (o histórico vinculado sai junto). */
export const deleteOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("opportunities").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Histórico unificado da oportunidade (etapa, atividade, reunião, nota, proposta, campo). */
export const listOpportunityEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { opportunityId: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("opportunity_events")
      .select("id, kind, title, detail, occurred_at")
      .eq("opportunity_id", data.opportunityId)
      .order("occurred_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** Registra uma nota livre no histórico da oportunidade. */
export const addOpportunityNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { opportunityId: string; text: string }) => input)
  .handler(async ({ data, context }) => {
    if (!data.text.trim()) throw new Error("Escreva a nota antes de salvar");
    const { error } = await context.supabase.from("opportunity_events").insert({
      opportunity_id: data.opportunityId,
      kind: "nota",
      title: "Nota",
      detail: data.text.trim(),
      owner_id: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
