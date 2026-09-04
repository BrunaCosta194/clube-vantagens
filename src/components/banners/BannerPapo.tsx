import { Link } from "react-router-dom";
import imgPapo from "@/assets/banners/topo-papo.jpg";

// Banner 3 — Papo de Aluguel. Imagem da campanha + CTA de e-book.
// Clique (banner inteiro ou botão) leva à página do Papo de Aluguel.
export default function BannerPapo() {
  return (
    <Link
      to="/papodealuguel"
      aria-label="Papo de Aluguel — baixar e-book grátis"
      className="relative block h-full w-full"
    >
      <img
        src={imgPapo}
        alt="Corretagem não é bico, é profissão — podcast Papo de Aluguel"
        className="h-full w-full select-none object-contain"
      />
      {/* CTA sobreposto — visual (o Link do banner é quem navega) */}
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-papo-laranja px-4 py-2 text-xs font-medium text-papo-azul shadow-lux-sm sm:bottom-5 sm:px-5 sm:py-2.5 sm:text-sm">
        Baixe o e-book grátis
      </span>
    </Link>
  );
}
