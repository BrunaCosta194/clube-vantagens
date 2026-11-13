# Portal de cadastro de parceiros

Data: 2026-11-13
Fonte: "Briefing para Bruna — Portal de Cadastro de Parceiros", da Júlia (Papo de Aluguel), recebido em 13/11.
Situação: **validada pela Júlia em 13/11** (respostas na seção 10); blocos A–E implementados (o aviso por e-mail espera o endereço e o domínio do remetente). Antes: proposta para validar com a Júlia e a Yruena. O próprio briefing pede isso ("validar a estrutura das telas e o fluxo antes do desenvolvimento completo").

Este documento segue o briefing e acrescenta melhorias, marcadas com **[+]**. Onde a proposta muda algo do briefing, isso vem marcado com **[≠]** e com o motivo.

---

## 1. Resumo da proposta

- O parceiro recebe pelo WhatsApp um **link pessoal** que só abre o cadastro da própria empresa. Não há conta nem senha, e o link serve também para salvar e continuar depois.
- O cadastro tem 7 etapas curtas, pensadas para o celular, com salvamento automático. Logo e fotos são **obrigatórios para publicar, não para enviar**, então o parceiro nunca trava por falta de arquivo.
- Tudo fica guardado em um banco estruturado, que separa três coisas:
  - **respostas** do parceiro (originais, não mudam depois do envio);
  - **perfil**, que é o texto final que a equipe organiza e que vira a página;
  - **arquivos**, num bucket privado.
- A coordenação acompanha tudo em `/admin/parceiros`: lista com status, pendências, edição, histórico e exportação.
- **[+]** O mesmo link pessoal serve depois para o parceiro **ver a prévia da página e aprovar** com um clique. A aprovação fica registrada com data, hora e uma cópia exata do que foi aprovado.
- **[+]** A página pública passa a ser **um modelo único** (`/parceiro/:slug`) que lê o perfil publicado. Acaba o trabalho de copiar dados para um `.ts` e criar uma página nova para cada parceiro, como foi feito com Dewa, Bioreluz e Insurance.

Fluxo completo:

```
Convite (admin gera o link) → Cadastro iniciado → Cadastro recebido
  → [Informações incompletas ↺] → Em preparação → Aguardando aprovação do parceiro
  → [Ajustes solicitados ↺] → Aprovado → Publicado
```

---

## 2. Acesso pelo link pessoal (sem conta)

**Como funciona**

1. Na coordenação, alguém cria o convite em `/admin/parceiros`: nome da empresa, nome e WhatsApp do contato.
2. O sistema gera um código aleatório de 32 bytes. O banco guarda **só o hash** desse código, nunca o código em si.
3. O link fica assim: `clube-vantagens.vercel.app/cadastro-parceiro#<codigo>`.
4. **[+]** O código vai depois do `#`. Essa parte do endereço não é enviada ao servidor, então não aparece nos logs da Vercel nem no `Referer`.
5. O botão "Enviar pelo WhatsApp" abre o `wa.me` do contato com uma mensagem pronta que já traz o link.
6. A página lê o código e conversa **só com a Edge Function** `parceiro-cadastro`, que usa a service_role. As tabelas não têm nenhuma policy para visitante. É o mesmo modelo da `cotacao-enviar`.

**Regras**

- Um link abre **um único cadastro**. Não existe listagem nem busca: quem tem o link não enxerga outros parceiros, como o briefing exige no item 8.
- O link vale por **90 dias** a partir do envio do convite. O admin pode **gerar um novo link**, o que invalida o anterior na hora (para o caso de link vazado ou contato trocado).
- Limite de requisições por IP e por link, com hash do IP como na cotação.
- A página tem `noindex`, `referrer: no-referrer` e **nenhum script de terceiros**: nada de Behold, Turnstile ou analytics externo. O `track()` interno continua.
- Depois do envio, o link mostra "Cadastro recebido" e o andamento. **O parceiro ainda pode completar e corrigir** (por exemplo, mandar o logo que faltou) até a equipe passar o status para "Em preparação". *(Mudou na implementação, 13/11: com o resumo só para leitura, quem enviasse sem logo não teria como mandá-lo pelo link.)* Depois disso, o botão "Preciso corrigir algo" avisa a coordenação pelo histórico. A edição volta a abrir se o status for para "Informações incompletas" ou "Ajustes solicitados".
- **[+]** Mais de uma pessoa da empresa pode usar o mesmo link. Cada gravação confere a versão (`versao`). Se outra pessoa salvou antes, a tela avisa e recarrega, em vez de apagar o que a outra escreveu.

**[+] Parceiros que já estão no site.** O admin pode criar o convite **já preenchido** com o que existe em `src/data/parceiros.ts` (nome, categoria, descrição, WhatsApp, Instagram). Os 8 parceiros atuais só completam e confirmam o que falta, sem digitar tudo de novo.

---

## 3. Experiência do formulário

### Regras gerais

- **Pensado para o celular, testado em 375px.**
  - campos grandes e teclado certo para cada um (`type="tel"`, `inputmode="numeric"`, `autocomplete`);
  - botões "Voltar" e "Continuar" fixos no rodapé da tela;
  - nada de dois campos lado a lado no celular.
