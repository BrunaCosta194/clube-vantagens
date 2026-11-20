# Clube de Vantagens — Sanchez Clube

Landing page + área de membro do clube de vantagens da Sanchez Imóveis (Mogi das Cruzes/SP). Site institucional que apresenta parceiros com desconto exclusivo para clientes da Sanchez, com cadastro, login e programa de indicação.

- Repo: `BrunaCosta194/clube-vantagens` (GitHub)
- Deploy: Vercel, auto-deploy no push pra `main` → **clube.sanchezimoveis.com.br** (domínio oficial) e clube-vantagens.vercel.app
- Cliente: Yruena (Sanchez Imóveis) — aprova nome, logo e parceiros

## Estado atual — leia primeiro (atualizado em 2026-11-20)

> Esta seção vale mais que trechos antigos abaixo. **Este repositório é PÚBLICO**: nunca commitar chave, token, service_role, senha ou dado pessoal de membro.

**Quem:** desenvolvido pela Bruna Hayata (`BrunaCosta194`) para a Yruena, dona da Sanchez Imóveis. A Yruena aprova produto, textos e parceiros. A Bruna escreve em português e prefere respostas diretas.

**No ar (`main`):**
- Reestruturação do briefing de 21/09 (spec `docs/superpowers/2026-09-22-reestruturacao-briefing-yruena.md`, 12 blocos): nomenclatura/design/ordem da home, eventos (`track()` + `LinkRastreado`, tabela `eventos`), e-book com formulário curto + `/privacidade`, carrossel de banners (`src/data/banners.ts`, validade por data), contato com mapa/"como chegar"/horários, feed do Instagram (Behold), painel `/admin` (só agregados; `admins` + `is_admin()`).
- Páginas de parceiro: `/parceiro/bioreluz` e `/parceiro/insurance-sante` (cotação grava em `cotacoes` + bucket privado `cotacoes-docs`, depois abre o WhatsApp da Yruena).
- Loja (`/loja`): produtos Shopee de afiliado em `src/data/produtos.ts`; filtros derivam dos canais ativos.
- Sessão persistente: `src/lib/sessao.tsx` (`SessaoProvider` / `useSessao`); navbar mostra "Olá, <nome>" + "Minha área".
- **Voucher de cadastro = 5% permanente** (`VOUCHER_CADASTRO_LABEL` em `src/lib/recompensas.ts`; banco alinhado pela migration 0006). Não vale para itens de afiliado.
- **Mídia kit do Papo de Aluguel** em `/midiakit` — cópia estática em `public/midiakit/` (rewrite no `vercel.json` antes do catch-all). Fonte de verdade fica fora do repo (`~/papo-de-aluguel-midiakit` no PC da Bruna); ao editar, recopiar trocando `img/` por `/midiakit/img/`. Adesões gravam em `patrocinio_adesoes` (migration 0010).
- **Demo da Dewa** em `/parceiro/dewa` (dados em `src/data/dewa.ts`, fotos lidas do CDN do site deles; benefício 10%/cupom SANCHEZCLUBE é **de exemplo**, com selo na tela). Dewa aparece primeiro na vitrine. Trocar benefício e logo do card quando a Yruena fechar com a Dewa. **Saindo pelo painel (20/11, branch `claude/dewa-pelo-painel`):** a Dewa mandou o cadastro com o benefício real (10% com código próprio, aguardando validação da Yruena). A rota `/parceiro/dewa` agora usa `ParceiroPublico` com `slugFixo="dewa"` e a página feita à mão em `seNaoPublicada`: enquanto a página do painel não for publicada, aparece a feita à mão; depois, a do painel (e o card da vitrine passa a ser o do banco, mesmo slug). A migration `0021` tira `dewa` dos endereços reservados de `parceiro_perfil_salvar` e inclui `destak-office`, que só estava reservado no TS. Página montada no painel em 20/11, já no endereço `dewa` (0021 rodada). Falta o logo (veio em PDF; pedido na nota interna da ficha). Quando a do painel estiver no ar, dá para apagar `ParceiroDewa.tsx`, `src/data/dewa.ts` e o card fixo da Dewa em `parceiros.ts`.
- **Destak Boutique em `/parceiro/destak-office` (17/11):** loja de moda feminina ("44 anos vestindo gerações", Instagram @destak_office; o logo diz "Destak Boutique"), página feita para a Yruena postar no Instagram. Dados em `src/data/destak.ts`, fotos e logo em `src/assets/parceiros/destak/`; três peças escolhidas pela Yruena (vestido vermelho P/M e G, R$ 839; vestido branco 38/40, R$ 699; macacão P, M e G, R$ 659). "Quero esta peça" e "Falar com a loja" abrem o WhatsApp Business da loja (`wa.me/message/...`, sem texto pronto). **Sem benefício por enquanto** (decisão de 17/11: sem caixa "Sua vantagem" e sem `voucher` no card; quando houver, incluir em `destak.ts` e voltar com a caixa). **Saindo pelo painel (20/11, branch `claude/destak-pelo-painel`):** a Priscila mandou o cadastro em 18/11 com benefício confirmado (10% de desconto, aguardando validação da Yruena), endereço e horário, mas sem logo e foto: a página do painel foi montada com o logo e as fotos da página feita à mão (as três peças viraram itens com preço e tamanhos) e está "Em preparação" no endereço `destak-office` (0022 rodada e trocado em 20/11). Mesmo esquema da Dewa: a rota usa `ParceiroPublico` com `slugFixo="destak-office"` e a feita à mão até a do painel ser publicada; a migration `0022` tira `destak-office` dos endereços reservados. No cadastro, "onde vale" veio como "Em todos acima" (campo livre) e aparece assim na página: pedir à Priscila para corrigir antes da validação.
- **Login com motivo real e "Esqueci minha senha" (18/11):** antes todo erro do login aparecia como "E-mail ou senha incorretos", inclusive e-mail não confirmado. Agora `mensagemErroAuth()` (`src/lib/membros.ts`) traduz o código do Supabase e, se o e-mail não foi confirmado, a tela oferece "Reenviar link de confirmação". `/esqueci-senha` manda o link (`resetPasswordForEmail`) e `/nova-senha` grava a senha nova; o `App` leva para `/nova-senha` no evento `PASSWORD_RECOVERY` mesmo se o link cair na home. **No Supabase:** incluir `https://clube.sanchezimoveis.com.br/nova-senha` e `https://clube-vantagens.vercel.app/nova-senha` em Authentication → URL Configuration → Redirect URLs. O e-mail padrão do Supabase (sem SMTP próprio) manda só poucos e-mails por hora; acima disso, a tela pede para esperar.
- **Visual novo da página do parceiro do bloco F (19/11, branch `claude/lp-parceiros-visual`):** `PaginaParceiro.tsx` (página pública, prévia do painel e prévia do parceiro) refeito no padrão do site: sem degradê sobre a foto, sem pílula; nome em Playfair ao lado da foto principal, que aparece **inteira** (as capas chegam em 3:1, 4:5, quadrado, muitas com texto: nada é cortado; capa em faixa, mais larga que 1,6:1, vai embaixo do nome na largura toda), faixa escura "Sua vantagem no Sanchez Clube", seções com título à esquerda, produtos em grade quando a maioria tem foto e em lista com preço ao lado quando não tem, fotos em colunas na proporção original, atendimento em lista. `cardBeneficio()` passou a escrever "WhatsApp" com maiúscula ("vale em WhatsApp"). Os cadastros recebidos (Flow2Work, Consultings Company, Vidraçaria AV, Dewa; Destak sem logo e foto principal) saem por este fluxo: "Montar a página com as respostas" na ficha → validação da Yruena → aprovação do parceiro → publicar. Dewa e Destak já têm página feita à mão nos endereços reservados `dewa` e `destak-office`: a página do painel precisa de outro endereço, ou fica a feita à mão. **Em 19/11** as páginas de Flow2Work (`flow2work`), Consultings Company (`consultings-company`) e Vidraçaria AV (`vidracaria-av`) foram montadas no painel, com os textos revisados (frase curta, etiquetas, pequenas correções; o benefício saiu do texto "Sobre" da Vidraçaria porque vem da versão validada), e estão "Em preparação". **Em 20/11** Consultings e Vidraçaria foram para a validação da Yruena ("Aguardando validação"); a Vidraçaria não tem endereço por enquanto (só online, seg a sex 9h–18h, no campo "Observação do horário", porque o horário do cadastro não se edita no painel). O deploy de prévia da Vercel não tem as variáveis do Supabase, então o visual novo com os dados reais só aparece depois do merge (no "Ver prévia" da ficha). A Vidraçaria publicada substitui o card fixo de `parceiros.ts` na vitrine (mesmo slug). Ajustes depois de ver as prévias reais (20/11): foto de produto inteira (sem corte), logo claro de fundo transparente ganha placa escura (análise dos pixels; sem CORS fica a placa clara), galeria distribui as fotos pela coluna mais curta (2 colunas no celular, 3 no desktop, também com 1 ou 2 fotos), e vantagem por código sem código ainda criado avisa que está sendo criado. **Atenção no painel:** os campos "Etiquetas", "Como atende" e "Cidades atendidas" só gravam ao sair do campo. A Flow2Work usa "código do Clube": criar o código antes de publicar. Perguntas para mandar aos parceiros (logo da Flow2Work e da Dewa; "onde vale" da Destak) estão na nota interna de cada ficha.
- Página `/papodealuguel` (podcast; botões do YouTube e do Instagram com os mesmos endereços do mídia kit, desde 12/11) e catch-all `*` → `/`.
- **Banner do Papo no carrossel (12/11):** artes novas da designer ("Aqui não tem papo furado", `topo-papo.jpg` recortada de 2000×667 para 1920×465 e `mobile/topo-papo.jpg` 1080×810 própria); o clique leva ao mídia kit (`/midiakit`, por `<a>`, porque é página estática fora do React Router). A página `/papodealuguel` continua no ar, só saiu do banner.
- **Visual da home no padrão do site da Sanchez (12/11, branch `claude/clube-visual-v4`):** fontes trocadas para as do site novo (Playfair Display nos títulos, DM Sans no texto; `src/fonts.css`, arquivos em `public/fonts`); sem rótulo em pílula, sem fonte mono, sem degradê, sem sombra, sem vidro e sem os números 01–04. Menu em barra simples, parceiros em 3 colunas (lista no celular), loja em grade de 2 no celular, "Como funciona" em lista ao lado do título, chamada final em faixa escura, rodapé com o nome grande. Textos e paleta mantidos. As outras páginas seguiram o mesmo padrão: entrar/criar conta com a foto da Yruena ao lado do formulário (`AuthLayout`), loja, privacidade, Minha área, páginas de parceiro (Dewa, Bioreluz, Insurance), modais (parceiro, Quem somos, e-book, cotação) e o painel `/admin` sem rótulo mono/caixa alta. O Papo de Aluguel mantém o visual próprio (só perdeu o brilho decorativo e os rótulos miúdos).

