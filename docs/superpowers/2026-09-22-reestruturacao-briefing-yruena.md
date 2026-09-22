# Reestruturação do site — Briefing Yruena (21/09/2026)

Fonte: `~/Downloads/BRIEFING DE REESTRUTURAÇÃO DO SITE.txt`.
Objetivo: o Clube Sanchez deixa de parecer página de desconto e vira o **hub de negócios da Comunidade Sanchez**, com toda a jornada mensurável (banner → clique → download → cadastro → uso → indicação → conversão).

Assinatura oficial: **Clube Sanchez. Onde a comunidade faz negócios.**

## Legenda

- **Dificuldade:** 🟢 Fácil (texto/CSS, 1 sessão curta) · 🟡 Média (componente novo ou lógica de front) · 🔴 Difícil (banco + RLS + integração externa ou painel)
- **Prioridade:** P0 = antes de divulgar · P1 = funcionamento do hub · P2 = evolução
- **Bloqueio:** ⏳ depende de conteúdo/decisão de fora (Yruena, marketing, parceiro)

Cada bloco = 1 branch + 1 PR pequeno. Ordem de execução = ordem dos blocos.

---

## Estado atual do código (mapeado 2026-09-22)

| Item do briefing | Onde está hoje | Situação |
|---|---|---|
| "Sanchez Clube" | 24 ocorrências em 11 arquivos + `index.html` | trocar tudo |
| Menu cobre títulos | `Navbar.tsx` é `fixed`, sem `scroll-padding-top` / `scroll-mt` em nenhum lugar | bug confirmado |
| Espaços vazios | seções com `py-16 sm:py-24 lg:py-32` | reduzir |
| Loja sem hierarquia | `LojaSecao.tsx`: "Loja Sanchez" é eyebrow mono pequeno, h2 é "curadoria" | inverter |
| Fundo laranja | `CtaCadastro.tsx` `bg-terracota` + `IndiqueGanhe.tsx` `bg-club-panel` | repintar cobre/preto |
| R$ 200 | `Hero.tsx:96` `{ n: "R$200", l: "Já na 1ª vantagem" }` | remover |
| 53 anos | fixo em `Hero.tsx`, `Footer.tsx`, `QuemSomos.tsx` | calcular pelo ano de fundação |
| Carrossel | `BannerCarousel.tsx`: 4 slides coded, autoplay 6s, sem pausa, sem contador, sem aria | 6 slides + a11y |
| Como funciona / Indique / CTA | 3 blocos separados (`ComoFunciona`, `IndiqueGanhe`, `CtaCadastro`) | fundir em 1 sequência |
| E-book | `lib/ebook.ts`: exige **cadastro completo** (decisão de 04/08) | trocar por form curto |
| Mensuração | inexistente (só `ebook_downloads` por membro) | criar do zero |

---

## Bloco 1 — Nomenclatura e textos 🟢 P0

Só texto. Zero risco.

1. `Sanchez Clube` → `Clube Sanchez` em toda interface: navbar (alt do logo), banners, títulos, botões, cadastro, área do membro, rodapé, `index.html` (`<title>`, meta description, og:*), mensagens `wa.me` pré-preenchidas, dados de parceiros.
2. Hero: título "Clube de Vantagens" + texto novo (53 anos + "O Clube Sanchez amplia essa relação…"). Botões **Quero fazer parte** (`/cadastro`) e **Já sou membro** (`/login`) — já existem, conferir rótulos.
3. Indicadores: remover **R$200**. Ficam: **parceiros ativos** (contagem automática, ver Bloco 7 — neste bloco já usar `parceiros.filter(p => p.ativo).length`), **53 anos de Sanchez**, **5% de boas-vindas**.
4. Anos calculados: `const ANO_FUNDACAO = 1973` em `src/lib/marca.ts` + `anosDeSanchez()`; usar em Hero, Footer, QuemSomos. ⏳ confirmar 1973 com Yruena.
5. Constante única `ASSINATURA = "Clube Sanchez. Onde a comunidade faz negócios."` em `src/lib/marca.ts`.
6. Rodapé: nome correto + texto institucional novo + termina com a assinatura.
7. Parceiros: título **"Vantagens de quem a Sanchez confia"** + apoio "Escolha um parceiro para conhecer o benefício, as condições e os canais de atendimento."
8. "Indique seus amigos" → **"Indique."**; aplicar "Compartilhe seu link. Convide; quem entra já ganha."

