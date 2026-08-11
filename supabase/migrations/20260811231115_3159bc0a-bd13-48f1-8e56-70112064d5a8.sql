INSERT INTO public.pipelines (key, name, description, card_fields, position) VALUES
('outbound', 'Outbound', 'Prospecção ativa conduzida pelo time comercial', ARRAY['company','value','priority','temperature','probability','health','daysInStage','origin','lastActivity','nextActivity','owner']::text[], 0),
('inbound', 'Inbound', 'Demanda gerada por marketing e site', ARRAY['company','value','temperature','probability','origin','nextActivity','owner']::text[], 1),
('enterprise', 'Enterprise', 'Contas complexas com ciclo longo e múltiplos decisores', ARRAY['company','contact','value','priority','probability','health','daysInStage','closeDate','owner']::text[], 2),
('parcerias', 'Parcerias', 'Oportunidades originadas por parceiros e indicações', ARRAY['company','value','partner','origin','probability','nextActivity','owner']::text[], 3)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.stages (pipeline_id, key, name, position, probability)
SELECT pl.id, v.key, v.name, v.position, v.probability FROM (VALUES
('outbound', 'prospeccao', 'Prospecção', 0, 10),
('outbound', 'contato', 'Contato Inicial', 1, 20),
('outbound', 'qualificacao', 'Qualificação', 2, 35),
('outbound', 'diagnostico', 'Diagnóstico', 3, 45),
('outbound', 'demonstracao', 'Demonstração', 4, 60),
('outbound', 'proposta', 'Proposta', 5, 72),
('outbound', 'negociacao', 'Negociação', 6, 85),
('outbound', 'ganho', 'Fechado Ganho', 7, 100),
('outbound', 'perdido', 'Fechado Perdido', 8, 0),
('inbound', 'contato', 'Contato Inicial', 0, 20),
('inbound', 'qualificacao', 'Qualificação', 1, 35),
('inbound', 'demonstracao', 'Demonstração', 2, 60),
('inbound', 'proposta', 'Proposta', 3, 72),
('inbound', 'negociacao', 'Negociação', 4, 85),
('inbound', 'ganho', 'Fechado Ganho', 5, 100),
('inbound', 'perdido', 'Fechado Perdido', 6, 0),
('enterprise', 'prospeccao', 'Prospecção', 0, 10),
('enterprise', 'qualificacao', 'Qualificação', 1, 35),
('enterprise', 'diagnostico', 'Diagnóstico', 2, 45),
('enterprise', 'demonstracao', 'Demonstração', 3, 60),
('enterprise', 'proposta', 'Proposta', 4, 72),
('enterprise', 'negociacao', 'Negociação', 5, 85),
('enterprise', 'ganho', 'Fechado Ganho', 6, 100),
('enterprise', 'perdido', 'Fechado Perdido', 7, 0),
('parcerias', 'contato', 'Contato Inicial', 0, 20),
('parcerias', 'qualificacao', 'Qualificação', 1, 35),
('parcerias', 'proposta', 'Proposta', 2, 72),
('parcerias', 'negociacao', 'Negociação', 3, 85),
('parcerias', 'ganho', 'Fechado Ganho', 4, 100),
('parcerias', 'perdido', 'Fechado Perdido', 5, 0)
) AS v(pkey, key, name, position, probability) JOIN public.pipelines pl ON pl.key = v.pkey
ON CONFLICT (pipeline_id, key) DO NOTHING;

