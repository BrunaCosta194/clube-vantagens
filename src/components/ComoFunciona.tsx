import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const passos = [
  {
    num: "01",
    titulo: "Cadastre-se grátis",
    texto:
      "Crie sua conta em minutos. É o cadastro que libera todas as vantagens do clube.",
  },
  {
    num: "02",
    titulo: "Aproveite as vantagens",
    texto:
      "Descontos e serviços exclusivos com os parceiros selecionados pela Sanchez.",
  },
  {
    num: "03",
    titulo: "Indique e ganhem juntos",
    texto:
      "Convide amigos: quem indica e quem é indicado ganham pontos e recompensas.",
  },
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="bg-warm-wash py-24 sm:py-32">
      <div className="container-club">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="max-w-xl"
        >
          <h2 className="h-display text-[clamp(2rem,4.5vw,3.25rem)]">
            Como funciona
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-3">
          {passos.map((p, i) => (
            <motion.div
              key={p.num}
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease }}
              className="group"
            >
              <div className="rule mb-6 origin-left transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-5xl font-semibold text-terracota/25 transition-colors duration-500 group-hover:text-terracota">
                  {p.num}
                </span>
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold text-grafite">
                {p.titulo}
              </h3>
              <p className="mt-3 max-w-xs leading-relaxed text-grafite-soft">
                {p.texto}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
