import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { slugify } from "@/lib/tags";

/** Cria uma tag personalizada do usuário autenticado. */
export const createTag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string; color?: string | null }) => input)
  .handler(async ({ data, context }) => {
    const name = data.name.trim();
    if (!name) throw new Error("Informe o nome da tag");
    const slug = slugify(name);
    if (!slug) throw new Error("Nome de tag inválido");
    const { data: row, error } = await context.supabase
      .from("tags")
      .insert({ name, slug, color: data.color ?? null, owner_id: context.userId })
      .select("id, name, slug, color")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("Já existe uma tag com esse nome");
      throw new Error(error.message);
    }
    return row;
  });

/** Renomeia ou troca a cor de uma tag existente (RLS garante o escopo). */
export const updateTag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; name?: string; color?: string | null }) => input)
  .handler(async ({ data, context }) => {
    const patch: { name?: string; slug?: string; color?: string | null } = {};
    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) throw new Error("Informe o nome da tag");
      patch.name = name;
      patch.slug = slugify(name);
    }
    if (data.color !== undefined) patch.color = data.color;
    const { error } = await context.supabase.from("tags").update(patch).eq("id", data.id);
    if (error) {
      if (error.code === "23505") throw new Error("Já existe uma tag com esse nome");
      throw new Error(error.message);
    }
    return { ok: true };
  });

/** Exclui uma tag e todas as suas associações (RLS garante o escopo). */
export const deleteTag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("tags").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Associa uma tag a uma oportunidade. */
export const addOpportunityTag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { opportunityId: string; tagId: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("opportunity_tags").insert({
      opportunity_id: data.opportunityId,
      tag_id: data.tagId,
      owner_id: context.userId,
    });
    if (error && error.code !== "23505") throw new Error(error.message);
    return { ok: true };
  });

/** Remove a associação entre uma tag e uma oportunidade. */
export const removeOpportunityTag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { opportunityId: string; tagId: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("opportunity_tags")
      .delete()
      .eq("opportunity_id", data.opportunityId)
      .eq("tag_id", data.tagId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
