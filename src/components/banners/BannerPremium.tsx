import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

// Banner 4 — Sanchez Premium. Destino aspiracional, paleta própria escura.
// Botão outline discreto (restrição comunica exclusividade).
export default function BannerPremium() {
  return (
    <div className="flex h-full w-full items-center bg-banner-premium px-6 sm:px-10 lg:px-16">
      <div className="max-w-xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cobre-light sm:text-xs">
          Sanchez Premium
        </p>
        <h2 className="mt-2 font-display text-[clamp(1.4rem,4vw,2.75rem)] font-semibold leading-[1.02] text-perola">
          Curadoria, segurança jurídica{" "}
          <span className="italic text-cobre-light">e investimentos.</span>
        </h2>
        <Link
          to="/premium"
          className="group mt-5 inline-flex items-center gap-2 rounded-full border border-perola/40 px-5 py-2.5 text-sm font-medium text-perola transition-all duration-500 ease-lux hover:border-perola hover:bg-perola/5 active:scale-[0.98] sm:mt-6"
        >
          Conhecer o Premium
          <ArrowUpRight
            className="h-4 w-4 transition-transform duration-500 ease-lux group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={1.5}
          />
        </Link>
      </div>
    </div>
  );
}
