import { Link } from "react-router-dom";
import imgLoja from "@/assets/banners/topo-loja.jpg";
import imgMobile from "@/assets/banners/mobile/topo-loja.jpg";
import type { BannerProps } from "@/data/banners";
import { track } from "@/lib/track";

// Banner Loja Sanchez. Imagem da campanha; clique leva direto à Loja.
export default function BannerLoja({ posicao, campanha, destino, primeiro }: BannerProps) {
  return (
    <Link
      to={destino}
      aria-label="Confira nossos produtos na Loja Sanchez"
      className="block h-full w-full"
      onClick={() => track("banner_click", { banner: "loja", campanha, posicao, destino })}
    >
      {/* Arte larga (1920×465) só de md pra cima: no celular ela vira uma tira
          de 83px. Abaixo disso entra o recorte 4:3, remontado a partir da
          mesma arte (scripts/banners-mobile-remontagem.py), e o palco do
          carrossel também é 4:3 — as duas aparecem inteiras. */}
      <picture className="block h-full w-full">
        <source media="(max-width: 767px)" srcSet={imgMobile} />
        <img
          src={imgLoja}
          alt="Confira nossos produtos na Loja Sanchez"
          className="h-full w-full select-none object-cover md:object-contain"
          loading={primeiro ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={primeiro ? "high" : "auto"}
        />
      </picture>
    </Link>
  );
}
