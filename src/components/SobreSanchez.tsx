import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

// Pilares da empresa. TODO: confirmar com a Yruena se são estes três
// (recuperados da versão anterior do site) ou se ela passou outros.
const pilares = [
  { n: "01", t: "Curadoria", d: "Seleção premium de imóveis e parceiros." },
  { n: "02", t: "Segurança jurídica", d: "Cada negócio com respaldo e transparência." },
  { n: "03", t: "Investimentos", d: "Assessoria imobiliária que gera resultado." },
];

export default function SobreSanchez() {
  return (
    <section id="sobre" className="relative overflow-hidden bg-warm-wash py-16 sm:py-24 lg:py-32">
      {/* halo cobre sutil */}
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-cobre/10 blur-[120px]" />

      <div className="container-club relative">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-cobre-deep">
          A Sanchez
        </p>

        <motion.blockquote
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease }}
          className="mt-5 max-w-4xl font-display text-[clamp(1.7rem,3.6vw,3rem)] font-medium leading-[1.15] tracking-[-0.01em] text-grafite"
        >
          Há <span className="text-cobre-deep">53 anos</span> fazemos negócios
          imobiliários com excelência em Mogi das Cruzes e no Alto Tietê. O clube
          é a nossa forma de{" "}
          <span className="italic text-cobre">retribuir essa confiança.</span>
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-grafite-muted"
        >
          — Yruena, à frente do Sanchez Clube
        </motion.p>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-cobre-line/20 bg-cobre-line/15 sm:mt-16 sm:grid-cols-3">
          {pilares.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease }}
              className="bg-creme-100 p-7"
            >
              <span className="font-mono text-sm text-cobre">{p.n}</span>
              <h3 className="mt-4 font-display text-xl font-semibold text-grafite">
                {p.t}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-grafite-soft">{p.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
