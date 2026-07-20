import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroClube from "@/assets/banners/hero-clube.jpg";
import sanchezPremium from "@/assets/banners/sanchez-premium-banner.jpg";
import bioreluz from "@/assets/banners/bioreluz-banner.jpg";
import insuranceSante from "@/assets/banners/insurance-sante-banner.jpg";
import mrt from "@/assets/banners/mrt-banner.jpg";
import oticasDiniz from "@/assets/banners/oticas-diniz-banner.jpg";
import remalar from "@/assets/banners/remalar-banner.jpg";
import renovaLar from "@/assets/banners/renova-lar-banner.jpg";
// Recortes 4:3 dos mesmos banners — os originais são 1920x465 e viram uma tira
// ilegível de ~86px no celular. Ver README dos assets.
import heroClubeM from "@/assets/banners/mobile/hero-clube.jpg";
import sanchezPremiumM from "@/assets/banners/mobile/sanchez-premium.jpg";
import bioreluzM from "@/assets/banners/mobile/bioreluz.jpg";
import insuranceSanteM from "@/assets/banners/mobile/insurance-sante.jpg";
import mrtM from "@/assets/banners/mobile/mrt.jpg";
import oticasDinizM from "@/assets/banners/mobile/oticas-diniz.jpg";
import remalarM from "@/assets/banners/mobile/remalar.jpg";
import renovaLarM from "@/assets/banners/mobile/renova-lar.jpg";

// Banners oficiais enviados pelo marketing da Sanchez.
const slides = [
  { src: heroClube, mobile: heroClubeM, alt: "Sanchez Clube — descontos e vantagens" },
  { src: sanchezPremium, mobile: sanchezPremiumM, alt: "Sanchez Premium — Curadoria, segurança jurídica e investimentos" },
  { src: oticasDiniz, mobile: oticasDinizM, alt: "Óticas Diniz — R$200 de desconto" },
  { src: bioreluz, mobile: bioreluzM, alt: "Bioreluz — Limpeza e Impermeabilização" },
  { src: insuranceSante, mobile: insuranceSanteM, alt: "Insurance & Santé — Seguros e Planos de Saúde" },
  { src: mrt, mobile: mrtM, alt: "MRT Arquitetura" },
  { src: remalar, mobile: remalarM, alt: "Remalar — Produtos e Serviços" },
  { src: renovaLar, mobile: renovaLarM, alt: "Renova Lar Designer — Móveis Planejados" },
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
    <section id="top" className="relative w-full overflow-hidden bg-club-splash pb-6 pt-20 sm:pb-8 sm:pt-24">
      {/* palco do banner — de ponta a ponta */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full"
      >
        {/* 4:3 no celular (arte recortada), 16:9 no tablet, faixa larga no desktop */}
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[64/15]">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={index}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(1);
                else if (info.offset.x > 60) go(-1);
              }}
              className="absolute inset-0 touch-pan-y"
            >
              <picture>
                <source media="(min-width: 1024px)" srcSet={slides[index].src} />
                <img
                  src={slides[index].mobile}
                  alt={slides[index].alt}
                  draggable={false}
                  className="h-full w-full select-none object-cover"
                />
              </picture>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* setas — escondidas no celular, onde o gesto de arrastar já resolve */}
        <button
          onClick={() => go(-1)}
          aria-label="Banner anterior"
          className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-creme/85 text-grafite shadow-lux-sm backdrop-blur-sm transition hover:bg-creme sm:grid sm:left-5"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Próximo banner"
          className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-creme/85 text-grafite shadow-lux-sm backdrop-blur-sm transition hover:bg-creme sm:grid sm:right-5"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </motion.div>

      {/* pontinhos — alvo de toque de 44px, com o traço desenhado por dentro */}
      <div className="relative mt-2 flex justify-center sm:mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Ir para o banner ${i + 1}`}
            aria-current={i === index}
            className="grid h-11 w-6 place-items-center"
          >
            <span
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "w-7 bg-creme" : "w-1.5 bg-creme/50"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