**Aceite:** `grep -rn "Sanchez Clube" src index.html` = 0; nenhum "R$200"/"R$ 200" na home; tsc limpo.

---

## Bloco 2 — Correções de design e UX 🟢/🟡 P0

1. **Menu sobreposto** 🟢: `html { scroll-padding-top: <altura da navbar + folga> }` no `index.css` (cobre todas as âncoras `/#secao`) + conferir `z-index` das camadas. Testar clicando cada link do menu em 375px e desktop.
2. **Espaços vazios** 🟢: reduzir padding vertical das seções (ex.: `py-12 sm:py-16 lg:py-20`) — criar utilitário `section-y` pra padronizar.
3. **Hierarquia Loja** 🟢 (`LojaSecao.tsx`): h2 = **Loja Sanchez** · subtítulo = **Produtos com curadoria** (visível, menor) · texto "A curadoria presente nos serviços da Sanchez agora também está disponível para compra pela Loja Sanchez e pela Shopee." · produtos · botão **Ver todos os produtos**.
4. **Fundo laranja** 🟡: CTA final em cobre/preto/off-white/cinza-chumbo (paleta do guia de identidade). Laranja (`gatilho #C2551F`) só como detalhe promocional, máx. 1 por tela.
5. **Contraste** 🟢: revisar textos de apoio (`text-grafite-soft`, `creme/50`, etc.) — mínimo WCAG AA 4.5:1 no corpo; line-length ≤ 70ch.
6. **WhatsApp flutuante** 🟢: não pode cobrir botões/preços no celular — reservar `padding-bottom` no fim da página e/ou esconder durante formulários.

**Aceite:** nenhum título escondido atrás do menu em 375/768/1440; checklist visual nos 3 tamanhos.

---

## Bloco 3 — Nova ordem da página + "Como funciona" único 🟡 P0/P1

Nova hierarquia (seção 3 do briefing):

1. Menu → 2. Carrossel → 3. Apresentação (Hero) → 4. Indicadores → 5. Parceiros → 6. Loja → 7. **Como funciona + CTA final (um bloco só)** → 8. Instagram (Bloco 10, P2 — placeholder oculto até lá) → 9. Rodapé com ecossistema, contatos, mapa e assinatura.

- Fundir `ComoFunciona` + `IndiqueGanhe` + `CtaCadastro` num único componente: 4 etapas (Cadastre-se grátis / Confira os parceiros / Aproveite / Indique) → fecha com **"Faça parte do Clube Sanchez"** + "Cadastro gratuito e acesso imediato às vantagens disponíveis." + **Criar minha conta** / **Já sou membro**. Título quebrado em 2 linhas.
- Remover os componentes antigos que ficarem órfãos.
- **Menu recomendado:** Clube Sanchez · Loja · Comunidade Sanchez · Parceiros · Como funciona · Indique e ganhe · Minha área. No mobile, hamburguer com os mesmos itens.
- **Ecossistema no rodapé/seção:** apresentar Sanchez Imóveis (link site principal), BioReluz e Insurance & Santé como **empresas do grupo** (destaque institucional, separadas dos parceiros), Loja, Papo de Aluguel, Premium.

✅ Decidido (Bruna, 22/09): **"Comunidade Sanchez" no menu leva para `/cadastro`** — sem seção nova de ecossistema. "Indique e ganhe" = âncora `#indique` na etapa 4 do bloco fundido. Empresas do grupo (BioReluz, Insurance & Santé) aparecem só como links no rodapé.

