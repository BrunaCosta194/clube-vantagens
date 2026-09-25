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
// cinco produtos e a foto da família. O palco do carrossel continua sendo a
// faixa 1920×465, então o `object-cover` mostra só uma tira dessa arte —
// cortar pelo centro (`object-center`) partiria a palavra "INSURANCE" no
// meio. Com o ponto focal em 32% da altura a tira pega o nome e a assinatura
// inteiros, com a ponta do coração por cima; a lista de produtos e a foto
// ficam fora (continuam aparecendo na página do parceiro).
// Acima de 768px a arte larga entra em `object-contain`, sem corte nenhum, e
// o ponto focal deixa de importar (proporção da imagem = proporção do palco).
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
          className="h-full w-full select-none object-cover object-[50%_32%] md:object-contain md:object-center"
          loading={primeiro ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={primeiro ? "high" : "auto"}
        />
      </picture>
    </Link>
  );
}
