import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

// Banner 2 — Loja Sanchez (novo). Mesmo gradiente cobre do Banner 1 —
// sinaliza que Loja e Clube são o mesmo nível de marca.
export default function BannerLoja() {
  return (
    <div className="flex h-full w-full items-center bg-banner-clube px-6 sm:px-10 lg:px-16">
      <div className="max-w-xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-perola sm:text-xs">
          Loja Sanchez
        </p>
        <h2 className="mt-2 max-w-lg font-display text-[clamp(1.4rem,4vw,2.75rem)] font-semibold leading-[1.02] text-[#2D1A0F]">
          Viu no nosso Instagram?{" "}
          <span className="italic text-[#4A2B1C]">Está na Loja Sanchez.</span>
        </h2>
        <Link
          to="/loja"
          className="group mt-5 inline-flex items-center gap-2.5 rounded-full bg-[#894C36] py-2.5 pl-5 pr-4 text-sm font-medium text-perola shadow-lux-sm transition-all duration-500 ease-lux hover:bg-[#6f3c2b] active:scale-[0.98] sm:mt-6"
        >
          <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
          Ver na loja
        </Link>
      </div>
    </div>
  );
}
