# Spec — Fase 2 do Clube (Auth + membros/indicações)

Status: **código praticamente pronto; falta rodar contra um Supabase real.** Este documento é o roteiro de ativação, endurecimento e verificação. É o **pré-requisito da [integração com o Connect](./integracao-leads-connect.md)** — sem Fase 2 no ar não há lead para enviar.
Última revisão: 2026-07-27.

## 1. O que JÁ está pronto no código

Não precisa reescrever — já existe e está coerente entre si:

- **Migrations** (`supabase/migrations/`):
  - `0001_membros_indicacoes.sql` — tabelas `membros` e `indicacoes`, RLS, e o trigger `handle_new_membro` (SECURITY DEFINER) que cria o registro no signup.
  - `0002_voucher_cadastro.sql` — troca pontos por **voucher fixo de R$100** (`voucher_cadastro`), remove `pontos`/`pontos_gerados`. Aplicar DEPOIS da 0001.
- **Camada de dados** (`src/lib/`):
  - `supabase.ts` — client com `anon key` (lança erro se faltar env).
  - `membros.ts` — `criarMembro` (signUp com metadata), `entrar`, `sair`, `buscarMeuPerfil`, `buscarMinhasIndicacoes`, `linkIndicacao`, tipos `Membro`/`Indicacao`.
  - `recompensas.ts` — `VALOR_VOUCHER_CADASTRO = 100` (ponto único de ajuste da Yruena).
- **Páginas** (`src/pages/`): `Cadastro.tsx` (lê `?ref=CODIGO`, chama `criarMembro`), `Login.tsx`, `AreaMembro.tsx`.
- **Rotas** já existem: `/cadastro`, `/login`, `/area`.

## 2. Schema final (depois das duas migrations)

`membros`:
| campo | tipo | nota |
|---|---|---|
| `id` | uuid PK | = `auth.users.id`, `on delete cascade` |
| `nome`, `whatsapp`, `email` | text not null | |
| `documento` | text **not null unique** | CPF/CNPJ — chave de cruzamento com o Connect |
| `codigo_indicacao` | text not null unique | derivado do uuid (8 chars) no trigger |
| `indicado_por` | uuid null | FK interna → `membros.id` |
| `voucher_cadastro` | numeric(10,2) | default 100.00 |
| `status` | text | `lead` \| `membro` \| `cliente` (default `lead`) |
| `origem` | text | default `clube` |
| `created_at` | timestamptz | |

`indicacoes`: `id`, `indicador_id` → membros, `indicado_id` **unique** → membros, `status` (`cadastrado`\|`convertido`), `created_at`.

**RLS:** membro faz SELECT/UPDATE só do próprio registro; indicação visível ao indicador ou indicado. **Não há policy de INSERT** — de propósito: quem insere é o trigger (SECURITY DEFINER), o client nunca insere direto.

**Trigger `handle_new_membro`** (roda `after insert on auth.users`): lê `raw_user_meta_data` (nome, whatsapp, documento, codigo_ref), gera `codigo_indicacao`, insere em `membros`; se veio `codigo_ref` válido, insere a linha em `indicacoes` vinculando indicador↔indicado.

## 3. Fluxo de cadastro

1. Visitante abre `/cadastro` (ou `/cadastro?ref=CODIGO` vindo de uma indicação).
2. `Cadastro.tsx` lê `ref` e chama `criarMembro({ nome, whatsapp, email, documento, senha, codigoRef })`.
3. `criarMembro` faz `supabase.auth.signUp` passando os dados em `options.data` (metadata).
4. O trigger `handle_new_membro` dispara e cria `membros` (+ `indicacoes` se houve `ref`).
5. `AreaMembro` mostra voucher, dados e link de indicação próprio (`linkIndicacao`).

## 4. Ativação — passo a passo

1. **Reativar/criar o projeto Supabase do Clube** (está pausado). Banco novo e isolado — NÃO usar o banco do Connect.
2. **Aplicar as migrations em ordem**: `0001` depois `0002` (SQL editor do Supabase ou CLI). Conferir que `membros`/`indicacoes`, RLS, e o trigger `on_auth_user_created` existem.
3. **Configurar env** (`.env` local e no dashboard da Vercel):
   - `VITE_SUPABASE_URL` = URL do projeto do Clube
   - `VITE_SUPABASE_ANON_KEY` = anon key do Clube (nunca a service_role)
4. **Auth settings no Supabase** (decidir, ver §6): confirmação de e-mail ON/OFF, provedores, URL de redirect.
5. **Testar** o fluxo completo (§5).
6. **Deploy** (push na `main` → Vercel).

## 5. Verificação (testar antes de considerar pronto)

- [ ] Cadastro cria usuário no Auth **e** linha em `membros` (trigger funcionou).
- [ ] Cadastro via `/cadastro?ref=CODIGO` cria a linha em `indicacoes` com indicador correto.
- [ ] Login entra e `AreaMembro` mostra os dados do próprio membro.
- [ ] RLS: um membro logado NÃO consegue ler o registro de outro (`select` retorna só o próprio).
- [ ] `documento` duplicado é barrado (unique) com mensagem amigável, não erro cru.
- [ ] Voucher de R$100 aparece na área do membro.
- [ ] Link de indicação copiável funciona e leva ao `/cadastro?ref=`.
- [ ] **Mobile e desktop** (regra do projeto: toda tela nos dois formatos).

## 6. Endurecimento (resolver antes de produção)

1. **Falha do trigger vira usuário órfão.** Se o `signUp` cria o usuário no Auth mas o INSERT em `membros` falha (ex.: `documento` duplicado ou ausente), fica um usuário no Auth sem `membros`. Mitigar: validar `documento`/campos no client antes do signUp, e tratar o erro do `signUp` mostrando mensagem clara. Avaliar um caminho de limpeza de órfãos.
2. **Normalizar `documento`** (só dígitos, sem `.`/`-`/`/`) **antes** do signUp — o unique é sobre o valor cru; formatos diferentes do mesmo CPF criariam duplicatas e quebrariam o cruzamento com o Connect.
3. **Confirmação de e-mail.** Por padrão o Supabase pede confirmação; o trigger cria `membros` já no signup (antes de confirmar). Decidir: desligar confirmação para UX mais fluida, ou manter e ajustar o texto/estado da área do membro para "e-mail pendente".
4. **Spam / contas de teste.** Cadastro é público. Considerar Turnstile/hCaptcha no formulário. Já existe pendência de limpar contas de teste (responsabilidade da Bruna via dashboard, sem service_role no projeto).
5. **Colisão de `codigo_indicacao`.** É derivado dos 8 primeiros chars do uuid; colisão é improvável mas o unique pode estourar. Avaliar retry/append no trigger se acontecer.
6. **LGPD/consentimento.** Incluir aceite no cadastro — o dado será usado comercialmente no Connect (ver o spec da integração).

## 7. Decisões em aberto

- **Recompensa do indicador:** hoje `indicacoes` é rastreada mas o indicador não ganha nada (a Yruena ainda vai definir se/como recompensar). O modelo de pontos foi removido (migration 0002) em favor do voucher fixo.
- **Confirmação de e-mail:** ON ou OFF?
- **Captcha no cadastro:** agora ou depois?

## 8. Liga com a integração Connect

Depois da Fase 2 no ar, os leads (`membros` com `documento`) ficam prontos para o Connect consumir. Ver [`docs/integracao-leads-connect.md`](./integracao-leads-connect.md) — cruzamento por CPF/CNPJ, 2 bancos separados, `service_role` do Clube só no backend do Connect.
