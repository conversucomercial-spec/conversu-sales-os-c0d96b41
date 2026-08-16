import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Garante que o chamador é gestor (administrador). Usa o cliente autenticado
 * do próprio usuário, nunca o cliente privilegiado.
 */
export async function assertGestor(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "gestor",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Apenas o administrador pode alterar esta configuração");
}

/** Versão booleana, para telas que apenas exibem ou escondem uma seção. */
export async function isGestor(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "gestor" });
  return data === true;
}
