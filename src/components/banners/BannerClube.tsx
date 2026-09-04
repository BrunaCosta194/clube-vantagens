import { Link } from "react-router-dom";
import imgClube from "@/assets/banners/topo-clube.jpg";

// Banner 1 — Clube de Vantagens. Imagem da campanha; clique leva ao cadastro.
export default function BannerClube() {
  return (
    <Link
      to="/cadastro"
      aria-label="Faça parte do Clube de Vantagens — criar conta"
      className="block h-full w-full"
    >
      <img
        src={imgClube}
        alt="Comunidade Sanchez — Clube de Vantagens"
        className="h-full w-full select-none object-contain"
      />
    </Link>
  );
}
