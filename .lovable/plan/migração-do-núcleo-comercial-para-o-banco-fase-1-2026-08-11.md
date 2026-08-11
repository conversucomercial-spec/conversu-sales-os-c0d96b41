# Migração do núcleo comercial para o banco (Fase 1)

Objetivo: pipelines, etapas, empresas, contatos e oportunidades passam a viver no banco, com as telas de Empresas, Contatos e Pipeline lendo e escrevendo dados reais. Autenticação, perfis e papéis existentes ficam intactos.

## Decisões confirmadas
- Todos os registros de exemplo passam a pertencer ao seu usuário.
- Dashboard e Forecast passam a calcular sobre as oportunidades reais; Atividades, Reuniões, Propostas, Metas e inteligência de parceiros continuam com dados fictícios nesta fase.
- Banco recebe apenas o essencial de pipelines e etapas. Playbooks, critérios de etapa e campos customizados continuam no código.

## Estrutura do banco

Cinco tabelas novas, espelhando exatamente os campos já usados no código:

- **pipelines** — nome, descrição, campos exibidos no card, ordem.
- **stages** — pertence a um pipeline: chave, nome, ordem, probabilidade.
- **companies** — nome, segmento, MRR, status, site, cidade, funcionários, origem, parceiro, nota, dono.
- **contacts** — nome, cargo, empresa, telefone, WhatsApp, e-mail, LinkedIn, relacionamento, influência, última interação, dono.
- **opportunities** — título, empresa, contato, pipeline, etapa, valor, probabilidade, temperatura, health score, prioridade, dias na etapa, origem, parceiro, segmento, fonte, próximo passo, próxima atividade e data, data prevista de fechamento, último contato, resumo, dores, objeções, sugestões, riscos, argumentos, checklist, timeline, notas, arquivos, campos customizados, dono.

Chaves são UUID; oportunidade referencia empresa, contato, pipeline, etapa e dono. Listas e blocos de texto ricos (dores, checklist, timeline, campos customizados) ficam em JSON, como já são no código. Índices nos campos de filtro e relacionamento (dono, pipeline, etapa, empresa, contato, origem, parceiro). Todas as tabelas ganham data de criação/atualização com atualização automática.

## Regras de acesso
- Gestor: enxerga e administra todos os registros comerciais.
- Vendedor: enxerga e altera apenas os próprios registros; ao criar, o registro nasce como dele.
- Pipelines e etapas: leitura para qualquer usuário autenticado, alteração apenas por gestor.
- Nada muda em perfis e papéis; a verificação usa a função de papel já existente.

## Migração dos dados de exemplo
Os 4 pipelines, suas etapas, 18 empresas, 18 contatos e 24 oportunidades atuais são inseridos no banco com os mesmos valores, relacionamentos e ordem de hoje, todos atribuídos ao seu usuário. Nada é descartado nem duplicado — a inserção é feita uma única vez.

## Frontend

1. Camada de acesso nova (`src/lib/crm.functions.ts` + `src/lib/crm-mappers.ts`) com leitura/criação/edição de empresas, contatos e oportunidades e leitura de pipelines/etapas, sempre pela sessão do usuário.
2. Os tipos atuais (`Opportunity`, `CompanyRow`, `ContactRow`) são preservados; o mapeador converte a linha do banco para o mesmo formato que a UI já consome, então cards, filtros, busca e drawers seguem iguais.
3. Telas convertidas: Empresas, Contatos e Pipeline (incluindo arrastar entre etapas, que passa a gravar a etapa no banco).
4. Dashboard e Forecast passam a receber a lista real de oportunidades; os cálculos de métricas viram funções puras que recebem essa lista, sem virar coluna no banco.
5. Busca global passa a indexar empresas, contatos e oportunidades reais.
6. Atividades, Reuniões, Propostas, Metas e Relatórios continuam lendo os dados fictícios atuais, sem alteração visual.

## Detalhes técnicos
- Acesso via server functions autenticadas, com carregamento por TanStack Query no cliente; nada de chave de serviço no frontend.
- Os arrays fictícios que dependem de oportunidades (atividades, reuniões, propostas) permanecem gerados a partir do conjunto fictício mantido em `src/lib/data.ts`, para não quebrar as telas ainda não migradas.
- `daysInStage` e dias desde o último contato passam a ser derivados das datas gravadas.
- Verificações finais: migrations aplicadas, chaves estrangeiras e políticas conferidas, build e tipos sem erro, login e rotas protegidas testados, e Empresas/Contatos/Pipeline validados no navegador.

## Fora do escopo
Conector GitHub, atividades/reuniões/propostas/metas/parceiros no banco, e qualquer mudança na conexão de repositório.
