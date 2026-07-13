# Clube de Vantagens — Comunidade Sanchez

Landing Page + (em breve) área de membro do Clube de Vantagens da **Sanchez Imóveis**
(Mogi das Cruzes / Alto Tietê). Projeto **separado** que depois será conectado ao
**Sanchez Connect** (CRM), cruzando cadastros por CPF/CNPJ.

## Stack

Vite 6 · React 19 · TypeScript (strict) · Tailwind CSS 3 · Framer Motion v12 ·
Lucide React · React Router v7 · Supabase (fase 2).

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5175
npm run build    # build de produção
```

## Estrutura

```
src/
  data/parceiros.ts      # ← array editável dos parceiros (nome, categoria, voucher, site, whatsapp)
  lib/recompensas.ts     # ← constantes de pontos (PONTOS_CADASTRO/INDICACAO/CONVERSAO)
  components/            # Hero, SobreSanchez, ComoFunciona, VitrineParceiros (+ modal),
                         # IndiqueGanhe, CtaCadastro, Footer, Navbar
  assets/                # imagens (PLACEHOLDERS — trocar pelas artes finais)
```

## O que já está pronto (fase 1 — design da LP)

- Landing Page completa e responsiva: hero, institucional (Yruena / Sanchez Premium),
  como funciona, vitrine dos 6 parceiros com **modal** (benefício, site, WhatsApp),
  bloco "Indique & Ganhe" (recompensa dos dois lados) e CTA de cadastro.
- Identidade: terracota `hsl(12,84%,52%)`, dourado `hsl(39,89%,47%)`, creme, grafite.
  Tipografia Fraunces + Inter + IBM Plex Mono.

## Próximos passos (fase 2 — quando a Yruena aprovar o visual)

1. Trocar imagens placeholder pelas artes/logos definitivas.
2. Preencher `site` e `whatsapp` de cada parceiro em `src/data/parceiros.ts`.
3. Criar projeto **novo** no Supabase e preencher `.env` (ver `.env.example`).
4. Migrations SQL (`membros`, `indicacoes`, RLS) em `supabase/migrations/`.
5. Supabase Auth: cadastro (nome, WhatsApp, e-mail, CPF/CNPJ, senha) + login.
6. Área do membro logada: pontos, código de indicação, lista de indicações.
7. Camada de dados isolada em `src/lib/` (`criarMembro`, `registrarIndicacao`).

## Conexão futura com o Sanchez Connect

O Connect vai **ler** as tabelas `membros` e `indicacoes` deste projeto, cruzando
por **`documento` (CPF/CNPJ)** e pelo **código de indicação**. Toda escrita de dados
fica isolada em `src/lib/` para o Connect plugar depois — este projeto **não**
implementa lógica de CRM nem de conversão de lead.
