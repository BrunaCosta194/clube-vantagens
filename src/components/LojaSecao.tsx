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
    <section id="loja" className="bg-warm-wash py-16 sm:py-24 lg:py-32">
      <div className="container-club">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-cobre-deep">
              Loja Sanchez
            </p>
            <h2 className="mt-3 h-display text-[clamp(2rem,4.5vw,3.25rem)]">
              Produtos com{" "}
              <span className="italic text-cobre">curadoria.</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-grafite-soft">
              A curadoria que você vê no nosso Instagram, agora pra comprar.
              Entrega Sanchez em estoque próprio ou via Shopee — sempre com a
              confiança de quem já é do clube.
            </p>
          </div>

          <Link
            to="/loja"
            className="group inline-flex items-center gap-2 text-sm font-medium text-cobre-deep underline-offset-4 transition-colors duration-300 hover:underline"
          >
            Ver todos os produtos
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-500 ease-lux group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.5}
            />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: 0.1, ease }}
          className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-5 lg:grid-cols-4"
        >
          {vitrine.map((p) => (
            <ProdutoCard key={p.slug} produto={p} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
