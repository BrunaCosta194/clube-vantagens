import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { anosDeSanchez } from "@/lib/marca";

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
            className="absolute inset-0 bg-grafite/70"
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
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[12px] bg-creme shadow-[0_30px_90px_rgba(45,26,15,0.3)] sm:rounded-[12px]"
          >
            {/* cabeçalho cobre */}
            <div className="relative bg-grafite px-6 py-9 text-perola sm:px-9">
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-perola text-grafite transition-colors hover:bg-cobre-light"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <p className="text-[15px] font-semibold text-cobre-light">
                Sanchez Imóveis
              </p>
              <h2 className="mt-2 font-display text-[clamp(2.25rem,5vw,3rem)] leading-none">
                Quem somos
              </h2>
            </div>

            {/* corpo rolável */}
            <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-9">
              {/* História */}
              <p className="text-[17px] leading-relaxed text-grafite">
                Há <span className="font-semibold text-cobre-deep">{anosDeSanchez()} anos</span>,
                a Sanchez Imóveis é referência em locação, administração e venda
                de imóveis em Mogi das Cruzes e no Alto Tietê. Uma das primeiras
                imobiliárias da cidade, hoje é reconhecida pelo profundo
                conhecimento das particularidades do mercado regional.
              </p>

              {/* Missão / Visão */}
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[10px] bg-creme-100 p-5">
                  <p className="text-[15px] font-semibold text-cobre-deep">
                    Missão
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-grafite">
                    {missao}
                  </p>
                </div>
                <div className="rounded-[10px] bg-creme-100 p-5">
                  <p className="text-[15px] font-semibold text-cobre-deep">
                    Visão
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-grafite">
                    {visao}
                  </p>
                </div>
              </div>

              {/* Valores */}
              <div className="mt-6">
                <p className="text-[15px] font-semibold text-cobre-deep">
                  Valores
                </p>
                <ul className="mt-3 space-y-2">
                  {valores.map((v) => (
                    <li key={v} className="flex items-start gap-3 text-base text-grafite">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cobre-deep" />
                      {v}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pilares */}
              <div className="mt-7">
                <p className="text-[15px] font-semibold text-cobre-deep">
                  Nossos pilares
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {pilares.map((p) => (
                    <div
                      key={p.t}
                      className="rounded-[10px] bg-creme-100 p-5"
                    >
                      <h3 className="font-display text-xl leading-tight text-grafite">
                        {p.t}
                      </h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-grafite">
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
