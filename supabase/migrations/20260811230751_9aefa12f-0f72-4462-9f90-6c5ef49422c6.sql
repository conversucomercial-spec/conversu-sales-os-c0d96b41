CREATE TABLE public.pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  card_fields text[] NOT NULL DEFAULT '{}',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pipelines TO authenticated;
GRANT ALL ON public.pipelines TO service_role;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pipelines visiveis para autenticados" ON public.pipelines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestor administra pipelines" ON public.pipelines FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'gestor')) WITH CHECK (public.has_role(auth.uid(), 'gestor'));

CREATE TABLE public.stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  key text NOT NULL,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  probability integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pipeline_id, key)
);
CREATE INDEX idx_stages_pipeline ON public.stages(pipeline_id, position);
GRANT SELECT ON public.stages TO authenticated;
GRANT ALL ON public.stages TO service_role;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stages visiveis para autenticados" ON public.stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestor administra stages" ON public.stages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'gestor')) WITH CHECK (public.has_role(auth.uid(), 'gestor'));

CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_key text UNIQUE,
  name text NOT NULL,
  segment text NOT NULL DEFAULT '',
  mrr numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Prospect',
  site text,
  city text,
  employees integer,
  origin text NOT NULL DEFAULT 'outros',
  partner text,
  note text,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_companies_owner ON public.companies(owner_id);
CREATE INDEX idx_companies_origin ON public.companies(origin);
CREATE INDEX idx_companies_partner ON public.companies(partner);
CREATE INDEX idx_companies_status ON public.companies(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver empresas proprias ou gestor" ON public.companies FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Criar empresa como dono" ON public.companies FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Editar empresas proprias ou gestor" ON public.companies FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor')) WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Excluir empresas proprias ou gestor" ON public.companies FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_key text UNIQUE,
  name text NOT NULL,
  role text,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  phone text,
  whatsapp text,
  email text,
  linkedin text,
  relationship text NOT NULL DEFAULT 'Em construção',
  influence text NOT NULL DEFAULT 'Influenciador',
  last_interaction text,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_contacts_owner ON public.contacts(owner_id);
CREATE INDEX idx_contacts_company ON public.contacts(company_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver contatos proprios ou gestor" ON public.contacts FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Criar contato como dono" ON public.contacts FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Editar contatos proprios ou gestor" ON public.contacts FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor')) WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Excluir contatos proprios ou gestor" ON public.contacts FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_key text UNIQUE,
  title text NOT NULL,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  pipeline_id uuid NOT NULL REFERENCES public.pipelines(id) ON DELETE RESTRICT,
  stage_id uuid NOT NULL REFERENCES public.stages(id) ON DELETE RESTRICT,
  value numeric NOT NULL DEFAULT 0,
  probability integer NOT NULL DEFAULT 0,
  temperature text NOT NULL DEFAULT 'Morno',
  health integer NOT NULL DEFAULT 50,
  priority text NOT NULL DEFAULT 'Média',
  days_in_stage integer NOT NULL DEFAULT 0,
  stage_changed_at timestamptz NOT NULL DEFAULT now(),
  last_contact date,
  origin text NOT NULL DEFAULT 'outros',
  partner text,
  segment text,
  source text,
  next_step text,
  next_activity text,
  next_activity_date date,
  close_date date,
  summary text,
  pains jsonb NOT NULL DEFAULT '[]'::jsonb,
  objections jsonb NOT NULL DEFAULT '[]'::jsonb,
  suggestions jsonb NOT NULL DEFAULT '[]'::jsonb,
  risks jsonb NOT NULL DEFAULT '[]'::jsonb,
  sales_arguments jsonb NOT NULL DEFAULT '[]'::jsonb,
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  files jsonb NOT NULL DEFAULT '[]'::jsonb,
  proposals jsonb NOT NULL DEFAULT '[]'::jsonb,
  meetings jsonb NOT NULL DEFAULT '[]'::jsonb,
  custom jsonb NOT NULL DEFAULT '{}'::jsonb,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_opportunities_owner ON public.opportunities(owner_id);
CREATE INDEX idx_opportunities_pipeline ON public.opportunities(pipeline_id);
CREATE INDEX idx_opportunities_stage ON public.opportunities(stage_id);
CREATE INDEX idx_opportunities_company ON public.opportunities(company_id);
CREATE INDEX idx_opportunities_contact ON public.opportunities(contact_id);
CREATE INDEX idx_opportunities_origin ON public.opportunities(origin);
CREATE INDEX idx_opportunities_partner ON public.opportunities(partner);
CREATE INDEX idx_opportunities_close_date ON public.opportunities(close_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver oportunidades proprias ou gestor" ON public.opportunities FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Criar oportunidade como dono" ON public.opportunities FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Editar oportunidades proprias ou gestor" ON public.opportunities FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor')) WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Excluir oportunidades proprias ou gestor" ON public.opportunities FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'));
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pipelines_updated_at BEFORE UPDATE ON public.pipelines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stages_updated_at BEFORE UPDATE ON public.stages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();