---

## Bloco 4 — Carrossel com 6 banners + acessibilidade 🟡 P1

1. Ordem: Comunidade Sanchez → **BioReluz** → **Insurance & Santé** → Loja → Papo de Aluguel → Premium.
2. Novos `BannerBioreluz.tsx` e `BannerInsurance.tsx` (coded, padrão dos existentes, responsivos). ⏳ Artes "já enviadas pela equipe" — Bruna localizar; se forem imagem, usar `<picture>` com versão desktop + mobile.
3. Config em `src/data/banners.ts`: `{ id, campanha, destino, inicio, fim, ativo, ordem }`. O carrossel filtra por data (`inicio <= hoje <= fim`) — banner vencido some sozinho. Histórico = o arquivo no git.
4. UX: contador "2 / 6" + pontinhos, setas, **pausa em hover/foco/toque** e ao interagir, autoplay mais lento (8s), respeita `prefers-reduced-motion`, `aria-roledescription="carousel"`, `aria-label` em cada slide e botão, `aria-live` só quando pausado.
5. Cada banner é um `<a>`/`<Link>` com destino definido (hook para `banner_view`/`banner_click` do Bloco 5).

**Admin de banners** (CRUD por tela) fica para P2 (Bloco 11). Até lá, trocar banner = editar `banners.ts` + deploy.

---

## Bloco 5 — Fundação de mensuração 🔴 P1

Base de tudo que é "mensurar" no briefing. Fazer **antes** dos blocos 6–9 pra eles já nascerem rastreados.

**Recomendação:** tabela própria no Supabase do Clube (dados próprios, cruzáveis com cadastro/CPF, sem cookie de terceiros). GA4 opcional depois, só como espelho.

1. Migration `0007_eventos.sql`: `public.eventos (id, nome, sessao_id, membro_id null, props jsonb, origem, campanha, utm jsonb, dispositivo, pagina, created_at)`. RLS: **só INSERT** para anon/authenticated, com `check` de `nome` numa lista permitida e tamanho de `props` limitado; sem SELECT no client (leitura só pelo painel/service_role).
2. `src/lib/track.ts`: `track(nome, props)` — fire-and-forget, nunca quebra a UI; `sessao_id` em `sessionStorage`; dispositivo por largura/UA (mobile/tablet/desktop).
3. **Preservação de campanha:** na primeira página da sessão, capturar `utm_source/medium/campaign/content`, `ref` e `document.referrer` → guardar em `sessionStorage` → anexar a todo evento **e** ao cadastro (`membros.origem/campanha`, nova coluna).
4. `banner_view` via `IntersectionObserver` (≥50% visível, 1x por banner por sessão).
5. Eventos: `banner_view`, `banner_click`, `ebook_form_open`, `ebook_form_submit`, `ebook_download`, `club_signup_start`, `club_signup_complete`, `partner_open`, `partner_contact`, `product_click`, `referral_share`, `referral_conversion`, `map_open`, `social_click`.
6. Componente `<LinkRastreado evento="..." props={...}>` para links externos (WhatsApp, telefone, site, Instagram, Shopee) — usa `sendBeacon`/`keepalive` pra não perder o evento ao sair da página.
7. LGPD: atualizar Política de Privacidade mencionando a coleta de eventos anônimos de navegação.

**Aceite:** cada evento da lista aparece na tabela com sessão, origem e dispositivo (conferido por SQL no Dashboard).

---

## Bloco 6 — E-book com formulário curto 🔴 P1

**Muda a decisão de 04/08** (hoje baixar exige virar membro). Briefing: visitante **não** precisa de cadastro completo.

1. Clique em "Baixe grátis":
   - **Membro logado** → baixa direto + `ebook_download` (membro).
   - **Visitante** → modal "Antes de baixar" / "Preencha seus dados para receber o e-book e novos materiais do Papo de Aluguel." · Nome completo, E-mail, WhatsApp · checkbox **separado e opcional** de autorização de comunicações · link visível p/ Política de Privacidade · botão **Baixar e-book grátis**.
