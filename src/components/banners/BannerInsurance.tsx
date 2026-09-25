import { Link } from "react-router-dom";
import imgDesktop from "@/assets/banners/insurance-sante-banner.jpg";
import imgMobile from "@/assets/banners/mobile/insurance-sante.jpg";
import type { BannerProps } from "@/data/banners";
import { track } from "@/lib/track";

// Banner Insurance & Santé — empresa do grupo. Igual ao BioReluz: a arte já
// tem marca, assinatura e a lista de produtos embutidas, então não se
// sobrepõe texto nenhum.
//
// Enquadramento: a arte mobile (4:3) empilha logo do coração, nome, lista de
// cinco produtos e a foto da família, e o palco é 4:3 abaixo de 768px — a
// arte cabe inteira, sem corte. De md pra cima entram a faixa larga e o palco
// 1920×465, também sem corte.
export default function BannerInsurance({ posicao, campanha, destino, primeiro }: BannerProps) {
  return (
    <Link
      to={destino}
      aria-label="Insurance & Santé — seguros e planos de saúde: conhecer os produtos"
      className="block h-full w-full"
      onClick={() => track("banner_click", { banner: "insurance", campanha, posicao, destino })}
    >
      <picture className="block h-full w-full">
        <source media="(max-width: 767px)" srcSet={imgMobile} />
        <img
          src={imgDesktop}
          alt="Insurance & Santé — seguros e planos de saúde"
          className="h-full w-full select-none object-cover md:object-contain"
          loading={primeiro ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={primeiro ? "high" : "auto"}
        />
      </picture>
    </Link>
  );
}
