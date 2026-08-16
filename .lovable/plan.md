# Auditoria completa — Conversu Sales OS

Auditoria de código e banco reais, sem alterações. Base: 27 oportunidades, 27 empresas, 16 contatos, 4 funis, 32 etapas, 1 perfil de usuário.

## 1. Pronto e funcionando

- **Autenticação e papéis**: login e-mail/senha + Google, área protegida `_authenticated`, perfis criados automaticamente, papéis `gestor`/`vendedor` em tabela separada com `has_role()`.
- **Núcleo comercial no banco**: `pipelines`, `stages`, `companies`, `contacts`, `opportunities` com RLS "dono ou gestor" em todas as operações e GRANTs corretos (sem acesso anônimo).
- **Pipeline/Kanban**: leitura real, arrastar-e-soltar persistido, bloqueio de etapa de outro funil, aviso de erro, visão lista, drawer da oportunidade.
- **Criação de oportunidade em 3 campos** (empresa, contato, origem) com roteamento automático de funil/etapa.
- **Discovery**: formulário estruturado gravado em `discoveries` + `discovery_documents`, vinculado à oportunidade.
- **Reunião na oportunidade**: bloco estruturado gravado em `opportunities.meeting`, com registro automático na timeline quando marcada como realizada.
- **Tags**: criação, cor, vínculo, selos no card e filtro "qualquer/todas".
- **Empresas e Contatos**: listagem real com busca e filtros.
- **Design system** coeso (marca Conversu, Sora, tokens semânticos) e responsividade geral das telas.

## 2. Parcialmente pronto

- **Dashboard**: parte das métricas vem de `crm-metrics` (dados reais), mas gráficos de conversão, receita mensal, segmentos e atividades ainda vêm de `src/lib/data.ts`. Mistura fontes na mesma tela.
- **Forecast**: cenários calculados sobre oportunidades reais, porém todas com valor 0 — os números saem zerados.
- **Cadência LinkedIn**: existe máquina de estados e registro manual por oportunidade, mas `prospecting_events` está com 0 registros e **não existe a visão agrupada por empresa** (X conexões / Y aceitas / Z mensagens / próxima ação).
- **Discovery**: existe, mas não é exigido nem sinalizado antes da primeira reunião, e não aparece na ficha da empresa — só dentro da oportunidade.
- **Busca global (topbar)**: funciona visualmente, mas consulta a lista mock, não o banco.
- **Configurações**: perfil real; equipe, integrações, comercial e metas são áreas de leitura.

## 3. Mock/dummy que precisa virar dado real

Sem tabela no banco hoje:
- **Atividades e Tarefas** (`activities` do mock) — nenhuma tabela existe.
- **Reuniões** (agenda) — só existe o bloco dentro da oportunidade, não uma entidade consultável.
- **Propostas** — tela inteira em mock.
- **Metas** — `GOALS` fixo em `src/lib/config.ts`.
- **Relatórios** — motivos de perda, ciclo de venda, origem, segmentos e receita mensal vêm do mock.
- **Parceiros** — métricas derivadas de mock.
- **IA Comercial** — placeholders (esperado nesta fase).
- **Owners/equipe** — `OWNERS` fixo em várias telas, embora exista `profiles`.
- **Configuração de funis/etapas/campos/playbooks** — `src/lib/config.ts` duplica o que já está no banco (`pipelines`/`stages`), risco de divergência.

## 4. Bugs e problemas técnicos

