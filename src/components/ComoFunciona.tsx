import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const passos = [
  {
    num: "01",
    titulo: "Cadastre-se grátis",
    texto:
      "Crie sua conta em minutos e já garanta R$100 em voucher de boas-vindas.",
  },
  {
    num: "02",
    titulo: "Aproveite as vantagens",
    texto:
      "Descontos e serviços exclusivos com os parceiros selecionados pela Sanchez.",
  },
  {
    num: "03",
    titulo: "Indique seus amigos",
    texto:
      "Cada membro tem um link só dele. Compartilhe e convide quem quiser pro clube.",
  },
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="bg-warm-wash py-16 sm:py-24 lg:py-32">
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

        <div className="mt-10 grid gap-x-10 gap-y-10 sm:mt-16 sm:grid-cols-3 sm:gap-y-12">
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
