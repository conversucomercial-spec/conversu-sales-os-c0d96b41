# Conversu Sales OS

Se eu estivesse construindo isso para a Conversu, eu faria um prompt com uma visão de produto, não apenas de uma tela. O Lovable costuma entregar resultados muito melhores quando entende o contexto, o objetivo e as regras do sistema.

PROMPT — CONVERSU SALES OS

Você é um Product Designer Sênior, UX/UI Designer, Arquiteto de Software e Engenheiro Frontend especialista em plataformas SaaS B2B.

Sua missão é construir um sistema chamado Conversu Sales OS.

Objetivo

O Conversu Sales OS não é apenas um CRM.

Ele é uma plataforma inteligente para gestão comercial, criada para ajudar vendedores e gestores a acompanharem todo o ciclo de vendas de forma clara, organizada e eficiente.

O sistema deve transmitir a sensação de um produto premium, moderno e extremamente intuitivo, semelhante a Attio, Linear, Notion, Vercel, Stripe e HubSpot, priorizando simplicidade, velocidade e foco.

A primeira versão será apenas um protótipo funcional (frontend), utilizando dados fictícios. Não implemente autenticação, backend ou integrações nesta etapa.

Identidade Visual

Crie uma interface moderna, minimalista e elegante.

Utilize:

Muito espaço em branco

Bordas suaves

Cards limpos

Sombras discretas

Tipografia moderna

Ícones consistentes

Design responsivo

Animações suaves

Excelente experiência desktop

A sensação deve ser de um software premium.

Estrutura do Sistema

Menu lateral fixo contendo:

Dashboard

Pipeline

Empresas

Contatos

Atividades

Reuniões

Propostas

Forecast

IA Comercial

Relatórios

Configurações

Dashboard

Ao abrir o sistema quero visualizar imediatamente:

Cards

Pipeline Total

Forecast

Receita Prevista

Receita Fechada

Ticket Médio

Win Rate

Negociações em Risco

Próximos Fechamentos

Atividades Pendentes

Reuniões Hoje

Gráficos

Pipeline por etapa

Pipeline por vendedor

Pipeline por segmento

Origem dos leads

Conversão do funil

Forecast mensal

Receita mensal

Área "Hoje"

Mostrar:

Follow-ups de hoje

Propostas vencendo

Negociações sem atualização

Clientes aguardando resposta

Reuniões do dia

Pipeline

O pipeline deve ser Kanban.

Etapas:

Prospecção

Contato Inicial

Qualificação

Diagnóstico

Demonstração

Proposta

Negociação

Fechado Ganho

Fechado Perdido

Cada card deve conter:

Empresa

Contato

Valor

Temperatura

Probabilidade

Health Score

Dias na etapa

Próxima atividade

Responsável

Ao clicar em um card, abrir um painel lateral (Drawer), sem sair da tela.

Tela da Oportunidade

Cada oportunidade deverá possuir:

Resumo Executivo

Timeline

Histórico

Notas

Atividades

Reuniões

Arquivos

Propostas

Checklist

Informações comerciais

Empresa

Contato principal

Valor

Responsável

Data prevista de fechamento

Temperatura

Probabilidade

Próximo passo

Health Score

IA Comercial

Reserve um painel para IA.

Ainda não implemente IA.

Apenas deixe os componentes preparados.

O painel deverá conter:

Resumo da negociação

Principais dores

Objeções

Próximos passos sugeridos

Chance de fechamento

Riscos

Argumentos comerciais

Resumo das reuniões

Resumo das propostas

Insights comerciais

Empresas

Página contendo:

Lista de empresas

Segmento

MRR potencial

Responsável

Número de oportunidades

Status

Ao abrir uma empresa mostrar:

Resumo

Contatos

Histórico

Oportunidades

Reuniões

Arquivos

Contatos

Lista completa de contatos.

Cada contato deverá possuir:

Cargo

Empresa

Telefone

WhatsApp

E-mail

LinkedIn

Histórico

Relacionamento

Atividades

Lista geral contendo:

Ligações

WhatsApp

E-mails

Follow-ups

Tarefas

Reuniões

Filtros por:

Responsável

Status

Data

Prioridade

Forecast

Página dedicada contendo:

Receita prevista

Forecast ponderado

Pipeline

Probabilidade

Fechamentos do mês

Próximos meses

Gráficos modernos.

Relatórios

Criar dashboards para:

Pipeline

Conversão

Tempo médio de venda

Origem dos leads

Ranking de vendedores

Segmentos

Motivos de perda

Forecast

Receita

UX

Priorizar velocidade.

Poucos cliques.

Nunca abrir muitas telas.

Sempre que possível utilizar Drawers.

Utilizar tabelas modernas.

Utilizar filtros rápidos.

Pesquisa global.

Interface extremamente fluida.

Componentes

Criar componentes reutilizáveis.

Cards

Badges

Tags

Indicadores

Timeline

Drawer

Kanban

Tabelas

Modais

Gráficos

KPIs

Preparação para IA

Embora a IA não seja implementada nesta versão, toda a arquitetura visual deve estar preparada para recebê-la futuramente.

O sistema deverá prever funcionalidades como:

Resumos automáticos de negociações

Sugestão de próximos passos

Geração automática de tarefas

Forecast inteligente

Score automático da oportunidade

Identificação de negociações em risco

Resumo de reuniões

Estratégias de negociação

Assistente comercial

Recomendações de follow-up

Escalabilidade

O projeto deve ser organizado para permitir futura implementação de:

Banco de dados

APIs

Integração com Notion

Supabase

PostgreSQL

CRM próprio

WhatsApp

E-mail

Calendário

IA

Sem necessidade de reestruturar o frontend.

Resultado esperado

O resultado deve ser um software com aparência de produto pronto para comercialização, e não apenas um conjunto de telas.

Quero um sistema que transmita confiança, organização e inteligência, oferecendo uma experiência superior à de CRMs tradicionais.

O foco deve estar em produtividade, clareza do pipeline, facilidade de navegação e preparação para recursos avançados de IA no futuro. Antes de gerar qualquer tela, pense como um Product Manager e projete uma experiência coesa, escalável e consistente em toda a aplicação.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://conversu-sales-os.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c7f85ae9-d1eb-48af-b7c2-72335ae37d91).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