2. Migration `0008_ebook_leads.sql`: `ebook_leads (id, nome, email, whatsapp, material, aceita_comunicacao bool, aceita_comunicacao_em, origem, campanha, sessao_id, created_at)`. RLS só INSERT. `ebook_downloads` ganha `lead_id` e `membro_id` opcionais.
3. Visitante que já preencheu nesta máquina → `localStorage` guarda o lead id e não pede de novo (download repetido é contado, não bloqueado).
4. Métricas que o painel precisa derivar: total, únicos (por email/membro), repetidos, membro × visitante, origem, campanha/banner, **cadastros no Clube depois do download** (join `ebook_leads.email` = `membros.email`).
5. Pré-preencher o cadastro do Clube com os dados do lead quando o visitante clicar em "Quero fazer parte" depois.
6. Estados: carregando, sucesso, erro (download não pode depender do insert — se o banco falhar, baixa mesmo assim e loga).

---

## Bloco 7 — Parceiros completos + Level Up 🟡 P1 ⏳

1. Tipo `Parceiro` ganha: `area`, `beneficio`, `condicoes`, `validade` (data), `telefone`, `whatsapp`, `site`, `endereco?`, `ativo`.
2. Cartão/modal mostra tudo + botão **Usar a vantagem**. Validade vencida → some da vitrine e do contador (automático).
3. Contador de parceiros ativos = derivado do array (BioReluz e Insurance contam? ⏳ decidir — são "grupo", não parceiros).
4. Rastrear `partner_open` e `partner_contact` (tipo: whatsapp/telefone/site/atendimento).
5. **Level Up** entra só após validação com Eduardo e Marcela ⏳.
6. Regra do **5%**: só mostrar se regra, onde usar e condições estiverem escritas e acessíveis (link "ver condições") ⏳.

⏳ Conteúdo: planilha com todos os campos acima por parceiro (marketing/gestão do clube).

---

## Bloco 8 — Loja: DEWA + rastreio 🟡 P1 ⏳

1. Novo canal `"dewa"` em `produtos.ts` (`seloDoCanal`, cor de badge) — filtros e subtítulo da `/loja` já derivam dos canais ativos.
2. Card mostra: imagem, nome, descrição curta, preço, vendedor/canal, botão, selo Loja Sanchez / Shopee / DEWA.
3. `product_click` com produto, canal e destino.

⏳ Produtos DEWA (fotos, preços, links) + confirmação da DEWA pela gestão do clube.

---

## Bloco 9 — Contato, mapa e rota 🟡 P1 ⏳

1. Seção de contato: endereço completo clicável, WhatsApp, Instagram, **site principal da Sanchez** (todos com `LinkRastreado`).
2. Mapa: `iframe` do Google Maps embed (grátis, sem chave, `loading="lazy"`).
3. **Ver no mapa** → abre o endereço no app de mapas. **Como chegar** → pede geolocalização; autorizou → abre rota a partir da posição; negou → campo "ponto de partida" manual ou abre direto no app.
4. `map_open` com tipo (ver/rota) e se autorizou localização.

**Distância e tempo dentro do site** exigem API de rotas (ver Decisão D3). Recomendação: fase 1 = deep link (o app de mapas mostra rota, distância e tempo); fase 2 = cálculo no site se a Yruena fizer questão.

⏳ Endereço completo oficial + URL do site principal (sanchezimoveis.com.br?).

---

## Bloco 10 — Instagram no site 🔴 P2

Publicações aparecendo automaticamente, sem pesar o carregamento.

- Opção A (recomendada): Edge Function no Supabase chama Instagram Graph API 1x/hora, guarda os últimos 6–9 posts numa tabela/bucket; site lê o cache (rápido, sem script de terceiro). Exige conta **Business/Creator** ligada a página do Facebook + token de longa duração (renovar a cada 60 dias — automatizar na mesma função).
- Opção B: widget pronto (Behold, LightWidget) — rápido de ligar, mas script externo e limite no plano grátis.
- Carregar só quando a seção entrar na tela (lazy) → não afeta a velocidade inicial.
- `social_click` nos posts.

