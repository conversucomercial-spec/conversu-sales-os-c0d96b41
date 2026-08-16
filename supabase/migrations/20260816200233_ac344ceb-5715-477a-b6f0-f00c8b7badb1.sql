-- 1. Notificações
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  detail text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'geral',
  entity_type text,
  entity_id uuid,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications_insert_own" ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX notifications_user_unread_idx ON public.notifications (user_id, read_at, created_at DESC);

-- Notificação automática a partir da timeline da oportunidade
CREATE OR REPLACE FUNCTION public.notify_opportunity_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  op_owner uuid;
BEGIN
  SELECT owner_id INTO op_owner FROM public.opportunities WHERE id = NEW.opportunity_id;
  IF op_owner IS NULL THEN RETURN NEW; END IF;
  INSERT INTO public.notifications (user_id, title, detail, kind, entity_type, entity_id, link)
  VALUES (op_owner, NEW.title, COALESCE(NEW.detail, ''), NEW.kind, 'opportunity', NEW.opportunity_id, '/pipeline');
  RETURN NEW;
END;
$$;
CREATE TRIGGER notify_on_opportunity_event
AFTER INSERT ON public.opportunity_events
FOR EACH ROW EXECUTE FUNCTION public.notify_opportunity_event();

-- 2. Documentos/anexos (metadados; arquivo fica no Storage)
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  mime_type text NOT NULL DEFAULT 'application/octet-stream',
  size_bytes bigint NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'outro',
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE CASCADE,
  meeting_id uuid REFERENCES public.meetings(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_select" ON public.documents FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "documents_insert" ON public.documents FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "documents_update" ON public.documents FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor')) WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "documents_delete" ON public.documents FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX documents_company_idx ON public.documents (company_id);
CREATE INDEX documents_opportunity_idx ON public.documents (opportunity_id);
CREATE INDEX documents_meeting_idx ON public.documents (meeting_id);

-- 3. Tags também em empresas e contatos (mesmo padrão de opportunity_tags)
CREATE TABLE public.company_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, tag_id)
);
GRANT SELECT, INSERT, DELETE ON public.company_tags TO authenticated;
GRANT ALL ON public.company_tags TO service_role;
ALTER TABLE public.company_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_tags_select" ON public.company_tags FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "company_tags_insert" ON public.company_tags FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "company_tags_delete" ON public.company_tags FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));

CREATE TABLE public.contact_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contact_id, tag_id)
);
GRANT SELECT, INSERT, DELETE ON public.contact_tags TO authenticated;
GRANT ALL ON public.contact_tags TO service_role;
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_tags_select" ON public.contact_tags FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "contact_tags_insert" ON public.contact_tags FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "contact_tags_delete" ON public.contact_tags FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));