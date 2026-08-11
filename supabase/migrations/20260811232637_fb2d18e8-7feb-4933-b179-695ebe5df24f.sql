REVOKE ALL ON public.companies, public.contacts, public.opportunities, public.pipelines, public.stages FROM anon;

DROP POLICY IF EXISTS "Criar contato como dono" ON public.contacts;
DROP POLICY IF EXISTS "Editar contatos proprios ou gestor" ON public.contacts;

CREATE POLICY "Criar contato como dono" ON public.contacts FOR INSERT TO authenticated
WITH CHECK (
  (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
  AND (
    company_id IS NULL
    OR public.has_role(auth.uid(), 'gestor')
    OR EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_id = auth.uid())
  )
);

CREATE POLICY "Editar contatos proprios ou gestor" ON public.contacts FOR UPDATE TO authenticated
USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
WITH CHECK (
  (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
  AND (
    company_id IS NULL
    OR public.has_role(auth.uid(), 'gestor')
    OR EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Criar oportunidade como dono" ON public.opportunities;
DROP POLICY IF EXISTS "Editar oportunidades proprias ou gestor" ON public.opportunities;

CREATE POLICY "Criar oportunidade como dono" ON public.opportunities FOR INSERT TO authenticated
WITH CHECK (
  (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
  AND (
    public.has_role(auth.uid(), 'gestor')
    OR (
      EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_id = auth.uid())
      AND (
        contact_id IS NULL
        OR EXISTS (SELECT 1 FROM public.contacts ct WHERE ct.id = contact_id AND ct.owner_id = auth.uid())
      )
    )
  )
);

CREATE POLICY "Editar oportunidades proprias ou gestor" ON public.opportunities FOR UPDATE TO authenticated
USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
WITH CHECK (
  (owner_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))
  AND (
    public.has_role(auth.uid(), 'gestor')
    OR (
      EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_id = auth.uid())
      AND (
        contact_id IS NULL
        OR EXISTS (SELECT 1 FROM public.contacts ct WHERE ct.id = contact_id AND ct.owner_id = auth.uid())
      )
    )
  )
);