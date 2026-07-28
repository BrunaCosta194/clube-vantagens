import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

// Modal "Quem somos" — história, missão, visão, valores e pilares da Sanchez.
// TODO: conteúdo genérico a partir do site oficial (sanchezimoveis.com.br).
// A Yruena confirma/ajusta o texto depois.
const missao =
  "Agilidade e dedicação para realizar o melhor atendimento do setor e oferecer os melhores serviços em administração de imóveis em Mogi das Cruzes.";
const visao =
  "Conquistar o reconhecimento de clientes, fornecedores e colaboradores, com foco na excelência do atendimento e na qualidade dos serviços prestados.";
const valores = [
  "Agilidade no atendimento e na busca por soluções",
  "Empatia para compreender e superar expectativas",
  "Inovação permanente, baseada em tecnologia e pessoas",
  "Conhecimento profundo do mercado imobiliário regional",
];
const pilares = [
  { t: "Curadoria", d: "Seleção premium de imóveis e parceiros." },
  { t: "Segurança jurídica", d: "Cada negócio com respaldo e transparência." },
  { t: "Investimentos", d: "Assessoria imobiliária que gera resultado." },
];

type Props = { aberto: boolean; onClose: () => void };

export default function QuemSomos({ aberto, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = aberto ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [aberto, onClose]);

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-grafite/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Quem somos"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] border border-cobre-line/20 bg-creme shadow-lux sm:rounded-[2rem]"
          >
            {/* cabeçalho cobre */}
            <div className="relative bg-banner-clube px-5 py-6 sm:px-8 sm:py-8">
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-perola/90 text-grafite shadow-lux-sm backdrop-blur-sm transition hover:bg-perola"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-perola">
                Sanchez Imóveis
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#2D1A0F] sm:text-3xl">
                Quem somos
              </h2>
            </div>

            {/* corpo rolável */}
            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
              {/* História */}
              <p className="text-sm leading-relaxed text-grafite-soft sm:text-base">
                Há <span className="font-semibold text-cobre-deep">53 anos</span>,
                a Sanchez Imóveis é referência em locação, administração e venda
                de imóveis em Mogi das Cruzes e no Alto Tietê. Uma das primeiras
                imobiliárias da cidade, hoje é reconhecida pelo profundo
                conhecimento das particularidades do mercado regional.
              </p>

              {/* Missão / Visão */}
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-cobre-line/20 bg-creme-100 p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cobre-deep">
                    Missão
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-grafite-soft">
                    {missao}
                  </p>
                </div>
                <div className="rounded-2xl border border-cobre-line/20 bg-creme-100 p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cobre-deep">
                    Visão
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-grafite-soft">
                    {visao}
                  </p>
                </div>
              </div>

              {/* Valores */}
              <div className="mt-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cobre-deep">
                  Valores
                </p>
                <ul className="mt-3 space-y-2">
                  {valores.map((v) => (
                    <li key={v} className="flex items-start gap-2.5 text-sm text-grafite-soft">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cobre" />
                      {v}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pilares */}
              <div className="mt-7">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cobre-deep">
                  Nossos pilares
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {pilares.map((p, i) => (
                    <div
                      key={p.t}
                      className="rounded-2xl border border-cobre-line/20 bg-creme-100 p-4"
                    >
                      <span className="font-mono text-sm text-cobre">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-2 font-display text-base font-semibold text-grafite">
                        {p.t}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-grafite-soft">
                        {p.d}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
