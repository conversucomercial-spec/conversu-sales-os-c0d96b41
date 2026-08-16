import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TeamMember = {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  role: "gestor" | "vendedor" | null;
};

/** Equipe comercial com papéis. Somente o administrador enxerga a lista completa. */
export const listTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ isAdmin: boolean; members: TeamMember[] }> => {
    const { isGestor } = await import("@/lib/authz.server");
    const admin = await isGestor(context.supabase, context.userId);
    if (!admin) return { isAdmin: false, members: [] };

    const [profilesRes, rolesRes] = await Promise.all([
      context.supabase.from("profiles").select("id, full_name, email, job_title").order("full_name"),
      context.supabase.from("user_roles").select("user_id, role"),
    ]);
    if (profilesRes.error) throw new Error(profilesRes.error.message);
    if (rolesRes.error) throw new Error(rolesRes.error.message);

    const roleByUser = new Map((rolesRes.data ?? []).map((r) => [r.user_id, r.role]));
    return {
      isAdmin: true,
      members: (profilesRes.data ?? []).map((p) => ({
        id: p.id,
        fullName: p.full_name,
        email: p.email ?? "",
        jobTitle: p.job_title ?? "",
        role: (roleByUser.get(p.id) as "gestor" | "vendedor" | undefined) ?? null,
      })),
    };
  });

/**
 * Cria (ou convida) a conta de um vendedor. Somente o administrador executa.
 * Com senha informada, a conta já nasce ativa; sem senha, é enviado um convite.
 */
export const createSeller = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { email: string; fullName: string; jobTitle?: string; password?: string }) => input,
  )
  .handler(async ({ data, context }) => {
    const { assertGestor } = await import("@/lib/authz.server");
    await assertGestor(context.supabase, context.userId);

    const email = data.email.trim().toLowerCase();
    const fullName = data.fullName.trim();
    if (!email || !email.includes("@")) throw new Error("Informe um e-mail válido");
    if (!fullName) throw new Error("Informe o nome do vendedor");
    if (data.password && data.password.length < 8) {
      throw new Error("A senha precisa ter ao menos 8 caracteres");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const metadata = { full_name: fullName, job_title: data.jobTitle || "Executivo(a) comercial" };

    let userId: string;
    if (data.password) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: data.password,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (error || !created.user) throw new Error(error?.message ?? "Não foi possível criar a conta");
      userId = created.user.id;
    } else {
      const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: metadata,
      });
      if (error || !invited.user) throw new Error(error?.message ?? "Não foi possível enviar o convite");
      userId = invited.user.id;
    }

    const { error: roleError } = await context.supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "vendedor" });
    if (roleError && roleError.code !== "23505") throw new Error(roleError.message);

    return { id: userId, invited: !data.password };
  });

/** Define o papel de um usuário (vendedor ou gestor). */
export const setMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; role: "gestor" | "vendedor" }) => input)
  .handler(async ({ data, context }) => {
    const { assertGestor } = await import("@/lib/authz.server");
    await assertGestor(context.supabase, context.userId);
    const { error: delError } = await context.supabase
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId);
    if (delError) throw new Error(delError.message);
    const { error } = await context.supabase
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });
    if (error && error.code !== "23505") throw new Error(error.message);
    return { ok: true };
  });

/** Revoga o acesso de um usuário ao CRM, sem apagar o histórico comercial. */
export const revokeMemberAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data, context }) => {
    const { assertGestor } = await import("@/lib/authz.server");
    await assertGestor(context.supabase, context.userId);
    if (data.userId === context.userId) throw new Error("Você não pode revogar o próprio acesso");
    const { error } = await context.supabase
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
