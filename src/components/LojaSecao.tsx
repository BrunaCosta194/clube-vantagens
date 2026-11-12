import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { produtos } from "@/data/produtos";
import ProdutoCard from "./ProdutoCard";

const ease = [0.22, 1, 0.36, 1] as const;

// Vitrine da Loja na home — mostra os primeiros produtos e leva pra /loja.
export default function LojaSecao() {
  // destaques primeiro, no máximo 4 na home
  const vitrine = [...produtos]
    .sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0))
    .slice(0, 4);

  return (
    <section id="loja" className="section-y bg-creme">
      <div className="container-club">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="grid gap-6 lg:grid-cols-12 lg:items-end"
        >
          <div className="lg:col-span-8">
            <h2 className="h-display text-[clamp(2.5rem,5.2vw,4.5rem)]">
              Loja <span className="italic text-cobre-deep">Sanchez</span>
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-grafite">
              A curadoria presente nos serviços da Sanchez agora também está
              disponível para compra pela Loja Sanchez e pela Shopee.
            </p>
          </div>

          <Link to="/loja" className="btn-quiet group lg:col-span-4 lg:justify-self-end">
            Ver todos os produtos
            <ArrowUpRight
              className="h-[18px] w-[18px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              strokeWidth={1.75}
            />
          </Link>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:mt-16 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
          {vitrine.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.07, ease }}
              className="min-w-0"
            >
              <ProdutoCard produto={p} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
