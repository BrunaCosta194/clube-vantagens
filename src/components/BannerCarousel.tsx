import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BannerClube from "./banners/BannerClube";
import BannerBioreluz from "./banners/BannerBioreluz";
import BannerInsurance from "./banners/BannerInsurance";
import BannerLoja from "./banners/BannerLoja";
import BannerPapo from "./banners/BannerPapo";
import BannerPremium from "./banners/BannerPremium";
import { bannersVigentes, type BannerId, type BannerProps } from "@/data/banners";
import { trackOnce } from "@/lib/track";

// Carrossel do topo — Bloco 4. A lista NÃO mora mais aqui: vem de
// `src/data/banners.ts`, já ordenada e filtrada por data. Aqui ficam só as
// duas coisas que são de apresentação e não cabem num arquivo de dados:
// qual componente desenha cada banner e como ele é anunciado em voz alta.
const COMPONENTES: Record<BannerId, ComponentType<BannerProps>> = {
  clube: BannerClube,
  bioreluz: BannerBioreluz,
  insurance: BannerInsurance,
  loja: BannerLoja,
  papo: BannerPapo,
  premium: BannerPremium,
};

/** Nome humano de cada banner — entra no `aria-label` do slide. O `campanha`
 * do arquivo de dados é slug de relatório ("institucional-bioreluz"), não
 * serve pra leitor de tela. */
const ROTULOS: Record<BannerId, string> = {
  clube: "Comunidade Sanchez",
  bioreluz: "BioReluz",
  insurance: "Insurance & Santé",
  loja: "Loja Sanchez",
  papo: "Papo de Aluguel",
  premium: "Sanchez Premium",
};

