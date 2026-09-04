import imgPremium from "@/assets/banners/topo-premium.jpg";

// Banner 4 — Sanchez Premium. Imagem da campanha; clique abre o WhatsApp
// da Yruena (atendimento Premium).
const NUMERO_YRUENA = "5511971796030"; // WhatsApp Yruena (55 + DDD 11)
const MENSAGEM = "Olá, Yruena! Tenho interesse no Sanchez Premium.";

export default function BannerPremium() {
  const href = `https://wa.me/${NUMERO_YRUENA}?text=${encodeURIComponent(MENSAGEM)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Yruena sobre o Sanchez Premium no WhatsApp"
      className="block h-full w-full"
    >
      <img
        src={imgPremium}
        alt="Sanchez Premium — curadoria, segurança jurídica e investimentos"
        className="h-full w-full select-none object-contain"
      />
    </a>
  );
}
