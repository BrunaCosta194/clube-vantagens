import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { TERMOS_VERSAO } from "../../supabase/functions/_shared/parceiro-cadastro.ts";

// Página /condicoes-parceiro — termo que a empresa aceita ao enviar o cadastro do
// Portal do Parceiro (/cadastro-parceiro). Escrito a partir das definições da Júlia
// (13/11/2026). Precisa da leitura da Yruena antes de ir para os parceiros.
//
// Mudou o texto? Trocar TERMOS_VERSAO em supabase/functions/_shared/parceiro-cadastro.ts:
// cada cadastro guarda a versão que aceitou (autorizacao_termos_versao).

const ATUALIZADO_EM = "13 de novembro de 2026";
const COORDENACAO = "+55 11 99662-8696";

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[clamp(1.6rem,3vw,2.1rem)] leading-tight text-grafite">{titulo}</h2>
      <div className="mt-4 space-y-4 text-[17px] leading-[1.65] text-grafite">{children}</div>
    </section>
  );
}

export default function CondicoesParceiro() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-creme">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pb-28 pt-[120px] sm:px-8 sm:pt-[160px]">
        <p className="eyebrow">Clube Sanchez · Parceiros</p>
        <h1 className="mt-3 h-display text-[clamp(2.5rem,6vw,4.25rem)]">Condições de participação</h1>
        <p className="mt-4 text-base text-grafite-soft">
          Atualizadas em {ATUALIZADO_EM} (versão {TERMOS_VERSAO}).
        </p>

        <div className="mt-14 space-y-14">
          <Secao titulo="O que é ser parceiro">
            <p>
              A empresa parceira oferece um benefício aos membros do Clube Sanchez e ganha uma página própria no site do
              Clube, com sua apresentação, seus produtos ou serviços e seus contatos.
            </p>
          </Secao>

          <Secao titulo="Uso dos materiais enviados">
            <p>
              Ao enviar o cadastro, a empresa autoriza o Clube Sanchez a usar o nome comercial, o logotipo, as fotografias,
              as informações e os benefícios que forneceu, para divulgação no site do Clube e nos canais relacionados a ele.
            </p>
            <p>
              A empresa declara que as imagens enviadas são suas ou que tem autorização para divulgá-las.
            </p>
            <p>
              Nossa equipe pode organizar e reescrever os textos para manter um padrão entre as páginas. Nada vai ao ar sem
              a aprovação da empresa.
            </p>
          </Secao>

          <Secao titulo="Benefício oferecido">
            <p>
              Nenhum benefício é divulgado sem a confirmação expressa da empresa. Guardamos o texto exato de cada benefício
              confirmado, com a data da confirmação.
            </p>
            <p>
              Se a empresa quiser mudar o desconto, as regras ou a validade, a nova versão precisa ser confirmada de novo
              antes de aparecer no site. Enquanto isso, a versão anterior continua valendo ou sai do ar, conforme a empresa
              pedir.
            </p>
            <p>A empresa se compromete a oferecer o benefício nas condições confirmadas enquanto ele estiver divulgado.</p>
          </Secao>

          <Secao titulo="Aprovação e publicação da página">
            <p>
              Antes de publicar, mostramos a página pronta para a empresa conferir. A publicação só acontece depois da
              aprovação dela e é sempre feita manualmente pela coordenação do Clube, nunca de forma automática.
            </p>
          </Secao>

          <Secao titulo="Sem exclusividade">
            <p>
              A participação não tem exclusividade. A empresa pode participar de outros clubes, programas ou parcerias, e o
              Clube Sanchez pode ter outros parceiros do mesmo segmento.
            </p>
          </Secao>

          <Secao titulo="Sem cobrança nesta fase">
            <p>
              Nesta fase inicial, a participação no Clube não tem custo. Qualquer condição comercial futura será
              apresentada separadamente e só vale se a empresa aceitar.
            </p>
            <p>
              Ser parceiro do Clube não significa contratar patrocínio do Papo de Aluguel. São oportunidades relacionadas,
              mas com regras e aprovações próprias.
            </p>
          </Secao>

          <Secao titulo="Alterações e saída">
            <p>
              A empresa pode pedir alterações na página ou a saída do Clube a qualquer momento, avisando a coordenação. Na
              saída, a página e o benefício deixam de ser divulgados.
            </p>
          </Secao>

          <Secao titulo="Dados pessoais">
            <p>
              Os dados de contato do responsável pela empresa são usados só para conversar sobre a parceria e não aparecem
              no site. Os detalhes estão na{" "}
              <Link to="/privacidade#parceiros" className="font-semibold text-cobre-deep underline underline-offset-4">
                Política de privacidade
              </Link>
              .
            </p>
          </Secao>

          <Secao titulo="Contato">
            <p>
              Coordenação do Clube Sanchez pelo WhatsApp: <span className="font-semibold">{COORDENACAO}</span>.
            </p>
          </Secao>
        </div>
      </main>
      <Footer />
    </div>
  );
}
