# Spec — Integração de leads: Clube de Vantagens → Sanchez Connect

Status: **planejado, não implementado.** Documento pronto para execução quando a Bruna chamar.
Última revisão: 2026-07-27.

## 1. Objetivo

Todo cadastro no Clube de Vantagens é um lead em potencial. Quando alguém se cadastra no site do Clube, esse contato deve ficar disponível no **Sanchez Connect** (CRM interno) para o time comercial trabalhar — cruzando por **CPF/CNPJ** para saber se é gente nova ou alguém que a Sanchez já conhece.

Resumo da regra de negócio:
- **Documento (CPF/CNPJ) novo** no Connect → **lead novo** no funil comercial.
- **Documento já existente** no Connect (locatário/proprietário/cliente) → não é lead novo; é **enriquecimento** (marca que essa pessoa também entrou no Clube), não duplica.

## 2. Princípio de arquitetura (decisão já tomada)

**Dois bancos Supabase SEPARADOS. Não fundir.** O lead cruza por CPF/CNPJ (campo `documento`), não por chave estrangeira entre bancos.

Por quê:
1. **Segurança** — o Clube é site público e roda a `anon key` no browser. O Connect tem ~350 clientes reais, contratos e dados sensíveis. Fundir colocaria a chave de qualquer visitante no mesmo banco do CRM; um erro de RLS vazaria tudo. Bancos separados = parede física.
2. **Blast radius** — spam, contas de teste e bugs de migration do Clube não tocam o banco de produção do Connect.
3. **Ritmo** — Clube deploya no push (Vercel), muda rápido; Connect é interno e cauteloso. Schemas independentes.

Bancos:
- **Clube** = projeto Supabase próprio e isolado (hoje PAUSADO; ver pré-requisitos).
- **Connect** = org `conectar`, ref `ljjspipywlhyspfsvljz`.

## 3. Pré-requisitos (o que precisa existir ANTES da integração)

⚠️ A integração depende de coisas que ainda não existem:

1. **Fase 2 do Clube construída** — hoje o Clube só tem a landing page. O cadastro/login (Supabase Auth) e as tabelas `membros`/`indicacoes` **nunca foram ao ar**. Sem elas não há lead para enviar. É o primeiro passo.
2. **Banco do Clube reativado** — o projeto Supabase do Clube está pausado (cedeu vaga na conta). Reativar ou criar novo.
3. **Campo de tipo de cliente no Connect** — o Connect precisa distinguir lead novo de cliente existente. Ver a pendência do campo `tipo` de cliente + filtro na Carteira do Connect.

## 4. Modelo de dados

### 4.1 Origem — banco do Clube

`membros` (o cadastro do site):
| campo | tipo | nota |
|---|---|---|
| `id` | uuid | = auth uid |
| `documento` | text UNIQUE | CPF/CNPJ — chave de cruzamento |
| `nome` | text | |
| `whatsapp` | text | |
| `email` | text | |
| `codigo_indicacao` | text UNIQUE | link de indicação próprio |
| `indicado_por` | uuid null | quem indicou (FK interna do Clube) |
| `status` | enum | `membro` \| `lead` \| `cliente` (default `lead`) |
| `origem` | text | `clube` |
| `created_at` | timestamptz | |

`indicacoes`: `indicador_id`, `indicado_id`, `status` (`cadastrado`\|`convertido`), `pontos_gerados`.

### 4.2 Destino — banco do Connect

Um registro de lead com rastro da origem. Não sobrescrever cliente existente — associar.

`leads_clube` (ou campo `origem` na entidade de contatos/leads já existente do Connect):
| campo | tipo | nota |
|---|---|---|
| `id` | uuid | PK no Connect |
| `documento` | text | chave de cruzamento (indexar) |
| `nome`, `whatsapp`, `email` | text | copiados do Clube |
| `origem` | text | `clube_vantagens` |
| `membro_clube_id` | uuid | id do membro no banco do Clube (referência lógica, não FK física) |
| `status_funil` | enum | `novo` \| `em_contato` \| `qualificado` \| `convertido` \| `descartado` |
| `cliente_existente` | bool | true se o `documento` já batia com um cliente do Connect |
| `entrou_em` | timestamptz | data do cadastro no Clube |
| `sincronizado_em` | timestamptz | quando a ponte trouxe/atualizou |

## 5. Ponte — opção escolhida e alternativas

