import { createElement, useEffect, useRef, useState } from "react";
import { Instagram } from "lucide-react";
import LinkRastreado from "@/components/LinkRastreado";
import { track } from "@/lib/track";

// Bloco 10 — Instagram no site via widget do Behold (behold.so, plano grátis:
// 1.200 views/mês, 6 posts, atualiza 1x/dia). A seção só aparece quando
// VITE_BEHOLD_FEED_ID estiver configurado (Vercel → Environment Variables +
// redeploy) — sem ele, não renderiza nada. O script do Behold só é baixado
// quando a seção chega perto da tela, pra não pesar o carregamento inicial
// nem gastar view do plano com quem não rola até aqui.
const FEED_ID = (import.meta.env.VITE_BEHOLD_FEED_ID as string | undefined)?.trim() ?? "";
const SCRIPT_BEHOLD = "https://w.behold.so/widget.js";
const INSTAGRAM = "https://www.instagram.com/sanchezimoveisenegocios/";

function carregarScriptBehold() {
  if (document.querySelector(`script[src="${SCRIPT_BEHOLD}"]`)) return;
  const s = document.createElement("script");
  s.type = "module";
  s.src = SCRIPT_BEHOLD;
  document.head.append(s);
}

export default function InstagramFeed() {
  const secaoRef = useRef<HTMLElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = secaoRef.current;
    if (!el || visivel) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisivel(true);
          obs.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visivel]);

  useEffect(() => {
    if (visivel) carregarScriptBehold();
  }, [visivel]);

  if (!FEED_ID) return null;

  return (
    <section ref={secaoRef} id="instagram" className="section-y scroll-mt-24 bg-creme">
      <div className="container-club">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cobre-deep">
              Instagram
            </p>
            <h2 className="h-display mt-3 text-[clamp(2rem,4.5vw,3.25rem)]">
              O que rola <span className="italic text-cobre">na Sanchez.</span>
            </h2>
          </div>
          <LinkRastreado
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            evento="social_click"
            props={{ rede: "instagram", local: "feed_seguir" }}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full border border-cobre px-5 text-sm font-medium text-cobre-deep transition hover:bg-cobre/10 sm:self-auto"
          >
            <Instagram className="h-4 w-4" strokeWidth={1.5} />
            Seguir @sanchezimoveisenegocios
          </LinkRastreado>
        </div>

        {/* O widget abre os posts em links próprios (dentro do shadow DOM dele);
            o clique sobe até aqui, então dá pra contar sem saber qual post foi. */}
        <div
          className="mt-10 min-h-[240px] lg:mt-14"
          onClick={() => void track("social_click", { rede: "instagram", local: "feed_post" })}
        >
          {visivel && createElement("behold-widget", { "feed-id": FEED_ID })}
        </div>
      </div>
    </section>
  );
}