INSERT INTO public.companies (legacy_key, name, segment, mrr, status, site, city, employees, origin, partner, note, owner_id)
SELECT v.*, (SELECT id FROM public.profiles ORDER BY created_at, id LIMIT 1) FROM (VALUES
('emp-1', 'Nexora Tecnologia', 'SaaS', 5200, 'Cliente', 'nexora.com.br', 'São Paulo', 40, 'inbound', null, 'Conta prioritária do trimestre.'),
('emp-2', 'Grupo Aurora', 'Indústria', 23200, 'Prospect', 'grupo.com.br', 'Curitiba', 120, 'outbound', null, 'Decisão depende do board.'),
('emp-3', 'Vetra Indústria', 'Varejo', 10000, 'Prospect', 'vetra.com.br', 'Belo Horizonte', 320, 'indicacao', 'Nucleo Digital', 'Expansão prevista para o próximo ciclo.'),
('emp-4', 'Lumen Saúde', 'Serviços', 28000, 'Em negociação', 'lumen.com.br', 'Recife', 850, 'outros', null, 'Relacionamento aquecido via indicação.'),
('emp-5', 'Bright Varejo', 'Saúde', 14800, 'Prospect', 'bright.com.br', 'Porto Alegre', 1500, 'parceiro', 'Alpha Consultoria', 'Conta prioritária do trimestre.'),
('emp-6', 'Orbita Labs', 'Educação', 32800, 'Cliente', 'orbita.com.br', 'São Paulo', 40, 'inbound', null, 'Decisão depende do board.'),
('emp-7', 'Cortex Systems', 'SaaS', 19600, 'Em negociação', 'cortex.com.br', 'Curitiba', 120, 'inbound', null, 'Expansão prevista para o próximo ciclo.'),
('emp-8', 'Vialog Transportes', 'Indústria', 6400, 'Prospect', 'vialog.com.br', 'Belo Horizonte', 320, 'outbound', null, 'Relacionamento aquecido via indicação.'),
('emp-9', 'Solaris Energia', 'Varejo', 24400, 'Prospect', 'solaris.com.br', 'Recife', 850, 'indicacao', 'Alpha Consultoria', 'Conta prioritária do trimestre.'),
('emp-10', 'Kaizen Educação', 'Serviços', 11200, 'Em negociação', 'kaizen.com.br', 'Porto Alegre', 1500, 'outros', null, 'Decisão depende do board.'),
('emp-11', 'Prisma Consultoria', 'Saúde', 29200, 'Cliente', 'prisma.com.br', 'São Paulo', 40, 'parceiro', 'Nucleo Digital', 'Expansão prevista para o próximo ciclo.'),
('emp-12', 'Fluxo Digital', 'Educação', 16000, 'Prospect', 'fluxo.com.br', 'Curitiba', 120, 'inbound', null, 'Relacionamento aquecido via indicação.'),
('emp-13', 'Atlas Alimentos', 'SaaS', 34000, 'Em negociação', 'atlas.com.br', 'Belo Horizonte', 320, 'inbound', null, 'Conta prioritária do trimestre.'),
('emp-14', 'Norvik Seguros', 'Indústria', 20800, 'Prospect', 'norvik.com.br', 'Recife', 850, 'outbound', null, 'Decisão depende do board.'),
('emp-15', 'Zenit Software', 'Varejo', 7600, 'Prospect', 'zenit.com.br', 'Porto Alegre', 1500, 'indicacao', 'Nucleo Digital', 'Expansão prevista para o próximo ciclo.'),
('emp-16', 'Meridian Bank', 'Serviços', 25600, 'Cliente', 'meridian.com.br', 'São Paulo', 40, 'outros', null, 'Relacionamento aquecido via indicação.'),
('emp-17', 'Terrano Agro', 'Saúde', 12400, 'Prospect', 'terrano.com.br', 'Curitiba', 120, 'parceiro', 'Alpha Consultoria', 'Conta prioritária do trimestre.'),
('emp-18', 'Vibrant Mídia', 'Educação', 30400, 'Prospect', 'vibrant.com.br', 'Belo Horizonte', 320, 'inbound', null, 'Decisão depende do board.')
) AS v(legacy_key, name, segment, mrr, status, site, city, employees, origin, partner, note)
ON CONFLICT (legacy_key) DO NOTHING;

