import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  PONTOS_CADASTRO,
  PONTOS_INDICACAO,
  PONTOS_CONVERSAO,
} from "@/lib/recompensas";

const ease = [0.22, 1, 0.36, 1] as const;

const tiers = [
  {
    pts: `+${PONTOS_CADASTRO}`,
    titulo: "Bônus de boas-vindas",
    texto: "Para quem entra no clube por uma indicação.",
    destaque: false,
  },
  {
    pts: `+${PONTOS_INDICACAO}`,
    titulo: "Por cada amigo",
    texto: "Para você, a cada indicação que se cadastra.",
    destaque: false,
  },
  {
    pts: `+${PONTOS_CONVERSAO}`,
    titulo: "Quando vira cliente Sanchez",
    texto: "Recompensa maior — etapa confirmada pelo Sanchez Connect.",
    destaque: true,
  },
];

export default function IndiqueGanhe() {
  return (
    <section
      id="indique"
      className="grain relative overflow-hidden bg-club-panel py-24 text-creme sm:py-32"
    >
      <div className="pointer-events-none absolute -right-24 -top-16 h-96 w-96 rounded-full bg-dourado/25 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_120%,hsl(15_80%_28%/0.45),transparent_55%)]" />

      <div className="container-club relative grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-creme backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-dourado-soft" />
            Indique &amp; ganhe
          </span>
          <h2 className="mt-6 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.01em]">
            Aqui, os dois lados{" "}
            <span className="italic text-grafite">ganham.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-creme/85">
            Cada membro tem um código de indicação. Quando você convida alguém,
            vocês dois são recompensados — e a recompensa cresce quando o
            indicado vira cliente Sanchez.
          </p>
          <Link
            to="/cadastro"
            className="group mt-9 inline-flex items-center gap-3 rounded-full bg-grafite py-2.5 pl-6 pr-2.5 text-sm font-medium text-creme transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-grafite-soft active:scale-[0.985]"
          >
            Pegar meu código
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
            </span>
          </Link>
        </motion.div>

        {/* painel de recompensas — vidro fosco sobre o laranja */}
        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: 0.1, ease }}
          className="overflow-hidden rounded-[2rem] bg-white/10 p-1.5 ring-1 ring-white/25 backdrop-blur-md"
        >
          <div className="divide-y divide-white/15 overflow-hidden rounded-[calc(2rem-0.375rem)]">
            {tiers.map((t) => (
              <div
                key={t.titulo}
                className={`flex items-center gap-6 px-6 py-6 ${
                  t.destaque ? "bg-white/15" : ""
                }`}
              >
                <span
                  className={`w-24 shrink-0 font-mono text-4xl font-semibold tracking-tight ${
                    t.destaque ? "text-dourado-soft" : "text-creme"
                  }`}
                >
                  {t.pts}
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-creme">
                    {t.titulo}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-creme/75">
                    {t.texto}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
