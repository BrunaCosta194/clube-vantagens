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
// A ordem é dada pela lista (<ol>) e pela posição, sem números decorativos.
export default function ComoFunciona() {
  const { usuario, carregando } = useSessao();
  const logado = !carregando && usuario !== null;

  return (
    <section id="como-funciona" className="bg-creme-100">
      <div className="container-club grid gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:gap-10 lg:py-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="lg:col-span-5"
        >
          <h2 className="h-display text-[clamp(2.5rem,5.2vw,4.5rem)] lg:sticky lg:top-32">
            Como funciona
            <br />
            <span className="italic text-cobre-deep">o Clube Sanchez.</span>
          </h2>
        </motion.div>

        <ol className="grid gap-2 lg:col-span-7">
          {passos.map((p, i) => (
            <motion.li
              key={p.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease }}
              className="rounded-[10px] bg-creme px-6 py-7 sm:px-10 sm:py-9"
            >
              <h3 className="font-display text-[clamp(1.75rem,2.6vw,2.25rem)] leading-tight text-grafite">
                {p.titulo}
              </h3>
              <p className="mt-2 max-w-lg text-lg leading-relaxed text-grafite">{p.texto}</p>
            </motion.li>
          ))}

          {/* Etapa 4 — Indique. Fecha o "como funciona" e já é o convite pra
              indicar: sem repetir um bloco de "indique e ganhe" separado. */}
          <motion.li
            id="indique"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 3 * 0.08, ease }}
            className="scroll-mt-28 rounded-[10px] bg-cobre-deep px-6 py-7 text-perola sm:px-10 sm:py-9"
          >
            <h3 className="font-display text-[clamp(1.75rem,2.6vw,2.25rem)] leading-tight">
              Indique
            </h3>
            <p className="mt-2 max-w-lg text-lg leading-relaxed">
              Compartilhe seu link. Convide; quem entra já ganha.
            </p>
            <p className="mt-5 font-display text-[clamp(2rem,3.4vw,2.75rem)] leading-none">
              {VOUCHER_CADASTRO_LABEL} de boas-vindas
            </p>
            <p className="mt-3 max-w-lg text-[15px] leading-snug text-perola/85">
              {VOUCHER_CADASTRO_NOTA}
            </p>

            <Link
              to={logado ? "/area" : "/cadastro"}
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold underline decoration-perola/50 underline-offset-[6px] transition-colors hover:decoration-perola"
            >
              {logado ? (
                <Copy className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
              )}
              {logado ? "Copiar meu link" : "Pegar meu link"}
            </Link>
          </motion.li>
        </ol>
      </div>

      {/* Chamada final — faixa escura de ponta a ponta, cor lisa. */}
      <div id="cadastro" className="scroll-mt-20 bg-grafite text-perola">
        <div className="container-club relative grid items-center gap-10 py-20 sm:py-28 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease }}
            className="lg:col-span-8"
          >
            {logado ? (
              <>
                <p className="eyebrow eyebrow-escuro">Você já é do clube</p>
                <h2 className="mt-4 font-display text-[clamp(2.5rem,5.2vw,4.5rem)] leading-[1.05] tracking-[-0.03em]">
                  Continue aproveitando o Clube Sanchez
                </h2>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-perola/90">
                  Acompanhe seu voucher, seu link de indicação e as vantagens
                  disponíveis na sua área.
                </p>
                <div className="mt-10">
                  <Link to="/area" className="btn-primary group bg-perola text-grafite hover:bg-cobre-light hover:text-grafite">
                    Minha área
                    <span className="btn-primary-icon">
                      <ArrowUpRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="eyebrow eyebrow-escuro">O cadastro é a chave</p>
                <h2 className="mt-4 font-display text-[clamp(2.5rem,5.2vw,4.5rem)] leading-[1.05] tracking-[-0.03em]">
                  Faça parte do Clube Sanchez
                </h2>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-perola/90">
                  Cadastro gratuito e acesso imediato às vantagens disponíveis.
                </p>

                <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                  {beneficios.map((b) => (
                    <li key={b} className="inline-flex items-center gap-2.5 text-base">
                      <Check className="h-[18px] w-[18px] text-cobre-light" strokeWidth={2} />
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
                  <Link to="/cadastro" className="btn-primary group bg-perola text-grafite hover:bg-cobre-light hover:text-grafite">
                    Criar minha conta
                    <span className="btn-primary-icon">
                      <ArrowUpRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </span>
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex min-h-11 items-center text-[15px] font-semibold underline decoration-perola/50 underline-offset-[6px] transition-colors hover:decoration-perola"
                  >
                    Já sou membro
                  </Link>
                </div>
              </>
            )}
          </motion.div>

          <img
            src={logoCta}
            alt=""
            loading="lazy"
            decoding="async"
            className="pointer-events-none hidden w-full max-w-[18rem] select-none justify-self-end lg:col-span-4 lg:block"
          />
        </div>
      </div>
    </section>
  );
}
