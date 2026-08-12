CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  color text,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX tags_owner_slug_key ON public.tags (owner_id, slug);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags_select" ON public.tags FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "tags_insert" ON public.tags FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "tags_update" ON public.tags FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "tags_delete" ON public.tags FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.opportunity_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX opportunity_tags_unique ON public.opportunity_tags (opportunity_id, tag_id);
CREATE INDEX opportunity_tags_tag_idx ON public.opportunity_tags (tag_id);

GRANT SELECT, INSERT, DELETE ON public.opportunity_tags TO authenticated;
GRANT ALL ON public.opportunity_tags TO service_role;

ALTER TABLE public.opportunity_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "opportunity_tags_select" ON public.opportunity_tags FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "opportunity_tags_insert" ON public.opportunity_tags FOR INSERT TO authenticated
  WITH CHECK (
    (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
    AND EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_id
        AND (o.owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
    )
    AND EXISTS (
      SELECT 1 FROM public.tags t
      WHERE t.id = tag_id
        AND (t.owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
    )
  );

CREATE POLICY "opportunity_tags_delete" ON public.opportunity_tags FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));