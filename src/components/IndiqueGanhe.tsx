import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { VALOR_VOUCHER_CADASTRO } from "@/lib/recompensas";

const ease = [0.22, 1, 0.36, 1] as const;

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
          <h2 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.01em]">
            Convide, quem entra{" "}
            <span className="italic text-grafite">já ganha.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-creme/85">
            Cada membro tem um link de indicação só dele. Compartilhe com quem
            quiser — assim que a pessoa se cadastra, já garante o voucher de
            boas-vindas do clube.
          </p>
          <Link
            to="/cadastro"
            className="group mt-9 inline-flex items-center gap-3 rounded-full bg-grafite py-2.5 pl-6 pr-2.5 text-sm font-medium text-creme transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-grafite-soft active:scale-[0.985]"
          >
            Pegar meu link
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
            </span>
          </Link>
        </motion.div>

        {/* painel do voucher — vidro fosco sobre o laranja */}
        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: 0.1, ease }}
          className="overflow-hidden rounded-[2rem] bg-white/10 p-8 text-center ring-1 ring-white/25 backdrop-blur-md sm:p-12"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-creme/70">
            Voucher de boas-vindas
          </span>
          <p className="mt-3 font-display text-[clamp(3rem,7vw,4.5rem)] font-semibold text-dourado-soft">
            R${VALOR_VOUCHER_CADASTRO}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-creme/75">
            Para todo mundo que se cadastra no clube — direto ou por indicação.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
