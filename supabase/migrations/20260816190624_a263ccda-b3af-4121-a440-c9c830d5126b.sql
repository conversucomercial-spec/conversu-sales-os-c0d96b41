
-- ============ ACTIVITIES ============
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'tarefa',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'media',
  status text NOT NULL DEFAULT 'pendente',
  due_at timestamptz,
  completed_at timestamptz,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver atividades proprias ou gestor" ON public.activities FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Criar atividade como dono" ON public.activities FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Editar atividades proprias ou gestor" ON public.activities FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Excluir atividades proprias ou gestor" ON public.activities FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX activities_owner_due_idx ON public.activities (owner_id, due_at);
CREATE INDEX activities_opportunity_idx ON public.activities (opportunity_id);

-- ============ MEETINGS ============
CREATE TABLE public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'agendada',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location text NOT NULL DEFAULT '',
  attendees jsonb NOT NULL DEFAULT '[]'::jsonb,
  agenda text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  next_steps text NOT NULL DEFAULT '',
  recording_url text,
  transcript_url text,
  source text NOT NULL DEFAULT 'manual',
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meetings TO authenticated;
GRANT ALL ON public.meetings TO service_role;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver reunioes proprias ou gestor" ON public.meetings FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Criar reuniao como dono" ON public.meetings FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Editar reunioes proprias ou gestor" ON public.meetings FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Excluir reunioes proprias ou gestor" ON public.meetings FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX meetings_owner_start_idx ON public.meetings (owner_id, starts_at);
CREATE INDEX meetings_opportunity_idx ON public.meetings (opportunity_id);

-- ============ TIMELINE UNIFICADA ============
CREATE TABLE public.opportunity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  kind text NOT NULL,
  title text NOT NULL,
  detail text NOT NULL DEFAULT '',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.opportunity_events TO authenticated;
GRANT ALL ON public.opportunity_events TO service_role;
ALTER TABLE public.opportunity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver eventos proprios ou gestor" ON public.opportunity_events FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Registrar evento da propria oportunidade" ON public.opportunity_events FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.opportunities o
    WHERE o.id = opportunity_id AND (o.owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))));
CREATE POLICY "Gestor exclui eventos da timeline" ON public.opportunity_events FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'gestor'));
CREATE INDEX opportunity_events_opp_idx ON public.opportunity_events (opportunity_id, occurred_at DESC);

-- ============ PROPOSTAS ============
CREATE TABLE public.proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  number text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'rascunho',
  value numeric NOT NULL DEFAULT 0,
  setup_value numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  valid_until date,
  sent_at date,
  decided_at date,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  terms text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO authenticated;
GRANT ALL ON public.proposals TO service_role;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver propostas proprias ou gestor" ON public.proposals FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Criar proposta da propria oportunidade" ON public.proposals FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.opportunities o
    WHERE o.id = opportunity_id AND (o.owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))));
CREATE POLICY "Editar propostas proprias ou gestor" ON public.proposals FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Excluir propostas proprias ou gestor" ON public.proposals FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX proposals_opportunity_idx ON public.proposals (opportunity_id);

-- ============ METAS ============
CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL DEFAULT 'vendedor',
  metric text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  target numeric NOT NULL DEFAULT 0,
  subject_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  team text,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver metas proprias ou gestor" ON public.goals FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR subject_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestor cria metas" ON public.goals FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestor edita metas" ON public.goals FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestor exclui metas" ON public.goals FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'gestor'));
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX goals_period_idx ON public.goals (period_start, period_end);

-- ============ DIAS NA ETAPA DERIVADO ============
CREATE OR REPLACE FUNCTION public.opportunity_days_in_stage(_stage_changed_at timestamptz)
RETURNS integer
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT GREATEST(0, (EXTRACT(EPOCH FROM (now() - _stage_changed_at)) / 86400)::int)
$$;