INSERT INTO public.contacts (legacy_key, name, role, company_id, phone, whatsapp, email, linkedin, relationship, influence, last_interaction, owner_id)
SELECT v.legacy_key, v.name, v.role, co.id, v.phone, v.whatsapp, v.email, v.linkedin, v.relationship, v.influence, v.last_interaction, (SELECT id FROM public.profiles ORDER BY created_at, id LIMIT 1) FROM (VALUES
('ct-1', 'Ana Beatriz Rocha', 'CEO', 'emp-1', '+55 11 96729-3486', '+55 11 95648-1324', 'ana@nexora.com.br', 'linkedin.com/in/ana-beatriz-rocha', 'Forte', 'Decisor', 'há 1 dias'),
('ct-2', 'Carlos Menezes', 'Diretor Comercial', 'emp-2', '+55 11 95648-2405', '+55 11 94567-9243', 'carlos@grupo.com.br', 'linkedin.com/in/carlos-menezes', 'Neutro', 'Influenciador', 'há 2 dias'),
('ct-3', 'Débora Lima', 'Head de Vendas', 'emp-3', '+55 11 94567-1324', '+55 11 93486-8162', 'débora@vetra.com.br', 'linkedin.com/in/débora-lima', 'Em construção', 'Usuário', 'há 3 dias'),
('ct-4', 'Eduardo Farias', 'CFO', 'emp-4', '+55 11 93486-9243', '+55 11 92405-7081', 'eduardo@lumen.com.br', 'linkedin.com/in/eduardo-farias', 'Forte', 'Decisor', 'há 4 dias'),
('ct-5', 'Fernanda Alves', 'Gerente de Operações', 'emp-5', '+55 11 92405-8162', '+55 11 91324-6000', 'fernanda@bright.com.br', 'linkedin.com/in/fernanda-alves', 'Neutro', 'Influenciador', 'há 5 dias'),
('ct-6', 'Gustavo Pinto', 'COO', 'emp-6', '+55 11 91324-7081', '+55 11 99243-4919', 'gustavo@orbita.com.br', 'linkedin.com/in/gustavo-pinto', 'Em construção', 'Usuário', 'há 6 dias'),
('ct-7', 'Helena Castro', 'Head de Marketing', 'emp-7', '+55 11 99243-6000', '+55 11 98162-3838', 'helena@cortex.com.br', 'linkedin.com/in/helena-castro', 'Forte', 'Decisor', 'há 7 dias'),
('ct-8', 'Igor Marques', 'CEO', 'emp-8', '+55 11 98162-4919', '+55 11 97081-2757', 'igor@vialog.com.br', 'linkedin.com/in/igor-marques', 'Neutro', 'Influenciador', 'há 8 dias'),
('ct-9', 'Joana Ribeiro', 'Diretor Comercial', 'emp-9', '+55 11 97081-3838', '+55 11 96000-1676', 'joana@solaris.com.br', 'linkedin.com/in/joana-ribeiro', 'Em construção', 'Usuário', 'há 9 dias'),
('ct-10', 'Lucas Andrade', 'Head de Vendas', 'emp-10', '+55 11 96000-2757', '+55 11 94919-9595', 'lucas@kaizen.com.br', 'linkedin.com/in/lucas-andrade', 'Forte', 'Decisor', 'há 10 dias'),
('ct-11', 'Mariana Teixeira', 'CFO', 'emp-11', '+55 11 94919-1676', '+55 11 93838-8514', 'mariana@prisma.com.br', 'linkedin.com/in/mariana-teixeira', 'Neutro', 'Influenciador', 'há 11 dias'),
('ct-12', 'Nelson Cardoso', 'Gerente de Operações', 'emp-12', '+55 11 93838-9595', '+55 11 92757-7433', 'nelson@fluxo.com.br', 'linkedin.com/in/nelson-cardoso', 'Em construção', 'Usuário', 'há 12 dias'),
('ct-13', 'Patrícia Gomes', 'COO', 'emp-13', '+55 11 92757-8514', '+55 11 91676-6352', 'patrícia@atlas.com.br', 'linkedin.com/in/patrícia-gomes', 'Forte', 'Decisor', 'há 1 dias'),
('ct-14', 'Rodrigo Sales', 'Head de Marketing', 'emp-14', '+55 11 91676-7433', '+55 11 99595-5271', 'rodrigo@norvik.com.br', 'linkedin.com/in/rodrigo-sales', 'Neutro', 'Influenciador', 'há 2 dias'),
('ct-15', 'Sofia Barbosa', 'CEO', 'emp-15', '+55 11 99595-6352', '+55 11 98514-4190', 'sofia@zenit.com.br', 'linkedin.com/in/sofia-barbosa', 'Em construção', 'Usuário', 'há 3 dias'),
('ct-16', 'Tiago Moura', 'Diretor Comercial', 'emp-16', '+55 11 98514-5271', '+55 11 97433-3109', 'tiago@meridian.com.br', 'linkedin.com/in/tiago-moura', 'Forte', 'Decisor', 'há 4 dias'),
('ct-17', 'Vanessa Coelho', 'Head de Vendas', 'emp-17', '+55 11 97433-4190', '+55 11 96352-2028', 'vanessa@terrano.com.br', 'linkedin.com/in/vanessa-coelho', 'Neutro', 'Influenciador', 'há 5 dias'),
('ct-18', 'William Duarte', 'CFO', 'emp-18', '+55 11 96352-3109', '+55 11 95271-9947', 'william@vibrant.com.br', 'linkedin.com/in/william-duarte', 'Em construção', 'Usuário', 'há 6 dias')
) AS v(legacy_key, name, role, company_key, phone, whatsapp, email, linkedin, relationship, influence, last_interaction)
JOIN public.companies co ON co.legacy_key = v.company_key
ON CONFLICT (legacy_key) DO NOTHING;

