import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { mapCompany, mapContact, mapOpportunity, type CrmSnapshot } from "@/lib/crm-mappers";
import { pipelineKeyForOrigin } from "@/lib/pipeline-routing";

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
      companiesRes.error ??
      contactsRes.error ??
      opsRes.error ??
      stagesRes.error ??
      pipelinesRes.error ??
      profilesRes.error;
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
        mapContact(row, {
          companyName: (row.company_id ? companyById.get(row.company_id)?.name : undefined) ?? "—",
        }),
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

/** Move uma oportunidade para outra etapa do MESMO funil. Nunca troca de pipeline. */
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

    const { data: stage, error: stageError } = await supabase
      .from("stages")
      .select("id, pipeline_id, probability")
      .eq("pipeline_id", op.pipeline_id)
      .eq("key", data.stageKey)
      .maybeSingle();
    if (stageError) throw new Error(stageError.message);
    if (!stage) throw new Error("Etapa não pertence ao funil desta oportunidade");

    const { error } = await supabase
      .from("opportunities")
      .update({
        stage_id: stage.id,
        probability: stage.probability,
        days_in_stage: 0,
        stage_changed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Salva o bloco de reunião da oportunidade. Ao marcar como realizada, registra
 * um evento na timeline com data/hora, insights, dores, objeções e próximos passos.
 */
export const saveMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; meeting: Record<string, string> }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: op, error: opError } = await supabase
      .from("opportunities")
      .select("id, meeting, timeline")
      .eq("id", data.id)
      .maybeSingle();
    if (opError) throw new Error(opError.message);
    if (!op) throw new Error("Oportunidade não encontrada");

    const previous = (op.meeting ?? {}) as Record<string, string>;
    const meeting = { ...previous, ...data.meeting };
    const timeline: Record<string, string>[] = Array.isArray(op.timeline)
      ? (op.timeline as Record<string, string>[])
      : [];

    const becameDone =
      meeting["status"] === "Reunião realizada" && previous["status"] !== "Reunião realizada";
    if (becameDone) {
      const detail = [
        meeting["insights"] ? `Insights: ${meeting["insights"]}` : "",
        meeting["pains"] ? `Dores: ${meeting["pains"]}` : "",
        meeting["objections"] ? `Objeções: ${meeting["objections"]}` : "",
        meeting["nextSteps"] ? `Próximos passos: ${meeting["nextSteps"]}` : "",
      ]
        .filter(Boolean)
        .join(" · ");
      timeline.unshift({
        date: [meeting["date"], meeting["time"]].filter(Boolean).join(" ") || new Date().toISOString(),
        title: "Reunião realizada",
        detail,
        type: "reuniao",
      });
    }

    const { error } = await supabase
      .from("opportunities")
      .update({ meeting, timeline })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Criação enxuta: empresa, contato e origem. O funil vem da lógica comercial
 * (origem + porte da conta), a etapa é a primeira válida daquele funil e a
 * probabilidade vem da etapa. Empresa e contato são validados sob RLS.
 */
export const createOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { companyId: string; contactId?: string; origin: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // RLS garante que só empresas acessíveis retornam aqui.
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, name, employees, segment, owner_id, partner")
      .eq("id", data.companyId)
      .maybeSingle();
    if (companyError) throw new Error(companyError.message);
    if (!company) throw new Error("Empresa não encontrada ou sem permissão");

    let contactName: string | null = null;
    if (data.contactId) {
      const { data: contact, error: contactError } = await supabase
        .from("contacts")
        .select("id, name, company_id")
        .eq("id", data.contactId)
        .maybeSingle();
      if (contactError) throw new Error(contactError.message);
      if (!contact) throw new Error("Contato não encontrado ou sem permissão");
      if (contact.company_id && contact.company_id !== company.id) {
        throw new Error("O contato selecionado não pertence a esta empresa");
      }
      contactName = contact.name;
    }

    const pipelineKey = pipelineKeyForOrigin(data.origin, company.employees ?? 0);
    const { data: pipelines, error: pipelineError } = await supabase
      .from("pipelines")
      .select("id, key, position")
      .order("position");
    if (pipelineError) throw new Error(pipelineError.message);
    const pipeline = pipelines?.find((p) => p.key === pipelineKey) ?? pipelines?.[0];
    if (!pipeline) throw new Error("Nenhum funil configurado");

    const { data: stage, error: stageError } = await supabase
      .from("stages")
      .select("id, probability, position")
      .eq("pipeline_id", pipeline.id)
      .order("position")
      .limit(1)
      .maybeSingle();
    if (stageError) throw new Error(stageError.message);
    if (!stage) throw new Error("O funil selecionado não possui etapas");

    const { data: created, error } = await supabase
      .from("opportunities")
      .insert({
        title: contactName ? `${company.name} — ${contactName}` : company.name,
        company_id: company.id,
        contact_id: data.contactId ?? null,
        pipeline_id: pipeline.id,
        stage_id: stage.id,
        probability: stage.probability,
        origin: data.origin,
        partner: company.partner,
        segment: company.segment,
        owner_id: userId,
        stage_changed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    return { id: created.id, pipelineKey: pipeline.key };
  });
