import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { parceiros, type Parceiro } from "@/data/parceiros";
import ParceiroModal from "./ParceiroModal";
import { track } from "@/lib/track";

const ease = [0.22, 1, 0.36, 1] as const;

export default function VitrineParceiros() {
  const [aberto, setAberto] = useState<Parceiro | null>(null);

  return (
    <section id="parceiros" className="section-y relative isolate bg-warm-wash">
      <div className="ambiente" />
      <div className="container-club relative">
        {/* cabeçalho editorial */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease }}
            className="max-w-xl"
          >
            <span className="eyebrow">Parceiros</span>
            <h2 className="h-display mt-4 text-[clamp(2rem,4.5vw,3.25rem)]">
              Vantagens de quem <span className="italic text-cobre">a Sanchez confia</span>
            </h2>
          </motion.div>
          <p className="max-w-xs text-sm leading-relaxed text-grafite-soft md:text-right">
            Escolha um parceiro para conhecer o benefício, as condições e os
            canais de atendimento.
          </p>
        </div>

        {/* mobile: carrossel horizontal com swipe + peek; sm+: grid */}
        <div className="-mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-2 no-scrollbar sm:mx-0 sm:mt-14 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 lg:gap-5">
          {parceiros.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: (i % 4) * 0.08, ease }}
              className="group w-[72%] min-w-0 shrink-0 snap-start sm:w-auto sm:shrink"
            >
              {(() => {
                const inner = (
                  <div className="bezel flex h-full flex-col transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:shadow-[0_50px_90px_-45px_hsl(19_40%_14%/0.4)]">
                <div className="bezel-core relative aspect-[16/10] overflow-hidden bg-[#FBF8F3] shadow-[inset_0_0_0_1px_hsl(19_30%_14%/0.05)]">
                  {/* logo inteiro, centralizado na placa — os arquivos têm proporções
                      bem diferentes (quadrado, faixa larga), cover cortava */}
                  <img
                    src={p.imagem}
                    alt={p.nome}
                    loading="lazy"
                    className="h-full w-full object-contain px-6 pb-4 pt-10 transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                  />
                  <span
                    className="absolute left-3 top-3 rounded-full bg-creme/90 px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-grafite-soft backdrop-blur-sm"
                    style={{ boxShadow: `inset 0 0 0 1px ${p.cor}33` }}
                  >
                    {p.categoria}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-3.5 sm:px-4 sm:pb-4 sm:pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-base font-semibold leading-tight text-grafite sm:text-lg">
                      {p.nome}
                    </h3>
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-grafite/10 text-grafite-soft transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-cobre group-hover:bg-cobre group-hover:text-perola sm:h-8 sm:w-8">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                  </div>
                  <p className="mb-3 mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-grafite-soft sm:mb-4 sm:mt-2 sm:line-clamp-3 sm:text-sm">
                    {p.descricaoCurta}
                  </p>
                  {p.voucher && (
                    <div className="mt-auto flex items-center gap-2 border-t border-grafite/10 pt-3 sm:pt-4">
                      <span className="h-1.5 w-1.5 rounded-full bg-cobre" />
                      <span className="font-mono text-[11px] font-medium tracking-wide text-cobre-deep sm:text-xs">
                        {p.voucher}
                      </span>
                    </div>
                  )}
                </div>
                  </div>
                );
                return p.pagina ? (
                  <Link
                    to={p.pagina}
                    onClick={() => track("partner_open", { slug: p.slug })}
                    className="block h-full w-full text-left"
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      track("partner_open", { slug: p.slug });
                      setAberto(p);
                    }}
                    className="block h-full w-full text-left"
                  >
                    {inner}
                  </button>
                );
              })()}
            </motion.div>
          ))}
        </div>
      </div>

      <ParceiroModal parceiro={aberto} onClose={() => setAberto(null)} />
    </section>
  );
}
