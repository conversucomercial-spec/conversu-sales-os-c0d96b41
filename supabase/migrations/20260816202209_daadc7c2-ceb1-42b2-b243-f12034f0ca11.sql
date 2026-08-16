-- 1. Documentos: link externo e vínculo com proposta
ALTER TABLE public.documents ALTER COLUMN storage_path DROP NOT NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS external_url text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS proposal_id uuid REFERENCES public.proposals(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS documents_proposal_id_idx ON public.documents(proposal_id);

CREATE OR REPLACE FUNCTION public.documents_source_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (NEW.storage_path IS NULL OR NEW.storage_path = '') AND (NEW.external_url IS NULL OR NEW.external_url = '') THEN
    RAISE EXCEPTION 'Informe um arquivo ou um link para o documento';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS documents_source_guard ON public.documents;
CREATE TRIGGER documents_source_guard
BEFORE INSERT OR UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.documents_source_guard();

-- 2. Funis e etapas configuráveis
ALTER TABLE public.pipelines ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
ALTER TABLE public.pipelines ADD COLUMN IF NOT EXISTS updated_by uuid;
ALTER TABLE public.stages ADD COLUMN IF NOT EXISTS criteria text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.stages ADD COLUMN IF NOT EXISTS playbook jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.stages ADD COLUMN IF NOT EXISTS updated_by uuid;

DROP POLICY IF EXISTS "Gestor gerencia funis" ON public.pipelines;
CREATE POLICY "Gestor gerencia funis" ON public.pipelines
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'gestor'))
WITH CHECK (public.has_role(auth.uid(), 'gestor'));

DROP POLICY IF EXISTS "Gestor gerencia etapas" ON public.stages;
CREATE POLICY "Gestor gerencia etapas" ON public.stages
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'gestor'))
WITH CHECK (public.has_role(auth.uid(), 'gestor'));

-- 3. Campos personalizados
CREATE TABLE public.custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity text NOT NULL CHECK (entity IN ('opportunity','company','contact')),
  key text NOT NULL,
  label text NOT NULL,
  type text NOT NULL DEFAULT 'texto' CHECK (type IN ('texto','numero','moeda','data','lista','booleano','texto_longo')),
  options text[] NOT NULL DEFAULT '{}',
  required boolean NOT NULL DEFAULT false,
  pipeline_keys text[] NOT NULL DEFAULT '{}',
  position integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity, key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_fields TO authenticated;
GRANT ALL ON public.custom_fields TO service_role;
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campos visiveis para autenticados" ON public.custom_fields
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestor gerencia campos" ON public.custom_fields
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'gestor'))
WITH CHECK (public.has_role(auth.uid(), 'gestor'));
CREATE TRIGGER update_custom_fields_updated_at
BEFORE UPDATE ON public.custom_fields
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Listas de apoio configuráveis
CREATE TABLE public.option_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_key text NOT NULL,
  value text NOT NULL,
  label text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (list_key, value)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.option_lists TO authenticated;
GRANT ALL ON public.option_lists TO service_role;
ALTER TABLE public.option_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listas visiveis para autenticados" ON public.option_lists
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestor gerencia listas" ON public.option_lists
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'gestor'))
WITH CHECK (public.has_role(auth.uid(), 'gestor'));
CREATE TRIGGER update_option_lists_updated_at
BEFORE UPDATE ON public.option_lists
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Automações configuráveis
CREATE TABLE public.automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  trigger_type text NOT NULL CHECK (trigger_type IN ('etapa_alterada','parada_dias','reuniao_realizada','proposta_vencendo','oportunidade_criada')),
  trigger_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  action_type text NOT NULL CHECK (action_type IN ('notificacao','atividade','campo')),
  action_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_rules TO authenticated;
GRANT ALL ON public.automation_rules TO service_role;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Automacoes visiveis para autenticados" ON public.automation_rules
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestor gerencia automacoes" ON public.automation_rules
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'gestor'))
WITH CHECK (public.has_role(auth.uid(), 'gestor'));
CREATE TRIGGER update_automation_rules_updated_at
BEFORE UPDATE ON public.automation_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Papéis: sem liberação automática; somente gestor concede
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email, job_title)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'job_title', 'Executivo(a) comercial')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_owner_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND lower(NEW.email) = 'matheus@useconversu.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'gestor')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_owner ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_owner
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_owner_admin_role();

DROP TRIGGER IF EXISTS on_auth_user_confirmed_grant_owner ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_grant_owner
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_owner_admin_role();

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'gestor'
FROM auth.users u
WHERE lower(u.email) = 'matheus@useconversu.com'
  AND u.email_confirmed_at IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

DROP POLICY IF EXISTS "Gestor concede papeis" ON public.user_roles;
CREATE POLICY "Gestor concede papeis" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'gestor'));

DROP POLICY IF EXISTS "Gestor remove papeis" ON public.user_roles;
CREATE POLICY "Gestor remove papeis" ON public.user_roles
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'gestor'));