- **Cabeçalho mínimo:** logo do Sanchez Clube e a barra de progresso ("Etapa 2 de 7 · Benefício"). Sem o menu do site, para não tirar o foco.
- **Identidade visual atual:** Playfair Display nos títulos, DM Sans no texto, cobre sobre creme, sem pílula, sem sombra e sem degradê, igual ao resto do site.
- **Salvamento automático:**
  - grava 1,5 s depois da última digitação e ao trocar de etapa;
  - o rodapé mostra "Salvo às 14:32";
  - **[+]** uma cópia fica no `localStorage`, então quem perder o sinal no meio do caminho não perde o que digitou e a página sincroniza quando a conexão volta.
- **Campos opcionais com a palavra "(opcional)"** ao lado do rótulo. Os obrigatórios não levam asterisco.
- **[+] Placeholder com exemplo do mundo real** em cada campo de texto. Por exemplo: "Ex.: Fazemos limpeza de sofás e impermeabilização de estofados em Mogi e região."
- **[+] O erro aparece só ao tentar avançar**, nunca enquanto a pessoa digita, e a tela rola até o primeiro campo com problema.
- **Etapas livres:** o parceiro pode pular uma etapa e voltar depois. A revisão final lista o que falta.

### Tela 0: Boas-vindas

- **[+] Personalizada:** "Olá, *Dewa*! Sua empresa está chegando ao Sanchez Clube!", com o nome que veio do convite.
- Usa o texto do briefing sem mudança, mais o botão **Começar meu cadastro**.
- Logo abaixo vem o tempo estimado. O valor provisório é "cerca de 15 minutos" e será trocado pela mediana real depois do teste com as duas empresas (seção 9).
- **[+]** Embaixo, uma lista curta "O que vai ajudar ter em mãos": logo, 3 a 6 fotos, o benefício que você quer oferecer e o link do site ou catálogo, se tiver.
- **[+]** Mais abaixo, o aviso: "Você pode parar e continuar depois por este mesmo link."
- Quem volta pelo link cai direto na etapa onde parou, com o botão "Continuar de onde parei".

### Etapa 1: Vamos conhecer seu negócio?

| Campo | Situação | Observação |
|---|---|---|
| Nome comercial | obrigatório | vem preenchido do convite |
| Nome do responsável | obrigatório | |
| Segmento | obrigatório | **[+]** lista fechada com as categorias que o site já usa, mais "Outro", para alimentar o filtro da vitrine |
| Há quanto tempo existe | opcional | **[+]** ano de fundação (número). O site calcula "há 18 anos", que nunca fica desatualizado, como já se faz com os anos da Sanchez |
| Cidade | obrigatório | vem marcada "Mogi das Cruzes" |
| O que sua empresa faz? | obrigatório | caixa livre, sem limite de linhas, como pede o briefing |
| O que diferencia sua empresa? | opcional | |
| **[+] Já tem site, catálogo ou apresentação?** | opcional | link ou PDF de até 25 MB |

**[≠] Logo e foto principal saíram desta etapa e foram para a etapa 4.** Motivo: subir arquivo é o passo mais difícil no celular, e o empresário muitas vezes não tem o logo à mão. Com isso, a etapa 1 fica só com texto e se resolve em 2 minutos. Assim que a pessoa começa, quem já preencheu a primeira etapa tende a terminar.

**[+] "Já tem site ou catálogo?"** aparece logo na etapa 1. Quando o parceiro manda esse material, as etapas 3 (produtos) e 4 (galeria) passam a mostrar "Pode pular: vamos montar a partir do material que você enviou". É o que o briefing pede em três lugares diferentes, resolvido num só.

### Etapa 2: Qual vantagem sua empresa vai oferecer?

Campos que se adaptam à resposta anterior:

| Tipo escolhido | Campos que aparecem |
|---|---|
| Desconto percentual | % (número de 1 a 100) + em quê ("toda a loja", "serviços", "produtos selecionados") |
| Desconto em reais | valor em R$ + valor mínimo da compra (opcional) |
| Brinde | qual brinde |
| Serviço sem custo | qual serviço (ex.: "visita técnica", "1ª avaliação") |
| Condição especial | descrição |
| Outro | descrição |

Depois vêm os campos comuns:

- Onde usar (múltipla escolha):
  - loja física;
  - site;
  - WhatsApp;
  - atendimento externo;
  - outro.
- Como o membro usa:
  - código de desconto: o parceiro informa o código, ou **[+]** marca "Quero que o Clube crie um código", que gera algo como `SANCHEZCLUBE`;
  - identificação de membro (ver o alerta abaixo);
  - contato direto com a empresa;
  - outro procedimento.
- Regras do benefício: cada opção marcada abre um campo para o detalhe.
  - valor mínimo;
  - quantidade limitada;
  - produtos ou serviços fora da regra;
  - acumula com outras promoções (Sim/Não);
  - outras condições.
- Validade: "Sem prazo definido" ou "Até [data]".

