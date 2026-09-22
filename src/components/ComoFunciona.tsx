import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const passos = [
  {
    num: "01",
    titulo: "Cadastre-se grátis",
    texto: "Crie sua conta em poucos minutos e receba 5% de boas-vindas.",
  },
  {
    num: "02",
    titulo: "Confira os parceiros",
    texto: "Conheça os benefícios, as condições e os serviços disponíveis.",
  },
  {
    num: "03",
    titulo: "Aproveite",
    texto: "Escolha a vantagem e acesse o canal indicado para utilizá-la.",
  },
  {
    num: "04",
    titulo: "Indique",
    texto: "Compartilhe seu link. Convide; quem entra já ganha.",
  },
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="section-y bg-warm-wash">
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

        <div className="mt-10 grid gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-10">
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
