import { useEffect, useRef, useState } from "react";
import { Instagram } from "lucide-react";
import LinkRastreado from "@/components/LinkRastreado";
import { track } from "@/lib/track";

// Bloco 10 — Instagram no site via widget do Behold (behold.so, plano grátis:
// 1.200 views/mês, 6 posts, atualiza 1x/dia). Feed ID do @sanchezimoveisenegocios
// fica aqui (é público, vai no HTML de qualquer jeito); VITE_BEHOLD_FEED_ID na
// Vercel sobrescreve. ID vazio = seção não renderiza. O script do Behold só é baixado
// quando a seção chega perto da tela, pra não pesar o carregamento inicial
// nem gastar view do plano com quem não rola até aqui.
const FEED_ID_PADRAO = "B4y3mzvHS2PcREK8vyhu";
const FEED_ID = (import.meta.env.VITE_BEHOLD_FEED_ID as string | undefined)?.trim() || FEED_ID_PADRAO;
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
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 className="h-display text-[clamp(2.5rem,5.2vw,4.5rem)] lg:col-span-8">
            O que rola <span className="italic text-cobre-deep">na Sanchez.</span>
          </h2>
          <LinkRastreado
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            evento="social_click"
            props={{ rede: "instagram", local: "feed_seguir" }}
            className="btn-quiet self-start lg:col-span-4 lg:self-auto lg:justify-self-end"
          >
            <Instagram className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Seguir @sanchezimoveisenegocios
          </LinkRastreado>
        </div>

        {/* O widget abre os posts em links próprios (dentro do shadow DOM dele);
            o clique sobe até aqui, então dá pra contar sem saber qual post foi. */}
        <div
          className="mt-12 min-h-[240px] lg:mt-16"
          onClick={() => void track("social_click", { rede: "instagram", local: "feed_post" })}
        >
          {visivel && <div data-behold-id={FEED_ID} />}
        </div>
      </div>
    </section>
  );
}