**[+] Prévia do benefício ao vivo.** Embaixo dos campos aparece um mini card exatamente como ele vai sair na vitrine ("**10% de desconto** · em toda a coleção · use o código SANCHEZCLUBE"). O parceiro vê na hora como o membro vai ler a oferta. Isso antecipa uma parte pequena da "prévia visual" da fase 2 sem custo grande.

**Confirmação expressa**, como pede o briefing, com uma caixa a marcar:

> "Confirmo que **[empresa]** autoriza o Sanchez Clube a divulgar este benefício aos membros, nas condições acima."

O banco grava o texto exato do benefício, a data, a hora e quem marcou. Se o parceiro mudar o benefício depois, a confirmação é **desmarcada sozinha**.

> ⚠️ **Alerta: o membro hoje não tem como provar que é membro.** A `/area` mostra o voucher e o link de indicação, mas não existe carteirinha nem código individual. Se um parceiro escolher "apresentação da identificação de membro", isso precisa existir antes da publicação. **[+]** A proposta é um **cartão de membro na `/area`**, com nome, número de membro e QR. Fica como item à parte (seção 8, bloco G). Enquanto ele não existir, essa opção aparece com a nota "em breve" e a recomendação de usar código.

### Etapa 3: O que sua empresa oferece?

- **[+] A primeira pergunta é: "Você vende produtos ou presta serviços?"** As respostas possíveis são "produtos", "serviços" ou "os dois". A escolha muda os textos:
  - quem presta serviço vê **"Especialidade"** no lugar de "Produto";
  - nenhum campo pede estoque nem catálogo.
- Itens (de 0 a 8; o recomendado é 3, mas **[≠] não é obrigatório**), cada um com:
  - nome;
  - descrição curta, até 160 caracteres, com contador;
  - foto (opcional);
  - preço (opcional), em um de três formatos: **[+]** "Preço fixo R$", "A partir de R$" ou "Sob consulta". Isso resolve o caso de quem não tem preço fixo, que o próprio briefing levanta;
  - link de vídeo (opcional): aceita YouTube, Instagram e TikTok e confere se o link é válido.
- Botão **Adicionar outro produto ou serviço**, que some no 8º item.
- **[+]** Cada item é um card que dobra (só o nome fica visível), para a tela não ficar enorme no celular. Para remover, há "Remover", com a opção de desfazer.
- Se a pessoa mandou material na etapa 1, a tela mostra "Pode pular" (ver etapa 1).

**[≠] Motivo de não exigir 3 itens:** um parceiro de serviço único, como um estúdio de fotografia, travaria no "mínimo 3". A equipe completa os itens a partir do material ou de uma conversa.

### Etapa 4: Vamos mostrar sua empresa?

A etapa reúne, em ordem:

1. **Logo** (obrigatório para publicar).
   - Formatos aceitos: PNG, SVG, PDF, AI e EPS. A maioria dos arquivos `.ai` já é compatível com PDF.
   - JPG também entra, com o aviso: "Funciona, mas o ideal é PNG sem fundo ou o arquivo do designer".
   - Texto de ajuda: "Prints de tela não são recomendados".
   - **[+]** Se a imagem tiver menos de 500 px, a tela avisa: "Esse arquivo parece pequeno. Se tiver o original do designer, ele fica melhor."
2. **Foto principal**, que vira a capa (obrigatória para publicar).
   - **[+]** A tela confere a proporção e avisa se a foto estiver na vertical ("Para a capa, prefira uma foto deitada (horizontal)").
   - Também avisa se tiver menos de 1200 px de largura.
   - Lembrete: "Sem arte com texto por cima".
3. **Galeria**: de 3 a 6 fotos recomendadas, no máximo 10.
   - dá para selecionar várias de uma vez;
   - as miniaturas aparecem com botão de excluir;
   - **[+]** cada foto pode receber uma legenda opcional e um tipo (ambiente, equipe, produtos, serviço, trabalho concluído).

Para todos os uploads:

- **[+] O navegador reduz a imagem antes de subir:** lado maior de até 2400 px, JPEG com qualidade 85. Uma foto de celular cai de 4–8 MB para cerca de 600 KB. O envio fica bem mais rápido no 4G e o armazenamento rende mais.
- Fotos HEIC do iPhone: o seletor do iOS converte para JPEG sozinho, desde que o `accept` não liste HEIC.
- Cada arquivo tem barra de progresso. Se o envio falhar, aparece "Tentar de novo", e o resto do cadastro não se perde.
- Caixa a marcar uma vez nesta etapa: "As imagens são da minha empresa ou tenho autorização para divulgá-las."

### Etapa 5: Como os membros podem encontrar sua empresa?

- **[≠] A modalidade de atendimento vem primeiro**, porque ela decide quais campos aparecem. As opções (pode marcar mais de uma) são:
  - presencial;
  - online;
  - no endereço do cliente;
  - outros.
- WhatsApp comercial: obrigatório, com máscara de telefone. **[+]** Se a pessoa digitar "11 9...", o sistema completa o 55.
- Instagram (opcional): aceita `@perfil` ou o link e guarda os dois no mesmo formato.
- Site (opcional).
- Se a modalidade for **presencial**:
  - endereço, com **[+] CEP que preenche a rua sozinho** (ViaCEP, API pública e gratuita);
  - **[+]** o link do "Como chegar" no Google Maps é gerado sozinho, como o `DEWA_MAPA`;
  - horário de funcionamento.
