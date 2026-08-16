import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { TablesUpdate } from "@/integrations/supabase/types";
import type { ActivityRecord } from "@/lib/activities";

/** Lista as atividades acessíveis ao usuário, já com nomes de empresa, contato e oportunidade. */
export const listActivities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ActivityRecord[]> => {
    const { supabase } = context;
    const [rowsRes, companiesRes, contactsRes, opsRes, profilesRes] = await Promise.all([
      supabase.from("activities").select("*").order("due_at", { ascending: true }),
      supabase.from("companies").select("id, name"),
      supabase.from("contacts").select("id, name"),
      supabase.from("opportunities").select("id, title"),
      supabase.from("profiles").select("id, full_name"),
    ]);
    const err =
      rowsRes.error ?? companiesRes.error ?? contactsRes.error ?? opsRes.error ?? profilesRes.error;
    if (err) throw new Error(err.message);

    const companies = new Map((companiesRes.data ?? []).map((c) => [c.id, c.name]));
    const contacts = new Map((contactsRes.data ?? []).map((c) => [c.id, c.name]));
    const ops = new Map((opsRes.data ?? []).map((o) => [o.id, o.title]));
    const owners = new Map((profilesRes.data ?? []).map((p) => [p.id, p.full_name]));

    return (rowsRes.data ?? []).map((row) => ({
      id: row.id,
      type: row.type as ActivityRecord["type"],
      title: row.title,
      description: row.description ?? "",
      priority: row.priority as ActivityRecord["priority"],
      status: row.status as ActivityRecord["status"],
      dueAt: row.due_at,
      completedAt: row.completed_at,
      companyId: row.company_id,
      contactId: row.contact_id,
      opportunityId: row.opportunity_id,
      ownerId: row.owner_id,
      ownerName: owners.get(row.owner_id) ?? "Sem responsável",
      companyName: row.company_id ? (companies.get(row.company_id) ?? "—") : "—",
      contactName: row.contact_id ? (contacts.get(row.contact_id) ?? "—") : "—",
      opportunityTitle: row.opportunity_id ? (ops.get(row.opportunity_id) ?? "—") : "—",
    }));
  });

/** Cria uma atividade vinculada a empresa, contato e/ou oportunidade. */
export const createActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      type: string;
      title: string;
      description?: string;
      priority?: string;
      dueAt?: string | null;
      companyId?: string | null;
      contactId?: string | null;
      opportunityId?: string | null;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!data.title.trim()) throw new Error("Informe um título para a atividade");

    let companyId = data.companyId ?? null;
    if (!companyId && data.opportunityId) {
      const { data: op } = await supabase
        .from("opportunities")
        .select("company_id, contact_id")
        .eq("id", data.opportunityId)
        .maybeSingle();
      companyId = op?.company_id ?? null;
    }

    const { data: created, error } = await supabase
      .from("activities")
      .insert({
        type: data.type,
        title: data.title.trim(),
        description: data.description ?? "",
        priority: data.priority ?? "media",
        due_at: data.dueAt ?? null,
        company_id: companyId,
        contact_id: data.contactId ?? null,
        opportunity_id: data.opportunityId ?? null,
        owner_id: userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    if (data.opportunityId) {
      await supabase.from("opportunity_events").insert({
        opportunity_id: data.opportunityId,
        kind: "atividade",
        title: `Atividade criada: ${data.title.trim()}`,
        detail: data.description ?? "",
        owner_id: userId,
      });
      await supabase
        .from("opportunities")
        .update({
          next_activity: data.title.trim(),
          next_activity_date: data.dueAt ? data.dueAt.slice(0, 10) : null,
        })
        .eq("id", data.opportunityId);
    }
    return { id: created.id };
  });

/** Atualiza campos da atividade (inclusive concluir/reabrir). */
export const updateActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id: string;
      title?: string;
      description?: string;
      type?: string;
      priority?: string;
      status?: string;
      dueAt?: string | null;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: TablesUpdate<"activities"> = {};
    if (data.title !== undefined) patch["title"] = data.title;
    if (data.description !== undefined) patch["description"] = data.description;
    if (data.type !== undefined) patch["type"] = data.type;
    if (data.priority !== undefined) patch["priority"] = data.priority;
    if (data.dueAt !== undefined) patch["due_at"] = data.dueAt;
    if (data.status !== undefined) {
      patch["status"] = data.status;
      patch["completed_at"] = data.status === "concluida" ? new Date().toISOString() : null;
    }

    const { data: updated, error } = await supabase
      .from("activities")
      .update(patch)
      .eq("id", data.id)
      .select("id, title, opportunity_id, status")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!updated) throw new Error("Atividade não encontrada ou sem permissão");

    if (data.status === "concluida" && updated.opportunity_id) {
      await supabase.from("opportunity_events").insert({
        opportunity_id: updated.opportunity_id,
        kind: "atividade",
        title: `Atividade concluída: ${updated.title}`,
        owner_id: userId,
      });
      await supabase
        .from("opportunities")
        .update({ last_contact: new Date().toISOString().slice(0, 10) })
        .eq("id", updated.opportunity_id);
    }
    return { ok: true };
  });

/** Remove uma atividade. */
export const deleteActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("activities").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
