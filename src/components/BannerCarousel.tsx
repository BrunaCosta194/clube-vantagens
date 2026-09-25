import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BannerClube from "./banners/BannerClube";
import BannerLoja from "./banners/BannerLoja";
import BannerPapo from "./banners/BannerPapo";
import BannerPremium from "./banners/BannerPremium";
import { trackOnce } from "@/lib/track";

// Carrossel do topo — banners coded (CSS/HTML), sem imagem.
// Ordem (arquitetura do site): Clube → Loja → Papo de Aluguel → Premium.
const slides: { key: string; node: ReactNode }[] = [
  { key: "clube", node: <BannerClube /> },
  { key: "loja", node: <BannerLoja /> },
  { key: "papo", node: <BannerPapo /> },
  { key: "premium", node: <BannerPremium /> },
];

const AUTO_MS = 6000;

/** banner_view: só conta com o slide ativo pelo menos 50% visível na tela —
 * ver useEffect abaixo. Dedup por banner via trackOnce (1x por sessão). */
function proporcaoVisivel(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const alturaJanela = window.innerHeight || document.documentElement.clientHeight;
  const alturaVisivel = Math.min(rect.bottom, alturaJanela) - Math.max(rect.top, 0);
  if (alturaVisivel <= 0 || rect.height <= 0) return 0;
  return alturaVisivel / rect.height;
}

export default function BannerCarousel() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const palcoRef = useRef<HTMLDivElement>(null);
  // ref auxiliar: o observer é montado 1x (deps vazias) e precisa sempre ler
  // o slide ATUAL, não o de quando ele foi criado.
  const indexRef = useRef(index);
  indexRef.current = index;

  const registrarView = useCallback((i: number) => {
    const banner = slides[i].key;
    trackOnce(`banner_view_${banner}`, "banner_view", { banner, posicao: i + 1 });
  }, []);

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

  // banner_view: o palco entrou na tela (>=50%) — conta o slide ATUAL.
  // IntersectionObserver montado 1x (o palco não sai do DOM, só o slide
  // interno troca) + o efeito abaixo cobre o caso de trocar de slide
  // enquanto o carrossel já está visível.
  useEffect(() => {
    const el = palcoRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && entries[0].intersectionRatio >= 0.5) {
          registrarView(indexRef.current);
        }
      },
      { threshold: [0.5] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [registrarView]);

  useEffect(() => {
    const el = palcoRef.current;
    if (!el || proporcaoVisivel(el) < 0.5) return;
    registrarView(index);
  }, [index, registrarView]);

  return (
    <section id="top" className="relative w-full overflow-hidden bg-creme pb-6 pt-20 sm:pb-8 sm:pt-24">
      {/* palco do banner — de ponta a ponta */}
      <motion.div
        ref={palcoRef}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto w-full max-w-[92rem] px-4 sm:px-6"
      >
        {/* banners são imagens (1920x465); container casa a proporção para
            mostrar o banner inteiro sem corte, em qualquer tela */}
        <div className="relative aspect-[1920/465] w-full overflow-hidden rounded-[1.75rem] shadow-lux">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={slides[index].key}
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
              {slides[index].node}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* setas — escondidas no celular, onde o gesto de arrastar já resolve */}
        <button
          onClick={() => go(-1)}
          aria-label="Banner anterior"
          className="absolute left-6 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-creme/85 text-grafite shadow-lux-sm backdrop-blur-sm transition hover:bg-creme sm:grid sm:left-9"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Próximo banner"
          className="absolute right-6 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-creme/85 text-grafite shadow-lux-sm backdrop-blur-sm transition hover:bg-creme sm:grid sm:right-9"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </motion.div>

      {/* pontinhos — alvo de toque de 44px, com o traço desenhado por dentro */}
      <div className="relative mt-2 flex justify-center sm:mt-3">
        {slides.map((s, i) => (
          <button
            key={s.key}
            onClick={() => goTo(i)}
            aria-label={`Ir para o banner ${i + 1}`}
            aria-current={i === index}
            className="grid h-11 w-6 place-items-center"
          >
            <span
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "w-7 bg-cobre" : "w-1.5 bg-cobre/40"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
