import { Link } from "react-router-dom";
import imgLoja from "@/assets/banners/topo-loja.jpg";
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
      <img
        src={imgLoja}
        alt="Confira nossos produtos na Loja Sanchez"
        className="h-full w-full select-none object-contain"
        loading={primeiro ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={primeiro ? "high" : "auto"}
      />
    </Link>
  );
}
