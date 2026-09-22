import { motion } from "framer-motion";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { VOUCHER_CADASTRO_LABEL, VOUCHER_CADASTRO_NOTA } from "@/lib/recompensas";
import { useSessao } from "@/lib/sessao";
import logoCta from "@/assets/marca/logo-sanchez.png";

const ease = [0.22, 1, 0.36, 1] as const;

const passos = [
  {
    num: "01",
    titulo: "Cadastre-se grátis",
    texto: "Crie sua conta em poucos minutos e receba 5% de boas-vindas.",
  },
  {
    num: "02",
    titulo: "Confira os parceiros",
    texto: "Conheça os benefícios, as condições e os serviços disponíveis.",
  },
  {
    num: "03",
    titulo: "Aproveite",
    texto: "Escolha a vantagem e acesse o canal indicado para utilizá-la.",
  },
];

const beneficios = [
  "Cadastro grátis, sem letras miúdas",
  "Acesso imediato às vantagens",
  "Seu código de indicação",
];

// Uma sequência só: como funciona (4 etapas, a última já é o convite pra
// indicar) fechando com a chamada final de cadastro — sem repetir blocos.
export default function ComoFunciona() {
  const { usuario, carregando } = useSessao();
  const logado = !carregando && usuario !== null;

  return (
    <section id="como-funciona" className="section-y bg-warm-wash">
      <div className="container-club">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="max-w-xl"
        >
          <h2 className="h-display text-[clamp(2rem,4.5vw,3.25rem)]">
            Como funciona
            <br />
            <span className="italic text-cobre">o Clube Sanchez.</span>
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-10">
          {passos.map((p, i) => (
            <motion.div
              key={p.num}
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease }}
              className="group"
            >
              <div className="rule mb-6 origin-left transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
              <span className="font-mono text-5xl font-semibold text-terracota/25 transition-colors duration-500 group-hover:text-terracota">
                {p.num}
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-grafite">
                {p.titulo}
              </h3>
              <p className="mt-3 max-w-xs leading-relaxed text-grafite-soft">
                {p.texto}
              </p>
            </motion.div>
          ))}

          {/* Etapa 4 — Indique. Fecha o "como funciona" e já é o convite pra
              indicar: sem repetir um bloco de "indique e ganhe" separado. */}
          <motion.div
            id="indique"
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 3 * 0.12, ease }}
            className="group scroll-mt-28"
          >
            <div className="rule mb-6 origin-left transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
            <span className="font-mono text-5xl font-semibold text-terracota/25 transition-colors duration-500 group-hover:text-terracota">
              04
            </span>
            <h3 className="mt-5 font-display text-2xl font-semibold text-grafite">
              Indique
            </h3>
            <p className="mt-3 max-w-xs leading-relaxed text-grafite-soft">
              Compartilhe seu link. Convide; quem entra já ganha.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-cobre/10 px-3 py-1.5">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-cobre-deep">
                {VOUCHER_CADASTRO_LABEL} de boas-vindas
              </span>
            </div>
            <p className="mt-2 max-w-xs text-[11px] leading-snug text-grafite-muted">
              {VOUCHER_CADASTRO_NOTA}
            </p>

            {logado ? (
              <Link
                to="/area"
                className="group/link mt-4 inline-flex items-center gap-2 text-sm font-medium text-cobre-deep underline-offset-4 transition-colors duration-300 hover:underline"
              >
                <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                Copiar meu link
              </Link>
            ) : (
              <Link
                to="/cadastro"
                className="group/link mt-4 inline-flex items-center gap-2 text-sm font-medium text-cobre-deep underline-offset-4 transition-colors duration-300 hover:underline"
              >
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                Pegar meu link
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Chamada final — mesma sequência, sem seção separada. Paleta
          institucional (grafite + cobre de detalhe), fundo laranja removido. */}
      <div id="cadastro" className="container-club mt-16 scroll-mt-28 sm:mt-20 lg:mt-24">
        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease }}
          className="relative overflow-hidden rounded-[2rem] bg-grafite px-6 py-12 sm:rounded-[2.5rem] sm:px-16 sm:py-20"
        >
          {/* cobre sofisticado como detalhe — fundo segue a identidade institucional */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_0%,hsl(19_45%_28%/0.55),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(hsl(0_0%_100%/0.4)_1px,transparent_1px)] [background-size:100%_2.2rem]" />

          {/* logo à direita — só em telas maiores (no mobile empilharia feio) */}
          <img
            src={logoCta}
            alt="Clube Sanchez"
            className="pointer-events-none absolute right-6 top-1/2 hidden w-[clamp(13rem,24vw,24rem)] -translate-y-1/2 select-none opacity-90 drop-shadow-[0_20px_45px_hsl(19_50%_6%/0.5)] lg:block"
          />

          <div className="relative max-w-2xl">
            {logado ? (
              <>
                <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-cobre-light">
                  Você já é do clube
                </span>
                <h2 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-perola">
                  Continue aproveitando o Clube Sanchez
                </h2>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-perola/85">
                  Acompanhe seu voucher, seu link de indicação e as vantagens
                  disponíveis na sua área.
                </p>

                <div className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-3">
                  <Link
                    to="/area"
                    className="group inline-flex items-center gap-3 rounded-full bg-cobre-deep py-2.5 pl-6 pr-2.5 text-sm font-semibold text-perola transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-cobre active:scale-[0.985]"
                  >
                    Minha área
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-cobre-light">
                  O cadastro é a chave
                </span>
                <h2 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-perola">
                  Faça parte do Clube Sanchez
                </h2>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-perola/85">
                  Cadastro gratuito e acesso imediato às vantagens disponíveis.
                </p>

                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
                  {beneficios.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-2 text-sm text-perola/90"
                    >
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-white/15">
                        <Check className="h-3 w-3" strokeWidth={2} />
                      </span>
                      {b}
                    </span>
                  ))}
                </div>

                <div className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-3">
                  <Link
                    to="/cadastro"
                    className="group inline-flex items-center gap-3 rounded-full bg-cobre-deep py-2.5 pl-6 pr-2.5 text-sm font-semibold text-perola transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-cobre active:scale-[0.985]"
                  >
                    Criar minha conta
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                  </Link>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-perola/90 underline-offset-4 transition hover:underline"
                  >
                    Já sou membro
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