- Horário: **[+] grade simples por dia da semana**, com atalhos ("Seg a sex, 9h às 18h" e "Sáb, 9h às 13h") e a opção "Só com hora marcada". É mais fácil no celular do que um texto livre, e a página consegue mostrar "Aberto agora".
- Se a modalidade for **online ou no endereço do cliente**: cidades e regiões atendidas, com lista sugerida (Mogi, Suzano, Itaquaquecetuba, Alto Tietê, Grande SP) mais "Outra".

### Etapa 6: Como funciona o atendimento da sua empresa?

- Pergunta inicial: "Sua empresa trabalha com orçamentos ou cotações?"
  - Se a resposta for **Não**, o formulário avança sozinho, como pede o briefing.
  - Se for **Sim**, aparecem os campos abaixo.
- O que precisa receber para orçar: caixas a marcar, com campo livre ao lado.
  - **[+]** opções: descrição do que o cliente precisa, fotos, medidas, endereço do serviço, planta ou projeto, prazo desejado, orçamento disponível.
- Documentos específicos: campo livre, com o exemplo "CNH e documento do veículo, para seguro auto".
- Como prefere receber: WhatsApp, e-mail ou formulário no site do Clube. **[+]** Se escolher e-mail, aparece o campo do e-mail.

**[+] Para aproveitar depois:** as respostas ficam num formato que alimenta direto um **formulário de orçamento genérico** na página do parceiro (fase 2). Ele usaria a mesma estrutura da `cotacao-enviar`: Turnstile, limite por IP, upload por link único e bucket privado.

### Etapa 7: Sua empresa está quase pronta para fazer parte do Sanchez Clube!

- Resumo em cards, um por etapa, cada um com o botão **Editar**, que leva à etapa e volta para a revisão. O resumo mostra:
  - nome;
  - logo e capa (miniaturas);
  - apresentação;
  - benefício (o mesmo mini card da etapa 2);
  - produtos;
  - contatos.
- **[+] Lista "Ainda falta"**, com o que é obrigatório para publicar e não foi enviado. Exemplo: "Logo · Foto principal". O texto ao lado diz que o parceiro **pode enviar assim mesmo** e mandar o que falta depois pelo mesmo link.
- Caixas a marcar obrigatórias:
  - "Autorizo o uso dos materiais enviados na página pública do Sanchez Clube, conforme as [Condições de participação] e a [Política de privacidade]";
  - a confirmação do benefício (seção 2), se ainda não estiver marcada.
- Botão **Enviar meu cadastro**.

### Tela final: Cadastro recebido com sucesso!

- Usa o texto do briefing sem mudança.
- Botão secundário **Falar com a coordenação**, que abre `wa.me/5511996628696` com a mensagem pronta "Olá! Acabei de enviar o cadastro da [empresa] no Sanchez Clube."
- **[+]** Também aparece: "Guarde este link: por ele você acompanha o andamento e aprova sua página quando ela estiver pronta."
- **[+] Andamento à vista:** quem volta ao link depois do envio vê em que pé está o cadastro (Recebido → Em preparação → Aguardando sua aprovação → Publicado), em vez de uma tela parada.

### [+] Aprovação pelo mesmo link

Quando a equipe põe a página em "Aguardando aprovação do parceiro", o link pessoal passa a mostrar a página nova:

1. **Prévia da página** exatamente como vai ao ar: o modelo `/parceiro/:slug` com o perfil em rascunho e uma faixa "Prévia, ainda não publicada".
2. Dois botões:
   - **Aprovar minha página**: grava a aprovação com data, hora, nome de quem aprovou (o campo vem preenchido com o responsável) e o hash do conteúdo aprovado;
   - **Pedir ajuste**: abre uma caixa de texto e muda o status para "Ajustes solicitados".
3. Se a equipe editar a página depois da aprovação, ela **volta a precisar de aprovação**, porque o hash mudou.

Isso atende o que o briefing pede ("a aprovação deverá ser registrada") melhor do que um "ok" no WhatsApp: fica uma prova do **conteúdo exato** que o parceiro aprovou.

---

## 4. Área da coordenação: `/admin/parceiros`

Fica dentro do `/admin` atual, numa aba "Parceiros".

### Lista

- Colunas:
  - empresa;
  - segmento;
  - status (etiqueta colorida);
  - **progresso**: % de etapas completas;
  - **pendências**: fichas do tipo "logo", "capa", "benefício não confirmado", "sem fotos";
  - última atividade (ex.: "há 3 dias");
  - quem é o responsável na equipe.
- Filtros: por status e "parados há mais de 7 dias". **[+]** Este último mostra quem começou e não terminou, que é o "identificar quem não concluiu" do briefing.
- Busca por nome.
- Botões:
  - **Novo convite**;
  - **Exportar CSV**: uma linha por parceiro, com as respostas principais.

### Ficha do parceiro

