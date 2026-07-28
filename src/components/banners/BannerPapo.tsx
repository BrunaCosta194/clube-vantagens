import { Mic } from "lucide-react";
import { Link } from "react-router-dom";

// Banner 3 — Papo de Aluguel. Planeta próprio do ecossistema:
// fundo escuro azul (amostra da logo), acento laranja #FF8437.
export default function BannerPapo() {
  return (
    <div className="relative flex h-full w-full items-center overflow-hidden bg-banner-papo px-6 sm:px-10 lg:px-16">
      {/* reflexo metálico decorativo (papo-reflexo) — nunca em texto */}
      <div className="pointer-events-none absolute -right-10 top-0 h-full w-1/2 bg-[radial-gradient(60%_80%_at_80%_20%,rgba(89,208,240,0.18),transparent_60%)]" />
      <div className="relative max-w-xl">
        <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-papo-laranja sm:text-xs">
          <Mic className="h-3.5 w-3.5" strokeWidth={1.5} />
          Papo de Aluguel
        </p>
        <h2 className="mt-2 font-display text-[clamp(1.4rem,4vw,2.75rem)] font-semibold leading-[1.02] text-papo-texto">
          Corretagem não é bico,{" "}
          <span className="italic text-papo-laranja">é profissão.</span>
        </h2>
        <Link
          to="/papodealuguel"
          className="mt-5 inline-flex items-center rounded-full bg-papo-laranja px-5 py-2.5 text-sm font-medium text-papo-azul shadow-lux-sm transition-all duration-500 ease-lux hover:brightness-105 active:scale-[0.98] sm:mt-6"
        >
          Baixe o e-book grátis
        </Link>
      </div>
    </div>
  );
}
