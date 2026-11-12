import { useEffect, useRef } from "react";

// Cloudflare Turnstile (anti-robô), o mesmo widget do site da Sanchez Imóveis.
// Sem biblioteca: carrega o script da Cloudflare só quando o widget aparece
// (o formulário de cotação), em modo explícito, e devolve o token por onToken.
// O token vale para um envio só: depois de cada tentativa, chame `reiniciar`.
//
// A chave é pública (vai no HTML): VITE_TURNSTILE_SITE_KEY na Vercel. Sem ela o
// widget não aparece e a função recusa o envio, então a chave tem de estar lá.

export const CHAVE_TURNSTILE = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined)?.trim() ?? "";

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Api = {
  render: (el: HTMLElement, opcoes: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: Api;
  }
}

let carregando: Promise<Api> | null = null;

function carregar(): Promise<Api> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (carregando) return carregando;
  carregando = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
    s.onerror = () => {
      carregando = null;
      reject(new Error("turnstile"));
    };
    document.head.append(s);
  });
  return carregando;
}

type Props = {
  onToken: (token: string) => void;
  /** Muda o valor para pedir um token novo (depois de cada tentativa de envio). */
  reiniciar: number;
};

export default function Turnstile({ onToken, reiniciar }: Props) {
  const caixa = useRef<HTMLDivElement>(null);
  const id = useRef<string | null>(null);
  const aoToken = useRef(onToken);
  aoToken.current = onToken;

  useEffect(() => {
    if (!CHAVE_TURNSTILE) return;
    let vivo = true;
    carregar()
      .then((api) => {
        if (!vivo || !caixa.current || id.current) return;
        id.current = api.render(caixa.current, {
          sitekey: CHAVE_TURNSTILE,
          language: "pt-br",
          callback: (t: string) => aoToken.current(t),
          "expired-callback": () => aoToken.current(""),
          "error-callback": () => aoToken.current(""),
        });
      })
      .catch(() => aoToken.current(""));
    return () => {
      vivo = false;
      if (id.current) window.turnstile?.remove(id.current);
      id.current = null;
    };
  }, []);

  useEffect(() => {
    if (reiniciar === 0 || !id.current) return;
    aoToken.current("");
    window.turnstile?.reset(id.current);
  }, [reiniciar]);

  if (!CHAVE_TURNSTILE) return null;
  return <div ref={caixa} className="min-h-[65px] max-w-full overflow-hidden" />;
}
