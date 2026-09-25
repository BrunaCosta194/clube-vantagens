import { Link } from "react-router-dom";
import imgPapo from "@/assets/banners/topo-papo.jpg";
import imgMobile from "@/assets/banners/mobile/topo-papo.jpg";
import type { BannerProps } from "@/data/banners";
import { track } from "@/lib/track";

// Banner Papo de Aluguel. Imagem da campanha + CTA de e-book.
// Clique (banner inteiro ou botão) leva à página do Papo de Aluguel.
export default function BannerPapo({ posicao, campanha, destino, primeiro }: BannerProps) {
  return (
    <Link
      to={destino}
      aria-label="Papo de Aluguel — baixar e-book grátis"
      className="relative block h-full w-full"
      onClick={() => track("banner_click", { banner: "papo", campanha, posicao, destino })}
    >
      {/* Arte larga (1920×465) só de md pra cima: no celular ela vira uma tira
          de 83px. Abaixo disso entra o recorte 4:3, remontado a partir da
          mesma arte (scripts/banners-mobile-remontagem.py), e o palco do
          carrossel também é 4:3 — as duas aparecem inteiras. */}
      <picture className="block h-full w-full">
        <source media="(max-width: 767px)" srcSet={imgMobile} />
        <img
          src={imgPapo}
          alt="Corretagem não é bico, é profissão — podcast Papo de Aluguel"
          className="h-full w-full select-none object-cover md:object-contain"
          loading={primeiro ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={primeiro ? "high" : "auto"}
        />
      </picture>
      {/* CTA sobreposto — visual (o Link do banner é quem navega) */}
      <span
        aria-hidden="true"
        className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-papo-laranja px-4 py-2 text-xs font-medium text-papo-azul shadow-lux-sm sm:bottom-5 sm:px-5 sm:py-2.5 sm:text-sm"
      >
        Baixe o e-book grátis
      </span>
    </Link>
  );
}
