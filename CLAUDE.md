# Clube de Vantagens — Sanchez Clube

Landing page + área de membro do clube de vantagens da Sanchez Imóveis (Mogi das Cruzes/SP). Site institucional que apresenta parceiros com desconto exclusivo para clientes da Sanchez, com cadastro, login e programa de indicação.

- Repo: `BrunaCosta194/clube-vantagens` (GitHub)
- Deploy: Vercel, auto-deploy no push pra `main` → clube-vantagens.vercel.app
- Cliente: Yruena (Sanchez Imóveis) — aprova nome, logo e parceiros

## Estado atual — leia primeiro (atualizado em 2026-10-01)

> Esta seção vale mais que trechos antigos abaixo. **Este repositório é PÚBLICO**: nunca commitar chave, token, service_role, senha ou dado pessoal de membro.

**Quem:** desenvolvido pela Bruna Hayata (`BrunaCosta194`) para a Yruena, dona da Sanchez Imóveis. A Yruena aprova produto, textos e parceiros. A Bruna escreve em português e prefere respostas diretas.

**No ar (`main`):**
- Reestruturação do briefing de 21/09 (spec `docs/superpowers/2026-09-22-reestruturacao-briefing-yruena.md`, 12 blocos): nomenclatura/design/ordem da home, eventos (`track()` + `LinkRastreado`, tabela `eventos`), e-book com formulário curto + `/privacidade`, carrossel de banners (`src/data/banners.ts`, validade por data), contato com mapa/"como chegar"/horários, feed do Instagram (Behold), painel `/admin` (só agregados; `admins` + `is_admin()`).
- Páginas de parceiro: `/parceiro/bioreluz` e `/parceiro/insurance-sante` (cotação grava em `cotacoes` + bucket privado `cotacoes-docs`, depois abre o WhatsApp da Yruena).
- Loja (`/loja`): produtos Shopee de afiliado em `src/data/produtos.ts`; filtros derivam dos canais ativos.
- Sessão persistente: `src/lib/sessao.tsx` (`SessaoProvider` / `useSessao`); navbar mostra "Olá, <nome>" + "Minha área".
- **Voucher de cadastro = 5% permanente** (`VOUCHER_CADASTRO_LABEL` em `src/lib/recompensas.ts`; banco alinhado pela migration 0006). Não vale para itens de afiliado.
- **Mídia kit do Papo de Aluguel** em `/midiakit` — cópia estática em `public/midiakit/` (rewrite no `vercel.json` antes do catch-all). Fonte de verdade fica fora do repo (`~/papo-de-aluguel-midiakit` no PC da Bruna); ao editar, recopiar trocando `img/` por `/midiakit/img/`. Adesões gravam em `patrocinio_adesoes` (migration 0010).
- Página `/papodealuguel` (podcast) e catch-all `*` → `/`.

**Banco:** Supabase próprio do Clube (não é o do Connect). Migrations `0001`–`0010` em `supabase/migrations/`, **aplicadas à mão pela Bruna** no SQL Editor. RLS: leads/eventos/cotações só têm INSERT para anon; leitura só por `/admin`, dashboard ou service_role. O mesmo projeto Supabase hospeda o schema `inteligencia` do projeto Sanchez Inteligência — não mexer nele por aqui.

**Integração com o Sanchez Connect (CRM):** bancos separados de propósito. Um script no repo do Connect lê `membros` daqui de hora em hora e cruza por CPF/CNPJ (só dígitos — `normalizarDocumento()` em `src/lib/membros.ts`). Por isso CPF/CNPJ é obrigatório no cadastro.

**PRs abertas:** #25 (mídia kit: fotos dos valores + links TikTok/Facebook) e #26 (mídia kit: contrato v2). A Bruna revisa e mescla.

**Pendências — dependem da Yruena:** bloco 7 (parceiros completos + Level Up: planilha + logos), bloco 8 (Loja DEWA: planilha + fotos), bloco 12 (regra dos 5% da indicação); primeira entrada no `/admin` com dados reais; revisão da `/privacidade` (prazos de guarda são rascunho); título da seção Instagram; logo vetor transparente; conteúdo real de Bioreluz/Insurance e do "Quem somos"; arte de banner do contato; artes de celular dos banners.

**Pendência técnica:** branch `fix/trigger-pula-equipe` (faz o trigger `handle_new_membro` pular usuários de equipe do Inteligência) precisa renumerar a migration para `0011` antes do PR — `0009` e `0010` já existem.

**Regras deste site:**
- Fluxo: branch a partir da `main` → PR → a Bruna revisa, mescla e roda migrations. Push/merge na `main` é dela.
- Responsivo sempre: conferir 375px e desktop.
- Performance: nada de `mix-blend-mode` em camada fixa nem `filter: blur` ligado a scroll/reveal; `backdrop-blur` só na navbar. Imagem nova sempre comprimida antes do commit (logos PNG ≤600px, JPEG progressivo q78–80). Fontes locais em `public/fonts` (sem Google Fonts, sem preload). Rotas com `React.lazy`.
- Design: a Bruna gosta de "premium" sem mexer em paleta/texto e prefere foto realista a ilustração vetorial.
- Não rodar prettier (sem config; reformata tudo). `tsconfig.tsbuildinfo` fica fora dos commits.
- Logo novo de parceiro: recortar sem fundo, mesmo tamanho na placa (`-card.png`, `object-contain`).

