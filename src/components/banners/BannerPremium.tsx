import imgPremium from "@/assets/banners/topo-premium.jpg";
import type { BannerProps } from "@/data/banners";
import LinkRastreado from "@/components/LinkRastreado";

// Banner Sanchez Premium. Imagem da campanha; clique abre o WhatsApp da
// Yruena (atendimento Premium). O número e a mensagem viraram o `destino`
// deste banner em `data/banners.ts` — mesmo link de antes, só que agora no
// mesmo lugar dos outros destinos.
export default function BannerPremium({ posicao, campanha, destino, primeiro }: BannerProps) {
  return (
    <LinkRastreado
      href={destino}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Yruena sobre o Sanchez Premium no WhatsApp"
      className="block h-full w-full"
      evento="banner_click"
      props={{ banner: "premium", campanha, posicao, destino }}
    >
      <img
        src={imgPremium}
        alt="Sanchez Premium — curadoria, segurança jurídica e investimentos"
        className="h-full w-full select-none object-contain"
        loading={primeiro ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={primeiro ? "high" : "auto"}
      />
    </LinkRastreado>
  );
}