| Aba | O que mostra |
|---|---|
| **Respostas** | Tudo o que o parceiro escreveu, organizado por etapa. Só leitura: é o original. |
| **Arquivos** | Miniaturas, botão de download (link assinado de 5 minutos), opção de marcar "usar na página" ou "descartar" e de escolher qual foto vira a capa. |
| **Página** | Editor do **perfil** com os campos que a página pública mostra. Vem preenchido com as respostas e a equipe reescreve à vontade. Botão "Ver prévia". |
| **Andamento** | Status atual, troca de status com uma observação, histórico completo (quem, quando, o quê) e as aprovações registradas. |
| **Link** | Copiar o link, enviar pelo WhatsApp, gerar um novo (invalida o antigo) e ver a data de validade. |

- **[+] Mensagem de pendência pronta.** Ao marcar "Informações incompletas", um botão abre o WhatsApp do parceiro com o texto: "Oi, [nome]! Para terminar sua página no Sanchez Clube, falta: logo e foto principal. É só enviar pelo mesmo link: [link]."
- **[+] Separar respostas e perfil** resolve o "editar ou corrigir informações" sem perder o que o parceiro escreveu de fato. Se houver discussão sobre o benefício, o original está guardado.

### Status

Os 8 do briefing, mais **[+] "Convite enviado"** antes de tudo, **"Aguardando validação"** (pedido da Júlia: validação institucional da Yruena antes de a página ir ao parceiro) e **[+] "Arquivado"** para quem desistiu. Quem muda cada status:

| Status | Quem muda |
|---|---|
| Convite enviado | automático, ao criar o convite |
| Cadastro iniciado | automático, na primeira gravação do parceiro |
| Cadastro recebido | automático, quando o parceiro clica em "Enviar" |
| Informações incompletas | equipe (reabre a edição pelo link) |
| Em preparação | equipe (Júlia revisa e prepara a página) |
| Aguardando validação | equipe, quando a página está pronta; só quem tem o papel `validacao` (Yruena) libera para o parceiro. Para o parceiro aparece como "Em preparação" |
| Aguardando aprovação do parceiro | Yruena, ao validar (libera a prévia no link) |
| Ajustes solicitados | parceiro ("Pedir ajuste") ou equipe |
| Aprovado | automático, quando o parceiro aprova |
| Publicado | equipe (botão "Publicar", que só funciona se o status for Aprovado) |
| Arquivado | equipe (tira do ar, se estava publicado) |

**Publicar sem a validação da Yruena e sem a aprovação do parceiro registradas é bloqueado no banco**, não só na tela. Isso cumpre o "a conclusão do cadastro não deve publicar automaticamente".

### Notificação de cadastro concluído

O briefing pede que a coordenação seja avisada. Proposta: **e-mail pela Edge Function**, usando o Resend (plano gratuito de 3 mil e-mails por mês).

- O e-mail tem o assunto "Novo cadastro: [empresa]" e o link direto para a ficha.
- Nunca leva dado do parceiro no corpo além do nome da empresa.
- Precisa de uma chave e de um remetente verificado. Ver a decisão D3.
- Enquanto isso não existe, o `/admin` mostra um contador de "novos desde a sua última visita".

### Quem acessa

Hoje o `/admin` mostra **só números agregados**. A ficha de parceiro tem dado pessoal (nome e WhatsApp do responsável), então aqui o acesso é outro:

- **[+] A tabela `admins` ganha a coluna `papeis`**: `painel` (métricas), `parceiros` (Júlia: ver, editar, preparar, publicar) e `validacao` (Yruena: ver e validar). A Bruna tem os três.
- Ver os cadastros exige `parceiros` ou `validacao`; editar e publicar, `parceiros`; validar, `validacao`.

---

## 5. Estrutura de dados

A parte do parceiro está na migration `0015_parceiros_cadastro.sql` (cadastro, arquivos, histórico, bucket, papéis, convites). O perfil e as aprovações (`parceiros_perfil`, `parceiros_aprovacoes`) entram numa migration seguinte, junto com o bloco F. As migrations são rodadas à mão pela Bruna, como as anteriores. Todas as tabelas ficam **com RLS ligada e sem policy para visitante**. O parceiro passa pela Edge Function e a equipe passa por funções `security definer` que conferem o papel.

```
parceiros_cadastro          um por empresa
  id, slug (único, definido pela equipe), status, responsavel_equipe
  token_hash, token_expira_em, token_gerado_em
  convite_nome, convite_contato_nome, convite_whatsapp
  respostas jsonb           o que o parceiro preencheu, por etapa
  respostas_versao int      controle de gravação simultânea
  schema_versao int         versão do formulário (as perguntas vão mudar)
  etapa_atual, etapas_completas int[]
  beneficio_confirmado_em, beneficio_confirmado_texto
  autorizacao_uso_em, autorizacao_versao_termos
  enviado_em, ultima_atividade_em, created_at, updated_at

parceiros_perfil            o que a página pública mostra (editado pela equipe)
  cadastro_id, slug, nome, categoria, ano_fundacao, cidade
  descricao_curta, sobre, diferenciais
  beneficio jsonb           { tipo, valor, titulo, detalhe, como_usar, codigo, regras, validade }
  itens jsonb[]             { nome, descricao, preco_tipo, preco, foto_id, video }
  contato jsonb             { whatsapp, instagram, site, endereco, mapa, horarios, regioes, modalidades }
  orcamento jsonb           { aceita, campos, documentos, canal }
  logo_id, capa_id, galeria_ids
  publicado bool, publicado_em, conteudo_hash

parceiros_arquivos
  id, cadastro_id, tipo (logo|capa|galeria|item|referencia), caminho, mime,
  tamanho, largura, altura, legenda, categoria, ordem, usar bool, created_at

parceiros_aprovacoes
  id, cadastro_id, conteudo_hash, snapshot jsonb, nome_aprovador,
  aprovado_em, ip_hash, decisao (aprovado|ajuste), comentario

parceiros_historico
  id, cadastro_id, quando, autor (uid da equipe | 'parceiro' | 'sistema'),
  acao, detalhe jsonb
```