// 8s: com 6s não dava tempo de ler o banner inteiro antes de trocar
// (briefing, Bloco 4).
const AUTO_MS = 8000;

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
  // Lista calculada uma vez por montagem: a data não muda no meio da visita,
  // e recalcular a cada render trocaria a identidade do array à toa.
  const slides = useMemo(() => bannersVigentes(), []);
  const total = slides.length;

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const palcoRef = useRef<HTMLDivElement>(null);

  // ── Pausa do autoplay ──────────────────────────────────────────────
  // Quatro motivos independentes. Hover, foco e toque são temporários (o
  // giro volta quando o usuário sai); `manual` é definitivo: quem clicou
  // numa seta ou num pontinho assumiu o controle, e puxar o slide debaixo
  // dele depois disso é hostil (mesma regra do padrão de carrossel da
  // WAI-ARIA). Arrastar o banner com o dedo também conta como manual.
  const movimentoReduzido = useReducedMotion() ?? false;
  const [hover, setHover] = useState(false);
  const [foco, setFoco] = useState(false);
  const [toque, setToque] = useState(false);
  const [manual, setManual] = useState(false);
  const pausado = movimentoReduzido || manual || hover || foco || toque;

  // ref auxiliar: o observer é montado 1x (deps estáveis) e precisa sempre
  // ler o slide ATUAL, não o de quando ele foi criado.
  const indexRef = useRef(index);
  indexRef.current = index;

  const registrarView = useCallback(
    (i: number) => {
      const banner = slides[i];
      if (!banner) return;
      // `campanha` vai junto do view pra que o painel (Bloco 11) consiga CTR
      // por campanha — só com o clique dá pra contar clique, não a taxa.
      trackOnce(`banner_view_${banner.id}`, "banner_view", {
        banner: banner.id,
        campanha: banner.campanha,
        posicao: i + 1,
      });
    },
    [slides],
  );

  const go = useCallback(
    (passo: number) => {
      setManual(true);
      setDir(passo > 0 ? 1 : -1);
      setIndex((i) => (i + passo + total) % total);
    },
    [total],
  );

  const irPara = useCallback((i: number) => {
    setManual(true);
    setDir(i > indexRef.current ? 1 : -1);
    setIndex(i);
  }, []);

  // Autoplay. Sem `index` nas deps de propósito: o intervalo não precisa
  // reiniciar a cada troca automática, e a troca manual já para o autoplay
  // de vez (via `manual`). Com 0 ou 1 banner vigente não há o que girar.
  useEffect(() => {
    if (pausado || total < 2) return;
    const t = setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % total);
    }, AUTO_MS);
    return () => clearInterval(t);
  }, [pausado, total]);

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

  // Nenhum banner vigente (todos expirados ou desativados): não renderiza
  // nada. Um <section> vazio deixaria um buraco de ~100px entre a navbar
  // fixa e o Hero. Fica depois de todos os hooks, pra não bagunçar a ordem.
  if (total === 0) return null;

  const posicaoIndex = Math.min(index, total - 1);
  const atual = slides[posicaoIndex];
  const Banner = COMPONENTES[atual.id];
  const posicao = posicaoIndex + 1;

  // prefers-reduced-motion: troca seca, sem deslize e sem fade.
  const deslocamento = movimentoReduzido ? 0 : 60;
  const transicao = movimentoReduzido
    ? { duration: 0 }
    : { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const };
  const opacidadeFora = movimentoReduzido ? 1 : 0;

  const focoVisivel =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobre focus-visible:ring-offset-2 focus-visible:ring-offset-creme";

  return (
    <section
      id="top"
      aria-roledescription="carousel"
      aria-label="Banners do Clube Sanchez"
      className="relative w-full overflow-hidden bg-creme pb-6 pt-20 sm:pb-8 sm:pt-24"
      // onFocus/onBlur do React são focusin/focusout (sobem na árvore): o
      // autoplay para assim que o teclado entra em qualquer botão daqui.
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFoco(true)}
      onBlur={() => setFoco(false)}
      onTouchStart={() => setToque(true)}
      onTouchEnd={() => setToque(false)}
      onTouchCancel={() => setToque(false)}
    >
      {/* palco do banner — de ponta a ponta */}
      <motion.div
        initial={movimentoReduzido ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          movimentoReduzido ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
        className="relative mx-auto w-full max-w-[92rem] px-4 sm:px-6"
      >
        {/* Duas proporções, uma por arte (ver CLAUDE.md): no celular o palco
            é 4:3, casando com os recortes de `banners/mobile`; de md pra cima
            vira a faixa 1920x465 das artes originais. A faixa larga no
            celular deixava cada banner com 83px de altura — marca e chamada
            ilegíveis.
            aria-live SÓ com o autoplay parado: anunciar cada troca com o
            carrossel girando sozinho é ruído contínuo no leitor de tela. */}
        <div
          ref={palcoRef}
          aria-live={pausado ? "polite" : "off"}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] shadow-lux md:aspect-[1920/465]"
        >
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={atual.id}
              custom={dir}
              role="group"
              aria-roledescription="slide"
              aria-label={`Banner ${posicao} de ${total}: ${ROTULOS[atual.id]}`}
              initial={{ opacity: opacidadeFora, x: dir * deslocamento }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: opacidadeFora, x: dir * -deslocamento }}
              transition={transicao}
              drag={total > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={movimentoReduzido ? 0 : 0.18}
              // arrastar também é assumir o controle — `go` marca `manual`.
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(1);
                else if (info.offset.x > 60) go(-1);
              }}
              className="absolute inset-0 touch-pan-y"
            >
              <Banner
                posicao={posicao}
                campanha={atual.campanha}
                destino={atual.destino}
                primeiro={posicaoIndex === 0}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* setas — escondidas no celular, onde o gesto de arrastar já resolve */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={`Banner anterior (mostrando ${posicao} de ${total})`}
              className={`absolute left-6 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-creme/85 text-grafite shadow-lux-sm backdrop-blur-sm transition hover:bg-creme sm:grid sm:left-9 ${focoVisivel}`}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={`Próximo banner (mostrando ${posicao} de ${total})`}
              className={`absolute right-6 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-creme/85 text-grafite shadow-lux-sm backdrop-blur-sm transition hover:bg-creme sm:grid sm:right-9 ${focoVisivel}`}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </>
        )}
      </motion.div>

      {/* contador + pontinhos. O contador é `aria-hidden`: quem usa leitor de
          tela já ouve "Banner 2 de 6" no rótulo do slide, e repetir "2 / 6"
          seria a mesma informação duas vezes. */}
      {total > 1 && (
        <div className="relative mt-2 flex items-center justify-center gap-3 sm:mt-3">
          <span aria-hidden="true" className="font-mono text-xs tabular-nums text-grafite-muted">
            {posicao} / {total}
          </span>
          <div className="flex">
            {slides.map((b, i) => (
              <button
                type="button"
                key={b.id}
                onClick={() => irPara(i)}
                aria-label={`Ir para o banner ${i + 1} de ${total}: ${ROTULOS[b.id]}`}
                aria-current={i === posicaoIndex ? "true" : undefined}
                className={`grid h-11 w-6 place-items-center rounded-full ${focoVisivel}`}
              >
                <span
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === posicaoIndex ? "w-7 bg-cobre" : "w-1.5 bg-cobre/40"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
