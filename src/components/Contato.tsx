import { useState } from "react";
import type { FormEvent } from "react";
import { Globe, Instagram, Mail, MapPin, MessageCircle, Navigation } from "lucide-react";
import LinkRastreado from "@/components/LinkRastreado";
import { track } from "@/lib/track";

// Bloco 9 — contato, mapa e rota. Padrão do site AV Alumi (Decisão D3): card de
// contato ao lado do iframe do Google Maps embed (grátis, sem chave). Distância
// e tempo ficam no app de mapas — o site só monta o deep link.
const ENDERECO = "Rua Doutor Ricardo Vilela, 965 — Centro, Mogi das Cruzes/SP, CEP 08780-060";
const DESTINO = "Rua Doutor Ricardo Vilela, 965, Centro, Mogi das Cruzes - SP, 08780-060";
const WHATSAPP = "5511971796030";
const INSTAGRAM = "https://www.instagram.com/sanchezimoveisenegocios/";
const SITE = "https://www.sanchezimoveis.com.br/";
const EMAIL = "financeiro@sanchezimoveis.com.br";

const destinoUrl = encodeURIComponent(DESTINO);
const hrefVerNoMapa = `https://www.google.com/maps/search/?api=1&query=${destinoUrl}`;
const hrefEmbed = `https://www.google.com/maps?q=${destinoUrl}&z=16&output=embed`;
const hrefWpp = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  "Olá! Vim pelo site do Clube Sanchez.",
)}`;

/** Rota no Google Maps. Sem `origin`, o app usa a posição atual do aparelho. */
function hrefRota(origem?: string) {
  const base = `https://www.google.com/maps/dir/?api=1&destination=${destinoUrl}`;
  return origem ? `${base}&origin=${encodeURIComponent(origem)}` : base;
}

type EstadoRota = "parado" | "localizando" | "negado" | "pronto";

