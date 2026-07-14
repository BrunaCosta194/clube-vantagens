import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    <section id="top" className="relative w-full overflow-hidden bg-grafite pb-8 pt-20 sm:pt-24">
      {/* palco do banner — de ponta a ponta */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full"
      >
        <div className="relative aspect-[64/15] w-full">
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
          className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-creme/85 text-grafite shadow-lux-sm backdrop-blur-sm transition hover:bg-creme sm:left-5"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Próximo banner"
          className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-creme/85 text-grafite shadow-lux-sm backdrop-blur-sm transition hover:bg-creme sm:right-5"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </motion.div>

      {/* pontinhos */}
      <div className="relative mt-5 flex justify-center gap-2">
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
    </section>
  );
}
