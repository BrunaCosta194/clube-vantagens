import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const beneficios = [
  "Cadastro grátis, sem letras miúdas",
  "Acesso imediato às vantagens",
  "Seu código de indicação",
];

export default function CtaCadastro() {
  return (
    <section id="cadastro" className="bg-warm-wash pb-24 pt-8 sm:pb-32">
      <div className="container-club">
        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease }}
          className="relative overflow-hidden rounded-[2.5rem] bg-terracota px-8 py-16 sm:px-16 sm:py-20"
        >
          {/* profundidade sutil, sem blob genérico */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_0%,hsl(24_90%_58%/0.6),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(hsl(0_0%_100%/0.4)_1px,transparent_1px)] [background-size:100%_2.2rem]" />

          <div className="relative max-w-2xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/80">
              O cadastro é a chave
            </span>
            <h2 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-white">
              Faça parte da Comunidade Sanchez.
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/85">
              Crie sua conta gratuita e comece a aproveitar as vantagens hoje
              mesmo. Leva menos de dois minutos.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
              {beneficios.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-2 text-sm text-white/90"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
                    <Check className="h-3 w-3" strokeWidth={2} />
                  </span>
                  {b}
                </span>
              ))}
            </div>

            <div className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-3">
              {/* TODO fase 2: rota /cadastro (Supabase Auth) */}
              <a
                href="#cadastro"
                className="group inline-flex items-center gap-3 rounded-full bg-white py-2.5 pl-6 pr-2.5 text-sm font-semibold text-terracota-700 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-creme active:scale-[0.985]"
              >
                Criar minha conta
                <span className="grid h-9 w-9 place-items-center rounded-full bg-terracota/10 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                </span>
              </a>
              {/* TODO fase 2: rota /login */}
              <a
                href="#cadastro"
                className="text-sm font-medium text-white/90 underline-offset-4 transition hover:underline"
              >
                Já sou membro
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
