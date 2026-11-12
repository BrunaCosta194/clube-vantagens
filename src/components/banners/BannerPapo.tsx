import imgPapo from "@/assets/banners/topo-papo.jpg";
import imgMobile from "@/assets/banners/mobile/topo-papo.jpg";
import type { BannerProps } from "@/data/banners";
import { track } from "@/lib/track";

// Banner Papo de Aluguel. O clique leva ao mídia kit (/midiakit), que é uma
// página estática em public/midiakit (fora do React Router): por isso <a>, não <Link>.
export default function BannerPapo({ posicao, campanha, destino, primeiro }: BannerProps) {
  return (
    <a
      href={destino}
      aria-label="Papo de Aluguel — ver o mídia kit"
      className="relative block h-full w-full"
      onClick={() => track("banner_click", { banner: "papo", campanha, posicao, destino })}
    >
      {/* Arte larga (1920×465) de md pra cima; no celular, a arte própria
          em 4:3 que a designer mandou (o palco do carrossel também é 4:3). */}
      <picture className="block h-full w-full">
        <source media="(max-width: 767px)" srcSet={imgMobile} />
        <img
          src={imgPapo}
          alt="Aqui não tem papo furado. É Papo de Aluguel."
          className="h-full w-full select-none object-cover"
          loading={primeiro ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={primeiro ? "high" : "auto"}
        />
      </picture>
      {/* chamada sobre a arte — visual (o link do banner é quem navega) */}
      <span
        aria-hidden="true"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-papo-laranja px-4 py-2 text-sm font-semibold text-papo-azul transition-transform duration-300 hover:-translate-y-0.5 sm:bottom-5 sm:px-5 sm:py-2.5 md:bottom-[15%] md:left-[16%] md:translate-x-0 lg:text-[15px]"
      >
        Ver o mídia kit
      </span>
    </a>
  );
}
