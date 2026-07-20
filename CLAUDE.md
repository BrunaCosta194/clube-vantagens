# Clube de Vantagens — Sanchez Clube

Landing page + área de membro do clube de vantagens da Sanchez Imóveis (Mogi das Cruzes/SP). Site institucional que apresenta parceiros com desconto exclusivo para clientes da Sanchez, com cadastro, login e programa de indicação.

- Repo: `BrunaCosta194/clube-vantagens` (GitHub)
- Deploy: Vercel, auto-deploy no push pra `main` → clube-vantagens.vercel.app
- Cliente: Yruena (Sanchez Imóveis) — aprova nome, logo e parceiros

## Stack

- Vite 6 + React 19 + TypeScript (strict)
- Tailwind CSS 3 + Framer Motion + Lucide React
- React Router v7 (rotas client-side, SPA)
- Supabase (`@supabase/supabase-js`) — auth + banco de membros/indicações, projeto **novo e exclusivo** deste site (não é o banco do Sanchez Connect)

Scripts: `npm run dev`, `npm run build` (roda `tsc --noEmit` antes), `npm run preview`, `npm run lint` (= `tsc --noEmit`).

## Variáveis de ambiente

`.env` (não commitado, ver `.env.example`):
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
Configuradas também no dashboard da Vercel. Usa só a **anon key** — nunca a service_role.

Rewrite SPA configurado em `vercel.json` (evita 404 em `/cadastro`, `/login`, `/area`).

## Estrutura

```
src/
  App.tsx              rotas (Landing, Cadastro, Login, AreaMembro)
  pages/
    Landing.tsx         página principal (compõe os componentes abaixo)
    Cadastro.tsx / Login.tsx   fluxo de auth (Supabase)
    AreaMembro.tsx       área logada do membro
  components/
    Navbar.tsx, Footer.tsx, AuthLayout.tsx    header/rodapé/layout de auth
    Hero.tsx, BannerCarousel.tsx              topo da landing
    VitrineParceiros.tsx, ParceiroModal.tsx   grid de parceiros + modal de detalhe
    ComoFunciona.tsx, IndiqueGanhe.tsx, CtaCadastro.tsx
  data/
    parceiros.ts         array editável dos parceiros do clube (fonte única — Vitrine e Modal leem daqui)
  lib/
    supabase.ts           client Supabase
    membros.ts             camada de acesso (cadastro, login, dados do membro)
    recompensas.ts          lógica de voucher/indicação
  assets/
    marca/                 logo oficial (logo-cs.png), favicon, foto da Yruena
    parceiros/              logos dos parceiros (cards da vitrine)
    banners/                banners do carrossel do topo
```

## Identidade visual

- Marca: **Sanchez Clube** (renomeado de "Comunidade Sanchez" a pedido da Yruena)
- Paleta: terracota/dourado sobre grafite e creme (tokens Tailwind customizados: `terracota`, `dourado`, `dourado-soft`, `grafite`, `grafite-soft`, `creme`, `warm-wash`)
- Tipografia: display + mono para labels uppercase/tracking largo
- Logo oficial em `src/assets/marca/logo-cs.png` (aplicado em Navbar, AuthLayout, AreaMembro, Footer e favicon) — sempre `object-contain`, nunca `object-cover`/`rounded-full` (corta o logo)
- Voucher de boas-vindas: **R$100** pra quem se cadastra (direto ou por indicação)

## Parceiros do clube (`src/data/parceiros.ts`)

Fonte única de verdade — basta editar o array `parceiros` que a Vitrine e o Modal atualizam sozinhos. Cada parceiro tem: `slug`, `nome`, `categoria`, `descricaoCurta`, `descricao`, `voucher`, `imagem`, `cor` (HSL), `site?` (link do Instagram/site), `whatsapp?`, `tags`.

Parceiros ativos (8):
1. **Bioreluz** — limpeza/impermeabilização
2. **Insurance & Santé** — seguros/planos de saúde
3. **MRT Arquitetura** — arquitetura/regularização de imóveis
4. **Óticas Diniz · Diniz Prime** — R$200 de desconto em óculos
5. **Remalar** — assistência técnica (Lorenzetti, Deca, Hydra)
6. **Renova Lar Designer** — móveis planejados
7. **Luminê Studio** — ensaio corporativo (12 fotos editadas), 20% de desconto, Instagram @studiio.lumine
8. **Vidraçaria AV** — vidros/espelhos/esquadrias, voucher R$100, Instagram @av.vidracaria_