**Por que `respostas` é `jsonb` e `perfil` tem colunas fixas.** O formulário vai mudar depois do teste, e o `jsonb` evita uma migration a cada pergunta nova. As respostas são conferidas por um **schema em TypeScript** em `supabase/functions/_shared/parceiro-cadastro.ts`. O mesmo arquivo é usado pela tela e pela função, com teste em `node --test`, como na cotação. O perfil é o contrato da página pública, então tem forma fixa.

**[+] View pública `parceiros_publicos`.** Ela expõe só o perfil com `publicado = true` e só os campos públicos. Nunca aparecem o nome do responsável, o WhatsApp do convite, as respostas, os arquivos não usados nem o histórico. A anon key lê **só essa view**. Isso atende o item do briefing "arquivos privados e dados internos não aparecem no site público" por construção, não por cuidado.

**Arquivos**

| Bucket | Acesso | Limites |
|---|---|---|
| `parceiros-cadastro` | privado | imagens até 15 MB; logo (PNG, SVG, PDF, AI, EPS, JPG) até 15 MB; referência (PDF) até 25 MB. Upload por link único gerado pela função, como na cotação |
| `parceiros-publico` | público | só arquivos processados na publicação |

**[+] O que acontece ao publicar:** a função copia as imagens marcadas como "usar" para o bucket público.

- **Reprocessa cada imagem** em JPEG ou WebP, com no máximo 1920 px. Isso apaga dados escondidos, **inclusive a localização GPS** que o celular grava na foto (cuidado de LGPD), e neutraliza arquivo malicioso disfarçado de imagem.
- **SVG nunca é servido como veio**, porque pode conter script. Ele vira PNG na publicação, ou a equipe sobe a versão tratada.
- Limite de quantidade por cadastro: 1 logo, 1 capa, 10 fotos de galeria, 8 fotos de itens e 3 referências. A função recusa pedidos de upload acima disso.

**Edge Function `parceiro-cadastro`** (uma função, várias ações):

| Ação | Faz |
|---|---|
| `abrir` | confere o link, devolve as respostas, os arquivos (miniaturas por link assinado), o status e a etapa |
| `salvar` | grava as respostas de uma etapa (confere a `versao` e o schema) |
| `upload` | devolve o link de upload único (confere o tipo, o tamanho e a quantidade) |
| `remover-arquivo` | apaga um arquivo do próprio cadastro |
| `enviar` | confere os obrigatórios para envio, muda o status, grava o histórico e dispara o e-mail |
| `previa` / `aprovar` / `pedir-ajuste` | fluxo de aprovação (seção 3) |

---

## 6. A página pública do parceiro

**[+] Modelo único `/parceiro/:slug`**, que lê da view `parceiros_publicos`. As partes da página vêm assim:

| Parte da página | Vem de |
|---|---|
| Logo do perfil | `logo_id` |
| Capa | `capa_id` |
| "Sobre a empresa" | `sobre` + `diferenciais` + "há X anos" |
| Vantagem em destaque | `beneficio` (mesmo componente do mini card do formulário) |
| Catálogo | `itens` |
| Galeria | `galeria_ids` |
| Botões de contato, mapa e horário ("Aberto agora") | `contato` |
| Pedir orçamento (fase 2) | `orcamento` |

Como ela entra no site:

- **A vitrine da home** passa a juntar os perfis publicados no banco com o `src/data/parceiros.ts` atual. Na transição, os dois convivem e um parceiro migrado sai do `.ts`.
- As páginas feitas à mão (Dewa, Bioreluz, Insurance) **continuam como estão**. Cada uma pode migrar para o modelo quando o parceiro passar pelo cadastro. Rotas fixas têm prioridade sobre `/parceiro/:slug` no React Router, então nada quebra.
- Rota com `React.lazy`, como as outras.

---

## 7. Segurança e LGPD

Como cada ponto do item 8 do briefing é atendido:

