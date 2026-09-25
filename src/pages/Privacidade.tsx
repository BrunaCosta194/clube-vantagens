import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Página /privacidade — exigida pelo briefing (Yruena, 21/09): o formulário
// curto do e-book precisa de link visível pra Política de Privacidade, e o
// texto tem que dizer que o site registra navegação anônima (Bloco 5).
//
// ATENÇÃO: texto é RASCUNHO técnico, escrito a partir do que o código
// realmente faz (ver src/lib/track.ts, src/lib/ebook.ts, migrations 0001–0008).
// Precisa da revisão da Bruna e da Yruena, e dos dados marcados como
// PENDENTE, antes de ir pro ar.

const ATUALIZADO_EM = "25 de setembro de 2026";

/** PENDENTE — confirmar com a Yruena: razão social, CNPJ, endereço completo
 * e o e-mail que responde pedidos de LGPD. Enquanto não vierem, a página
 * mostra o aviso de pendência no lugar do dado. */
const CONTROLADOR = {
  razaoSocial: "Sanchez Imóveis",
  cnpj: null as string | null,
  endereco: null as string | null,
  emailEncarregado: null as string | null,
};

function Pendente({ o_que }: { o_que: string }) {
  return (
    <mark className="rounded bg-gatilho/10 px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-gatilho">
      pendente: {o_que}
    </mark>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-grafite/10 pt-8">
      <h2 className="font-display text-xl font-semibold text-grafite sm:text-2xl">{titulo}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-grafite-soft">{children}</div>
    </section>
  );
}

export default function Privacidade() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-creme">
      <Navbar />

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cobre-deep">
          Clube Sanchez
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-grafite sm:text-4xl">
          Política de Privacidade
        </h1>
        <p className="mt-3 text-sm text-grafite-soft">Atualizada em {ATUALIZADO_EM}.</p>

        <div className="mt-10 space-y-10">
          <Secao titulo="Quem cuida dos seus dados">
            <p>
              O Clube Sanchez é o hub de negócios da Comunidade Sanchez, mantido pela{" "}
              {CONTROLADOR.razaoSocial}
              {CONTROLADOR.cnpj ? `, CNPJ ${CONTROLADOR.cnpj}` : " "}
              {!CONTROLADOR.cnpj && <Pendente o_que="CNPJ" />}
              {CONTROLADOR.endereco ? `, com sede em ${CONTROLADOR.endereco}` : " "}
              {!CONTROLADOR.endereco && <Pendente o_que="endereço da sede" />}. Somos nós que
              decidimos como os seus dados são usados neste site.
            </p>
            <p>
              Dúvidas, pedidos de acesso, correção ou exclusão:{" "}
              {CONTROLADOR.emailEncarregado ? (
                <a className="text-cobre-deep underline" href={`mailto:${CONTROLADOR.emailEncarregado}`}>
                  {CONTROLADOR.emailEncarregado}
                </a>
              ) : (
                <Pendente o_que="e-mail de contato LGPD" />
              )}
              . Respondemos em até 15 dias.
            </p>
          </Secao>

          <Secao titulo="O que coletamos, e só quando você entrega">
            <p>
              <strong className="text-grafite">Cadastro no Clube:</strong> nome, e-mail, WhatsApp,
              CPF ou CNPJ e uma senha. O CPF/CNPJ serve para identificar você junto aos parceiros e
              para ligar o seu cadastro ao seu relacionamento com a Sanchez Imóveis.
            </p>
            <p>
              <strong className="text-grafite">Materiais gratuitos, como o e-book do Papo de
              Aluguel:</strong> nome, e-mail e WhatsApp. Não é preciso virar membro para baixar.
            </p>
            <p className="rounded-2xl bg-perola px-5 py-4 text-grafite">
              No cadastro do Clube pedimos CPF ou CNPJ. Para baixar materiais gratuitos, não — ali
              são só nome, e-mail e WhatsApp.
            </p>
            <p>
              <strong className="text-grafite">Pedidos de cotação e contatos:</strong> os dados que
              você escrever no formulário ou mandar pelo WhatsApp.
            </p>
            <p>
              <strong className="text-grafite">Navegação anônima:</strong> registramos as ações no
              site — banner que apareceu, banner clicado, parceiro aberto, produto clicado, material
              baixado, cadastro iniciado e concluído — junto com a origem da visita (campanha, link
              de indicação, site que trouxe você), o tipo de aparelho e a página. Esse registro é
              anônimo: guardamos um identificador aleatório da visita, não o seu nome nem o seu IP.
              Se você estiver logado, aí sim o registro fica ligado ao seu cadastro.
            </p>
          </Secao>

          <Secao titulo="Para que usamos">
            <ul className="list-disc space-y-2 pl-5">
              <li>Criar e manter o seu cadastro de membro e liberar as vantagens.</li>
              <li>Entregar o material que você pediu.</li>
              <li>Encaminhar o seu contato ao parceiro quando você pede uma cotação.</li>
              <li>Entender o que funciona no site e melhorar as vantagens oferecidas.</li>
              <li>
                Avisar sobre novidades do Clube — só se você marcar a autorização. É uma escolha
                separada, e dizer não continua liberando o material.
              </li>
            </ul>
            <p>
              A base legal é o seu consentimento para os materiais e as comunicações, e a execução
              do contrato de participação no Clube para o restante.
            </p>
          </Secao>

          <Secao titulo="Com quem compartilhamos">
            <p>
              <strong className="text-grafite">Com o parceiro que você escolheu</strong>, e só ele,
              quando você pede uma cotação ou usa uma vantagem. Não vendemos e não cedemos a sua
              lista para terceiros.
            </p>
            <p>
              <strong className="text-grafite">Com as empresas que mantêm o site no ar:</strong>{" "}
              Supabase (banco de dados) e Vercel (hospedagem), que guardam os dados em nosso nome e
              não podem usá-los para outra coisa.
            </p>
            <p>
              <strong className="text-grafite">Dentro do grupo Sanchez</strong>, quando você já é
              cliente e o atendimento depende disso.
            </p>
          </Secao>

          <Secao titulo="Por quanto tempo guardamos">
            <p>
              Cadastro de membro: enquanto você fizer parte do Clube, e por mais cinco anos depois
              do encerramento, prazo legal para questões contratuais. Leads de material: até dois
              anos sem interação sua. Registros de navegação: dois anos.
            </p>
          </Secao>

          <Secao titulo="Seus direitos">
            <p>
              A LGPD garante a você: saber o que temos, corrigir o que estiver errado, pedir uma
              cópia, pedir a exclusão, retirar o consentimento a qualquer momento e saber com quem
              compartilhamos. É só escrever para o contato do começo desta página.
            </p>
            <p>
              Retirar o consentimento de comunicação não apaga o seu cadastro de membro, e não tira
              as vantagens que você já tem.
            </p>
          </Secao>

          <Secao titulo="Cookies e armazenamento no seu aparelho">
            <p>
              Usamos o armazenamento do navegador para manter você logado, lembrar que você já
              preencheu o formulário do material e guardar o identificador anônimo da visita. Nada
              disso é usado para publicidade de terceiros.
            </p>
          </Secao>

          <Secao titulo="Mudanças nesta política">
            <p>
              Se algo mudar, atualizamos a data no começo da página. Mudanças relevantes são
              avisadas por e-mail a quem tem cadastro.
            </p>
          </Secao>
        </div>

        <div className="mt-12 border-t border-grafite/10 pt-8">
          <Link to="/" className="text-sm font-medium text-cobre-deep hover:underline">
            ← Voltar para o Clube Sanchez
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
