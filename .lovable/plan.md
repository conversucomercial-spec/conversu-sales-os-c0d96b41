# Auditoria — Integração GitHub + Backend (Supabase)

Nenhuma alteração foi feita. Relatório do estado atual e próximos passos.

## 1. GitHub

- O projeto **não está conectado ao GitHub**. O repositório aponta apenas para o armazenamento Git interno do Lovable (`origin` + backup `secondary`), sem remoto `github.com`.
- Histórico de commits ativo e íntegro (últimos: "Lovable update", "Finalizou telas e configurações").
- Consequência: não há CI, code review, nem backup externo do código.

## 2. Banco de dados

Tabelas no schema público: **apenas 2** — `profiles` e `user_roles`.

| Item | Estado |
|---|---|
| Migrations versionadas | 2 arquivos, coerentes com o banco real |
| RLS | Habilitado nas duas tabelas |
| GRANTs | Presentes (authenticated + service_role); sem acesso anônimo |
| Enum `app_role` | `gestor`, `vendedor` |
| Registros | 1 perfil, 1 papel (conta de teste) |

Políticas ativas:
- `profiles`: leitura para qualquer autenticado; criação e edição só do próprio perfil; sem exclusão.
- `user_roles`: usuário vê os próprios papéis; gestor vê todos. Sem escrita pela API (papéis só mudam via banco/trigger) — correto e seguro contra escalonamento de privilégio.

Funções e triggers:
- `has_role()` — SECURITY DEFINER, `search_path` fixo, execução só para autenticados.
- `handle_new_user()` — cria perfil + papel `vendedor` no cadastro (trigger em auth.users).
- `update_updated_at_column()` — trigger de atualização em `profiles`.

Ponto de atenção do linter: aviso de que `has_role()` é SECURITY DEFINER executável por usuário logado. Neste caso é o padrão recomendado (a função existe justamente para ser usada nas políticas) — é aceitável, mas vale registrar a decisão.

## 3. Autenticação e frontend

- Login por e-mail/senha + Google, tela `/auth`.
- Área protegida `_authenticated` com verificação real de sessão e redirecionamento para `/auth`.
- Token de sessão anexado automaticamente às chamadas de servidor (`attachSupabaseAuth`), com proteção CSRF ativa.
- Consumo do banco hoje: **somente perfil e papel** (hook de sessão) e a edição de perfil em Configurações. Nada mais toca o banco.
- Não há nenhuma função de servidor implementada ainda — apenas o middleware de autenticação disponível.

## 4. O que ainda é mock

Todos os dados comerciais vivem em arquivos do frontend:
- `src/lib/data.ts` — empresas, contatos, oportunidades, atividades, reuniões, propostas, histórico, índice de busca e todas as métricas derivadas.
- `src/lib/config.ts` — pipelines, etapas, critérios, playbooks, campos personalizados e metas.
- `src/lib/partners.ts` — parceiros e cálculos de repasse.

Todas as telas (Dashboard, Pipeline, Empresas, Contatos, Atividades, Tarefas, Reuniões, Propostas, Forecast, Relatórios) leem desses arquivos.

## 5. Estruturas necessárias para migrar ao banco

Tabelas sugeridas, em ordem de dependência:

```text
pipelines → stages → custom_field_defs
companies → contacts
opportunities (empresa, contato, etapa, dono, valor, temperatura,
               probabilidade, health score, origem, parceiro, datas)
  ├── opportunity_custom_values
  ├── checklist_items
  └── timeline_events / notes
activities (ligação, whatsapp, e-mail, follow-up, tarefa)
meetings · proposals · files
partners · goals (empresa/equipe/vendedor por período)
```

Também necessário: coluna de dono (`owner_id`) em oportunidades para RLS por vendedor, políticas onde gestor vê tudo e vendedor vê o próprio, GRANTs por tabela, triggers de `updated_at` e uma camada de leitura/escrita via funções de servidor no lugar dos imports diretos dos mocks.

## 6. Próximos passos recomendados

1. Conectar o projeto ao GitHub (backup e revisão de código).
2. Definir o modelo de acesso comercial: vendedor vê só o que é dele, gestor vê tudo.
3. Migrar primeiro o núcleo: empresas, contatos e oportunidades (com etapas e pipelines), incluindo dados de exemplo.
4. Trocar as telas de Pipeline, Empresas e Contatos para leitura do banco, mantendo o restante em mock durante a transição.
5. Depois migrar atividades, reuniões, propostas, metas e parceiros.
6. Recalcular métricas (dashboard, forecast, relatórios) a partir do banco em vez dos arrays locais.
7. Registrar formalmente a decisão sobre o aviso de segurança da função de papéis.

Este documento é só o relatório — nada será executado sem sua aprovação de um plano de implementação.
