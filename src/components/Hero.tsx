import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { parceiros } from "@/data/parceiros";
import { anosDeSanchez } from "@/lib/marca";
import { VOUCHER_CADASTRO_LABEL } from "@/lib/recompensas";
import yruena from "@/assets/marca/yruena-hero.jpg";

const parceirosAtivos = parceiros.filter((p) => p.ativo !== false).length;

const ease = [0.22, 1, 0.36, 1] as const;

// Apresentação do clube, logo abaixo dos banners. Mesma linguagem do site da
// Sanchez Imóveis: título grande em Playfair, texto em DM Sans, foto inteira
// sem moldura, números grandes no lugar de rótulos miúdos.
export default function Hero() {
  const reduzido = useReducedMotion() ?? false;
  const entra = (i: number) =>
    reduzido
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay: 0.08 + i * 0.08, ease },
        };

  const numeros = [
    { n: String(parceirosAtivos), l: "parceiros ativos" },
    { n: String(anosDeSanchez()), l: "anos de Sanchez" },
    { n: VOUCHER_CADASTRO_LABEL, l: "de boas-vindas" },
  ];

  return (
    <section className="bg-creme">
      <div className="container-club grid items-end gap-12 pb-20 pt-10 sm:pb-28 sm:pt-12 lg:grid-cols-12 lg:gap-10 lg:pb-36 lg:pt-16">
        <div className="lg:col-span-7">
          <motion.h1
            {...entra(0)}
            className="h-display text-[clamp(3.25rem,8.4vw,7.5rem)] leading-[0.98]"
          >
            Clube de <span className="italic text-cobre-deep">Vantagens.</span>
          </motion.h1>

          <motion.p
            {...entra(1)}
            className="mt-8 max-w-xl text-lg leading-[1.6] text-grafite sm:text-xl"
          >
            Há {anosDeSanchez()} anos, a Sanchez Imóveis realiza negócios
            imobiliários em Mogi das Cruzes e no Alto Tietê. O Clube Sanchez
            amplia essa relação, reunindo benefícios, serviços, produtos e
            oportunidades selecionados para a nossa comunidade.
          </motion.p>

          <motion.div
            {...entra(2)}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <Link to="/cadastro" className="btn-primary group">
              Quero fazer parte
              <span className="btn-primary-icon">
                <ArrowUpRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
            </Link>
            <Link to="/login" className="btn-quiet">
              Já sou membro
            </Link>
          </motion.div>

          <motion.dl
            {...entra(3)}
            className="mt-14 grid max-w-xl grid-cols-3 gap-6 sm:mt-20"
          >
            {numeros.map((s) => (
              <div key={s.l} className="flex flex-col-reverse">
                <dt className="mt-2 text-[15px] leading-snug text-grafite-soft">{s.l}</dt>
                <dd className="font-display text-[clamp(2.5rem,4.4vw,3.75rem)] leading-none tracking-[-0.03em] text-grafite">
                  {s.n}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Foto da Yruena: inteira, grande, sem moldura nem cartão flutuante */}
        <motion.figure
          {...(reduzido
            ? {}
            : {
                initial: { opacity: 0, y: 32 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 1, delay: 0.2, ease },
              })}
          className="mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none"
        >
          <div className="overflow-hidden rounded-[10px] bg-creme-200">
            <img
              src={yruena}
              alt="Yruena, à frente do Clube Sanchez"
              className="aspect-[4/5] w-full object-cover object-top transition-transform duration-[1.2s] ease-lux hover:scale-[1.02]"
            />
          </div>
          <figcaption className="mt-4 text-[15px] text-grafite-soft">
            <span className="font-semibold text-grafite">Yruena</span> · Clube Sanchez
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
