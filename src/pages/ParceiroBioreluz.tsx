import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgePercent,
  MessageCircle,
  PlayCircle,
  Sparkles,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  bioreluzHistoria,
  bioreluzServicos,
  type ServicoBioreluz,
} from "@/data/bioreluzServicos";
import banner from "@/assets/banners/bioreluz-banner.jpg";
import logo from "@/assets/parceiros/bioreluz-logo-v2.jpg";

const ease = [0.22, 1, 0.36, 1] as const;
const WHATS =
  "https://wa.me/5511930937483?text=Te%20encontrei%20no%20site%20da%20Sanchez!";

export default function ParceiroBioreluz() {
  const [aberto, setAberto] = useState<ServicoBioreluz | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <main className="min-h-screen bg-warm-wash">
      {/* topo: voltar */}
      <header className="absolute inset-x-0 top-0 z-30 mx-auto flex w-full max-w-[92rem] items-center justify-between px-5 py-5 sm:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-grafite/20 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-grafite/30"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Voltar ao clube
        </Link>
        <a
          href={WHATS}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(145,63%,42%)] px-4 py-2 text-xs font-semibold text-white shadow-lux-sm transition hover:brightness-105"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={1.6} />
          Falar no WhatsApp
        </a>
      </header>

      {/* ── BANNER ── */}
      <section className="relative">
        <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/8] lg:aspect-[64/17]">
          <img
            src={banner}
            alt="Bioreluz"
            className="h-full w-full object-cover"
          />
          {/* leve escurecida só no topo, pra legibilidade dos botões */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-grafite/45 to-transparent" />
        </div>
      </section>

      {/* ── INTRO: logo + história + vantagem (painel legível) ── */}
      <section className="mx-auto w-full max-w-[92rem] px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease }}
          className="relative z-10 -mt-10 rounded-[2rem] border border-grafite/10 bg-creme p-6 shadow-lux sm:-mt-14 sm:p-9"
        >
          <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Bioreluz"
                  className="h-14 w-14 rounded-2xl border border-grafite/10 object-cover shadow-lux-sm"
                />
                <div>
                  <h1 className="font-display text-2xl font-semibold leading-tight text-grafite sm:text-3xl">
                    Bioreluz
                  </h1>
                  <span className="mt-1 inline-block rounded-full bg-cobre/10 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-cobre-deep">
                    Limpeza e Impermeabilização
                  </span>
                </div>
              </div>

              {/* breve história — máx 4 linhas */}
              <p className="mt-5 text-[15px] leading-relaxed text-grafite-soft sm:text-base">
                {bioreluzHistoria}
              </p>
            </div>

            <div className="inline-flex shrink-0 items-center gap-3 rounded-2xl border border-cobre-line/40 bg-cobre/10 px-4 py-3">
              <BadgePercent
                className="h-5 w-5 shrink-0 text-cobre-deep"
                strokeWidth={1.5}
              />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cobre-deep">
                  Sua vantagem
                </p>
                <p className="font-semibold text-grafite">
                  Condição exclusiva Sanchez
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── SERVIÇOS ── */}
      <section className="mx-auto w-full max-w-[92rem] px-6 py-16 sm:px-8 sm:py-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="h-display text-[clamp(1.75rem,4vw,2.75rem)]">
            Catálogo de serviços
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-grafite-muted md:text-right">
            Toque em um serviço para ver os detalhes e assistir à explicação.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {bioreluzServicos.map((s, i) => (
            <motion.button
              key={s.slug}
              onClick={() => setAberto(s)}
              initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.1, ease }}
              className="group text-left"
            >
              <div className="bezel h-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:shadow-[0_50px_90px_-45px_hsl(19_40%_14%/0.4)]">
                {/* foto ou placeholder de marca */}
                <div className="bezel-core relative aspect-[16/10] overflow-hidden">
                  {s.foto ? (
                    <img
                      src={s.foto}
                      alt={s.nome}
                      className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[hsl(196,55%,32%)] to-[hsl(196,70%,42%)]">
                      <Sparkles
                        className="h-8 w-8 text-white/70"
                        strokeWidth={1.3}
                      />
                    </div>
                  )}
                  <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-grafite shadow-lux-sm backdrop-blur-sm transition group-hover:bg-white">
                    <PlayCircle className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                </div>

                <div className="px-4 pb-4 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold leading-tight text-grafite">
                      {s.nome}
                    </h3>
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-grafite/10 text-grafite-soft transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-cobre group-hover:bg-cobre group-hover:text-perola">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-grafite-soft">
                    {s.destaque}
                  </p>
                  <div className="mt-4 flex items-center gap-2 border-t border-grafite/10 pt-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-cobre" />
                    <span className="font-mono text-xs font-medium tracking-wide text-cobre-deep">
                      Saiba mais
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <ServicoModal servico={aberto} onClose={() => setAberto(null)} />
    </main>
  );
}

// ── modal de serviço: descrição + vídeo (placeholder até chegar) ──
function ServicoModal({
  servico,
  onClose,
}: {
  servico: ServicoBioreluz | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = servico ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [servico, onClose]);

  return (
    <AnimatePresence>
      {servico && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-grafite/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={servico.nome}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.35, ease }}
            className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[2rem] border border-grafite/10 bg-creme shadow-lux sm:rounded-[2rem]"
          >
            {/* vídeo ou placeholder */}
            <div className="relative aspect-video w-full bg-grafite">
              {servico.videoUrl ? (
                <iframe
                  src={servico.videoUrl}
                  title={servico.nome}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-grafite to-[hsl(196,40%,22%)]">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <PlayCircle
                      className="h-12 w-12 text-white/60"
                      strokeWidth={1.2}
                    />
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
                      Vídeo em breve
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-creme/90 text-grafite shadow-lux-sm backdrop-blur-sm transition hover:bg-creme"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-7">
              <h3 className="font-display text-2xl font-semibold text-grafite">
                {servico.nome}
              </h3>
              <p className="mt-2 text-sm font-medium text-cobre-deep">
                {servico.destaque}
              </p>
              <p className="mt-4 leading-relaxed text-grafite-soft">
                {servico.descricao}
              </p>
            </div>

            <div className="border-t border-grafite/10 bg-white p-5">
              <a
                href={WHATS}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-[hsl(145,63%,42%)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                Solicitar este serviço
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
