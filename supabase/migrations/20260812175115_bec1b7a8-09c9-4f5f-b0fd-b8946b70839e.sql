ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS setup_value numeric,
  ADD COLUMN IF NOT EXISTS loss_reason text,
  ADD COLUMN IF NOT EXISTS owner_label text,
  ADD COLUMN IF NOT EXISTS meeting jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.opportunities ALTER COLUMN health DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS companies_legacy_key_key ON public.companies (legacy_key) WHERE legacy_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS contacts_legacy_key_key ON public.contacts (legacy_key) WHERE legacy_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS opportunities_legacy_key_key ON public.opportunities (legacy_key) WHERE legacy_key IS NOT NULL;