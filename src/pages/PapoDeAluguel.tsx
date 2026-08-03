import { ArrowLeft, Headphones, Instagram, Mic, Sparkles, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import yruena from "@/assets/papo/yruena-papo.jpg";
import logoPapo from "@/assets/papo/logo-papo.png";
import grid1 from "@/assets/papo/grid1.jpg";
import grid2 from "@/assets/papo/grid2.jpg";
import grid3 from "@/assets/papo/grid3.jpg";
import grid4 from "@/assets/papo/grid4.jpg";
import grid5 from "@/assets/papo/grid5.jpg";
import grid6 from "@/assets/papo/grid6.jpg";
import grid7 from "@/assets/papo/grid7.jpg";
import grid8 from "@/assets/papo/grid8.jpg";

// Página /papodealuguel — banner "Papo de Aluguel" reconstruído nativo e
// responsivo. Design original (1920×645) traduzido para os tokens do site
// (papo-azul / papo-laranja / Poppins) e empilhado no celular.
// TODO: trocar os href="#" pelos links reais do YouTube e do Instagram.

const social = [
  { Icon: Youtube, label: "ASSISTA NO YOUTUBE", href: "#" },
  { Icon: Instagram, label: "SIGA NO INSTAGRAM", href: "#" },
];

const features = [
  { Icon: Mic, l1: "ENTREVISTAS", l2: "INSPIRADORAS" },
  { Icon: Headphones, l1: "APRENDIZADO QUE", l2: "GERA VALOR" },
  { Icon: Sparkles, l1: "CONHECIMENTO QUE", l2: "GERA RESULTADO" },
];

// grid1 ocupa duas linhas (coluna larga); os demais preenchem o restante.
const galeria = [
  { src: grid1, pos: "35% 30%", span: true },
  { src: grid2, pos: "55% 20%" },
  { src: grid3, pos: "50% 35%" },
  { src: grid4, pos: "50% 30%" },
  { src: grid5, pos: "50% 40%" },
  { src: grid6, pos: "50% 40%" },
  { src: grid7, pos: "50% 35%" },
  { src: grid8, pos: "50% 35%" },
];

// gradiente-fundo do design original (oklch escuro azulado), em hex
const fundo =
  "linear-gradient(135deg, #1c2b45 0%, #131e33 55%, #0b1322 100%)";

export default function PapoDeAluguel() {
  return (
    <section
      className="relative flex min-h-screen flex-col overflow-hidden font-sans text-papo-texto"
      style={{ background: fundo }}
    >
      {/* brilho radial + textura pontilhada (decorativos) */}
      <div className="pointer-events-none absolute -top-40 right-[18%] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(89,208,240,0.18),transparent_70%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* topo: marca + voltar */}
      <header className="relative z-20 mx-auto flex w-full max-w-[92rem] items-center justify-between px-5 py-5 sm:px-8">
        <span className="flex items-center gap-2.5">
          <img
            src={logoPapo}
            alt="Papo de Aluguel"
            className="h-9 w-9 object-contain"
          />
          <span className="flex flex-col leading-[1.05]">
            <span className="text-[15px] font-semibold tracking-wide text-papo-texto">
              Papo
            </span>
            <span className="text-[15px] font-semibold tracking-wide text-papo-laranja">
              de Aluguel
            </span>
          </span>
        </span>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-papo-texto/80 transition-colors hover:border-white/30 hover:text-papo-texto"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Voltar ao clube
        </Link>
      </header>

      {/* corpo: empilha no celular, três zonas no desktop */}
      <div className="relative z-10 mx-auto flex w-full max-w-[92rem] flex-1 flex-col items-stretch lg:flex-row">
        {/* ── retrato da Yruena ── */}
        <div className="relative h-64 w-full shrink-0 sm:h-80 lg:h-auto lg:w-[26%]">
          <img
            src={yruena}
            alt="Yruena Monteiro"
            className="h-full w-full object-cover"
            style={{ objectPosition: "50% 8%" }}
          />
          {/* fade para dentro do conteúdo — para baixo no celular, para o lado no desktop */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0b1322] lg:bg-gradient-to-r lg:to-[#101a2e]" />
        </div>

        {/* ── conteúdo central ── */}
        <div className="relative z-10 flex flex-1 flex-col justify-center gap-8 px-6 py-12 sm:px-8 lg:px-12">
          <div>
            <span className="text-sm font-semibold tracking-[0.4em] text-papo-laranja">
              PODCAST
            </span>
            <h1 className="mt-3 text-[clamp(2.25rem,6vw,4.25rem)] font-semibold leading-[1.08] tracking-tight text-papo-texto">
              O conhecimento
              <br />
              que transforma
            </h1>
            <div className="mt-4 flex items-center gap-3.5">
              <span className="h-px w-10 bg-papo-laranja" />
              <span className="text-[13px] font-medium tracking-[0.18em] text-papo-texto/70 sm:text-sm">
                EXPERIÊNCIA EM CONHECIMENTO.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <span className="font-display text-5xl font-bold leading-[0.6] text-papo-laranja">
              &ldquo;
            </span>
            <p className="text-[clamp(1.35rem,3.4vw,2rem)] font-normal italic leading-[1.3] text-papo-texto/95">
              &ldquo;Não é papo furado,
              <br />é{" "}
              <strong className="font-semibold not-italic text-papo-laranja">
                Papo de Aluguel.&rdquo;
              </strong>
            </p>
          </div>

          {/* features */}
          <div className="flex flex-wrap items-start gap-x-6 gap-y-5">
            {features.map((f, i) => (
              <div key={f.l1} className="flex items-center gap-6">
                <div className="flex flex-col items-start gap-1.5">
                  <f.Icon
                    className="h-5 w-5 text-papo-laranja"
                    strokeWidth={1.5}
                  />
                  <span className="text-[10.5px] font-medium leading-tight tracking-wide text-papo-texto/60">
                    {f.l1}
                    <br />
                    {f.l2}
                  </span>
                </div>
                {i < features.length - 1 && (
                  <span className="hidden h-9 w-px bg-white/15 sm:block" />
                )}
              </div>
            ))}
          </div>

          {/* redes */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
            {social.map((s, i) => (
              <div key={s.label} className="flex items-center gap-5">
                <a
                  href={s.href}
                  className="inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.06em] text-papo-texto/90 transition-colors hover:text-papo-laranja"
                >
                  <s.Icon className="h-[18px] w-[18px] text-papo-laranja" strokeWidth={1.6} />
                  {s.label}
                </a>
                {i < social.length - 1 && (
                  <span className="hidden h-3.5 w-px bg-white/20 sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── mosaico de fotos ── */}
        <div className="relative w-full shrink-0 overflow-hidden lg:w-[40%]">
          <div className="grid h-56 grid-cols-3 grid-rows-2 gap-2 p-3 sm:h-72 lg:h-full lg:grid-cols-[1.3fr_1fr_1fr] lg:grid-rows-3 lg:gap-2.5">
            {galeria.map((g, i) => (
              <img
                key={i}
                src={g.src}
                alt=""
                loading="lazy"
                className={`h-full w-full min-h-0 object-cover ${
                  g.span ? "row-span-2" : ""
                } ${i > 5 ? "hidden lg:block" : ""}`}
                style={{ objectPosition: g.pos }}
              />
            ))}
          </div>
          {/* blends de borda */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b1322] via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-[#0b1322]" />
          <div className="pointer-events-none absolute inset-0 bg-papo-azul/25 mix-blend-color" />
        </div>
      </div>
    </section>
  );
}
