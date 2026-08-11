import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { applyCadenceEvent, type CadenceEventType, type CadenceStep } from "@/lib/cadence";
import type { ProspectingEvent } from "@/lib/prospecting-metrics";
import type { DiscoveryDocument, DiscoveryRecord } from "@/lib/discovery";

/** Histórico de prospecção acessível ao usuário (RLS aplica dono/gestor). */
export const listProspectingEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProspectingEvent[]> => {
    const { supabase } = context;
    const [eventsRes, profilesRes] = await Promise.all([
      supabase.from("prospecting_events").select("*").order("occurred_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name"),
    ]);
    if (eventsRes.error) throw new Error(eventsRes.error.message);
    if (profilesRes.error) throw new Error(profilesRes.error.message);
    const owners = new Map((profilesRes.data ?? []).map((p) => [p.id, p.full_name]));

    return (eventsRes.data ?? []).map((e) => ({
      id: e.id,
      opportunityId: e.opportunity_id,
      companyId: e.company_id,
      channel: e.channel,
      type: e.type,
      note: e.note ?? "",
      occurredAt: e.occurred_at,
      owner: owners.get(e.owner_id) ?? "Sem responsável",
    }));
  });

/**
 * Registra uma ação manual da cadência (executada pelo usuário no LinkedIn) e
 * recalcula etapa, próxima ação e vencimento na oportunidade.
 * O evento é histórico de auditoria: só inserção, nunca edição.
 */
export const logProspectingEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { opportunityId: string; type: CadenceEventType; note?: string }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: op, error: opError } = await supabase
      .from("opportunities")
      .select("id, company_id, linkedin_step")
      .eq("id", data.opportunityId)
      .maybeSingle();
    if (opError) throw new Error(opError.message);
    if (!op) throw new Error("Oportunidade não encontrada ou sem permissão");

    const occurredAt = new Date();
    const next = applyCadenceEvent({ step: op.linkedin_step as CadenceStep }, data.type, occurredAt);

    const { error: eventError } = await supabase.from("prospecting_events").insert({
      opportunity_id: op.id,
      company_id: op.company_id,
      channel: "linkedin",
      type: data.type,
      note: data.note ?? null,
      occurred_at: occurredAt.toISOString(),
      owner_id: userId,
    });
    if (eventError) throw new Error(eventError.message);

    const { error } = await supabase
      .from("opportunities")
      .update({
        linkedin_status: next.status,
        linkedin_step: next.step,
        linkedin_last_action_at: next.lastActionAt,
        linkedin_next_action: next.nextAction,
        linkedin_next_action_at: next.nextActionAt,
      })
      .eq("id", op.id);
    if (error) throw new Error(error.message);

    return next;
  });

/** Salva a URL do perfil de LinkedIn da oportunidade. */
export const saveLinkedinUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { opportunityId: string; url: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("opportunities")
      .update({ linkedin_url: data.url.trim() || null })
      .eq("id", data.opportunityId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Discovery + documentos/atas + histórico de prospecção de uma oportunidade. */
export const getOpportunityContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { opportunityId: string }) => input)
  .handler(
    async ({
      data,
      context,
    }): Promise<{
      discovery: DiscoveryRecord | null;
      documents: DiscoveryDocument[];
      events: ProspectingEvent[];
    }> => {
      const { supabase } = context;
      const [discoveryRes, docsRes, eventsRes, profilesRes] = await Promise.all([
        supabase.from("discoveries").select("*").eq("opportunity_id", data.opportunityId).maybeSingle(),
        supabase
          .from("discovery_documents")
          .select("*")
          .eq("opportunity_id", data.opportunityId)
          .order("created_at", { ascending: false }),
        supabase
          .from("prospecting_events")
          .select("*")
          .eq("opportunity_id", data.opportunityId)
          .order("occurred_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name"),
      ]);
      const err = discoveryRes.error ?? docsRes.error ?? eventsRes.error ?? profilesRes.error;
      if (err) throw new Error(err.message);
      const owners = new Map((profilesRes.data ?? []).map((p) => [p.id, p.full_name]));

      const d = discoveryRes.data;
      return {
        discovery: d
          ? {
              status: d.status,
              objective: d.objective,
              currentScenario: d.current_scenario,
              pains: d.pains,
              volume: d.volume,
              team: d.team,
              channels: d.channels,
              journeys: d.journeys,
              processes: d.processes,
              integrations: d.integrations,
              systems: d.systems,
              bottlenecks: d.bottlenecks,
              impacts: d.impacts,
              opportunitiesFound: d.opportunities_found,
              conversuFit: d.conversu_fit,
              validatedScope: d.validated_scope,
              nextSteps: d.next_steps,
            }
          : null,
        documents: (docsRes.data ?? []).map((doc) => ({
          id: doc.id,
          name: doc.name,
          date: doc.doc_date,
          url: doc.url,
          kind: doc.kind,
        })),
        events: (eventsRes.data ?? []).map((e) => ({
          id: e.id,
          opportunityId: e.opportunity_id,
          companyId: e.company_id,
          channel: e.channel,
          type: e.type,
          note: e.note ?? "",
          occurredAt: e.occurred_at,
          owner: owners.get(e.owner_id) ?? "Sem responsável",
        })),
      };
    },
  );

/** Cria ou atualiza o Discovery da oportunidade (1 por oportunidade). */
export const saveDiscovery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { opportunityId: string; discovery: DiscoveryRecord }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: op, error: opError } = await supabase
      .from("opportunities")
      .select("id")
      .eq("id", data.opportunityId)
      .maybeSingle();
    if (opError) throw new Error(opError.message);
    if (!op) throw new Error("Oportunidade não encontrada ou sem permissão");

    const d = data.discovery;
    const { error } = await supabase.from("discoveries").upsert(
      {
        opportunity_id: op.id,
        owner_id: userId,
        status: d.status,
        objective: d.objective,
        current_scenario: d.currentScenario,
        pains: d.pains,
        volume: d.volume,
        team: d.team,
        channels: d.channels,
        journeys: d.journeys,
        processes: d.processes,
        integrations: d.integrations,
        systems: d.systems,
        bottlenecks: d.bottlenecks,
        impacts: d.impacts,
        opportunities_found: d.opportunitiesFound,
        conversu_fit: d.conversuFit,
        validated_scope: d.validatedScope,
        next_steps: d.nextSteps,
      },
      { onConflict: "opportunity_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Vincula um documento/ata à oportunidade (base para Reunião → Ata → Documento). */
export const saveDiscoveryDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { opportunityId: string; name: string; date?: string; url?: string }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const name = data.name.trim();
    if (!name) throw new Error("Informe o nome do documento");

    const { error } = await supabase.from("discovery_documents").insert({
      opportunity_id: data.opportunityId,
      name,
      doc_date: data.date || null,
      url: data.url?.trim() || null,
      kind: "ata",
      owner_id: userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
