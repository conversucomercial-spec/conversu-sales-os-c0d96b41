# Finalização dos fluxos comerciais e gestão de vendedores

## Objetivo
Corrigir os recursos que existem parcialmente, mas não funcionam de ponta a ponta, mantendo as alterações focadas no escopo solicitado.

## Implementação

### 1. Nova oportunidade
- Manter o nome da oportunidade como texto livre na criação e na edição.
- Garantir acesso ao mesmo formulário pela barra superior e pelo Pipeline.
- Corrigir a gravação explícita de “Nenhum parceiro”, sem herdar silenciosamente o parceiro da empresa.
- Validar empresa, contato, etapa, responsável, valor, probabilidade e previsão de fechamento.

### 2. Tags personalizadas
- Corrigir criação e aplicação em oportunidades, empresas e contatos.
- Ajustar ownership das associações para permitir que o gestor aplique tags em registros visíveis sem conflito de RLS.
- Atualizar imediatamente os dados exibidos após criar, aplicar ou remover uma tag.
- Manter filtros múltiplos por tags no Pipeline, com modos “qualquer” e “todas”.
- Adicionar confirmação antes de excluir uma tag usada no CRM.

### 3. Filtros e ordenação
- Consolidar o filtro de período no Pipeline, Atividades, Forecast, Reuniões e Propostas.
- Adicionar período de criação em Empresas e Contatos, expondo `created_at` na camada de dados.
- Manter ordenação alfabética A–Z/Z–A em Empresas e Contatos e incluir filtros úteis pelos campos exibidos.
- Corrigir os KPIs de Forecast e Reuniões para respeitarem os mesmos filtros da listagem.

### 4. Documentos e links
- Ampliar documentos para aceitar arquivo (incluindo PDF) ou link externo.
- Permitir vínculo com empresa, oportunidade, reunião e proposta.
- Exibir documentos no drawer da oportunidade, detalhes da empresa, reunião e proposta.
- Manter categorias: proposta, discovery, ata de reunião, contrato, apresentação e outro.
- Migrar Propostas e Reuniões para a fonte real já existente no banco, removendo o uso de mocks nessas telas.

### 5. Administração de vendedores
- Remover completamente o cadastro público por e-mail/senha; `/auth` ficará apenas para contas já liberadas.
- Definir `matheus@useconversu.com` como administrador proprietário, condicionado a e-mail confirmado.
- Criar uma função de servidor protegida que valida a identidade e o papel do administrador antes de convidar/criar vendedores.
- Adicionar a gestão de vendedores na aba Equipe das Configurações, visível e operável somente pelo administrador.
- Manter `user_roles` sem escrita direta pelo navegador e atribuir `vendedor` apenas no fluxo administrativo.
- Não conceder acesso automático a usuários novos por cadastro ou OAuth.

## Alterações de banco
- Ajustar políticas de tags para associações válidas entre registros e tags acessíveis.
- Acrescentar suporte a links externos e vínculo de documentos com propostas.
- Atualizar o provisionamento de perfis/papéis para eliminar liberação automática.
- Promover com segurança a conta administradora definida, somente se o e-mail estiver confirmado.
- Preservar RLS: vendedor acessa os próprios dados; gestor acessa o conjunto permitido.

## Validação
- Testar criação e edição de oportunidade pelos dois pontos de entrada.
- Testar criar/aplicar/remover tags nas três entidades e filtrar o Pipeline.
- Testar períodos, filtros e ordenações em todas as telas afetadas.
- Testar upload de PDF, inclusão de link, abertura e exclusão nos quatro vínculos.
- Confirmar que cadastro público não existe e que somente `matheus@useconversu.com` consegue criar vendedores.
- Validar as rotas autenticadas em desktop e mobile, erros de console e respostas de rede.

## 6. Tudo editável dentro do CRM após publicar
Nada de configuração fica preso no código: depois que o sistema estiver no ar, o administrador ajusta a operação pela própria interface, sem nova publicação.

- **Funis**: criar, renomear, descrever, reordenar, ativar/desativar e definir quais campos aparecem no card.
- **Etapas**: criar, renomear, reordenar, ajustar probabilidade, critérios de avanço e playbook de cada etapa.
- **Campos**: catálogo editável de campos de oportunidade, empresa e contato — nome, tipo (texto, número, valor, data, lista, sim/não), obrigatoriedade, valores de lista e em quais funis aparecem.
- **Listas de apoio**: origens, parceiros, temperaturas, prioridades, motivos de perda, status de reunião, categorias de documento e etapas de cadência LinkedIn.
- **Metas**: criar e editar metas por empresa, equipe e vendedor, com período, indicador e valor-alvo.
- **Automações**: regras editáveis do tipo “quando acontecer X, faça Y” — mudança de etapa, oportunidade parada há N dias, reunião marcada como realizada, proposta vencendo — gerando notificação, atividade automática ou ajuste de campo.
- **Equipe e permissões**: administrador libera contas, define papel e responsável padrão.
- Toda edição é versionada com autor e data, e as telas passam a ler essas configurações do banco em vez de valores fixos.
- Registros já existentes continuam válidos quando uma configuração muda; nada é apagado silenciosamente.

Isso substitui os valores atualmente fixos no código (funis, etapas, listas e metas), que passam a viver no banco e a ser administrados pela tela de Configurações.
