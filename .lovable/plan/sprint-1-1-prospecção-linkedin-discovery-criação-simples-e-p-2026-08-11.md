# Sprint 1.1 — Prospecção LinkedIn, Discovery, criação simples e períodos

Base: estado atual do projeto. Auth, profiles, user_roles, RLS existente, pipelines/stages/companies/contacts/opportunities e Dashboard/Forecast/Pipeline permanecem como estão. Sem deploy, sem importação do Notion.

## 1. Cadência LinkedIn (dentro do card)

Nova aba **Prospecção / LinkedIn** no drawer da oportunidade — sem página separada.

Mostra: URL do perfil, status atual, etapa da cadência, data da última ação, próxima ação e vencimento, timeline dos eventos e botões de ação rápida (Conexão enviada, Conexão aceita, Mensagem enviada, Follow-up, Reunião, Sem resposta, Respondeu/Lead, Sem interesse).

Máquina de cadência determinística, sem automação externa:

```text
Prospect identificado -> Conexão enviada -> Conexão aceita -> Mensagem enviada
-> Follow-up 1 -> Follow-up 2 -> Respondeu/Lead -> Reunião marcada
Saídas: Sem interesse (encerra) | Sem resposta (continua cadência)
```

Prazos: conexão enviada +3 dias; mensagem enviada +4 dias; follow-up 1 +4 dias; follow-up 2 +5 dias; sem resposta +5 dias; conexão aceita +1 dia (enviar mensagem). Aceite de conexão nunca vira Lead; Lead exige resposta/interesse; Reunião é conversão posterior do Lead.

Cada clique grava data/hora do evento e o CRM recalcula próxima ação e vencimento.

## 2. Métricas de prospecção

Função utilitária que agrega, a partir dos eventos reais: empresas prospectadas, conexões enviadas/aceitas, mensagens, follow-ups, respostas, leads, reuniões, oportunidades geradas, fechamentos; e as taxas de aceite, resposta, conversão em lead e conversão em reunião. Filtrável por período e por responsável. Sem dashboard novo agora — apenas a camada pronta para as telas de resultados consumirem.

## 3. Discovery na oportunidade

Nova aba **Discovery** no drawer, com status (Não iniciado, Em andamento, Realizado, Validado) e os campos: objetivo, cenário atual, dores, volume de atendimentos, equipe, canais, jornadas, processos, integrações, sistemas, gargalos, impactos, oportunidades identificadas, atuação da Conversu, escopo validado, próximos passos. Layout compacto em blocos, salvo por seção.

Estrutura de documento/ata vinculada (nome, data, opportunity_id) já persistida e listada, preparando Reunião -> Ata -> Documento -> Oportunidade. Sem Gemini e sem geração automática agora.

## 4. Camada de período

Utilitário único de períodos (Hoje, Esta semana, Este mês, Trimestre, Semestre, Ano, Personalizado com início e fim), com timezone consistente e datas reais do banco — nada de data fixa de mock. Componente de seletor reutilizável aplicado em Dashboard/Resultados, Empresas, Pipeline e relatórios que já usam datas. `TODAY` fixo deixa de ser usado nos cálculos do núcleo real.

## 5. Nova oportunidade em 3 campos

Botão "Nova oportunidade" abre um diálogo com apenas **Empresa**, **Contato** e **Origem**. Ao confirmar, cria no banco com owner do usuário logado, pipeline e primeira etapa do funil, probabilidade da etapa, e o card aparece imediatamente no Pipeline. Empresa e contato listados apenas entre os registros que o usuário pode acessar. Todo o resto é preenchido depois no drawer.

## 6. Preservação

Sem alterar dados reais já migrados, sem reintroduzir fallback de etapa entre pipelines, sem trocar dados reais por mock. Atividades, Reuniões, Propostas, Metas e Parceiros seguem mock; LinkedIn e Discovery são persistidos.

## 7. Notion

Schema preparado para receber a base real (campos de LinkedIn, cadência e discovery, além de `legacy_key` já existente). Ao final, relatório indicando exatamente qual exportação é necessária (CSV/JSON das bases de Empresas, Contatos, Prospecção LinkedIn e Discovery, com colunas e chaves de vínculo). Nenhum dado inventado, exemplos atuais preservados.

## Detalhes técnicos

- Migração: `opportunities.linkedin_url`, `linkedin_status`, `linkedin_step`, `linkedin_last_action_at`, `linkedin_next_action`, `linkedin_next_action_at`; tabela `prospecting_events` (opportunity_id, company_id, type, occurred_at, note, owner_id); tabela `discoveries` (1-1 com opportunity, status + campos texto); tabela `discovery_documents` (opportunity_id, name, doc_date, url). Todas com GRANTs explícitos, RLS espelhando o padrão atual (dono ou gestor) e trigger de `updated_at`.
- Server fns em `src/lib/crm.functions.ts` (ou módulo irmão `prospecting.functions.ts`): `createOpportunity`, `logProspectingEvent`, `saveDiscovery`, `saveDiscoveryDocument`, todas com `requireSupabaseAuth` e validação de que empresa/contato pertencem ao usuário (ou gestor).
- Novo `src/lib/cadence.ts` com a máquina de estados e prazos; `src/lib/period.ts` com os presets de período; `src/lib/prospecting-metrics.ts` com os agregados e taxas.
- Novos componentes: `LinkedInPanel`, `DiscoveryPanel`, `NewOpportunityDialog`, `PeriodFilter`; drawer atual estendido com duas abas.
- `listCrm` passa a trazer os campos de cadência e discovery; tipos do Supabase regenerados após a migração.
- Validação: build, typecheck, lint dos arquivos tocados, consultas de RLS/ownership e teste no navegador autenticado (criação, cadência, discovery, filtros, drag-and-drop).

## Regras adicionais aprovadas

- **`prospecting_events` é histórico de auditoria**: vendedor só insere; edição e exclusão ficam restritas ao gestor por policy, e um gatilho impede alteração de `occurred_at`, `owner_id` e `opportunity_id` mesmo por gestor.
- **`createOpportunity` escolhe o funil pela origem comercial** já existente (Outbound -> Outbound, Inbound -> Inbound, Parceiro/Indicação -> Parcerias, contas enterprise/Outros -> funil correspondente), nunca o primeiro funil global. A oportunidade entra na primeira etapa válida daquele funil, herda a probabilidade da etapa, recebe `owner_id` do usuário autenticado, e empresa/contato são validados contra o RLS/ownership.
