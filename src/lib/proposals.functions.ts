import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ProposalRecord } from "@/lib/proposals";

/** Propostas comerciais reais, com empresa e oportunidade vinculadas. */
export const listProposals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProposalRecord[]> => {
    const { data: rows, error } = await context.supabase
      .from("proposals")
      .select(
        "*, opportunity:opportunities(id, title, company_id, companies(name)), owner:profiles!proposals_owner_id_fkey(full_name)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    return (rows ?? []).map((r) => {
      const op = (r as { opportunity?: { id: string; title: string; company_id: string; companies?: { name?: string } | null } | null })
        .opportunity;
      return {
        id: r.id,
        number: r.number,
        status: r.status,
        value: Number(r.value ?? 0),
        setupValue: Number(r.setup_value ?? 0),
        discount: Number(r.discount ?? 0),
        validUntil: r.valid_until,
        sentAt: r.sent_at,
        decidedAt: r.decided_at,
        terms: r.terms ?? "",
        notes: r.notes ?? "",
        items: Array.isArray(r.items) ? (r.items as ProposalRecord["items"]) : [],
        opportunityId: r.opportunity_id,
        opportunityTitle: op?.title ?? "—",
        companyId: op?.company_id ?? null,
        companyName: op?.companies?.name ?? "—",
        ownerName:
          (r as { owner?: { full_name?: string } | null }).owner?.full_name ?? "Responsável",
        createdAt: r.created_at,
      };
    });
  });

/** Cria ou atualiza uma proposta. */
export const saveProposal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id?: string;
      opportunityId: string;
      number?: string;
      status?: string;
      value?: number;
      setupValue?: number;
      discount?: number;
      validUntil?: string | null;
      sentAt?: string | null;
      decidedAt?: string | null;
      terms?: string;
      notes?: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const payload: Record<string, unknown> = {};
    if (data.number !== undefined) payload["number"] = data.number;
    if (data.status !== undefined) payload["status"] = data.status;
    if (data.value !== undefined) payload["value"] = data.value;
    if (data.setupValue !== undefined) payload["setup_value"] = data.setupValue;
    if (data.discount !== undefined) payload["discount"] = data.discount;
    if (data.validUntil !== undefined) payload["valid_until"] = data.validUntil || null;
    if (data.sentAt !== undefined) payload["sent_at"] = data.sentAt || null;
    if (data.decidedAt !== undefined) payload["decided_at"] = data.decidedAt || null;
    if (data.terms !== undefined) payload["terms"] = data.terms;
    if (data.notes !== undefined) payload["notes"] = data.notes;

    if (data.id) {
      const { error } = await context.supabase.from("proposals").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    if (!data.opportunityId) throw new Error("Selecione a oportunidade da proposta");
    const number =
      (data.number ?? "").trim() ||
      `PRO-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const { data: created, error } = await context.supabase
      .from("proposals")
      .insert({
        ...payload,
        number,
        opportunity_id: data.opportunityId,
        status: data.status ?? "Enviada",
        value: data.value ?? 0,
        setup_value: data.setupValue ?? 0,
        discount: data.discount ?? 0,
        owner_id: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("opportunity_events").insert({
      opportunity_id: data.opportunityId,
      kind: "proposta",
      title: `Proposta ${number} registrada`,
      detail: `Valor ${data.value ?? 0}`,
      owner_id: context.userId,
    });
    return { id: created.id };
  });

/** Exclui uma proposta. */
export const deleteProposal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("proposals").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
