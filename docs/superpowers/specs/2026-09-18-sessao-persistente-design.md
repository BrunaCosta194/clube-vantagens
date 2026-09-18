# Sessão persistente e visível na interface

Data: 2026-09-18

## Problema

Ao entrar com e-mail e senha, a pessoa cai em `/area`, vê o voucher de 5% e,
ao voltar para a home, tem a impressão de ter sido deslogada.

Ela não foi. O `createClient` do Supabase usa `persistSession: true` por
padrão, então a sessão continua viva no localStorage. O que acontece é que a
`Navbar` é estática: nunca consulta a sessão e exibe "Entrar" e "Fazer parte"
em qualquer situação. O usuário vê os botões de visitante e conclui que saiu.

Consequência prática: ninguém navega logado pela Loja ou pelas páginas de
parceiro, que é justamente o que o clube precisa que aconteça.

## Decisões

1. **O voucher de 5% é benefício permanente do membro**, não cupom de uso
   único. Nada a controlar no banco; nenhuma migration nesta mudança.
2. **Logado, a navbar mostra `Olá, <primeiro nome>` e um botão "Minha área".**
   O "Sair" continua existindo só dentro da área do membro — um único ponto de
   logout no site inteiro, longe do botão principal.
3. **Cadastro leva à área do membro; login leva à home.** Quem acabou de se
   cadastrar precisa ver o voucher, que é a novidade. Quem só fez login já
   conhece o benefício e quer navegar.

## Arquitetura

Contexto de sessão único, em vez de cada componente perguntar por conta
própria. A alternativa (cada `useEffect` chamando `getUser()`, como a
`AreaMembro` faz hoje) não é reativa: sair numa aba deixaria a navbar de outra
mostrando o usuário logado até um F5.

### `src/lib/sessao.tsx` (novo)

`SessaoProvider` mais o hook `useSessao()`. Faz `getSession()` ao montar e
assina `onAuthStateChange` — um listener para a aplicação toda.

Expõe `{ sessao, usuario, nome, carregando }`. O `nome` sai de
`user_metadata.nome`, que o `criarMembro` já grava no `signUp`, com o trecho
anterior ao `@` do e-mail como reserva. Assim a navbar não precisa consultar a
tabela `membros` a cada página.

### Componentes

- **`App.tsx`** — envolve as rotas no `SessaoProvider`.
- **`Navbar`** — enquanto `carregando`, mantém o estado deslogado sem piscar.
  Logada: saudação e "Minha área" (`/area`). Deslogada: "Entrar" e "Fazer
  parte", como hoje.
- **`Login`** — passa a redirecionar para `/` em vez de `/area`.
- **`Login` e `Cadastro`** — com sessão ativa, redirecionam em vez de exibir o
  formulário (login para `/`, cadastro para `/area`). Sem isso, "continuar
  logado" ainda pode ser desfeito sem querer.
- **`AreaMembro`** — usa `useSessao()` no lugar do `getUser()` próprio; segue
  buscando o perfil e as indicações na tabela, e mantém o "Sair".

O parâmetro `?next=` continua tendo prioridade sobre os destinos acima, nos
dois formulários. É dele que depende o gate do e-book do Papo de Aluguel.

## Fora de escopo

- Controle de uso do voucher (se um dia virar cupom).
- Confirmação de e-mail, captcha e demais itens de endurecimento previstos em
  `docs/fase-2-auth-membros.md`.
- Qualquer alteração de banco.

## Verificação

- `tsc --noEmit` limpo.
- Logado: navbar mostra a saudação na home, na Loja e nas páginas de parceiro;
  "Minha área" abre `/area` sem pedir senha.
- Voltar da área para a home mantém a saudação — o sintoma original.
- "Sair" na área devolve a navbar ao estado de visitante na hora, sem reload.
- Deslogado: navbar idêntica à de hoje.
- Conferir em 375px e no desktop.
