import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { mapCompany, mapContact, mapOpportunity, type CrmSnapshot } from "@/lib/crm-mappers";

/** Snapshot completo do CRM (empresas, contatos e oportunidades) sob RLS do usuário. */
export const listCrm = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CrmSnapshot> => {
    const { supabase } = context;
    const [companiesRes, contactsRes, opsRes, stagesRes, pipelinesRes, profilesRes] =
      await Promise.all([
        supabase.from("companies").select("*").order("name"),
        supabase.from("contacts").select("*").order("name"),
        supabase.from("opportunities").select("*").order("value", { ascending: false }),
        supabase.from("stages").select("*").order("position"),
        supabase.from("pipelines").select("*").order("position"),
        supabase.from("profiles").select("id, full_name"),
      ]);

    const err =
      companiesRes.error ?? contactsRes.error ?? opsRes.error ?? stagesRes.error ??
      pipelinesRes.error ?? profilesRes.error;
    if (err) throw new Error(err.message);

    const owners = new Map((profilesRes.data ?? []).map((p) => [p.id, p.full_name]));
    const companyRows = companiesRes.data ?? [];
    const contactRows = contactsRes.data ?? [];
    const stageRows = stagesRes.data ?? [];
    const pipelineRows = pipelinesRes.data ?? [];
    const companyById = new Map(companyRows.map((c) => [c.id, c]));
    const contactById = new Map(contactRows.map((c) => [c.id, c]));
    const stageById = new Map(stageRows.map((s) => [s.id, s]));
    const pipelineById = new Map(pipelineRows.map((p) => [p.id, p]));

    const opportunities = (opsRes.data ?? []).map((row) =>
      mapOpportunity(row, {
        company: companyById.get(row.company_id),
        contact: row.contact_id ? contactById.get(row.contact_id) : undefined,
        stageKey: stageById.get(row.stage_id)?.key ?? "prospeccao",
        pipelineKey: pipelineById.get(row.pipeline_id)?.key ?? "outbound",
        ownerName: owners.get(row.owner_id) ?? "Sem responsável",
      }),
    );

    return {
      companies: companyRows.map((row) =>
        mapCompany(row, {
          ownerName: owners.get(row.owner_id) ?? "Sem responsável",
          opportunities: opportunities.filter((o) => o.companyId === row.id).length,
        }),
      ),
      contacts: contactRows.map((row) =>
        mapContact(row, { companyName: companyById.get(row.company_id)?.name ?? "—" }),
      ),
      opportunities,
      stages: stageRows.map((s) => ({
        id: s.id,
        key: s.key,
        name: s.name,
        pipelineKey: pipelineById.get(s.pipeline_id)?.key ?? "outbound",
      })),
      owners: [...new Set(opportunities.map((o) => o.owner))].sort(),
    };
  });

/** Move uma oportunidade para outra etapa (mesmo funil quando possível). */
export const moveOpportunityStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; stageKey: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: op, error: opError } = await supabase
      .from("opportunities")
      .select("id, pipeline_id")
      .eq("id", data.id)
      .maybeSingle();
    if (opError) throw new Error(opError.message);
    if (!op) throw new Error("Oportunidade não encontrada");

    let { data: stage } = await supabase
      .from("stages")
      .select("id, pipeline_id, probability")
      .eq("pipeline_id", op.pipeline_id)
      .eq("key", data.stageKey)
      .maybeSingle();

    if (!stage) {
      const fallback = await supabase
        .from("stages")
        .select("id, pipeline_id, probability")
        .eq("key", data.stageKey)
        .limit(1)
        .maybeSingle();
      stage = fallback.data;
    }
    if (!stage) throw new Error("Etapa não encontrada");

    const { error } = await supabase
      .from("opportunities")
      .update({
        stage_id: stage.id,
        pipeline_id: stage.pipeline_id,
        probability: stage.probability,
        days_in_stage: 0,
        stage_changed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