export default function Contato() {
  const [estado, setEstado] = useState<EstadoRota>("parado");
  const [partida, setPartida] = useState("");
  // Link de reserva quando o navegador bloqueia o window.open depois do
  // pedido de localização (a permissão às vezes demora e perde o gesto do clique).
  const [rotaPronta, setRotaPronta] = useState<string | null>(null);

  function abrirRota(url: string, localizacao: string) {
    void track("map_open", { tipo: "rota", localizacao });
    const janela = window.open(url, "_blank", "noopener,noreferrer");
    if (!janela) {
      setRotaPronta(url);
      setEstado("pronto");
    }
  }

  function comoChegar() {
    if (!("geolocation" in navigator)) {
      setEstado("negado");
      return;
    }
    setEstado("localizando");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setEstado("parado");
        abrirRota(hrefRota(`${coords.latitude},${coords.longitude}`), "autorizada");
      },
      () => setEstado("negado"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  function rotaManual(e: FormEvent) {
    e.preventDefault();
    const origem = partida.trim();
    if (!origem) return;
    abrirRota(hrefRota(origem), "manual");
  }

  const itens = [
    {
      icone: MessageCircle,
      rotulo: "WhatsApp",
      valor: "(11) 97179-6030",
      href: hrefWpp,
      evento: "social_click" as const,
      props: { rede: "whatsapp", local: "contato" },
    },
    {
      icone: Instagram,
      rotulo: "Instagram",
      valor: "@sanchezimoveisenegocios",
      href: INSTAGRAM,
      evento: "social_click" as const,
      props: { rede: "instagram", local: "contato" },
    },
    {
      icone: Globe,
      rotulo: "Site da Sanchez Imóveis",
      valor: "sanchezimoveis.com.br",
      href: SITE,
      evento: "social_click" as const,
      props: { rede: "site", local: "contato" },
    },
    {
      icone: Mail,
      rotulo: "E-mail",
      valor: EMAIL,
      href: `mailto:${EMAIL}`,
      evento: "social_click" as const,
      props: { rede: "email", local: "contato" },
    },
  ];

  return (
    <section id="contato" className="section-y scroll-mt-24 bg-creme">
      <div className="container-club">
        <div className="max-w-xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cobre-deep">
            Contato
          </p>
          <h2 className="h-display mt-3 text-[clamp(2rem,4.5vw,3.25rem)]">
            Venha tomar um café <span className="italic text-cobre">com a gente.</span>
          </h2>
        </div>

        <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
          <div className="rounded-[1.5rem] border border-cobre-line/20 bg-white/70 p-6 sm:p-8">
            <div className="flex gap-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-cobre" strokeWidth={1.5} />
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-grafite-muted">
                  Endereço
                </p>
                <LinkRastreado
                  href={hrefVerNoMapa}
                  target="_blank"
                  rel="noopener noreferrer"
                  evento="map_open"
                  props={{ tipo: "ver", local: "endereco" }}
                  className="mt-1 block text-grafite underline-offset-4 hover:text-cobre hover:underline"
                >
                  {ENDERECO}
                </LinkRastreado>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <LinkRastreado
                href={hrefVerNoMapa}
                target="_blank"
                rel="noopener noreferrer"
                evento="map_open"
                props={{ tipo: "ver", local: "botao" }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-cobre px-5 text-sm font-medium text-cobre-deep transition hover:bg-cobre/10"
              >
                <MapPin className="h-4 w-4" strokeWidth={1.5} />
                Ver no mapa
              </LinkRastreado>
              <button
                type="button"
                onClick={comoChegar}
                disabled={estado === "localizando"}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-grafite px-5 text-sm font-medium text-creme transition hover:bg-grafite-soft disabled:opacity-60"
              >
                <Navigation className="h-4 w-4" strokeWidth={1.5} />
                {estado === "localizando" ? "Localizando…" : "Como chegar"}
              </button>
            </div>

            <div aria-live="polite">
              {estado === "pronto" && rotaPronta && (
                <a
                  href={rotaPronta}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-medium text-cobre-deep underline underline-offset-4"
                >
                  Rota pronta — abrir no app de mapas
                </a>
              )}

              {estado === "negado" && (
                <form onSubmit={rotaManual} className="mt-4 space-y-3">
                  <label htmlFor="partida" className="block text-sm text-grafite-muted">
                    Sem acesso à sua localização. Digite de onde você sai:
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      id="partida"
                      value={partida}
                      onChange={(e) => setPartida(e.target.value)}
                      placeholder="Ex.: Rua, bairro ou cidade"
                      autoComplete="street-address"
                      className="min-h-11 flex-1 rounded-full border border-cobre-line/40 bg-white px-4 text-sm text-grafite outline-none focus:border-cobre"
                    />
                    <button
                      type="submit"
                      className="min-h-11 rounded-full bg-cobre px-5 text-sm font-medium text-white transition hover:bg-cobre-deep"
                    >
                      Traçar rota
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => abrirRota(hrefRota(), "direto")}
                    className="text-sm text-cobre-deep underline underline-offset-4"
                  >
                    Ou abrir direto no app de mapas
                  </button>
                </form>
              )}
            </div>

            <ul className="mt-8 space-y-4 border-t border-cobre-line/20 pt-6">
              {itens.map(({ icone: Icone, rotulo, valor, href, evento, props }) => (
                <li key={rotulo} className="flex gap-4">
                  <Icone className="mt-0.5 h-5 w-5 shrink-0 text-cobre" strokeWidth={1.5} />
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-grafite-muted">
                      {rotulo}
                    </p>
                    <LinkRastreado
                      href={href}
                      target={href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      evento={evento}
                      props={props}
                      className="mt-1 block break-words text-grafite hover:text-cobre"
                    >
                      {valor}
                    </LinkRastreado>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-h-[320px] overflow-hidden rounded-[1.5rem] border border-cobre-line/20 lg:min-h-full">
            <iframe
              src={hrefEmbed}
              title="Mapa: Sanchez Imóveis, Centro de Mogi das Cruzes"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[320px] w-full border-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