| Item do briefing | Como fica |
|---|---|
| Acesso restrito às informações internas | RLS sem policy para visitante. A equipe entra por funções que conferem o papel `parceiros` |
| Armazenamento seguro | bucket privado e links assinados de curta duração |
| Validação de formato e tamanho | no navegador (para o usuário), na função (antes de liberar o upload) e no bucket (limite de mime e tamanho) |
| Arquivo malicioso | nada do bucket privado é servido ao público. A publicação reprocessa as imagens e o SVG nunca vai cru |
| Política de privacidade (LGPD) | nova seção "Parceiros" na `/privacidade`: dados coletados, finalidade, prazo de guarda e contato para correção ou exclusão |
| Consentimento para uso público | caixa de autorização com data e versão dos termos, mais a aprovação da página com snapshot |
| Quem edita e publica | papel `parceiros`. Publicar exige aprovação registrada, conferida no banco |
| Correção e exclusão | correção pelo link (quando reaberto) ou pela equipe. Botão "Excluir cadastro e arquivos" no admin. **[+]** Cadastro parado há 180 dias sem envio é apagado automaticamente (rascunho não vira acervo) |
| Formulário não dá acesso a outros parceiros | um link = um cadastro, o código é guardado só como hash e não existe listagem |

O repositório é público, então a chave do Resend e qualquer outro segredo ficam **só nos secrets do Supabase**.

---

## 8. Plano de desenvolvimento

Legenda: 🟢 fácil · 🟡 médio · 🔴 difícil. Cada bloco vira uma branch e um PR.

### Fase 1: cadastro funcional e organizado

| Bloco | O quê | Dificuldade |
|---|---|---|
| **A** | Migration 0015 (tabelas, view, buckets, papéis, funções do admin) + schema compartilhado com teste + Edge Function `parceiro-cadastro` (abrir/salvar/upload/enviar) | 🔴 |
| **B** | Formulário: boas-vindas, etapas 1–7, progresso, salvamento automático com cópia local, campos condicionais e prévia do benefício | 🔴 |
| **C** | Uploads: redução no navegador, miniaturas, excluir, avisos de proporção e resolução, nova tentativa | 🟡 |
| **D** | `/admin/parceiros`: convite, lista, ficha (respostas/arquivos/andamento/link), status com histórico, CSV, mensagem de pendência | 🔴 |
| **E** | Notificação por e-mail (depende da D3) + seção "Parceiros" na `/privacidade` + texto das Condições de participação | 🟢 |
| **F** | Perfil editável + prévia + aprovação pelo link + publicação (reprocessar imagens) + modelo `/parceiro/:slug` + vitrine lendo o banco | 🔴 |

**[+] O salvamento para continuar depois entra já na fase 1** (o briefing o põe como possível fase 2). Com o link pessoal, ele sai quase de graça, e é o que mais evita cadastro abandonado.

A ordem sugerida é A → B → C → D, e então o **teste com 2 empresas** (seção 9), seguido de E e F. O bloco F pode ficar para depois do teste: a equipe consegue montar as primeiras páginas olhando o admin enquanto o modelo único não fica pronto.

### Fora do cadastro, mas necessário

| Bloco | O quê | Dificuldade |
|---|---|---|
| **G** | Cartão de membro na `/area` (nome, número de membro, QR). **Fase 2** (Júlia, 13/11); quando existir, a opção "identificação de membro" volta ao cadastro | 🟡 |

### Fase 2: experiência e autonomia

- Prévia da página inteira **durante** o preenchimento (o mini card do benefício já sai na fase 1).
- Pedido de atualização pelo parceiro depois da publicação. Pelo mesmo link: "Quero atualizar" → escolhe a seção (benefício, produtos, fotos, horários, contatos ou institucional) → edita só aquela parte → equipe revisa → nova aprovação. As respostas guardam versões, então nada precisa ser preenchido de novo.
- Formulário de orçamento genérico na página do parceiro (seção 3, etapa 6).
- Métricas por parceiro: visualizações e cliques em WhatsApp, Instagram, site e "Como chegar". O `track()` e a tabela `eventos` já existem; falta filtrar por slug no painel.
- Histórico de benefícios visível ao parceiro. O `parceiros_historico` já grava isso desde a fase 1.
- Baixar todos os arquivos de um parceiro em ZIP.
- Lembrete automático para quem parou no meio (ex.: depois de 5 dias).

---

## 9. Teste com 2 empresas (antes de mandar para todos)

O briefing já prevê esse teste. **[+] A proposta é deixar ele mensurável:**

- Escolher uma empresa de **produto** (ex.: Dewa) e uma de **serviço** (ex.: Bioreluz ou MRT), porque os caminhos da etapa 3 são diferentes.
- O `track()` registra a abertura do link, a entrada e a saída de cada etapa, os erros de validação, as falhas de upload e o envio. O tempo de cada etapa sai do banco, e assim se descobre **onde a pessoa trava**.
- Depois do envio, uma pergunta opcional: "Alguma parte foi difícil?" (texto livre).
- Com o resultado, trocar o "cerca de 15 minutos" da boas-vindas pelo tempo real e ajustar as etapas que travaram.

---

## 10. Decisões (respondidas pela Júlia em 13/11)