INSERT INTO public.opportunities (
  legacy_key, title, company_id, contact_id, pipeline_id, stage_id, value, probability, temperature, health,
  priority, days_in_stage, last_contact, origin, partner, segment, source, next_step, next_activity,
  next_activity_date, close_date, summary, risks, checklist, notes, proposals, meetings, custom,
  pains, objections, suggestions, sales_arguments, timeline, files, owner_id)
SELECT
  v.legacy_key,
  co.name || ' — Implantação Conversu',
  co.id, ct.id, pl.id, st.id,
  v.value, v.probability, v.temperature, v.health, v.priority, v.days_in_stage, v.last_contact::date,
  v.origin, v.partner, v.segment, v.source, v.next_step, v.next_activity,
  v.next_activity_date::date, v.close_date::date,
  format('%s busca estruturar o processo comercial e ganhar previsibilidade de receita. A conversa avançou com %s (%s) e o time avalia substituir a operação atual em planilhas.', co.name, ct.name, ct.role),
  jsonb_build_array(v.risk1, 'Proposta próxima do vencimento'),
  jsonb_build_array(
    jsonb_build_object('label','Decisor identificado','done',true),
    jsonb_build_object('label','Orçamento confirmado','done',v.chk_budget),
    jsonb_build_object('label','Diagnóstico realizado','done',true),
    jsonb_build_object('label','Proposta enviada','done',v.chk_proposta),
    jsonb_build_object('label','Data de decisão definida','done',v.chk_data)),
  jsonb_build_array(
    jsonb_build_object('author',v.note_author1,'date','02/08/2026','text','Decisor pediu comparativo com solução atual até sexta.'),
    jsonb_build_object('author',v.note_author2,'date','27/07/2026','text','Time técnico validou integração com o ERP.')),
  jsonb_build_array(jsonb_build_object('id',v.proposal_id,'value',v.value,'status',v.proposal_status,'sent','02/08/2026','expires','16/08/2026')),
  jsonb_build_array(
    jsonb_build_object('date','28/07/2026','title','Demonstração da plataforma','participants',v.meet1,'summary','Time demonstrou interesse em forecast e automações de follow-up.'),
    jsonb_build_object('date','21/07/2026','title','Diagnóstico comercial','participants',v.meet2,'summary','Mapeados gargalos de qualificação e perda de leads.')),
  jsonb_build_object(
    'produto', v.custom_produto, 'segmento', v.segment, 'volume', v.custom_volume, 'budget', v.value::text,
    'concorrente', v.custom_concorrente, 'crm', v.custom_crm, 'usuarios', v.custom_usuarios,
    'decisor', ct.name, 'timing', v.custom_timing, 'canal', v.custom_canal,
    'comissao', '15% recorrente', 'coSelling', v.custom_coselling, 'juridico', v.custom_juridico),
  '["Falta de previsibilidade no forecast","Processo comercial em planilhas","Baixa visibilidade do funil pela liderança"]'::jsonb,
  '["Preocupação com tempo de implantação","Comparativo de preço com concorrente","Necessidade de aprovação do board"]'::jsonb,
  '["Enviar business case com ROI em 6 meses","Agendar sessão técnica com o time de operações","Definir data de decisão junto ao decisor"]'::jsonb,
  '["Redução de 30% no ciclo de vendas","Forecast ponderado automático","Onboarding assistido em 14 dias"]'::jsonb,
  '[{"date":"02/08/2026","title":"Proposta enviada","detail":"Documento comercial v2 enviado por e-mail.","type":"proposta"},{"date":"28/07/2026","title":"Reunião de demonstração","detail":"Demo com time comercial e operações.","type":"reuniao"},{"date":"21/07/2026","title":"Diagnóstico concluído","detail":"Mapeamento do funil atual e gargalos.","type":"atividade"},{"date":"14/07/2026","title":"Contato inicial","detail":"Primeira conversa de qualificação.","type":"atividade"}]'::jsonb,
  '[{"name":"Proposta-Conversu-v2.pdf","size":"820 KB","date":"02/08/2026"},{"name":"Diagnostico-comercial.xlsx","size":"312 KB","date":"21/07/2026"}]'::jsonb,
  (SELECT id FROM public.profiles ORDER BY created_at, id LIMIT 1)
