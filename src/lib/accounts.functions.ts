import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { TablesUpdate } from "@/integrations/supabase/types";

/** Cria uma empresa da carteira do usuário. */
export const createCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      name: string;
      segment?: string;
      status?: string;
      mrr?: number;
      site?: string;
      city?: string;
      employees?: number;
      origin?: string;
      partner?: string;
      note?: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    if (!data.name.trim()) throw new Error("Informe o nome da empresa");
    const { data: created, error } = await context.supabase
      .from("companies")
      .insert({
        name: data.name.trim(),
        segment: data.segment || "—",
        status: data.status || "Prospect",
        mrr: data.mrr ?? 0,
        site: data.site ?? "",
        city: data.city ?? "",
        employees: data.employees ?? 0,
        origin: data.origin || "outbound",
        partner: data.partner || null,
        note: data.note ?? "",
        owner_id: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: created.id };
  });

/** Atualiza os dados cadastrais de uma empresa. */
export const updateCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id: string;
      name?: string;
      segment?: string;
      status?: string;
      mrr?: number;
      site?: string;
      city?: string;
      employees?: number;
      origin?: string;
      partner?: string;
      note?: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const patch: TablesUpdate<"companies"> = {};
    if (rest.name !== undefined) patch["name"] = rest.name;
    if (rest.segment !== undefined) patch["segment"] = rest.segment;
    if (rest.status !== undefined) patch["status"] = rest.status;
    if (rest.mrr !== undefined) patch["mrr"] = rest.mrr;
    if (rest.site !== undefined) patch["site"] = rest.site;
    if (rest.city !== undefined) patch["city"] = rest.city;
    if (rest.employees !== undefined) patch["employees"] = rest.employees;
    if (rest.origin !== undefined) patch["origin"] = rest.origin;
    if (rest.partner !== undefined) patch["partner"] = rest.partner || null;
    if (rest.note !== undefined) patch["note"] = rest.note;
    const { error } = await context.supabase.from("companies").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Exclui uma empresa. Bloqueia quando ainda existem oportunidades vinculadas. */
export const deleteCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { count, error: countError } = await context.supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("company_id", data.id);
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0)
      throw new Error("Esta empresa tem oportunidades vinculadas. Exclua ou mova antes.");
    const { error } = await context.supabase.from("companies").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Cria um contato ligado a uma empresa. */
export const createContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      name: string;
      companyId?: string | null;
      role?: string;
      phone?: string;
      whatsapp?: string;
      email?: string;
      linkedin?: string;
      relationship?: string;
      influence?: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    if (!data.name.trim()) throw new Error("Informe o nome do contato");
    const { data: created, error } = await context.supabase
      .from("contacts")
      .insert({
        name: data.name.trim(),
        company_id: data.companyId || null,
        role: data.role ?? "",
        phone: data.phone ?? "",
        whatsapp: data.whatsapp ?? "",
        email: data.email ?? "",
        linkedin: data.linkedin ?? "",
        relationship: data.relationship || "Neutro",
        influence: data.influence || "Média",
        owner_id: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: created.id };
  });

/** Atualiza um contato. */
export const updateContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id: string;
      name?: string;
      companyId?: string | null;
      role?: string;
      phone?: string;
      whatsapp?: string;
      email?: string;
      linkedin?: string;
      relationship?: string;
      influence?: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const patch: TablesUpdate<"contacts"> = {};
    if (rest.name !== undefined) patch["name"] = rest.name;
    if (rest.companyId !== undefined) patch["company_id"] = rest.companyId || null;
    if (rest.role !== undefined) patch["role"] = rest.role;
    if (rest.phone !== undefined) patch["phone"] = rest.phone;
    if (rest.whatsapp !== undefined) patch["whatsapp"] = rest.whatsapp;
    if (rest.email !== undefined) patch["email"] = rest.email;
    if (rest.linkedin !== undefined) patch["linkedin"] = rest.linkedin;
    if (rest.relationship !== undefined) patch["relationship"] = rest.relationship;
    if (rest.influence !== undefined) patch["influence"] = rest.influence;
    const { error } = await context.supabase.from("contacts").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Exclui um contato. */
export const deleteContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("contacts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