| # | Decisão | Resposta | Onde está no código |
|---|---|---|---|
| D1 | Condições de participação | Termo simples: autoriza uso de nome, logo, fotos, informações e benefícios no site e canais do Clube; sem exclusividade; alteração ou saída avisando a coordenação; sem cobrança nesta fase (condição futura só com aceite); nada divulgado sem confirmação; página só publicada depois da aprovação. Aceite junto com a Política de privacidade. | `/condicoes-parceiro` (`src/pages/CondicoesParceiro.tsx`), versão em `TERMOS_VERSAO`; seção "Empresas parceiras" na `/privacidade`. **Texto precisa da leitura da Yruena.** |
| D2 | Acessos e publicação | Júlia: área de parceiros (acompanha, pede pendências, revisa, prepara, publica). Yruena: acompanha e faz a **validação institucional final**. Bruna: acesso técnico. Publicação sempre manual. | Papéis `parceiros`, `validacao`, `painel` em `admins.papeis`; status novo `aguardando_validacao` (0015). |
| D3 | Aviso de cadastro novo | E-mail operacional da coordenação + mais um destinatário (endereço a confirmar). Só empresa, data e link do painel. | Função manda pelo Resend quando `RESEND_API_KEY`, `AVISO_REMETENTE` e `AVISO_EMAILS` existirem. **Pendente: endereço e domínio do remetente.** |
| D4 | Cartão de membro | Fica para a fase 2. Não oferecer no cadastro uma identificação que não existe. | Opção "identificação de membro" removida de `COMO_USAR`. |
| D5 | Validade do link | 90 dias. Painel precisa renovar, gerar outro e **invalidar** o anterior. | `parceiro_convite_renovar` e `parceiro_convite_invalidar` (0015); botões no bloco D. |
| D6 | Endereço da página | Sem objeção: `/cadastro-parceiro`. | — |
| D7 | Os 8 parceiros atuais | Sim, todos fazem, com link pré-preenchido para conferir, corrigir e completar. | `p_respostas` do convite; botão "Convidar a partir do parceiro do site" no bloco D. O benefício vem desmarcado: precisa de confirmação nova. |
| D8 | Segmentos | Lista de 16, com "Outros" abrindo campo. | `SEGMENTOS`. |
| D9 | Teste | Dewa (produto) e Bioreluz ou MRT (serviço), também pelo celular, medindo tempo e envio de arquivos. | Eventos `parceiro_cadastro_*`. |

**Pontos extras da Júlia:**
- **Cadastro ≠ patrocínio.** Ser parceiro do Clube não é contratar cota do Papo de Aluguel. Já são tabelas e fluxos separados (`patrocinio_adesoes` × `parceiros_cadastro`); as Condições dizem isso com todas as letras.
- **Página pode ir ao ar sem catálogo completo.** `pendencias()` passou a ter três níveis: `envio` (o mínimo para enviar), `publicacao` (só logo e foto principal) e `recomendado` (catálogo, mais fotos, endereço e horário: não seguram nada).
- **Registro próprio do benefício.** Tabela `parceiros_beneficio_versoes`: cada confirmação vira uma versão com o texto exato; a anterior vira `substituido`. A página publicada só mostra versão `validado`. Mudou depois de publicado: nova confirmação e nova validação.

---|---|---|
| D1 | Texto das **Condições de participação** do parceiro (o que o Clube pode fazer com os materiais, exclusividade, como sair). O cadastro aponta para esse texto, que ainda não existe | Yruena + Júlia |
| D2 | Quem da coordenação acessa os dados dos parceiros no admin (Júlia? mais alguém?) e quem pode **publicar** | Yruena |
| D3 | Notificação: e-mail de quem? Criar uma conta no Resend com remetente do domínio (precisa de domínio próprio) ou usar o remetente de teste? | Bruna + Júlia |
| D4 | O Clube terá **cartão de membro** (bloco G)? Sem ele, a opção "identificação de membro" fica desligada | Yruena |
| D5 | Validade do link (proposta: 90 dias) e prazo para apagar rascunhos abandonados (proposta: 180 dias) | Bruna |
| D6 | Endereço da página (proposta: `/cadastro-parceiro`). Domínio próprio do Clube, se vier, entra em `CLUBE_ORIGENS` | Bruna |
| D7 | Os 8 parceiros atuais também passam pelo cadastro (com convite já preenchido)? Recomendado: sim, para todos ficarem no mesmo formato | Yruena |
| D8 | Lista fechada de segmentos para a etapa 1 | Júlia |
| D9 | Quais 2 empresas fazem o teste | Júlia |

---

## 11. Critérios de aceite da fase 1

- Um link abre só o próprio cadastro. Um link inválido, vencido ou substituído mostra "Este link não é mais válido. Fale com a coordenação", com o botão do WhatsApp.
- Dá para preencher tudo num celular de 375px, sair no meio, abrir o link de novo e continuar do mesmo ponto sem perder nada.
- Os campos condicionais funcionam: tipo de benefício, modalidade de atendimento e orçamento Sim/Não.
- O envio funciona sem logo e sem fotos, e as pendências aparecem no admin.
- Mudar o benefício depois de confirmado desmarca a confirmação.
- Nenhuma tabela nova responde a uma consulta com a anon key. A view pública só mostra perfis publicados.
- O admin sem o papel `parceiros` não vê a aba.
- Publicar sem aprovação registrada é recusado pelo banco.
- `tsc` limpo, teste do schema passando e páginas conferidas em 375px e no desktop.
