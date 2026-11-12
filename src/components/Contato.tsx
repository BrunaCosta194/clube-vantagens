import { useState } from "react";
import type { FormEvent } from "react";
import { Clock, Globe, Instagram, MapPin, MessageCircle, Navigation } from "lucide-react";
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
const HORARIOS = [
  { dias: "Segunda a sexta", horas: "09h às 18h" },
  { dias: "Sábado", horas: "09h às 13h" },
  { dias: "Domingos e feriados", horas: "Fechado" },
];

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
  ];

  const botaoContorno =
    "inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-md border border-grafite px-5 text-[15px] font-semibold text-grafite transition-colors hover:bg-grafite hover:text-perola";

  return (
    <section id="contato" className="section-y scroll-mt-24 bg-creme-100">
      <div className="container-club">
        <h2 className="h-display max-w-3xl text-[clamp(2.5rem,5.2vw,4.5rem)]">
          Venha tomar um café <span className="italic text-cobre-deep">com a gente.</span>
        </h2>

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="text-[15px] text-grafite-soft">Endereço</p>
            <LinkRastreado
              href={hrefVerNoMapa}
              target="_blank"
              rel="noopener noreferrer"
              evento="map_open"
              props={{ tipo: "ver", local: "endereco" }}
              className="mt-1 block text-xl font-semibold leading-snug text-grafite transition-colors hover:text-cobre-deep"
            >
              {ENDERECO}
            </LinkRastreado>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={comoChegar}
                disabled={estado === "localizando"}
                className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-md bg-cobre-deep px-5 text-[15px] font-semibold text-perola transition-colors hover:bg-grafite disabled:opacity-60"
              >
                <Navigation className="h-4 w-4" strokeWidth={1.75} />
                {estado === "localizando" ? "Localizando…" : "Como chegar"}
              </button>
              <LinkRastreado
                href={hrefVerNoMapa}
                target="_blank"
                rel="noopener noreferrer"
                evento="map_open"
                props={{ tipo: "ver", local: "botao" }}
                className={botaoContorno}
              >
                <MapPin className="h-4 w-4" strokeWidth={1.75} />
                Ver no mapa
              </LinkRastreado>
            </div>

            <div aria-live="polite">
              {estado === "pronto" && rotaPronta && (
                <a
                  href={rotaPronta}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-base font-semibold text-cobre-deep underline underline-offset-4"
                >
                  Rota pronta — abrir no app de mapas
                </a>
              )}

              {estado === "negado" && (
                <form onSubmit={rotaManual} className="mt-5 space-y-3">
                  <label htmlFor="partida" className="block text-base text-grafite">
                    Sem acesso à sua localização. Digite de onde você sai:
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      id="partida"
                      value={partida}
                      onChange={(e) => setPartida(e.target.value)}
                      placeholder="Ex.: Rua, bairro ou cidade"
                      autoComplete="street-address"
                      className="min-h-[3.25rem] flex-1 rounded-md border border-grafite/25 bg-white px-4 text-base text-grafite outline-none focus:border-cobre-deep"
                    />
                    <button
                      type="submit"
                      className="min-h-[3.25rem] rounded-md bg-grafite px-5 text-[15px] font-semibold text-perola transition-colors hover:bg-cobre-deep"
                    >
                      Traçar rota
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => abrirRota(hrefRota(), "direto")}
                    className="text-base text-cobre-deep underline underline-offset-4"
                  >
                    Ou abrir direto no app de mapas
                  </button>
                </form>
              )}
            </div>

            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {itens.map(({ icone: Icone, rotulo, valor, href, evento, props }) => (
                <li key={rotulo}>
                  <p className="flex items-center gap-2 text-[15px] text-grafite-soft">
                    <Icone className="h-4 w-4 text-cobre-deep" strokeWidth={1.75} />
                    {rotulo}
                  </p>
                  <LinkRastreado
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    evento={evento}
                    props={props}
                    className="mt-1 block break-words text-lg font-semibold text-grafite transition-colors hover:text-cobre-deep"
                  >
                    {valor}
                  </LinkRastreado>
                </li>
              ))}
              <li>
                <p className="flex items-center gap-2 text-[15px] text-grafite-soft">
                  <Clock className="h-4 w-4 text-cobre-deep" strokeWidth={1.75} />
                  Horário de funcionamento
                </p>
                <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-base">
                  {HORARIOS.map(({ dias, horas }) => (
                    <div key={dias} className="contents">
                      <dt className="text-grafite">{dias}</dt>
                      <dd className="font-semibold text-grafite">{horas}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            </ul>
          </div>

          <div className="min-h-[340px] overflow-hidden rounded-[10px] bg-creme-200 lg:col-span-7 lg:min-h-full">
            <iframe
              src={hrefEmbed}
              title="Mapa: Sanchez Imóveis, Centro de Mogi das Cruzes"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[340px] w-full border-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
