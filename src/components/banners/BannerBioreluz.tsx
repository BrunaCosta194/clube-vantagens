import { Link } from "react-router-dom";
import imgDesktop from "@/assets/banners/bioreluz-banner.jpg";
import imgMobile from "@/assets/banners/mobile/bioreluz.jpg";
import type { BannerProps } from "@/data/banners";
import { track } from "@/lib/track";

// Banner BioReluz — empresa do grupo. Arte enviada pela equipe, com marca e
// assinatura JÁ dentro da imagem: nada de texto sobreposto aqui, seria o
// mesmo recado duas vezes (e ilegível na faixa de 83px do celular).
//
// Duas artes, como manda o CLAUDE.md: a oficial é 1920×465 (faixa larga) e
// vira uma tira ilegível no celular. Abaixo de 768px o <picture> troca pela
// arte mobile 4:3, com a mesma composição remontada em tamanho útil (onda no
// topo, logo grande no terço superior, máquina de filtragem e cesto de
// produtos embaixo). O palco acompanha a troca — 4:3 no celular, faixa larga
// de md pra cima —, então cada arte aparece inteira nos dois formatos.
export default function BannerBioreluz({ posicao, campanha, destino, primeiro }: BannerProps) {
  return (
    <Link
      to={destino}
      aria-label="BioReluz — limpeza e impermeabilização: conhecer os serviços"
      className="block h-full w-full"
      onClick={() => track("banner_click", { banner: "bioreluz", campanha, posicao, destino })}
    >
      <picture className="block h-full w-full">
        <source media="(max-width: 767px)" srcSet={imgMobile} />
        <img
          src={imgDesktop}
          alt="BioReluz — limpeza e impermeabilização"
          className="h-full w-full select-none object-cover md:object-contain"
          loading={primeiro ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={primeiro ? "high" : "auto"}
        />
      </picture>
    </Link>
  );
}