**Banco:** Supabase próprio do Clube (não é o do Connect). Migrations `0001`–`0011` em `supabase/migrations/`, **aplicadas à mão pela Bruna** no SQL Editor (`0013` e `0014`, da cotação pela função, rodadas em 12/11); `0012` (limite de 10 MB e só PDF/foto no bucket `cotacoes-docs`, revisão de segurança) rodada e conferida em 10/11 (envio de `text/plain` sem login → `invalid_mime_type`). Os mesmos limites estão em `src/lib/cotacoes.ts`: mudar nos dois (a `0011` já estava no banco pela `0006` do repo `sanchez-inteligencia`). RLS: leads/eventos só têm INSERT para anon (cotações não: só a função `cotacao-enviar` grava, desde a `0014`); leitura só por `/admin`, dashboard ou service_role. O mesmo projeto Supabase hospeda o schema `inteligencia` do projeto Sanchez Inteligência — não mexer nele por aqui.

**Integração com o Sanchez Connect (CRM):** bancos separados de propósito. Um script no repo do Connect lê `membros` daqui de hora em hora e cruza por CPF/CNPJ (só dígitos — `normalizarDocumento()` em `src/lib/membros.ts`). Por isso CPF/CNPJ é obrigatório no cadastro.

**PRs:** já entraram #38, #39 e #40 (revisão de segurança e prazos de guarda, 14–16/11), #37 (Portal do Parceiro, parte 2), #36 (Portal do Parceiro, parte 1), #25 e #26 do mídia kit, #31 do visual novo e #32 do banner do Papo.