**Contexto fora do repo:** no PC da Bruna há um vault Obsidian em `C:\Users\Eduardo Hayata\Documents\Sanchez` (painel de pendências de todos os projetos da Yruena). Se tiver acesso, ler `00 Painel.md` e `Projetos/Clube.md`. Se não, este arquivo é a referência — **ao terminar uma mudança relevante, atualize esta seção no mesmo PR.**

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
- Paleta: **cobre** sobre fundo `#EFE0D3` (guia de identidade do Nível Clube; dourado/amarelo PROIBIDO). Tokens: `creme`, `grafite`, `cobre`, `gatilho` (laranja tático, máx. 1 por tela), `terracota`, `papo`, `premium`. CTA `#B66F4E`, hover `#894C36`, texto `#4A2B1C`.
- Tipografia: display + mono para labels uppercase/tracking largo
- Logo oficial em `src/assets/marca/logo-cs.png` (aplicado em Navbar, AuthLayout, AreaMembro, Footer e favicon) — sempre `object-contain`, nunca `object-cover`/`rounded-full` (corta o logo)
- Voucher de boas-vindas: **5% permanente** pra quem se cadastra (era R$100; mudou em 03/09/2026)

## Parceiros do clube (`src/data/parceiros.ts`)

Fonte única de verdade — basta editar o array `parceiros` que a Vitrine e o Modal atualizam sozinhos. Cada parceiro tem: `slug`, `nome`, `categoria`, `descricaoCurta`, `descricao`, `voucher`, `imagem`, `cor` (HSL), `site?` (link do Instagram/site), `whatsapp?`, `tags`.

Parceiros ativos (8):
1. **Bioreluz** — limpeza/impermeabilização
2. **Insurance & Santé** — seguros/planos de saúde
3. **MRT Arquitetura** — arquitetura/regularização de imóveis
4. **Óticas Diniz · Diniz Prime** — óculos (voucher de R$200 retirado; sem benefício por ora)
5. **Remalar** — assistência técnica (Lorenzetti, Deca, Hydra)
6. **Renova Lar Designer** — móveis planejados
7. **Luminê Studio** — ensaio corporativo (12 fotos editadas), 20% de desconto, Instagram @studiio.lumine
8. **Vidraçaria AV** — vidros/espelhos/esquadrias, voucher R$100, Instagram @av.vidracaria_

### Banners do carrossel (topo)

Os banners oficiais são **1920×465 (4,13:1)**, formato de faixa de site. Em tela de celular isso vira uma tira de ~86px de altura, com o texto ilegível. Por isso o carrossel usa duas artes:

- `src/assets/banners/*.jpg` — original largo, servido a partir de `md` (≥768px)
- `src/assets/banners/mobile/*.jpg` — recorte **4:3 (1080×810)**, servido abaixo de 768px

A troca é feita com `<picture>` + `<source media="(max-width: 767px)">` dentro de cada `banners/Banner*.tsx`. O palco do carrossel acompanha, em `BannerCarousel.tsx`: `aspect-[4/3]` no celular e `md:aspect-[1920/465]` daí pra cima. Como a proporção da arte bate com a do palco nos dois casos, o banner aparece inteiro — sem corte e sem ponto focal.

Dois scripts geram as versões mobile:

- `scripts/banners-mobile-remontagem.py` — usado pelos 6 banners do carrossel. **Remonta** a arte no 4:3: fundo tirado de uma região limpa da própria arte (sem letra, pra não virar fantasma borrado), e os elementos (logo, chamada, produto, pessoa) reposicionados em tamanho útil, com emenda suavizada por máscara. Cada banner tem seu bloco no script, com as coordenadas de recorte sobre a arte 1920×465.
- `scripts/banners-mobile.py` — script antigo, mais simples: encolhe a faixa larga dentro de um fundo borrado. Ainda gera as versões de `oticas-diniz`, `mrt`, `remalar` e `renova-lar`, que não estão no carrossel. **Não rode ele nos banners do carrossel**: sobrescreve os recortes remontados com a versão de marca pequena.

Ao trocar um banner do carrossel: substitua a arte larga, ajuste as coordenadas do bloco dele em `banners-mobile-remontagem.py`, rode `python scripts/banners-mobile-remontagem.py` e **olhe o resultado** — as coordenadas são específicas de cada arte.

Tudo isso é **paliativo**: o ideal é a agência mandar os banners já em versão mobile (vertical ou quadrada). Quando chegarem, é só substituir os arquivos em `banners/mobile/` e os scripts deixam de ser necessários.

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
- Selos/pontuação removidos e substituídos por voucher fixo de R$100 (commit `d1dc932`), depois trocado por 5% permanente
- Modal de parceiro distingue link de Instagram vs site próprio (commit `2caacdb`) — nem todo parceiro tem site, mas quase todos têm Instagram

## Coisas pendentes / não fazer sozinho

- Apagar contas de teste acumuladas no Supabase — responsabilidade da Bruna via dashboard (sem acesso service_role por aqui)
- Vários `voucher` em `parceiros.ts` com `// TODO: confirmar benefício` — não inventar valor, esperar confirmação
- Bio/foto real da Yruena no Hero ainda é placeholder em alguns textos — confirmar antes de tratar como final
