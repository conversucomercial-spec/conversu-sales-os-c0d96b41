# Conversu Sales OS — Fechamento da Sprint 1 + Acesso restrito

## Parte 1 — O que ficou pendente

Revisão do estado atual: Dashboard, Pipeline (Kanban + lista + drawer), Empresas e Contatos (tabelas + drawer) estão consolidados. As lacunas são:

1. **Atividades** — ainda usa filtros manuais e tabela simples. Falta aplicar os componentes criados na sprint (`ActivityCard`, `SearchField`/`FilterSelect`, `useCollection`) e os agrupamentos por tipo (Ligações, WhatsApp, E-mail, Follow-up, Tarefa, Reunião) com abas Hoje / Atrasadas / Semana.
2. **Reuniões** — tela mínima (cards soltos). Falta agenda agrupada por dia, filtros por responsável/status e drawer de detalhe (participantes, pauta, resumo, oportunidade vinculada).
3. **Propostas** — tabela estática. Falta KPI de vencendo em 7 dias, filtros e drawer com itens, condições, histórico e vínculo com a oportunidade.
4. **Forecast** — falta o comparativo Comprometido / Provável / Otimista, forecast ponderado por responsável e a lista de fechamentos previstos do mês.
5. **IA Comercial** — falta a página com os slots reservados por bloco (resumo, dores, objeções, próximos passos, riscos, argumentos, insights) usando o `AiSlot`, em estado "aguardando integração".
6. **Relatórios** — falta ranking de vendedores, motivos de perda e ciclo médio de venda (os dados já existem em `data.ts`, mas não estão renderizados).
7. **Configurações** — virar página real de preferências (perfil, equipe, integrações, aparência), preparada para o backend.
8. **Detalhes transversais** — drawer da oportunidade com abas completas (Notas, Arquivos, Propostas, Checklist), estados vazios consistentes e ajustes de responsividade.

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

- Rotas do CRM movidas para `src/routes/_authenticated/`, com o layout gate gerenciado (`ssr: false`, redirect para `/auth`). O `/` público vira redirecionamento para o login.
- Migração: `profiles` (FK `auth.users`, RLS por `auth.uid()`), enum `app_role`, `user_roles` + `has_role()` security definer, grants explícitos e trigger `handle_new_user`.
- Google via broker do Lovable (`lovable.auth.signInWithOAuth`) + `configure_social_auth`.
- Sessão exposta por um hook `useSession`, com listener único de `onAuthStateChange` no root.
- Novos componentes: `MeetingDrawer`, `ProposalDrawer`, `ActivityBoard`, `ForecastScenarios`, `UserMenu`; reaproveitando `kit.tsx`, `entity-cards.tsx` e `toolbar.tsx`.
- `src/lib/data.ts` mantido como única fonte de dados mock, com seletores já no formato que a API futura deve devolver.