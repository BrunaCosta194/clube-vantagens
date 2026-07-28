import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

// Banner 1 — Clube de Vantagens. Gradiente cobre (guia de identidade).
export default function BannerClube() {
  return (
    <div className="flex h-full w-full items-center bg-banner-clube px-6 sm:px-10 lg:px-16">
      <div className="max-w-xl">
        <p className="font-display text-lg italic text-[#4A2B1C] sm:text-xl lg:text-2xl">
          Comunidade Sanchez
        </p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,4.4vw,3rem)] font-semibold leading-[0.98] text-[#2D1A0F]">
          Clube de Vantagens
        </h2>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-perola sm:text-xs">
          Conheça e faça parte
        </p>
        <Link
          to="/cadastro"
          aria-label="Fazer parte do Clube de Vantagens"
          className="group mt-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#894C36] text-perola shadow-lux-sm transition-transform duration-500 ease-lux hover:scale-105 sm:mt-6"
        >
          <ArrowUpRight
            className="h-5 w-5 transition-transform duration-500 ease-lux group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={1.5}
          />
        </Link>
      </div>
    </div>
  );
}
