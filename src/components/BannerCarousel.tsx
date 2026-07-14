import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import heroClube from "@/assets/banners/hero-clube.jpg";
import bioreluz from "@/assets/banners/bioreluz-banner.jpg";
import insuranceSante from "@/assets/banners/insurance-sante-banner.jpg";
import mrt from "@/assets/banners/mrt-banner.jpg";
import oticasDiniz from "@/assets/banners/oticas-diniz-banner.jpg";
import remalar from "@/assets/banners/remalar-banner.jpg";
import renovaLar from "@/assets/banners/renova-lar-banner.jpg";

// Banners oficiais enviados pelo marketing da Sanchez.
const slides = [
  { src: heroClube, alt: "Comunidade Sanchez — Clube de Vantagens" },
  { src: oticasDiniz, alt: "Óticas Diniz — R$200 de desconto" },
  { src: bioreluz, alt: "Bioreluz — Limpeza e Impermeabilização" },
  { src: insuranceSante, alt: "Insurance & Santé — Seguros e Planos de Saúde" },
  { src: mrt, alt: "MRT Arquitetura" },
  { src: remalar, alt: "Remalar — Produtos e Serviços" },
  { src: renovaLar, alt: "Renova Lar Designer — Móveis Planejados" },
];

const AUTO_MS = 6000;

export default function BannerCarousel() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const go = useCallback((next: number) => {
    setDir(next > 0 ? 1 : -1);
    setIndex((i) => (i + next + slides.length) % slides.length);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      setDir(i > index ? 1 : -1);
      setIndex(i);
    },
    [index],
  );

  useEffect(() => {
    const t = setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_MS);
    return () => clearInterval(t);
  }, [index]);

  return (
    <section
      id="top"
      className="grain relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-club-splash px-4 pb-14 pt-24 text-creme sm:pt-28"
    >
      {/* vinheta / profundidade */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,hsl(15_80%_24%/0.55),transparent_60%)]" />
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-dourado/25 blur-[110px]" />

      {/* selo */}
      <motion.span
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.28em] backdrop-blur-sm sm:text-xs"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-dourado-soft" />
        Comunidade Sanchez · Clube de Vantagens
      </motion.span>

      {/* palco do banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mt-8 w-full max-w-6xl"
      >
        <div className="relative overflow-hidden rounded-[1.75rem] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.55)] ring-1 ring-white/20">
          <div className="relative aspect-[64/15] w-full bg-grafite">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.img
                key={index}
                src={slides[index].src}
                alt={slides[index].alt}
                custom={dir}
                initial={{ opacity: 0, x: dir * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -60 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
          </div>

          {/* setas */}
          <button
            onClick={() => go(-1)}
            aria-label="Banner anterior"
            className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-creme/85 text-grafite shadow-lux-sm backdrop-blur-sm transition hover:bg-creme sm:left-5"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Próximo banner"
            className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-creme/85 text-grafite shadow-lux-sm backdrop-blur-sm transition hover:bg-creme sm:right-5"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* pontinhos */}
        <div className="mt-6 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir para o banner ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "w-7 bg-creme" : "w-1.5 bg-creme/50 hover:bg-creme/80"
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* indicador de rolagem */}
      <motion.a
        href="#parceiros"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="relative z-10 mt-10 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-creme/80 transition hover:text-creme"
      >
        Role para conhecer
        <ChevronDown className="h-4 w-4 animate-bounce" strokeWidth={1.5} />
      </motion.a>
    </section>
  );
}
