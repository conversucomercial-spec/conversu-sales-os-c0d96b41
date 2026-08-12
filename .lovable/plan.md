# Importação da base real do Notion (fonte primária)

Arquivo analisado: `ExportBlock-...Part-1.zip` — 1 base "CRM de Vendas" com **27 registros** (CSV completo) + 27 páginas `.md` que repetem as mesmas propriedades (sem conteúdo extra, exceto "Assurant", que traz uma linha de contato no corpo). Não há bases separadas de Empresas, Contatos, Prospecção LinkedIn ou Discovery.

## Relatório de mapeamento (antes de importar)

### Campos com destino direto

| Notion | Destino no CRM |
|---|---|
| Empresa/Negócio | Empresa (nome) + título da oportunidade |
| Contato, Email, Telefone | Contato (nome, e-mail, telefone) |
| Etapa | Etapa do funil |
| Origem do lead | Origem + escolha do funil |
| Temperatura | Temperatura (Fria/Morna) |
| Criado em | Data de criação |
| Última interação | Último contato |
| Próximo follow-up | Próxima atividade (data) |
| Próxima ação | Próximo passo |
| Observações | Resumo/notas |
| Responsável | Dono do registro |
| Motivo de perda | Campo próprio nas perdidas |
| Valor Setup (R$) | Novo campo "Setup" (decisão sua) |

### Conversões necessárias

- **Etapas**: Qualificação → Qualificação; Diagnóstico realizado → Diagnóstico; **Reunião agendada → nova etapa "Reunião agendada"**; Proposta enviada → Proposta; Negociação → Negociação; Fechado perdido → Fechado Perdido.
- **Funil pela origem**: Outbound (14) → Outbound; Inbound (2) → Inbound; Indicação (4) e Parceria (5) → Parcerias; **Evento (2) → Inbound** (não existe funil de eventos hoje).
- **Datas em português** ("2 de março de 2026 12:15", "(BRT)") convertidas para data real no fuso de São Paulo.
- **Emojis** removidos: "❄️ Fria" → Fria, "🔴 Crítica" → saúde crítica, "⚪ Concluído" → concluído.
- **Valor**: o campo "Valor" é texto ("Setup 10k"); o número real está em "Valor Setup (R$)". Vai para o novo campo Setup. Em "Sancor" e "Portilho" o número está ausente — extraído do texto (10k / 5k) e sinalizado no relatório final.
- **Banco Fibra** e **99/Ezze**: texto diz 15k, número diz 10.000 → prevalece o número, divergência registrada.
- **Responsável**: 26 "Conversu comercial" + 1 "Conversu Tecnologia" — ambos atribuídos à sua conta (único usuário), com o nome original preservado.

### Campos vazios em 100% dos registros (não importados)
Prioridade, Status/arquivo da proposta, Status/arquivo do contrato, Concorrente, Lugar, Validade e prazos de proposta/contrato, Previsão de fechamento, Probabilidade, Valor Mensal (MRR).

Consequência: a **probabilidade** vem da etapa do funil e a **previsão de fechamento** fica em branco — Forecast só terá valor após o time preencher. MRR fica zerado.

### Não vem do Notion
Nenhum dado de cadência de LinkedIn, Discovery, reuniões, atividades ou metas existe no export. Essas abas continuam vazias/mock, prontas para preenchimento manual.

## O que será feito

1. **Ajuste de estrutura**: nova etapa "Reunião agendada" nos funis Outbound, Inbound e Parcerias; novo campo de **valor de setup** na oportunidade; campo de **motivo de perda**.
2. **Limpeza**: remover as 18 empresas, 18 contatos e 24 oportunidades de exemplo (dados fictícios), conforme sua decisão. Nada de Auth, perfis ou papéis é tocado.
3. **Importação idempotente**: 27 empresas, 27 contatos (os que têm nome) e 27 oportunidades, cada uma com chave de origem do Notion para permitir reimportação sem duplicar.
4. **Ajuste de tela**: exibir setup e motivo de perda no card/drawer; garantir que Dashboard/Forecast lidem com valor e previsão vazios sem quebrar.
5. **Relatório final**: linha a linha do que entrou, o que foi convertido e o que ficou em branco.

## Detalhes técnicos

- Migração: `stages` (+`reuniao`, reposicionando as demais), `opportunities.setup_value numeric default 0`, `opportunities.loss_reason text`; `legacy_key` = ID da página Notion em companies/contacts/opportunities, com índice único.
- Carga via inserts SQL gerados a partir do CSV `_all` (fonte primária), `ON CONFLICT (legacy_key) DO UPDATE`.
- Parser de datas pt-BR e normalização de emoji feitos na geração do SQL, não em runtime.
- `crm-mappers`/`crm.functions` estendidos com `setupValue` e `lossReason`; `pipeline-routing` ganha `evento -> inbound`.
- Validação: contagens por etapa/funil conferidas contra o CSV, build, typecheck e conferência no navegador autenticado.