### Banners do carrossel (topo)

Os banners oficiais são **1920×465 (4,13:1)**, formato de faixa de site. Em tela de celular isso vira uma tira de ~86px de altura, com o texto ilegível. Por isso o carrossel usa duas artes:

- `src/assets/banners/*.jpg` — original largo, servido só a partir de `lg` (≥1024px)
- `src/assets/banners/mobile/*.jpg` — recorte **4:3 (1080×810)** gerado por `scripts/banners-mobile.py`, servido abaixo de 1024px

A troca é feita com `<picture>` + `<source media="(min-width: 1024px)">` no `BannerCarousel.tsx`. As proporções do palco acompanham: `aspect-[4/3]` no celular, `sm:aspect-[16/9]` no tablet, `lg:aspect-[64/15]` no desktop.

O script monta cada versão mobile assim: fundo = o próprio banner em "cover" + blur (mantém a cor/textura da marca), frente = recorte da região da mensagem principal escalado a 94% da largura, centralizado. As caixas de recorte de cada banner ficam no dicionário `BOXES` do script — ao trocar um banner, ajuste a caixa dele e rode `python scripts/banners-mobile.py`.

Isso é **paliativo**: o ideal é a agência mandar os banners já em versão mobile (vertical ou quadrada). Quando chegarem, é só substituir os arquivos em `banners/mobile/` e o script deixa de ser necessário.

### Convenção de imagem dos cards

Card da vitrine usa container `aspect-[16/10]` com `object-cover`. Pra logo não ficar cortado/descentralizado (especialmente logos com elementos assimétricos tipo ícone + texto rotacionado), **sempre recortar a imagem-fonte pra aspecto 1.6:1 (16:10) antes de importar**, centralizando o elemento principal (ícone/marca) no recorte — assim o `object-cover` não precisa cortar nada. Processo usado (Python/Pillow): calcular bounding box do conteúdo (contra o fundo), centralizar, ajustar padding até bater aspecto 1.6, salvar como `.jpg` otimizado em `src/assets/parceiros/`.

Vários parceiros ainda têm `voucher`/benefício com `// TODO: confirmar benefício` — placeholder até a Yruena confirmar o valor exato com cada parceiro.

## Fase 2 — Auth e área de membro (Supabase)

- Cadastro/login de membros via Supabase Auth
- Cada membro tem código de indicação próprio (`/cadastro?ref=...`)
- Área de membro logada mostra voucher de boas-vindas e dados da conta
- Banco é **novo e isolado** deste projeto; o Sanchez Connect (CRM interno da Sanchez) vai futuramente **ler** as tabelas `membros`/`indicacoes` deste banco pra cruzar com CPF/CNPJ — mas isso é integração futura, não implementada ainda aqui

## Histórico relevante (por que as coisas são como são)

- Nome mudou de "Comunidade Sanchez" pra "Sanchez Clube" — decisão da Yruena após revisar o protótipo (commit `602df25`)
- Logo trocado de versão antiga pra versão oficial atual mais de uma vez, conforme Yruena aprovava (commits `4a3fa74`, `602df25`)
- Cards de vários parceiros trocados de banner genérico pra logo oficial de cada parceiro, à medida que a Bruna recebia os arquivos (commits `68b039e`, `eebd5b9`, `4c104db`, `8e5b73d`)
- Selos/pontuação removidos e substituídos por voucher fixo de R$100 (commit `d1dc932`) — simplificação de mecânica de recompensa
- Modal de parceiro distingue link de Instagram vs site próprio (commit `2caacdb`) — nem todo parceiro tem site, mas quase todos têm Instagram

## Coisas pendentes / não fazer sozinho

- Apagar contas de teste acumuladas no Supabase — responsabilidade da Bruna via dashboard (sem acesso service_role por aqui)
- Vários `voucher` em `parceiros.ts` com `// TODO: confirmar benefício` — não inventar valor, esperar confirmação
- Bio/foto real da Yruena no Hero ainda é placeholder em alguns textos — confirmar antes de tratar como final