Três opções, do mais barato ao mais robusto. **Recomendada para começar: Opção 1.**

### Opção 1 — Connect lê o banco do Clube ao vivo (RECOMENDADA)
O backend do Connect tem um 2º client Supabase apontando para o banco do Clube, usando a **`service_role` do Clube guardada SÓ no backend do Connect** (nunca no browser). Quando o corretor abre a tela de leads no Connect, o Connect lê `membros`/`indicacoes` do Clube e cruza por `documento`.
- **Prós:** zero infra nova, dado sempre atual, nada rodando em background.
- **Contras:** acopla a leitura ao banco do Clube estar de pé; cruzamento feito em tempo de leitura.

### Opção 2 — Sync agendado (cron/n8n)
Um job periódico lê `membros` novos do Clube e faz **upsert** em `leads_clube` dentro do Connect (dedup por `documento`). O corretor edita/marca status sem tocar no Clube.
- **Prós:** dados do lead materializados no Connect, corretor tem controle total do funil.
- **Contras:** +1 peça rodando, latência do intervalo.

### Opção 3 — Webhook no cadastro
Edge Function no Clube dispara no `INSERT` de `membros` e chama um endpoint do Connect (push em tempo real).
- **Prós:** tempo real.
- **Contras:** mais manutenção, tratamento de retry/falha.

## 6. Fluxo da Opção 1 (passo a passo)

1. Corretor abre "Leads do Clube" no Connect.
2. Backend do Connect lê `membros` do banco do Clube (via `service_role` do Clube, server-side).
3. Para cada `documento`, o Connect cruza com a base de clientes própria:
   - **não existe** → mostra como **lead novo** (`cliente_existente = false`).
   - **existe** → mostra como **cliente que também entrou no Clube** (`cliente_existente = true`), sem duplicar.
4. Corretor trabalha o lead; ao converter, marca no Connect. (Opcional: escrever de volta `status = cliente` no Clube para fechar o ciclo de recompensa de indicação — decidir se a escrita reversa é desejada.)

## 7. Segurança (obrigatório)

- A `service_role` do Clube fica **exclusivamente no backend do Connect** (variável de ambiente server-side). **Nunca** no browser, nunca em código client-side, nunca commitada.
- O site do Clube continua usando só a `anon key` com RLS (membro vê só os próprios dados).
- Cruzamento e leitura de `membros` sempre server-side no Connect.
- Nada de dados pessoais em URL/query string.

## 8. Cuidados de implementação

- **Idempotência/dedup:** cruzamento sempre por `documento` normalizado (só dígitos, sem pontuação). Upsert por `documento` na Opção 2/3.
- **Normalizar CPF/CNPJ** dos dois lados antes de comparar (remover `.`, `-`, `/`).
- **LGPD:** a pessoa se cadastrou no Clube; o uso comercial do dado no Connect precisa de base legal/consentimento no cadastro do Clube (texto de aceite). Confirmar com a Sanchez.
- **Indicações:** o vínculo `indicado_por` é interno do Clube. Se o Connect precisar do grafo de indicação para recompensa, ler `indicacoes` junto.

## 9. Checklist de execução (quando a Bruna chamar)

- [ ] Fase 2 do Clube no ar (Auth + tabelas `membros`/`indicacoes` + RLS).
- [ ] Banco do Clube reativado.
- [ ] Campo `tipo`/origem de cliente no Connect (distinguir lead novo × cliente).
- [ ] `service_role` do Clube configurada como env server-side no backend do Connect.
- [ ] 2º client Supabase no backend do Connect apontando para o Clube.
- [ ] Tela "Leads do Clube" no Connect: leitura + cruzamento por `documento` + flag `cliente_existente`.
- [ ] Normalização de CPF/CNPJ nos dois lados.
- [ ] (Opcional) escrita reversa `status = cliente` no Clube ao converter.
- [ ] Texto de consentimento/LGPD no cadastro do Clube.

## 10. Decisões em aberto

- Opção 1 (leitura ao vivo) vs 2 (materializar leads no Connect)? Recomendação: começar na 1, migrar pra 2 se o time quiser editar/anotar os leads dentro do Connect.
- Escrita reversa (Clube ← Connect) para fechar o ciclo de recompensa de indicação: fazer agora ou depois?
- Onde os leads aparecem no Connect: tela própria "Leads do Clube" ou dentro da Carteira com filtro de origem?
