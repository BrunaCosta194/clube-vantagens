import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const pilares = [
  { n: "01", t: "Curadoria", d: "Seleção premium de imóveis e parceiros." },
  { n: "02", t: "Segurança jurídica", d: "Cada negócio com respaldo e transparência." },
  { n: "03", t: "Investimentos", d: "Assessoria imobiliária que gera resultado." },
];

export default function SobreSanchez() {
  return (
    <section className="relative overflow-hidden bg-grafite py-24 text-creme sm:py-32">
      {/* halo quente sutil */}
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-terracota/10 blur-[120px]" />

      <div className="container-club relative">
        <motion.blockquote
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease }}
          className="max-w-4xl font-display text-[clamp(1.7rem,3.6vw,3rem)] font-medium leading-[1.15] tracking-[-0.01em]"
        >
          Há <span className="text-dourado-soft">50 anos</span> fazemos negócios
          imobiliários com excelência em Mogi das Cruzes e no Alto Tietê. O clube
          é a nossa forma de{" "}
          <span className="italic text-terracota-300">retribuir essa confiança.</span>
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-creme/50"
        >
          — Yruena, à frente da Comunidade Sanchez
        </motion.p>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-creme/10 bg-creme/10 sm:grid-cols-3">
          {pilares.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease }}
              className="bg-grafite p-7"
            >
              <span className="font-mono text-sm text-dourado-soft">{p.n}</span>
              <h3 className="mt-4 font-display text-xl font-semibold text-creme">
                {p.t}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-creme/60">{p.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