- **Dados importados incompletos**: das 27 oportunidades, **27 com valor 0**, **27 sem data de fechamento**, **27 sem timeline**, 15 sem health, 15 sem próxima atividade, 11 sem contato vinculado. Isso zera forecast, ticket médio e receita.
- **`days_in_stage` é coluna estática**: só zera ao mover etapa; nunca é recalculado — envelhece errado. Deveria derivar de `stage_changed_at`.
- **Duplicidade de verdade**: `STAGES` do mock ainda é usado por `pipeline.tsx`, `crm-metrics.ts` e drawer, enquanto as etapas reais vêm do banco (32 etapas, 4 funis; só 3 funis têm oportunidades). Renomeações no banco não refletem na UI.
- **Sem CRUD de escrita** para: editar/excluir oportunidade (valor, fechamento, responsável, próximo passo, temperatura), criar/editar empresa, criar/editar contato. Hoje só é possível mover etapa, salvar reunião, discovery, tags e evento de prospecção.
- **Notas, arquivos, propostas e checklist** dentro da oportunidade são JSONB somente leitura — não há gravação pela interface.
- **Sem invalidação cruzada de cache**: telas mock não reagem a mudanças reais; snapshot único `listCrm` recarrega tudo a cada mutação.
- **Timeline sem origem única**: mudanças de etapa não geram evento de timeline (só reunião realizada gera).

## 5. Problemas de UX/UI

- Telas que parecem funcionais mas não persistem nada (Atividades, Tarefas, Reuniões, Propostas, Metas) criam falsa sensação de sistema pronto.
- Números zerados no Dashboard/Forecast sem explicação — falta estado "dados incompletos" ou pedido de preenchimento.
- Não há edição inline nem ação rápida no card do kanban (mudar valor, marcar follow-up, agendar próxima ação).
- Busca global não leva a lugar nenhum útil (resultados mock).
- Sem estados vazios orientados a ação nas telas reais (ex.: "nenhum evento de LinkedIn — registrar primeiro contato").
- Sem confirmação/desfazer em ações destrutivas (excluir tag) e sem feedback de carregamento em algumas listas.
- Falta visão "conta" completa: abrir a empresa e ver contatos + oportunidades + discovery + reuniões + cadência num só lugar.

## 6. Arquitetura, dados e segurança

- **RLS**: correta e consistente (dono ou gestor) em todas as tabelas comerciais; `pipelines`/`stages` legíveis por qualquer autenticado e administráveis só por gestor. Sem acesso anônimo.
- **Exposição de perfis**: `profiles` é legível por qualquer autenticado e inclui e-mail — aceitável para equipe interna, mas é PII compartilhada; vale restringir colunas.
- **`opportunity_tags` sem política de UPDATE** (ok, é tabela de vínculo).
- **Config duplicada** entre `src/lib/config.ts` e o banco — principal risco de inconsistência do projeto.
- **Snapshot monolítico**: `listCrm` traz todas as tabelas em cada carga; funciona no volume atual, escala mal.
- **Sem camada de auditoria/eventos**: não existe tabela de eventos única (etapa, atividade, reunião, nota) que sustente timeline, IA e relatórios futuros.
- **Sem estrutura para sensores externos** (Gmail, Google Agenda, transcrições) — nenhuma tabela de contas conectadas, mensagens, eventos de agenda ou transcrições.

## 7. O que falta para uso diário real

1. Editar e excluir oportunidade (valor, setup, fechamento, responsável, temperatura, próximo passo, motivo de perda).
2. Criar e editar empresa e contato pela interface, com vínculo correto entre eles.
3. Atividades/follow-ups reais no banco, vinculados a empresa/contato/oportunidade, com "hoje / atrasadas / semana" e conclusão.
4. Reuniões como entidade consultável (agenda) alimentando o histórico da oportunidade e da empresa.
5. Cadência de LinkedIn agrupada por empresa, com perfil, mensagens enviadas, aceites e próxima ação/data.
6. Discovery visível e cobrado antes da primeira reunião, anexado à empresa e à oportunidade.
7. Ficha da empresa completa (360º).
8. Dashboard e Relatórios 100% sobre dados reais.
9. Preenchimento dos valores comerciais das 27 oportunidades importadas.
10. Estrutura preparada (tabelas vazias + contrato) para Gmail, Google Agenda e transcrições — sem simular integração.

