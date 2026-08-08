# Conversu Sales OS — Finalização da Sprint 1

Regra base: **todo dado comercial continua mockado** em `src/lib/data.ts`. Só autenticação, perfil e papéis vão para o banco. Dashboard, Pipeline, Empresas e Contatos não são redesenhados — só recebem os incrementos abaixo.

## Parte 1 — Telas pendentes

1. **Atividades** — reconstruir com `ActivityCard`, `SearchField`, `FilterSelect` e `useCollection`; abas Hoje / Atrasadas / Semana, agrupamento por tipo (Ligação, WhatsApp, E-mail, Follow-up, Tarefa, Reunião), ordenação, estados vazios e responsividade.
2. **Reuniões** — agenda agrupada por dia (horário, título, responsável, participantes, status, oportunidade vinculada), filtros de responsável e status e `MeetingDrawer` com pauta, resumo e vínculos.
3. **Propostas** — KPI de propostas vencendo em 7 dias, filtros (status, responsável, período) e `ProposalDrawer` com itens, condições comerciais, histórico, datas e oportunidade.
4. **Forecast** — cenários Comprometido / Provável / Otimista, forecast por responsável e lista de fechamentos previstos do mês (oportunidade, valor, probabilidade, cenário, responsável, data), com filtro de parceiro.
5. **IA Comercial** — página com blocos `AiSlot` (Resumo, Dores, Objeções, Próximos passos, Riscos, Argumentos, Insights) em estado "Aguardando integração".
6. **Relatórios** — motivos de perda, ciclo médio de vendas, performance das metas e a visão de parceiros (item 4). Sem ranking avançado de vendedores.
7. **Configurações** — página real com abas Perfil (nome, avatar, cargo, e-mail — dados reais do usuário), Equipe, Integrações, Aparência e Comercial (pipelines, etapas, campos, critérios, playbooks, metas como áreas preparadas, em leitura).
8. **Drawer da oportunidade** — completar Notas, Arquivos, Propostas, Checklist e Timeline unificada, já modelada para registrar mudança de etapa, atividade, reunião, proposta, tarefa, nota e alteração de campo.

## Parte 2 — Metas comerciais

Nova área de Metas com três níveis: Empresa (receita, MRR, contratos ganhos, pipeline criado), Equipe (receita, reuniões, oportunidades, propostas, ganhos) e Vendedor (leads, reuniões, oportunidades, propostas, ganhos, receita). Cada indicador mostra **Meta × Realizado × Forecast × Gap** com barra de progresso, período selecionável e estrutura pronta para metas reais por usuário/equipe/período.

## Parte 3 — Parceiros

- Oportunidades e empresas ganham `origem` (Outbound, Inbound, Parceiro, Indicação, Outros) e `parceiro` quando aplicável.
- Filtros de parceiro/origem em Pipeline, Empresas, Forecast e Relatórios, no mesmo padrão visual atual.
- Inteligência de parceiros em Relatórios: geração de demanda (leads, oportunidades, conversão, pipeline) e de receita (clientes ganhos, receita, ticket médio, participação na receita), pipeline aberto e receita ganha por parceiro, % da receita originada por parceiros e destaque do principal parceiro por pipeline e por receita.

## Parte 4 — Núcleo configurável

Pipeline passa a ser o núcleo da operação, sem etapas hardcoded:

- **Pipelines múltiplos** (Outbound, Inbound, Enterprise, Parcerias) com etapas próprias; seletor de pipeline na tela de Pipeline.
- **Campos dos cards** definidos por configuração (empresa, contato, valor, etapa, responsável, fechamento, probabilidade, origem, parceiro, última/próxima atividade, tags) — o card renderiza a partir da lista configurada.
- **Campos customizados da oportunidade** por pipeline (produto, segmento, volume, budget, concorrente, CRM atual, usuários, decisor, timing), exibidos no drawer.
- **Critérios obrigatórios por etapa** vindos de configuração, exibidos no drawer com o que falta para avançar.
- **Playbook por etapa** (objetivo, perguntas sugeridas, checklist, orientações, critérios de saída) em estrutura de dados editável, visível no drawer e em Configurações.
- **Atividades e tarefas** passam a referenciar empresa, contato, oportunidade, pipeline, etapa e responsável — pronto para automação futura (não implementada agora).

Sem editor administrativo completo nesta sprint: a configuração vive em um módulo mockado, pronto para vir do banco depois.

## Parte 2 — Autenticação (Lovable Cloud)

O CRM deixa de ser público: todo o sistema passa a exigir login.

- Ativação do backend (Lovable Cloud) com **e-mail/senha + Google**.
- Tela `/auth` com a identidade Conversu (Core #3422B5, Flow #E56745, Sora), alternando entre entrar e criar conta, com estados de erro e carregamento.
- Todas as telas do CRM passam para a área protegida; visitante sem sessão é redirecionado para `/auth`.
- Cabeçalho passa a exibir o usuário logado (avatar, nome, papel) com menu de conta e sair.
- **Perfis e papéis**: tabela de perfis (nome, avatar, cargo) criada automaticamente no cadastro e tabela separada de papéis (`gestor`, `vendedor`) com verificação segura no banco — base para permissões futuras (gestor vê o time, vendedor vê o próprio).
- Configurações passa a ler e editar o perfil real do usuário.

Os dados do CRM continuam fictícios nesta sprint; apenas usuários, perfis e papéis vão para o banco. A camada de dados fica isolada em um único módulo para o Manus trocar mock por consultas reais sem mexer nas telas.

## Detalhes técnicos

- Novo módulo `src/lib/config.ts` (pipelines, etapas, campos do card, campos customizados, critérios por etapa, playbooks, metas) e `src/lib/partners.ts` para as métricas derivadas — ambos mockados, com o mesmo formato que a API futura deve devolver.
- Novas rotas `metas` e `tarefas`; Pipeline lê etapas do pipeline ativo em vez da constante `STAGES`.
- Novos componentes: `MeetingDrawer`, `ProposalDrawer`, `ActivityBoard`, `ForecastScenarios`, `GoalCard`, `PlaybookPanel`, `StageCriteria`, `UserMenu`, reaproveitando `kit.tsx`, `entity-cards.tsx` e `toolbar.tsx`.
- Migração incremental: os campos novos entram como opcionais em `data.ts` para não quebrar as telas consolidadas.

- Rotas do CRM movidas para `src/routes/_authenticated/`, com o layout gate gerenciado (`ssr: false`, redirect para `/auth`). O `/` público vira redirecionamento para o login.
- Migração: `profiles` (FK `auth.users`, RLS por `auth.uid()`), enum `app_role`, `user_roles` + `has_role()` security definer, grants explícitos e trigger `handle_new_user`.
- Google via broker do Lovable (`lovable.auth.signInWithOAuth`) + `configure_social_auth`.
- Sessão exposta por um hook `useSession`, com listener único de `onAuthStateChange` no root.
- Novos componentes: `MeetingDrawer`, `ProposalDrawer`, `ActivityBoard`, `ForecastScenarios`, `UserMenu`; reaproveitando `kit.tsx`, `entity-cards.tsx` e `toolbar.tsx`.
- `src/lib/data.ts` mantido como única fonte de dados mock, com seletores já no formato que a API futura deve devolver.