FROM (VALUES
('op-1', 'emp-1', 'ct-1', 'inbound', 'prospeccao', 58500, 10, 'Morno', 74, 'Média', 10, '2026-07-28', 'inbound', null, 'SaaS', 'Inbound', 'Validar orçamento com o CFO', 'Follow-up por WhatsApp', '2026-08-01', '2026-08-05', 'Decisor secundário ainda não engajado', true, false, false, 'Marina Duarte', 'Rafael Lopes', 'PR-1000', 'Enviada', 'Ana Beatriz Rocha, Marina Duarte', 'Ana Beatriz Rocha', 'Sales OS', '449', 'Planilhas', 'Planilhas', '6', 'Imediato', 'Site', 'Sim', 'Não iniciada'),
('op-2', 'emp-2', 'ct-2', 'outbound', 'prospeccao', 54000, 10, 'Quente', 93, 'Alta', 5, '2026-07-26', 'outbound', null, 'Indústria', 'Outbound', 'Agendar demo técnica', 'Call de alinhamento', '2026-08-02', '2026-09-06', 'Decisor secundário ainda não engajado', false, false, false, 'Rafael Lopes', 'Camila Nunes', 'PR-1001', 'Enviada', 'Carlos Menezes, Rafael Lopes', 'Carlos Menezes', 'Sales OS + IA', '368', 'CRM legado', 'Pipedrive', '7', '30 dias', 'Webinar', 'Não', 'Em andamento'),
('op-3', 'emp-3', 'ct-3', 'parcerias', 'contato', 49500, 20, 'Morno', 62, 'Média', 28, '2026-07-24', 'indicacao', 'Nucleo Digital', 'Varejo', 'Indicação', 'Revisar escopo da proposta', 'Envio de proposta', '2026-08-03', '2026-10-07', 'Decisor secundário ainda não engajado', true, false, false, 'Camila Nunes', 'Thiago Bastos', 'PR-1002', 'Enviada', 'Débora Lima, Camila Nunes', 'Débora Lima', 'Enterprise', '287', 'Pipedrive', 'HubSpot', '8', '90 dias', 'Indicação', 'Sim', 'Concluída'),
('op-4', 'emp-4', 'ct-4', 'outbound', 'contato', 45000, 20, 'Quente', 81, 'Alta', 23, '2026-07-22', 'outros', null, 'Serviços', 'Evento', 'Confirmar decisor final', 'Reunião de diagnóstico', '2026-08-04', '2026-08-08', 'Decisor secundário ainda não engajado', false, false, false, 'Thiago Bastos', 'Juliana Prado', 'PR-1003', 'Enviada', 'Eduardo Farias, Thiago Bastos', 'Eduardo Farias', 'Sales OS', '206', 'HubSpot', 'Nenhum', '9', 'Sem prazo', 'Evento', 'Não', 'Não iniciada'),
('op-5', 'emp-5', 'ct-5', 'parcerias', 'qualificacao', 40500, 35, 'Frio', 50, 'Baixa', 18, '2026-07-20', 'parceiro', 'Alpha Consultoria', 'Saúde', 'Parceria', 'Validar orçamento com o CFO', 'E-mail de retomada', '2026-08-05', '2026-09-09', 'Sem interação há mais de 10 dias', true, false, false, 'Juliana Prado', 'Marina Duarte', 'PR-1004', 'Enviada', 'Fernanda Alves, Juliana Prado', 'Fernanda Alves', 'Sales OS + IA', '125', 'Planilhas', 'Planilhas', '10', 'Imediato', 'Site', 'Sim', 'Em andamento'),
('op-6', 'emp-6', 'ct-6', 'inbound', 'qualificacao', 36000, 35, 'Morno', 69, 'Média', 13, '2026-07-18', 'inbound', null, 'Educação', 'Site', 'Agendar demo técnica', 'Follow-up por WhatsApp', '2026-08-06', '2026-10-10', 'Decisor secundário ainda não engajado', false, false, false, 'Marina Duarte', 'Rafael Lopes', 'PR-1005', 'Enviada', 'Gustavo Pinto, Marina Duarte', 'Gustavo Pinto', 'Enterprise', '444', 'CRM legado', 'Pipedrive', '11', '30 dias', 'Webinar', 'Não', 'Concluída'),
('op-7', 'emp-7', 'ct-7', 'inbound', 'diagnostico', 31500, 45, 'Quente', 88, 'Alta', 8, '2026-07-16', 'inbound', null, 'SaaS', 'Inbound', 'Revisar escopo da proposta', 'Call de alinhamento', '2026-08-07', '2026-08-11', 'Decisor secundário ainda não engajado', true, false, false, 'Rafael Lopes', 'Camila Nunes', 'PR-1006', 'Enviada', 'Helena Castro, Rafael Lopes', 'Helena Castro', 'Sales OS', '363', 'Pipedrive', 'HubSpot', '12', '90 dias', 'Indicação', 'Sim', 'Não iniciada'),
('op-8', 'emp-8', 'ct-8', 'outbound', 'demonstracao', 27000, 60, 'Morno', 57, 'Média', 3, '2026-07-14', 'outbound', null, 'Indústria', 'Outbound', 'Confirmar decisor final', 'Envio de proposta', '2026-08-08', '2026-09-12', 'Decisor secundário ainda não engajado', false, false, false, 'Camila Nunes', 'Thiago Bastos', 'PR-1007', 'Enviada', 'Igor Marques, Camila Nunes', 'Igor Marques', 'Sales OS + IA', '282', 'HubSpot', 'Nenhum', '13', 'Sem prazo', 'Evento', 'Não', 'Em andamento'),
('op-9', 'emp-9', 'ct-9', 'parcerias', 'demonstracao', 22500, 60, 'Morno', 76, 'Média', 26, '2026-08-02', 'indicacao', 'Alpha Consultoria', 'Varejo', 'Indicação', 'Validar orçamento com o CFO', 'Reunião de diagnóstico', '2026-08-09', '2026-10-13', 'Decisor secundário ainda não engajado', true, false, false, 'Thiago Bastos', 'Juliana Prado', 'PR-1008', 'Enviada', 'Joana Ribeiro, Thiago Bastos', 'Joana Ribeiro', 'Enterprise', '201', 'Planilhas', 'Planilhas', '14', 'Imediato', 'Site', 'Sim', 'Concluída'),
('op-10', 'emp-10', 'ct-10', 'outbound', 'proposta', 18000, 72, 'Frio', 45, 'Alta', 21, '2026-07-31', 'outros', null, 'Serviços', 'Evento', 'Agendar demo técnica', 'E-mail de retomada', '2026-08-10', '2026-08-14', 'Sem interação há mais de 10 dias', false, true, false, 'Juliana Prado', 'Marina Duarte', 'PR-1009', 'Enviada', 'Lucas Andrade, Juliana Prado', 'Lucas Andrade', 'Sales OS', '120', 'CRM legado', 'Pipedrive', '15', '30 dias', 'Webinar', 'Não', 'Não iniciada'),
('op-11', 'emp-11', 'ct-11', 'parcerias', 'proposta', 193500, 72, 'Morno', 64, 'Alta', 16, '2026-07-29', 'parceiro', 'Nucleo Digital', 'Saúde', 'Parceria', 'Revisar escopo da proposta', 'Follow-up por WhatsApp', '2026-08-11', '2026-09-15', 'Decisor secundário ainda não engajado', true, true, false, 'Marina Duarte', 'Rafael Lopes', 'PR-1010', 'Enviada', 'Mariana Teixeira, Marina Duarte', 'Mariana Teixeira', 'Sales OS + IA', '439', 'Pipedrive', 'HubSpot', '16', '90 dias', 'Indicação', 'Sim', 'Em andamento'),
('op-12', 'emp-12', 'ct-12', 'inbound', 'negociacao', 189000, 85, 'Quente', 83, 'Alta', 11, '2026-07-27', 'inbound', null, 'Educação', 'Site', 'Confirmar decisor final', 'Call de alinhamento', '2026-08-12', '2026-10-16', 'Decisor secundário ainda não engajado', false, true, true, 'Rafael Lopes', 'Camila Nunes', 'PR-1011', 'Em negociação', 'Nelson Cardoso, Rafael Lopes', 'Nelson Cardoso', 'Enterprise', '358', 'HubSpot', 'Nenhum', '17', 'Sem prazo', 'Evento', 'Não', 'Concluída'),
('op-13', 'emp-13', 'ct-13', 'inbound', 'negociacao', 184500, 85, 'Frio', 52, 'Alta', 6, '2026-07-25', 'inbound', null, 'SaaS', 'Inbound', 'Validar orçamento com o CFO', 'Envio de proposta', '2026-08-13', '2026-08-17', 'Sem interação há mais de 10 dias', true, true, true, 'Camila Nunes', 'Thiago Bastos', 'PR-1012', 'Em negociação', 'Patrícia Gomes, Camila Nunes', 'Patrícia Gomes', 'Sales OS', '277', 'Planilhas', 'Planilhas', '18', 'Imediato', 'Site', 'Sim', 'Não iniciada'),
('op-14', 'emp-14', 'ct-14', 'enterprise', 'ganho', 180000, 100, 'Morno', 71, 'Alta', 1, '2026-07-23', 'outbound', null, 'Indústria', 'Outbound', 'Agendar demo técnica', 'Reunião de diagnóstico', '2026-08-14', '2026-09-18', 'Decisor secundário ainda não engajado', false, true, true, 'Thiago Bastos', 'Juliana Prado', 'PR-1013', 'Em negociação', 'Rodrigo Sales, Thiago Bastos', 'Rodrigo Sales', 'Sales OS + IA', '196', 'CRM legado', 'Pipedrive', '19', '30 dias', 'Webinar', 'Não', 'Em andamento'),
('op-15', 'emp-15', 'ct-15', 'parcerias', 'ganho', 175500, 100, 'Quente', 90, 'Alta', 24, '2026-07-21', 'indicacao', 'Nucleo Digital', 'Varejo', 'Indicação', 'Revisar escopo da proposta', 'E-mail de retomada', '2026-08-15', '2026-10-19', 'Decisor secundário ainda não engajado', true, true, true, 'Juliana Prado', 'Marina Duarte', 'PR-1014', 'Em negociação', 'Sofia Barbosa, Juliana Prado', 'Sofia Barbosa', 'Enterprise', '515', 'Pipedrive', 'HubSpot', '20', '90 dias', 'Indicação', 'Sim', 'Concluída'),
('op-16', 'emp-16', 'ct-16', 'enterprise', 'perdido', 171000, 0, 'Frio', 36, 'Baixa', 19, '2026-07-19', 'outros', null, 'Serviços', 'Evento', 'Confirmar decisor final', 'Follow-up por WhatsApp', '2026-08-16', '2026-08-20', 'Sem interação há mais de 10 dias', false, false, false, 'Marina Duarte', 'Rafael Lopes', 'PR-1015', 'Enviada', 'Tiago Moura, Marina Duarte', 'Tiago Moura', 'Sales OS', '434', 'HubSpot', 'Nenhum', '21', 'Sem prazo', 'Evento', 'Não', 'Não iniciada'),
('op-17', 'emp-17', 'ct-17', 'parcerias', 'qualificacao', 166500, 35, 'Morno', 78, 'Alta', 14, '2026-07-17', 'parceiro', 'Alpha Consultoria', 'Saúde', 'Parceria', 'Validar orçamento com o CFO', 'Call de alinhamento', '2026-08-17', '2026-09-21', 'Decisor secundário ainda não engajado', true, false, false, 'Rafael Lopes', 'Camila Nunes', 'PR-1016', 'Enviada', 'Vanessa Coelho, Rafael Lopes', 'Vanessa Coelho', 'Sales OS + IA', '353', 'Planilhas', 'Planilhas', '22', 'Imediato', 'Site', 'Sim', 'Em andamento'),
('op-18', 'emp-18', 'ct-18', 'inbound', 'proposta', 162000, 72, 'Frio', 47, 'Alta', 9, '2026-07-15', 'inbound', null, 'Educação', 'Site', 'Agendar demo técnica', 'Envio de proposta', '2026-08-18', '2026-10-22', 'Sem interação há mais de 10 dias', false, true, false, 'Camila Nunes', 'Thiago Bastos', 'PR-1017', 'Enviada', 'William Duarte, Camila Nunes', 'William Duarte', 'Enterprise', '272', 'CRM legado', 'Pipedrive', '23', '30 dias', 'Webinar', 'Não', 'Concluída'),
('op-19', 'emp-1', 'ct-1', 'inbound', 'negociacao', 157500, 85, 'Morno', 66, 'Alta', 4, '2026-08-03', 'inbound', null, 'SaaS', 'Inbound', 'Revisar escopo da proposta', 'Reunião de diagnóstico', '2026-08-19', '2026-08-23', 'Decisor secundário ainda não engajado', true, true, true, 'Thiago Bastos', 'Juliana Prado', 'PR-1018', 'Em negociação', 'Ana Beatriz Rocha, Thiago Bastos', 'Ana Beatriz Rocha', 'Sales OS', '191', 'Pipedrive', 'HubSpot', '24', '90 dias', 'Indicação', 'Sim', 'Não iniciada'),
('op-20', 'emp-2', 'ct-2', 'enterprise', 'demonstracao', 153000, 60, 'Quente', 85, 'Alta', 27, '2026-08-01', 'outbound', null, 'Indústria', 'Outbound', 'Confirmar decisor final', 'E-mail de retomada', '2026-08-20', '2026-09-24', 'Decisor secundário ainda não engajado', false, false, false, 'Juliana Prado', 'Marina Duarte', 'PR-1019', 'Enviada', 'Carlos Menezes, Juliana Prado', 'Carlos Menezes', 'Sales OS + IA', '510', 'HubSpot', 'Nenhum', '25', 'Sem prazo', 'Evento', 'Não', 'Em andamento'),
('op-21', 'emp-3', 'ct-3', 'parcerias', 'contato', 148500, 20, 'Frio', 54, 'Baixa', 22, '2026-07-30', 'indicacao', 'Alpha Consultoria', 'Varejo', 'Indicação', 'Validar orçamento com o CFO', 'Follow-up por WhatsApp', '2026-08-21', '2026-10-25', 'Sem interação há mais de 10 dias', true, false, false, 'Marina Duarte', 'Rafael Lopes', 'PR-1020', 'Enviada', 'Débora Lima, Marina Duarte', 'Débora Lima', 'Enterprise', '429', 'Planilhas', 'Planilhas', '26', 'Imediato', 'Site', 'Sim', 'Concluída'),
('op-22', 'emp-4', 'ct-4', 'enterprise', 'diagnostico', 144000, 45, 'Morno', 73, 'Média', 17, '2026-07-28', 'outros', null, 'Serviços', 'Evento', 'Agendar demo técnica', 'Call de alinhamento', '2026-08-22', '2026-08-26', 'Decisor secundário ainda não engajado', false, false, false, 'Rafael Lopes', 'Camila Nunes', 'PR-1021', 'Enviada', 'Eduardo Farias, Rafael Lopes', 'Eduardo Farias', 'Sales OS', '348', 'CRM legado', 'Pipedrive', '27', '30 dias', 'Webinar', 'Não', 'Não iniciada'),
('op-23', 'emp-5', 'ct-5', 'parcerias', 'ganho', 139500, 100, 'Quente', 92, 'Alta', 12, '2026-07-26', 'parceiro', 'Nucleo Digital', 'Saúde', 'Parceria', 'Revisar escopo da proposta', 'Envio de proposta', '2026-08-23', '2026-09-27', 'Decisor secundário ainda não engajado', true, true, true, 'Camila Nunes', 'Thiago Bastos', 'PR-1022', 'Em negociação', 'Fernanda Alves, Camila Nunes', 'Fernanda Alves', 'Sales OS + IA', '267', 'Pipedrive', 'HubSpot', '28', '90 dias', 'Indicação', 'Sim', 'Em andamento'),
('op-24', 'emp-6', 'ct-6', 'inbound', 'prospeccao', 135000, 10, 'Morno', 61, 'Média', 7, '2026-07-24', 'inbound', null, 'Educação', 'Site', 'Confirmar decisor final', 'Reunião de diagnóstico', '2026-08-24', '2026-10-28', 'Decisor secundário ainda não engajado', false, false, false, 'Thiago Bastos', 'Juliana Prado', 'PR-1023', 'Enviada', 'Gustavo Pinto, Thiago Bastos', 'Gustavo Pinto', 'Enterprise', '186', 'HubSpot', 'Nenhum', '29', 'Sem prazo', 'Evento', 'Não', 'Concluída')
) AS v(legacy_key, company_key, contact_key, pipeline_key, stage_key, value, probability, temperature, health,
  priority, days_in_stage, last_contact, origin, partner, segment, source, next_step, next_activity,
  next_activity_date, close_date, risk1, chk_budget, chk_proposta, chk_data, note_author1, note_author2,
  proposal_id, proposal_status, meet1, meet2, custom_produto, custom_volume, custom_concorrente, custom_crm,
  custom_usuarios, custom_timing, custom_canal, custom_coselling, custom_juridico)
JOIN public.companies co ON co.legacy_key = v.company_key
JOIN public.contacts ct ON ct.legacy_key = v.contact_key
JOIN public.pipelines pl ON pl.key = CASE WHEN EXISTS (
    SELECT 1 FROM public.stages s2 JOIN public.pipelines p2 ON p2.id = s2.pipeline_id
    WHERE p2.key = v.pipeline_key AND s2.key = v.stage_key
  ) THEN v.pipeline_key ELSE 'outbound' END
JOIN public.stages st ON st.pipeline_id = pl.id AND st.key = v.stage_key
ON CONFLICT (legacy_key) DO NOTHING;