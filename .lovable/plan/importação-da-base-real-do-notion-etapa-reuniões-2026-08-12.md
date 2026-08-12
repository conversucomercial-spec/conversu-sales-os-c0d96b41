# Importação da base real do Notion + etapa Reuniões

Fonte primária: CSV completo do export ("CRM de Vendas ..._all.csv") — 27 registros. As 27 páginas `.md` repetem as mesmas propriedades (sem conteúdo extra; só "Assurant" tem uma linha de contato no corpo). Não há bases separadas de Empresas, Contatos, Prospecção LinkedIn, Discovery ou Reuniões.

## Um ponto a alinhar antes de executar

Não existe hoje uma etapa chamada **Reuniões** no banco. As etapas atuais são: Prospecção, Contato Inicial, Qualificação, Diagnóstico, **Demonstração**, Proposta, Negociação, Fechado Ganho, Fechado Perdido.

Como você pediu para NÃO criar uma nova etapa, o plano **renomeia a etapa existente "Demonstração" para "Reuniões"** (mesma coluna, mesma posição, mesma probabilidade — nenhuma etapa nova é criada) e usa ela como o momento de reunião do funil. Os 7 registros do Notion em "Reunião agendada" entram nessa etapa com o **status de reunião = Reunião agendada**.

## Mapeamento (revalidado no arquivo)

**Empresas** — do Notion só existem: nome, origem do lead, responsável e observações (que trazem canal + segmento, ex.: "Linkedin, Seguradora"). Segmento é extraído das observações quando presente; MRR, site, cidade, funcionários, parceiro e LinkedIn **não existem** no arquivo e ficam nulos/zerados. 27 empresas, sem duplicidade de nome.

**Contatos** — nome, e-mail, telefone e última interação existem. Cargo, WhatsApp, LinkedIn, relacionamento e influência **não existem**; ficam nulos/padrão. Um registro sem nome de contato não gera contato.

**Oportunidades** — título/empresa, contato, etapa, origem, temperatura, criado em, última interação, próximo follow-up, próxima ação, observações, responsável, motivo de perda, valor de setup e saúde. Previsão de fechamento, probabilidade, MRR, prioridade, concorrente, validade/prazos e status de proposta/contrato estão vazios em 100% dos registros e ficam NULL.

**Etapas**: Qualificação → Qualificação (4); Diagnóstico realizado → Diagnóstico (5); Reunião agendada → **Reuniões** (7, com status de reunião); Proposta enviada → Proposta (1); Negociação → Negociação (5); Fechado perdido → Fechado Perdido (5). Probabilidade herdada da etapa.

**Funis pela origem**: Outbound 14 → Outbound; Inbound 2 → Inbound; Evento 2 → Inbound; Indicação 4 e Parceria 5 → Parcerias. Enterprise não é tocado. Etapas faltantes nos funis Inbound/Parcerias (Diagnóstico, Reuniões) são adicionadas àqueles funis para que os registros reais caibam sem trocar de pipeline.

**Normalizações**: datas pt-BR com "(BRT)" convertidas no fuso de São Paulo; "❄️ Fria" → Fria, "🟡 Morna" → Morna; "🔴 Crítica - follow-up atrasado" → saúde crítica, "⚪ Concluído" → concluído; nomes com espaço sobrando aparados.

**Setup**: campo numérico "Valor Setup (R$)" prevalece. Banco Fibra e 99/Ezze ficam com R$ 10.000 (texto dizia 15k). Sancor (10k) e Portilho (5k) só têm o texto — valor inferido e sinalizado no relatório. `value` continua 0; setup vai em campo próprio.

**Responsáveis**: 26 "Conversu comercial" + 1 "Conversu Tecnologia" → todos com owner do seu usuário, nome original preservado em campo textual.

**LinkedIn/Discovery/Reuniões passadas**: sem dados no arquivo — nada é inventado; estrutura fica pronta para preenchimento manual.

## Execução

1. **Migração**: renomear a etapa Demonstração → Reuniões; completar etapas faltantes em Inbound/Parcerias; adicionar `opportunities.setup_value numeric`, `loss_reason text`, `owner_label text`, `meeting jsonb` (status, data, hora, responsável, participantes, link, pauta, insights, dores, objeções, próximos passos); índices únicos em `legacy_key` de companies/contacts/opportunities.
2. **Importar** as 27 empresas, contatos e oportunidades com `ON CONFLICT (legacy_key) DO UPDATE` (reimportável sem duplicar), empresa deduplicada por nome.
3. **Validar** antes de remover: contagens por funil/etapa/status de reunião, órfãos, duplicidades, FKs, owner, datas, setup, motivo de perda, e conferência nominal de Sancor, Portilho, Banco Fibra e 99/Ezze.
4. **Só então remover** os 18 companies, 18 contacts e 24 opportunities de exemplo (identificados por não possuírem `legacy_key` do Notion).
5. **Interface**: bloco de Reunião no drawer (status, data/hora, responsável, participantes, link, pauta, insights, dores, objeções, próximos passos), editável e gravando evento na timeline ao marcar como realizada, com botão para levar insights/dores/próximos passos ao Discovery; badge de status de reunião no card quando a oportunidade estiver em Reuniões; setup e motivo de perda exibidos no card/drawer. Sem página nova; layout preservado.
6. **Validação técnica**: build, typecheck, lint dos arquivos tocados, RLS/ownership e teste no navegador autenticado (Empresas, Contatos, Pipeline, Dashboard, Forecast, criação de oportunidade, drag-and-drop, Reuniões, Discovery).
7. **Relatório final** com todos os itens pedidos. Sem deploy, sem mexer em Auth/profiles/user_roles/GitHub.

## Detalhes técnicos

- SQL de carga gerado a partir do CSV com parser pt-BR e normalização de emoji na geração, não em runtime; `legacy_key` = ID da página Notion (sufixo do nome do arquivo).
- `crm-mappers`/`crm.functions` estendidos com `setupValue`, `lossReason`, `ownerLabel` e `meeting`; nova server fn `saveMeeting` com `requireSupabaseAuth`.
- `pipeline-routing` ganha `evento -> inbound`; nenhum fallback entre funis é reintroduzido.
- RLS atual (dono/gestor) reaproveitada tal como está; nenhuma policy nova além das dos campos já cobertos pela tabela `opportunities`.