⏳ Acesso ao @sanchezimoveisenegocios como Business + app Meta.

---

## Bloco 11 — Painel de desempenho + admin 🔴 P2

1. Rota `/admin` protegida (coluna `membros.papel = 'admin'` ou tabela `admins`), consultas via funções `SECURITY DEFINER` que checam o papel.
2. Filtros: período, campanha, origem, dispositivo, situação do usuário, parceiro, produto, banner, material, código de indicação.
3. Cards/tabelas: views/cliques/CTR por banner, funil e-book (open → submit → download → cadastro), contatos por parceiro, cliques por produto/canal, cadastros por origem, indicações.
4. Admin de banners (CRUD com upload desktop/mobile, datas, ordem, campanha) + ativar/desativar benefícios — move `banners.ts`/`parceiros.ts` para tabelas. Só se a Yruena quiser autonomia sem passar pela Bruna.
5. Painel de cotações (Fase B3 antiga: ver cotações + docs por signed URL) cabe aqui também.

---

## Bloco 12 — Indicação ponta a ponta 🟡 P2

1. `referral_share` ao copiar/compartilhar link na `/area`.
2. `referral_conversion` quando o indicado conclui cadastro (trigger já grava `indicado_por` — só registrar evento/consultar).
3. Relacionar downloads → cadastros futuros (Bloco 6, item 4) e indicação → cadastro no painel.
4. Leitura de desempenho por parceiro e campanha.

---

## Decisões em aberto (Bruna)

| # | Decisão | Recomendação |
|---|---|---|
| D1 | Onde guardar eventos | ✅ Tabela própria no Supabase do Clube (Bloco 5) |
| D2 | E-book: voltar a liberar com form curto (desfaz decisão de 04/08)? | ✅ Sim |
| D3 | Mapa/rota | ✅ Padrão do site AV Alumi: card de contato (endereço, WhatsApp/telefone, e-mail, Instagram, horário) ao lado de iframe Google Maps embed (tem botões nativos "abrir" e "rotas"). Distância/tempo = no app de mapas, sem API paga |
| D4 | Admin de banners/parceiros por tela | ✅ Não agora — arquivos `src/data/*.ts` até P2 |
| D5 | Instagram | ✅ Widget **Behold** (igual site AV Alumi: título + botão @perfil + grade de 3 posts + "Ver mais no Instagram"), carregado lazy |

## Conteúdo pendente (pedir à Yruena / marketing)

- [ ] Ano de fundação exato (1973?)
- [ ] Artes dos banners BioReluz e Insurance & Santé (desktop + mobile) + destinos
- [ ] Destino, campanha e período de cada banner
- [ ] Regra do 5% (onde usa, condições)
- [ ] Planilha dos parceiros (área, benefício, condições, validade, telefone, WhatsApp, site, endereço)
- [ ] Level Up (após Eduardo e Marcela)
- [ ] DEWA: confirmação + produtos
- [ ] Endereço completo e site principal
- [ ] Destino de "Comunidade Sanchez" no menu
- [ ] Acesso Business do Instagram
- [ ] Texto da Política de Privacidade atualizado

## Ordem de execução sugerida

1. **Bloco 1 + 2** (P0, 1 PR cada) — dá pra divulgar depois disso
2. **Bloco 3** (reordenação + fusão)
3. **Bloco 5** (mensuração) → **Bloco 4** (carrossel já rastreado)
4. **Bloco 6** (e-book) → **Bloco 7/8/9** conforme o conteúdo chegar
5. **P2:** Bloco 12 → 11 → 10

Regras de sempre: branch a partir da `main`, tsc strict limpo, verificar em 375px e desktop, push na `main` é a Bruna quem faz.
