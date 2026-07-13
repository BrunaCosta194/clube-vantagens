import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { parceiros } from "@/data/parceiros";
import yruena from "@/assets/marca/yruena.png";

const ease = [0.22, 1, 0.36, 1] as const;

const up = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, delay: 0.1 + i * 0.09, ease },
  }),
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-club-hero">
      <div className="container-club relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        {/* ── Coluna editorial ── */}
        <div className="max-w-xl">
          <motion.span custom={0} variants={up} initial="hidden" animate="show" className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-terracota" />
            Comunidade Sanchez
          </motion.span>

          <motion.h1
            custom={1}
            variants={up}
            initial="hidden"
            animate="show"
            className="h-display mt-7 text-[clamp(2.8rem,7vw,5rem)]"
          >
            Clube de{" "}
            <span className="italic text-terracota">Vantagens.</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={up}
            initial="hidden"
            animate="show"
            className="mt-7 max-w-md text-lg leading-relaxed text-grafite-soft"
          >
            Descontos e serviços com parceiros selecionados pela Sanchez Imóveis
            — há mais de 50 anos em Mogi das Cruzes e no Alto Tietê.
          </motion.p>

          <motion.div
            custom={3}
            variants={up}
            initial="hidden"
            animate="show"
            className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4"
          >
            <Link to="/cadastro" className="btn-primary group">
              Quero fazer parte
              <span className="btn-primary-icon">
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </Link>
            <Link to="/login" className="btn-quiet">
              Já sou membro
            </Link>
          </motion.div>

          <motion.dl
            custom={4}
            variants={up}
            initial="hidden"
            animate="show"
            className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-grafite/10 pt-7"
          >
            {[
              { n: parceiros.length.toString().padStart(2, "0"), l: "Parceiros ativos" },
              { n: "50+", l: "Anos de Sanchez" },
              { n: "R$200", l: "Já na 1ª vantagem" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-mono text-2xl font-semibold text-grafite">{s.n}</dt>
                <dd className="mt-0.5 text-xs uppercase tracking-[0.14em] text-grafite-muted">
                  {s.l}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* ── Foto da Yruena (protagonista) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.1, delay: 0.15, ease }}
          className="relative mx-auto w-full max-w-md lg:mr-0"
        >
          {/* etiqueta vertical */}
          <span className="absolute -left-4 top-8 hidden font-mono text-[10px] uppercase tracking-[0.32em] text-grafite-muted [writing-mode:vertical-rl] lg:block">
            Est. Mogi das Cruzes
          </span>

          <div className="bezel">
            <div className="bezel-core">
              <img
                src={yruena}
                alt="Yruena — à frente da Comunidade Sanchez"
                className="aspect-[4/5] w-full object-cover object-top"
              />
            </div>
          </div>

          {/* caption flutuante */}
          <div className="animate-float-slow absolute -bottom-5 -left-5 flex items-center gap-3 rounded-2xl border border-grafite/10 bg-creme/90 px-4 py-3 shadow-lux backdrop-blur-sm">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-terracota/10 font-display text-sm font-semibold text-terracota-700">
              Y
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight text-grafite">Yruena</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-grafite-muted">
                Comunidade Sanchez
              </p>
            </div>
          </div>

          {/* selo dourado */}
          <div className="absolute -right-3 top-6 rounded-full border border-dourado/30 bg-creme/90 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-dourado-deep shadow-lux-sm backdrop-blur-sm">
            Sanchez Premium
          </div>
        </motion.div>
      </div>
    </section>
  );
}
