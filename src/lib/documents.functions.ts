import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "documents";

export type DocumentRecord = {
  id: string;
  name: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  category: string;
  companyId: string | null;
  opportunityId: string | null;
  meetingId: string | null;
  ownerName: string;
  createdAt: string;
};

type Scope = { companyId?: string; opportunityId?: string; meetingId?: string };

/** Documentos vinculados a uma empresa, oportunidade ou reunião. */
export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Scope) => input)
  .handler(async ({ data, context }): Promise<DocumentRecord[]> => {
    let q = context.supabase
      .from("documents")
      .select("*, owner:profiles!documents_owner_id_fkey(full_name)")
      .order("created_at", { ascending: false });
    if (data.companyId) q = q.eq("company_id", data.companyId);
    if (data.opportunityId) q = q.eq("opportunity_id", data.opportunityId);
    if (data.meetingId) q = q.eq("meeting_id", data.meetingId);
    if (!data.companyId && !data.opportunityId && !data.meetingId) return [];

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      storagePath: r.storage_path,
      mimeType: r.mime_type,
      sizeBytes: Number(r.size_bytes ?? 0),
      category: r.category,
      companyId: r.company_id,
      opportunityId: r.opportunity_id,
      meetingId: r.meeting_id,
      ownerName: (r as { owner?: { full_name?: string } | null }).owner?.full_name ?? "Responsável",
      createdAt: r.created_at,
    }));
  });

/** Gera uma URL assinada de upload (o arquivo nunca passa pelo banco). */
export const createDocumentUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string }) => input)
  .handler(async ({ data, context }) => {
    const safe = data.name.replace(/[^\w.-]+/g, "-").slice(-80);
    const path = `${context.userId}/${crypto.randomUUID()}-${safe}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error(error?.message ?? "Falha ao preparar o upload");
    return { path, token: signed.token };
  });

/** Registra os metadados do arquivo já enviado ao armazenamento. */
export const registerDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      name: string;
      storagePath: string;
      mimeType: string;
      sizeBytes: number;
      category: string;
      companyId?: string | null;
      opportunityId?: string | null;
      meetingId?: string | null;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("documents").insert({
      name: data.name,
      storage_path: data.storagePath,
      mime_type: data.mimeType || "application/octet-stream",
      size_bytes: data.sizeBytes,
      category: data.category,
      company_id: data.companyId ?? null,
      opportunity_id: data.opportunityId ?? null,
      meeting_id: data.meetingId ?? null,
      owner_id: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** URL assinada temporária para visualizar/baixar o documento. */
export const getDocumentUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("documents")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Documento não encontrado ou sem permissão");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(row.storage_path, 300);
    if (signError || !signed) throw new Error(signError?.message ?? "Falha ao gerar o link");
    return { url: signed.signedUrl };
  });

/** Remove o registro e o arquivo correspondente do armazenamento. */
export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: row, error: readError } = await context.supabase
      .from("documents")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!row) throw new Error("Documento não encontrado ou sem permissão");
    const { error } = await context.supabase.from("documents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.storage.from(BUCKET).remove([row.storage_path]);
    return { ok: true };
  });