**Cotação pela Edge Function (no ar desde 12/11, PR #33):** o formulário da Insurance & Santé não grava mais direto no banco. Chama `supabase/functions/cotacao-enviar` (regras em `supabase/functions/_shared/cotacao.ts`, teste `node --test supabase/functions/_shared/cotacao.test.ts`), que confere o Turnstile (`src/components/Turnstile.tsx`, sem biblioteca), o campo escondido `website` e no máximo 5 envios por IP por hora (hash do IP que muda todo dia, coluna `ip_hash`), grava com a service_role e devolve um link de upload de uso único por documento; o navegador sobe cada arquivo direto no bucket por esse link (`uploadToSignedUrl`). Documento que falha não perde a cotação: a tela pede para mandar pelo WhatsApp. Turnstile sem resposta da Cloudflare grava com `robo_checado = false`. `0013` e `0014` rodadas, função publicada, `CLUBE_ORIGENS` no Supabase, `VITE_TURNSTILE_SITE_KEY` na Vercel e `clube-vantagens.vercel.app` no widget "Site Sanchez"; testado pela Bruna em 12/11. **Domínio próprio do Clube, quando houver:** incluir em `CLUBE_ORIGENS` (o `secrets set` troca a lista inteira) e no widget do Turnstile, senão a cotação é recusada como robô. Publicar a função de novo depois de mudar o código: da pasta do Clube, `npx supabase functions deploy cotacao-enviar --project-ref yfdlvusoanyyetcgoafz --no-verify-jwt`. Para desfazer a `0014`, recriar as duas policies da `0005`.

**Portal do Parceiro (no ar desde 13/11: parte 1 = blocos A–E + painel D, #36; parte 2 = bloco F, #37):** briefing da Júlia (Papo de Aluguel) → spec `docs/superpowers/specs/2026-11-13-portal-cadastro-parceiros.md` (proposta para elas validarem: artifact "Portal do Parceiro"). `0015` (13/11) e `0016` (16/11) rodadas e função `parceiro-cadastro` publicada com o código do bloco F:
- `/cadastro-parceiro#<codigo>`: link pessoal sem conta, boas-vindas + 7 etapas, salvamento automático (cópia no `localStorage` se cair a internet), uploads com foto reduzida no aparelho, revisão, conclusão com andamento. Sem botão flutuante nem script de terceiros na página.
- Regras num arquivo só, usado pela tela e pela função: `supabase/functions/_shared/parceiro-cadastro.ts` (teste `node --test supabase/functions/_shared/parceiro-cadastro.test.ts`). Decisões da Júlia (13/11, seção 10 da spec) já aplicadas: 16 segmentos, sem opção "identificação de membro" (carteirinha é fase 2), link de 90 dias, publicação exige só logo + foto principal (catálogo/endereço/horário são `recomendado`).
- Fluxo: recebido → Júlia prepara → **validação da Yruena** (status `aguardando_validacao`) → aprovação do parceiro → publicação manual. Papéis em `admins.papeis`: `parceiros` (Júlia), `validacao` (Yruena), `painel`; Bruna com os três. A Júlia criou a conta e já está em `admins` com `parceiros` (16/11). Quem ainda não tem conta cria pelo `/cadastro` (não pelo painel do Supabase: o gatilho `handle_new_membro` recusa) e depois recebe o papel por SQL.
- Termo: `/condicoes-parceiro` (`TERMOS_VERSAO` guarda a versão aceita) + seção "Empresas parceiras" na `/privacidade` (rascunho nunca enviado e parado há 180 dias é apagado: `parceiros_rascunhos_vencidos()` na 0015 + ação `limpar_rascunhos` da função, que também apaga os arquivos no Storage; agendado pelo `pg_cron` todo dia às 6h17 UTC, chamando a função pelo `pg_net`). **Texto das Condições ainda precisa da leitura da Yruena.**
- Benefício com registro próprio: `parceiros_beneficio_versoes` (cada confirmação vira versão; a página só pode mostrar versão `validado`).
- Aviso por e-mail pronto na função; liga quando existirem os secrets `RESEND_API_KEY`, `AVISO_REMETENTE` e `AVISO_EMAILS`. `AVISO_EMAILS` já está no Supabase (13/11; os endereços ficam só lá, não no repo). **Falta:** a Bruna criar a chave do Resend (`RESEND_API_KEY`) e definir o remetente (`AVISO_REMETENTE`, precisa de domínio verificado no Resend; `onboarding@resend.dev` só entrega para o dono da conta). Depois de mudar secrets, publicar a função de novo.
- Edge Function `parceiro-cadastro` (abrir/salvar/upload/confirmar_upload/remover_arquivo/enviar/pedir_correcao; do bloco F, previa/aprovar/pedir_ajuste; e limpar_rascunhos, chamada pelo `pg_cron`). Deploy: `npx supabase functions deploy parceiro-cadastro --project-ref yfdlvusoanyyetcgoafz --no-verify-jwt` (usa o `CLUBE_ORIGENS` que já existe).
- Migration `0015` (rodada em 13/11): tabelas `parceiros_cadastro/arquivos/historico/beneficio_versoes` sem policy, bucket privado `parceiros-cadastro`, `admins.papeis` + `tem_papel()`, `parceiro_convite_criar()`/`_renovar()`/`_invalidar()` e os 3 eventos `parceiro_cadastro_*` no check de `eventos`. Enquanto não há painel, convite pelo SQL Editor (exemplo no fim da 0015).
- **Painel `/admin/parceiros` (bloco D):** lista com filtros por situação (inclusive "parados há 7+ dias"), busca, planilha CSV; ficha com próximo passo conforme o papel, o que falta + cobrança pelo WhatsApp, link (gerar novo / invalidar; o link só aparece na hora em que é gerado), versões do benefício, respostas, arquivos (download por link assinado), notas, responsável e histórico; "Novo convite" puxa dados de `src/data/parceiros.ts` (`respostasDoParceiro` em `src/lib/painelParceiros.ts`). Quem só tem `parceiros`/`validacao` e entra em `/admin` vai direto para lá; o botão flutuante do WhatsApp não aparece em `/admin*`.
- Regras de status: `TRANSICOES` (shared) espelha `parceiro_painel_mudar_status` (criada na 0015, trocada pela 0016 e pela 0018: mudar nos dois). Testadas num Postgres local com a 0015 de verdade (visitante/membro sem acesso; só a Yruena valida e só com benefício confirmado; ninguém publica antes de `aprovado`).
- **Bloco F (página do parceiro, migration `0016`, rodada em 16/11; no ar pelo #37):** na ficha, seção "Página": "Montar a página com as respostas" copia respostas e fotos para `parceiros_perfil.conteudo` (forma `PerfilPagina` em `supabase/functions/_shared/parceiro-pagina.ts`, teste `node --test supabase/functions/_shared/parceiro-pagina.test.ts`); a equipe edita e salva (`parceiro_perfil_salvar`). Toda foto da página é redesenhada no navegador (`src/lib/painelPagina.ts`: sai GPS/EXIF, SVG vira PNG; PDF/AI/EPS não, a equipe converte) e fica em `<cadastro>/pagina/` no bucket privado. O benefício da página é copiado pelo banco da versão confirmada, nunca da tela. Mandar para a validação exige logo + foto principal; ao validar, a página passa a usar a versão validada. O parceiro vê a prévia no mesmo link e aprova/pede ajuste (ações `previa`/`aprovar`/`pedir_ajuste` da função → `parceiro_pagina_decidir`, grava hash + cópia do conteúdo em `parceiros_aprovacoes`). "Publicar a página" copia as fotos para o bucket público `parceiros-publico` e chama `parceiro_perfil_publicar`, que confere aprovado + mesmo hash + benefício validado + fotos no bucket. Editar depois de ir ao parceiro volta para "Em preparação" (a versão publicada fica no ar até a nova). Arquivar tira do ar. Site: `/parceiro/:slug` (`ParceiroPublico.tsx` + `PaginaParceiro.tsx`, o mesmo componente da prévia) e a vitrine junta as páginas publicadas (`parceiros_publicados()`, sem o código) ao `src/data/parceiros.ts`; o código de desconto só para logado (`parceiro_codigo()`). Endereços `bioreluz` e `insurance-sante` são reservados (rotas feitas à mão; `dewa` e `destak-office` saíram pela 0021 e 0022). A caixa da vantagem mostra o título e a 1ª linha da descrição do benefício; as outras linhas entram na lista de condições (20/11: a Destak escreveu "10% à vista e 5% a prazo" na 2ª linha). Ordem: rodar a 0016 → publicar a função de novo → merge.
- Cartão de membro ficou para a fase 2.

**Revisão de segurança de 14/11 (mesclada pelo #38):**
- Migration `0017` (rodada em 16/11): tira a policy de UPDATE de `membros` (o membro alterava a própria linha inteira, inclusive CPF e `status`, e o Connect cruza por CPF) e o direito de gravar direto em `membros`/`indicacoes`; o gatilho `handle_new_membro` passa a conferir CPF/CNPJ com dígito verificador (`documento_valido()`, espelho de `documentoValido()` em `src/lib/membros.ts`), nome e WhatsApp, e grava o consentimento com a hora do servidor (mantém o trecho da equipe do Inteligência); gatilho em `patrocinio_adesoes` fixa data do aceite e valores pela cota. Se um dia houver "editar meus dados", liberar só as colunas certas (exemplo no arquivo).
- `cotacao-enviar`: token do Turnstile acima de 2048 caracteres ou resposta 4xx da Cloudflare recusam o envio (antes passavam como "fora do ar"); sem `CLUBE_ORIGENS` a função responde 500. **Publicar a função de novo depois do merge.**
- `parceiro-cadastro`: `salvar` e `enviar` só gravam se o status ainda for editável (`STATUS_EDITAVEIS`); tirar a confirmação do benefício marca a versão como `substituido`.
- `vercel.json`: cabeçalhos de segurança, com a CSP bloqueando de verdade (`Content-Security-Policy`; testada antes em modo só-aviso, console limpo em janela anônima). Domínio novo de script, iframe, API ou fonte precisa entrar nela, senão o navegador bloqueia: se algo sumir do site, olhar o console. A barra de comentários da Vercel (`vercel.live`) ficou de fora de propósito: só aparece para quem está logado na Vercel. Para voltar ao modo só-aviso, trocar a chave para `Content-Security-Policy-Report-Only`.
- Segunda parte (mesclada pelo #39; CSP conferida no ar em 16/11, 10 páginas sem bloqueio): migration `0018` (rodada em 16/11): a validação da Yruena só vale para a página que estava na tela dela (`parceiro_painel_mudar_status` ganhou o 4º parâmetro `p_hash`; página editada no meio → o painel recarrega e pede para conferir de novo); `created_at` de `eventos`, `ebook_leads` e `ebook_downloads` e a data do aceite de comunicação do e-book passam a ser as do servidor. A cópia local do cadastro do parceiro (`localStorage`) deixou de levar um pedaço do código do link no nome. `npm audit fix` aplicado (0 avisos).
- Terceira parte (mesclada pelo #40): migration `0019` (rodada e conferida em 16/11: segredo `cron_segredo` no Vault, `CRON_SEGREDO` na função, `parceiro-cadastro` publicada; chamada sem o cabeçalho → 403, com ele → 200): a limpeza agendada dos rascunhos manda o cabeçalho `x-cron-segredo`, com valor guardado no Vault (`cron_segredo`) e no secret `CRON_SEGREDO` da função `parceiro-cadastro`, que passa a recusar (403) quem chama `limpar_rascunhos` sem ele. Sem o secret, a ação segue aberta como antes. A `cotacao-enviar` passa a avisar no log (`IP veio de x-forwarded-for` ou `nenhum`) quando o IP do limite de 5 por hora não vem do `cf-connecting-ip`: se esse aviso aparecer nos logs da função, o limite pode ser contornado e precisa de ajuste. **Publicar as duas funções de novo depois do merge.**
- Prazos de guarda (16/11, na mesma branch): migration `0020` (**ainda não rodada; só rodar depois de a Yruena confirmar os prazos**, porque liga uma limpeza diária que apaga dado sem volta; funções testadas num Postgres local, a parte do `pg_cron`/Vault não): documentos da cotação saem em 90 dias, a cotação em 1 ano, leads do e-book em 2 anos sem novo download, eventos e downloads em 2 anos. O `pg_cron` chama `cotacao-enviar` com `{ "acao": "limpar" }` e o `x-cron-segredo` (o mesmo da 0019; sem o secret `CRON_SEGREDO` a função recusa); a função apaga os arquivos do bucket `cotacoes-docs`, marca `cotacoes.documentos_apagados_em` e chama `limpeza_de_dados()`. Prazo em três lugares: 0020 (piso), `DOCS_GUARDA_DIAS` em `_shared/cotacao.ts` e o texto da `/privacidade` (já fala em 1 ano e 90 dias). Membros, parceiros e adesões de patrocínio não entram. Ordem: 0019 inteira → publicar `cotacao-enviar` → 0020. A consulta para ver o que a primeira limpeza apagaria está no fim do arquivo.
- Decidido em 16/11: a Júlia pode ver as adesões de patrocínio e as métricas, então a leitura por `is_admin()` (qualquer pessoa em `admins`) fica como está.
- Turnstile da cotação (16/11): o formulário recusava todo envio como robô porque o site estava publicado sem `VITE_TURNSTILE_SITE_KEY` (a caixa nem aparecia) e, depois, porque `clube-vantagens.vercel.app` não estava nos hostnames do widget (erro `110200` da Cloudflare no console, caixa com "Não foi possível conectar ao site"). Corrigido pela Bruna na Vercel e na Cloudflare; caixa conferida no ar. Se voltar a acontecer, conferir essas duas coisas e fazer novo deploy (a variável só entra em build novo). Sem a chave, o formulário agora avisa que o envio pelo site está fora do ar e pede o WhatsApp, em vez de dizer que a pessoa parece um robô.
- Domínio oficial `clube.sanchezimoveis.com.br` (16/11): a cotação falhava nele com "Não foi possível enviar agora" (no log da função, `OPTIONS` 200 sem `POST` depois: o navegador bloqueia porque a origem não está em `CLUBE_ORIGENS`). A Bruna incluiu o domínio no secret `CLUBE_ORIGENS` (agora com os dois endereços, separados por vírgula; vale também para a `parceiro-cadastro`). O hostname também precisa estar no widget do Turnstile, senão a caixa dá erro `110200`. Endereço de prévia da Vercel não está na lista de propósito: cotação e cadastro de parceiro só funcionam nos dois endereços oficiais. Envio pelo domínio oficial testado pela Bruna em 16/11, sem aviso de IP no log da `cotacao-enviar`. Os links do mídia kit (`public/midiakit/app.js` e `index.html`) passaram a apontar para o domínio oficial: **trocar também na fonte, no PC da Bruna**, senão a próxima recópia traz o endereço antigo de volta.
- Ficou para decidir: CPF da Yruena e chave Pix em `public/midiakit/app.js` (arquivo público; a Bruna vai confirmar com a Yruena); confirmação da Yruena para os prazos de guarda da 0020 (acima); foto da página trocada depois da aprovação (o hash cobre o caminho, não o conteúdo do arquivo: só a equipe com papel `parceiros` consegue).

**Pendências — dependem da Yruena:** bloco 7 (parceiros completos + Level Up: planilha + logos), bloco 8 (Loja DEWA: planilha + fotos), bloco 12 (regra dos 5% da indicação); primeira entrada no `/admin` com dados reais; revisão da `/privacidade` (prazos de guarda são rascunho); título da seção Instagram; logo vetor transparente; conteúdo real de Bioreluz/Insurance e do "Quem somos"; arte de banner do contato; artes de celular dos banners.

**Gatilho `handle_new_membro`:** pula usuários de equipe do Inteligência (`0011`). Quem mudar essa função precisa manter esse trecho, senão a criação de login de equipe volta a dar "Database error creating new user".

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
- Tipografia: Playfair Display (títulos) + DM Sans (texto), as mesmas do site da Sanchez Imóveis; sem monoespaçada
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
