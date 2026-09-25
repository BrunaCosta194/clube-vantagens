import { Link } from "react-router-dom";
import imgClube from "@/assets/banners/topo-clube.jpg";
import imgMobile from "@/assets/banners/mobile/topo-clube.jpg";
import type { BannerProps } from "@/data/banners";
import { track } from "@/lib/track";

// Banner Comunidade Sanchez. Imagem da campanha; clique leva ao cadastro.
// `posicao`/`campanha`/`destino` agora chegam por prop (fonte:
// `data/banners.ts`) — antes a posição era número fixo aqui, que passaria a
// mentir no evento assim que a ordem mudasse ou um banner expirasse.
export default function BannerClube({ posicao, campanha, destino, primeiro }: BannerProps) {
  return (
    <Link
      to={destino}
      aria-label="Faça parte do Clube de Vantagens — criar conta"
      className="block h-full w-full"
      onClick={() => track("banner_click", { banner: "clube", campanha, posicao, destino })}
    >
      {/* Arte larga (1920×465) só de md pra cima: no celular ela vira uma tira
          de 83px. Abaixo disso entra o recorte 4:3, remontado a partir da
          mesma arte (scripts/banners-mobile-remontagem.py), e o palco do
          carrossel também é 4:3 — as duas aparecem inteiras. */}
      <picture className="block h-full w-full">
        <source media="(max-width: 767px)" srcSet={imgMobile} />
        <img
          src={imgClube}
          alt="Comunidade Sanchez — Clube de Vantagens"
          className="h-full w-full select-none object-cover md:object-contain"
          loading={primeiro ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={primeiro ? "high" : "auto"}
        />
      </picture>
    </Link>
  );
}
