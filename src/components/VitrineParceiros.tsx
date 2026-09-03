import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { parceiros, type Parceiro } from "@/data/parceiros";
import ParceiroModal from "./ParceiroModal";

const ease = [0.22, 1, 0.36, 1] as const;

export default function VitrineParceiros() {
  const [aberto, setAberto] = useState<Parceiro | null>(null);

  return (
    <section id="parceiros" className="bg-warm-wash py-16 sm:py-24 lg:py-32">
      <div className="container-club">
        {/* cabeçalho editorial */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease }}
            className="max-w-xl"
          >
            <h2 className="h-display text-[clamp(2rem,4.5vw,3.25rem)]">
              Vantagens de quem a Sanchez confia
            </h2>
          </motion.div>
          <p className="max-w-xs text-sm leading-relaxed text-grafite-muted md:text-right">
            Toque em um parceiro para ver o benefício, o contato e o site.
          </p>
        </div>

        {/* mobile: carrossel horizontal com swipe + peek; sm+: grid */}
        <div className="-mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-2 no-scrollbar sm:mx-0 sm:mt-14 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {parceiros.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.1, ease }}
              className="group min-w-[80%] shrink-0 snap-start sm:min-w-0 sm:shrink"
            >
              {(() => {
                const inner = (
                  <div className="bezel h-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:shadow-[0_50px_90px_-45px_hsl(19_40%_14%/0.4)]">
                <div className="bezel-core relative aspect-[16/10]">
                  <img
                    src={p.imagem}
                    alt={p.nome}
                    className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  />
                  <span
                    className="absolute left-3 top-3 rounded-full bg-creme/90 px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-grafite-soft backdrop-blur-sm"
                    style={{ boxShadow: `inset 0 0 0 1px ${p.cor}33` }}
                  >
                    {p.categoria}
                  </span>
                </div>

                <div className="px-4 pb-4 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold leading-tight text-grafite">
                      {p.nome}
                    </h3>
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-grafite/10 text-grafite-soft transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-cobre group-hover:bg-cobre group-hover:text-perola">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-grafite-soft">
                    {p.descricaoCurta}
                  </p>
                  <div className="mt-4 flex items-center gap-2 border-t border-grafite/10 pt-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-cobre" />
                    <span className="font-mono text-xs font-medium tracking-wide text-cobre-deep">
                      {p.voucher}
                    </span>
                  </div>
                </div>
                  </div>
                );
                return p.pagina ? (
                  <Link
                    to={p.pagina}
                    className="block h-full w-full text-left"
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    onClick={() => setAberto(p)}
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
