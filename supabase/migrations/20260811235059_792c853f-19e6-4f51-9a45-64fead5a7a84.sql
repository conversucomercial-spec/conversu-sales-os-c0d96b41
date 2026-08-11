-- 1. Campos de cadência LinkedIn na oportunidade
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_status TEXT NOT NULL DEFAULT 'nao_iniciado',
  ADD COLUMN IF NOT EXISTS linkedin_step TEXT NOT NULL DEFAULT 'prospect_identificado',
  ADD COLUMN IF NOT EXISTS linkedin_last_action_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS linkedin_next_action TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_next_action_at TIMESTAMPTZ;

-- 2. Eventos de prospecção (histórico imutável para vendedor)
CREATE TABLE IF NOT EXISTS public.prospecting_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'linkedin',
  type TEXT NOT NULL,
  note TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prospecting_events_opportunity_idx
  ON public.prospecting_events (opportunity_id, occurred_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prospecting_events TO authenticated;
GRANT ALL ON public.prospecting_events TO service_role;

ALTER TABLE public.prospecting_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver eventos proprios ou gestor"
  ON public.prospecting_events FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Registrar evento como dono da oportunidade"
  ON public.prospecting_events FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_id
        AND (o.owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
    )
  );

CREATE POLICY "Gestor edita eventos"
  ON public.prospecting_events FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Gestor exclui eventos"
  ON public.prospecting_events FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'gestor'));

CREATE OR REPLACE FUNCTION public.prospecting_events_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.opportunity_id IS DISTINCT FROM OLD.opportunity_id
     OR NEW.owner_id IS DISTINCT FROM OLD.owner_id
     OR NEW.occurred_at IS DISTINCT FROM OLD.occurred_at THEN
    RAISE EXCEPTION 'Historico de prospeccao e imutavel';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prospecting_events_guard ON public.prospecting_events;
CREATE TRIGGER prospecting_events_guard
  BEFORE UPDATE ON public.prospecting_events
  FOR EACH ROW EXECUTE FUNCTION public.prospecting_events_guard();

-- 3. Discovery por oportunidade
CREATE TABLE IF NOT EXISTS public.discoveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL UNIQUE REFERENCES public.opportunities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'nao_iniciado',
  objective TEXT NOT NULL DEFAULT '',
  current_scenario TEXT NOT NULL DEFAULT '',
  pains TEXT NOT NULL DEFAULT '',
  volume TEXT NOT NULL DEFAULT '',
  team TEXT NOT NULL DEFAULT '',
  channels TEXT NOT NULL DEFAULT '',
  journeys TEXT NOT NULL DEFAULT '',
  processes TEXT NOT NULL DEFAULT '',
  integrations TEXT NOT NULL DEFAULT '',
  systems TEXT NOT NULL DEFAULT '',
  bottlenecks TEXT NOT NULL DEFAULT '',
  impacts TEXT NOT NULL DEFAULT '',
  opportunities_found TEXT NOT NULL DEFAULT '',
  conversu_fit TEXT NOT NULL DEFAULT '',
  validated_scope TEXT NOT NULL DEFAULT '',
  next_steps TEXT NOT NULL DEFAULT '',
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.discoveries TO authenticated;
GRANT ALL ON public.discoveries TO service_role;

ALTER TABLE public.discoveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver discovery proprio ou gestor"
  ON public.discoveries FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Criar discovery da propria oportunidade"
  ON public.discoveries FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_id
        AND (o.owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
    )
  );

CREATE POLICY "Editar discovery proprio ou gestor"
  ON public.discoveries FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Excluir discovery proprio ou gestor"
  ON public.discoveries FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));

DROP TRIGGER IF EXISTS update_discoveries_updated_at ON public.discoveries;
CREATE TRIGGER update_discoveries_updated_at
  BEFORE UPDATE ON public.discoveries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Documentos / atas ligados à oportunidade
CREATE TABLE IF NOT EXISTS public.discovery_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  doc_date DATE,
  url TEXT,
  kind TEXT NOT NULL DEFAULT 'ata',
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS discovery_documents_opportunity_idx
  ON public.discovery_documents (opportunity_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.discovery_documents TO authenticated;
GRANT ALL ON public.discovery_documents TO service_role;

ALTER TABLE public.discovery_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver documentos proprios ou gestor"
  ON public.discovery_documents FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Criar documento da propria oportunidade"
  ON public.discovery_documents FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_id
        AND (o.owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
    )
  );

CREATE POLICY "Editar documentos proprios ou gestor"
  ON public.discovery_documents FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Excluir documentos proprios ou gestor"
  ON public.discovery_documents FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));

DROP TRIGGER IF EXISTS update_discovery_documents_updated_at ON public.discovery_documents;
CREATE TRIGGER update_discovery_documents_updated_at
  BEFORE UPDATE ON public.discovery_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();