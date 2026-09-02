import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgePercent,
  HeartPulse,
  Landmark,
  PlayCircle,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  insuranceCategorias,
  insuranceHistoria,
  insuranceProdutosFlat,
  type CategoriaInsurance,
  type ProdutoInsurance,
} from "@/data/insuranceProdutos";
import CotacaoForm from "@/components/CotacaoForm";
import banner from "@/assets/banners/insurance-sante-banner.jpg";
import logo from "@/assets/parceiros/insurance-sante-logo.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

// ícone por categoria
const iconePorCategoria: Record<
  CategoriaInsurance["slug"],
  typeof Shield
> = {
  seguros: Shield,
  consorcio: Landmark,
  "planos-saude": HeartPulse,
};

export default function ParceiroInsurance() {
  const [cotacao, setCotacao] = useState<{
    produto: ProdutoInsurance;
    categoria: string;
  } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <main className="min-h-screen bg-warm-wash">
      {/* topo: voltar */}
      <header className="absolute inset-x-0 top-0 z-30 mx-auto flex w-full max-w-[92rem] items-center justify-between px-5 py-5 sm:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-grafite/20 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-grafite/30"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Voltar ao clube
        </Link>
      </header>

      {/* ── BANNER ── */}
      <section className="relative">
        <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/8] lg:aspect-[64/17]">
          <img
            src={banner}
            alt="Insurance & Santé"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-grafite/45 to-transparent" />
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className="mx-auto w-full max-w-[92rem] px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease }}
          className="relative z-10 -mt-10 rounded-[2rem] border border-grafite/10 bg-creme p-6 shadow-lux sm:-mt-14 sm:p-9"
        >
          <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Insurance & Santé"
                  className="h-14 w-14 rounded-2xl border border-grafite/10 object-cover shadow-lux-sm"
                />
                <div>
                  <h1 className="font-display text-2xl font-semibold leading-tight text-grafite sm:text-3xl">
                    Insurance &amp; Santé
                  </h1>
                  <span className="mt-1 inline-block rounded-full bg-cobre/10 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-cobre-deep">
                    Seguros · Consórcio · Planos de Saúde
                  </span>
                </div>
              </div>
              <p className="mt-5 text-[15px] leading-relaxed text-grafite-soft sm:text-base">
                {insuranceHistoria}
              </p>
            </div>

            <div className="inline-flex shrink-0 items-center gap-3 rounded-2xl border border-cobre-line/40 bg-cobre/10 px-4 py-3">
              <BadgePercent className="h-5 w-5 shrink-0 text-cobre-deep" strokeWidth={1.5} />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cobre-deep">
                  Sua vantagem
                </p>
                <p className="font-semibold text-grafite">
                  Cotação sem custo + condição de clube
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── CATÁLOGO POR CATEGORIA ── */}
      <div className="mx-auto w-full max-w-[92rem] px-6 py-14 sm:px-8 sm:py-20">
        {insuranceCategorias.map((cat) => {
          const Icone = iconePorCategoria[cat.slug];
          return (
            <section key={cat.slug} className="mb-14 last:mb-0">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cobre/12 text-cobre-deep">
                  <Icone className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-grafite">
                    {cat.titulo}
                  </h2>
                  <p className="mt-1 text-sm text-grafite-soft">
                    {cat.descricao}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {cat.produtos.map((p, i) => (
                  <motion.button
                    key={p.slug}
                    onClick={() =>
                      setCotacao({ produto: p, categoria: cat.titulo })
                    }
                    initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease }}
                    className="group flex h-full flex-col rounded-[1.5rem] border border-grafite/10 bg-white p-5 text-left shadow-card transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-cobre/40 hover:shadow-lux"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-lg font-semibold leading-tight text-grafite">
                        {p.nome}
                      </h3>
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-grafite/10 text-grafite-soft transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-cobre group-hover:bg-cobre group-hover:text-perola">
                        <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                      </span>
                    </div>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-grafite-soft">
                      {p.descricaoCurta}
                    </p>
                    <div className="mt-4 flex items-center gap-2 border-t border-grafite/10 pt-4">
                      <span className="h-1.5 w-1.5 rounded-full bg-cobre" />
                      <span className="font-mono text-xs font-medium tracking-wide text-cobre-deep">
                        Faça sua cotação
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── RODAPÉ: vídeos de explicação ── */}
      <section className="border-t border-grafite/10 bg-creme">
        <div className="mx-auto w-full max-w-[92rem] px-6 py-16 sm:px-8 sm:py-20">
          <div className="flex items-center gap-3">
            <PlayCircle className="h-6 w-6 text-cobre-deep" strokeWidth={1.5} />
            <h2 className="h-display text-[clamp(1.5rem,3.5vw,2.25rem)]">
              Assista à explicação do seu produto
            </h2>
          </div>
          <p className="mt-2 max-w-xl text-sm text-grafite-soft">
            Vídeos curtos explicando cada seguro, consórcio e plano. Em breve.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {insuranceProdutosFlat.map((p) => (
              <div
                key={p.slug}
                className="overflow-hidden rounded-[1.25rem] border border-grafite/10 bg-white shadow-card"
              >
                <div className="relative aspect-video w-full">
                  {p.videoUrl ? (
                    <iframe
                      src={p.videoUrl}
                      title={p.nome}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-grafite to-[hsl(184,40%,24%)]">
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <PlayCircle className="h-9 w-9 text-white/55" strokeWidth={1.2} />
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                          Vídeo em breve
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm font-semibold text-grafite">{p.nome}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CotacaoForm
        produto={cotacao?.produto ?? null}
        categoria={cotacao?.categoria}
        onClose={() => setCotacao(null)}
      />
    </main>
  );
}