## 8. Backlog priorizado

**P0 — bloqueia o uso**
- Edição/exclusão de oportunidade (todos os campos comerciais).
- Preencher valor, setup e data de fechamento das oportunidades importadas.
- CRUD de empresa e contato.
- Atividades/follow-ups reais (tabela + tela + vínculo + concluir).
- Eliminar `STAGES`/`OWNERS` mock: UI passa a ler só banco.

**P1 — essencial**
- Timeline unificada por eventos (mudança de etapa, atividade, reunião, nota, proposta).
- Reuniões como entidade + agenda real.
- Cadência LinkedIn agrupada por empresa com próxima ação.
- Ficha 360º da empresa (contatos, oportunidades, discovery, reuniões, cadência).
- Dashboard e Forecast sem nenhuma fonte mock.
- Busca global sobre o banco.
- `days_in_stage` derivado de `stage_changed_at`.

**P2 — importante**
- Propostas reais; Metas reais por usuário/período; Relatórios reais (perda, ciclo, origem, segmento, parceiros).
- Configuração de funis/etapas/campos migrada do `config.ts` para o banco.
- Notas, arquivos e checklist graváveis.
- Estados vazios, confirmações e edição rápida no kanban.

**P3 — futuro**
- Tabelas e contratos para Gmail, Google Agenda e transcrições (Fireflies/Otter/Meet), sem conectar.
- IA Comercial consumindo a timeline unificada.
- Permissões finas por equipe, auditoria e notificações.

## 9. Ordem recomendada (menor retrabalho)

1. **Modelo de dados primeiro**: criar `activities`, `meetings`, `opportunity_events` (timeline), `proposals`, `goals`, e mover funis/etapas/campos definitivamente para o banco. Tudo com RLS igual ao padrão atual.
2. **Camada de escrita**: server functions de update/delete para oportunidade, empresa e contato, todas gravando evento na timeline.
3. **Higienização dos dados importados** (valores, datas, contatos faltantes).
4. **Trocar mock por real nas telas**, na ordem: Pipeline/Drawer → Empresas/Contatos (360º) → Atividades → Reuniões → Dashboard/Forecast → Relatórios/Metas/Propostas.
5. **Remover `src/lib/data.ts` como fonte de dados** (fica só com formatadores e tipos) e remover `OWNERS`/`STAGES`.
6. **Cadência LinkedIn agrupada** sobre `prospecting_events` já existentes.
7. **Camada de sensores** (tabelas vazias + contrato) por último, junto com a preparação para IA.

Fazer o passo 1 antes de qualquer tela evita reescrever componentes duas vezes — é a maior economia de retrabalho do projeto.

## 10. Critério objetivo de "CRM finalizado"

O CRM é considerado pronto para uso quando, em teste com usuário real:

1. Nenhuma tela lê `src/lib/data.ts` como fonte de dados.
2. É possível criar, editar e excluir empresa, contato e oportunidade pela interface, com vínculos corretos.
3. Mover card no kanban persiste e gera evento na timeline.
4. Toda oportunidade tem valor, responsável, etapa, próxima ação e data de fechamento preenchíveis.
5. Atividades/follow-ups podem ser criadas, vinculadas e concluídas, e aparecem em "hoje/atrasadas".
6. Discovery pode ser preenchido antes da reunião e é visível na empresa e na oportunidade.
7. Reunião registrada aparece no histórico da oportunidade e da empresa.
8. Cadência de LinkedIn mostra, por empresa, conexões, aceites, mensagens e próxima ação com data.
9. Busca global e todos os filtros retornam dados reais.
10. Dashboard, Forecast e Relatórios batem com uma conferência manual das oportunidades do banco.
11. Um vendedor só vê os próprios registros; um gestor vê todos (validado em duas contas).
12. Build, tipos e navegação autenticada sem erro; sem números zerados inexplicados.
