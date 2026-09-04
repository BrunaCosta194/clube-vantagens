import { Link } from "react-router-dom";
import imgLoja from "@/assets/banners/topo-loja.jpg";

// Banner 2 — Loja Sanchez. Imagem da campanha; clique leva direto à Loja.
export default function BannerLoja() {
  return (
    <Link
      to="/loja"
      aria-label="Confira nossos produtos na Loja Sanchez"
      className="block h-full w-full"
    >
      <img
        src={imgLoja}
        alt="Confira nossos produtos na Loja Sanchez"
        className="h-full w-full select-none object-contain"
      />
    </Link>
  );
}
