import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgePercent,
  Check,
  Clock,
  Copy,
  Instagram,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import LinkRastreado from "@/components/LinkRastreado";
import { useSessao } from "@/lib/sessao";
import {
  DEWA_INSTAGRAM,
  DEWA_MAPA,
  DEWA_SITE,
  DEWA_WHATS,
  dewaBeneficio,
  dewaCasa,
  dewaFotos,
  dewaHistoria,
  dewaProdutos,
  dewaVantagensLoja,
  fotoDewa,
} from "@/data/dewa";

const ease = [0.22, 1, 0.36, 1] as const;
const SLUG = "dewa";

const aparecer = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

export default function ParceiroDewa() {
  const { usuario, carregando } = useSessao();
  const membro = !carregando && !!usuario;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-creme">
      {/* topo: voltar + WhatsApp */}
      <header className="absolute inset-x-0 top-0 z-30 mx-auto flex w-full max-w-[92rem] items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/55"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">Voltar ao clube</span>
          <span className="sm:hidden">Clube</span>
        </Link>
        <LinkRastreado
          href={DEWA_WHATS}
          target="_blank"
          rel="noreferrer"
          evento="partner_contact"
          props={{ slug: SLUG, canal: "whatsapp", lugar: "topo" }}
          className="inline-flex items-center gap-2 rounded-full bg-[#2a9e6a] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={1.6} />
          Falar com a Dewa
        </LinkRastreado>
      </header>

      {/* ── TOPO: foto da Casa Dewa ── */}
      <section className="relative">
        <div className="relative h-[86svh] min-h-[34rem] max-h-[58rem] w-full overflow-hidden sm:h-[80vh]">
          <motion.img
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.2, ease }}
            src={fotoDewa(dewaFotos.quintal, 1400)}
            srcSet={[800, 1400, 2000].map((w) => `${fotoDewa(dewaFotos.quintal, w)} ${w}w`).join(", ")}
            sizes="100vw"
            fetchPriority="high"
            alt="O Quintal da Casa Dewa à noite"
            className="h-full w-full object-cover"
          />
          {/* duas camadas: escurece embaixo (texto no celular) e à esquerda (texto no desktop) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/45" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-black/60 via-black/15 to-transparent md:block" />

          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[92rem] px-5 pb-24 sm:px-8 sm:pb-28">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease }}
              className="max-w-2xl"
            >
              <span className="inline-flex items-center gap-2 text-[15px] text-white font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-cobre-light" />
                Parceiro Sanchez Clube
              </span>
              <h1 className="mt-5 font-display text-[clamp(3.5rem,13vw,8rem)] leading-[0.88] tracking-[-0.02em] text-white">
                Dewa
              </h1>
              <p className="mt-4 font-display text-2xl italic text-white/90 sm:text-3xl">
                Onde o bem existe.
              </p>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/80 sm:text-base">
                Moda em algodão, lifestyle e bem-estar, feita em Mogi das Cruzes
                desde 2008. Agora com condição exclusiva para quem é do clube.
              </p>
              <ul className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/20 pt-5 text-sm text-white/75 font-semibold">
                <li>Desde 2008</li>
                <li aria-hidden className="h-3 w-px bg-white/30" />
                <li>Vila Oliveira · Mogi</li>
                <li aria-hidden className="h-3 w-px bg-white/30" />
                <li>Loja · Yoga · Quintal</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HISTÓRIA + BENEFÍCIO ── */}
      <section className="mx-auto w-full max-w-[92rem] px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease }}
          className="relative z-10 -mt-14 grid gap-6 rounded-[12px] border border-grafite/10 bg-creme p-5 sm:p-9 lg:grid-cols-[1.4fr_1fr] lg:gap-10"
        >
          <div>
            <p className="text-sm text-cobre-deep font-semibold">
              Sobre a Dewa
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-grafite-soft sm:text-base">
              {dewaHistoria}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Masculino", "Feminino", "Infantil", "Dewa Sports", "Acessórios", "Yoga"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full border border-grafite/10 bg-white/60 px-3 py-1 text-sm text-grafite-soft"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>

          <Beneficio membro={membro} />
        </motion.div>
      </section>

      {/* ── COMO USAR ── */}
      <section className="mx-auto w-full max-w-[92rem] px-5 pt-16 sm:px-8 sm:pt-24">
        <p className="text-sm text-cobre-deep font-semibold">
          Três passos
        </p>
        <h2 className="h-display mt-2 text-[clamp(2.5rem,5.2vw,4.5rem)]">Como usar seu benefício</h2>
        <ol className="mt-10 grid gap-2 sm:mt-12 sm:grid-cols-3">
          {[
            {
              t: "Entre no clube",
              d: "O cadastro no Sanchez Clube é gratuito para clientes da Sanchez Imóveis.",
            },
            {
              t: "Pegue seu cupom",
              d: "Com a sua conta aberta, o cupom aparece aqui nesta página.",
            },
            {
              t: "Use na Dewa",
              d: "Mostre o cupom no caixa da Casa Dewa ou digite no site na hora de pagar.",
            },
          ].map((p, i) => (
            <motion.li
              key={p.t}
              {...aparecer}
              transition={{ duration: 0.7, delay: i * 0.1, ease }}
              className="rounded-[10px] bg-creme-100 px-6 py-7 sm:px-8 sm:py-9"
            >
              <h3 className="font-display text-[clamp(1.6rem,2.4vw,2rem)] leading-tight text-grafite">{p.t}</h3>
              <p className="mt-2 text-base leading-relaxed text-grafite">{p.d}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ── PEÇAS ── */}
      <section className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 sm:py-24">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-cobre-deep font-semibold">
              Coleção
            </p>
            <h2 className="h-display mt-2 text-[clamp(2.5rem,5.2vw,4.5rem)]">Peças da Dewa</h2>
          </div>
          <LinkRastreado
            href={DEWA_SITE}
            target="_blank"
            rel="noreferrer"
            evento="partner_contact"
            props={{ slug: SLUG, canal: "site", lugar: "pecas" }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-cobre-deep hover:text-cobre"
          >
            Ver a coleção inteira
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          </LinkRastreado>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-6 lg:grid-cols-4">
          {dewaProdutos.map((p, i) => (
            <motion.div
              key={p.nome}
              {...aparecer}
              transition={{ duration: 0.7, delay: (i % 4) * 0.08, ease }}
            >
              <LinkRastreado
                href={DEWA_SITE}
                target="_blank"
                rel="noreferrer"
                evento="product_click"
                props={{ slug: SLUG, canal: "dewa", produto: p.nome }}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[10px] bg-creme-200 sm:rounded-[10px]">
                  <img
                    src={fotoDewa(p.foto, 700)}
                    alt={p.nome}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1.2s] ease-lux group-hover:scale-[1.05]"
                  />
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-sm text-grafite sm:left-3 sm:top-3 font-semibold">
                    {p.linha}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-medium leading-snug text-grafite sm:text-base">
                  {p.nome}
                </h3>
                <p className="mt-1 text-sm">
                  <span className="font-semibold text-cobre-deep">{p.precoPix}</span>{" "}
                  <span className="text-grafite-muted">no Pix</span>
                </p>
                <p className="text-sm text-grafite-muted">ou {p.preco} no cartão</p>
              </LinkRastreado>
            </motion.div>
          ))}
        </div>

        {/* vantagens da loja */}
        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-grafite/10 bg-grafite/10 sm:mt-14 lg:grid-cols-4">
          {dewaVantagensLoja.map((v) => (
            <div key={v.titulo} className="bg-creme-100 p-5">
              <p className="font-semibold text-grafite">{v.titulo}</p>
              <p className="mt-1 text-sm text-grafite-soft">{v.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CASA DEWA ── */}
      <section className="bg-[#2a211c] py-16 text-perola sm:py-24">
        <div className="mx-auto w-full max-w-[92rem] px-5 sm:px-8">
          <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
            <h2 className="font-display text-[clamp(2.5rem,5.2vw,4.5rem)] leading-[1.05] tracking-[-0.03em]">
              Mais que uma loja: a Casa Dewa
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-perola/70 md:justify-self-end md:text-right">
              Na Vila Oliveira, pertinho de muitos imóveis da Sanchez. Parte das vendas volta
              para quem precisa na cidade.
            </p>
          </div>

          <div className="-mx-5 mt-10 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mt-14 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
            {dewaCasa.map((c) => (
              <figure key={c.titulo} className="w-[80%] shrink-0 snap-start sm:w-[45%] md:w-auto">
                <div className="group aspect-[4/5] overflow-hidden rounded-[10px]">
                  <img
                    src={fotoDewa(c.foto, 800)}
                    alt={c.titulo}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1.2s] ease-lux group-hover:scale-[1.04]"
                  />
                </div>
                <figcaption className="mt-4">
                  <p className="font-display text-lg">{c.titulo}</p>
                  <p className="mt-1 text-sm leading-relaxed text-perola/70">{c.texto}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-4 text-sm text-perola/50 md:hidden font-semibold">
            Deslize para ver mais →
          </p>
        </div>
      </section>

      {/* ── VISITE ── */}
      <section className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid overflow-hidden rounded-[12px] border border-grafite/10 bg-creme md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[30rem]">
            <img
              src={fotoDewa(dewaFotos.fachada, 1000)}
              alt="Fachada da Casa Dewa"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
            <h2 className="h-display text-[clamp(2.25rem,4.5vw,3.5rem)]">Visite a Casa Dewa</h2>
            <ul className="mt-6 space-y-4 text-[15px] text-grafite-soft">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-cobre" strokeWidth={1.5} />
                <span>
                  Av. Laurinda Cardoso Mello Freire, 182
                  <br />
                  Vila Oliveira · Mogi das Cruzes
                </span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-cobre" strokeWidth={1.5} />
                <span>
                  Segunda a sexta, 10h às 19h
                  <br />
                  Sábado, 10h às 14h
                </span>
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkRastreado
                href={DEWA_MAPA}
                target="_blank"
                rel="noreferrer"
                evento="partner_contact"
                props={{ slug: SLUG, canal: "mapa" }}
                className="inline-flex items-center gap-2 rounded-md bg-cobre-deep px-5 text-[15px] font-semibold text-white transition hover:bg-grafite-deep min-h-[3.25rem]"
              >
                <MapPin className="h-4 w-4" strokeWidth={1.6} />
                Como chegar
              </LinkRastreado>
              <LinkRastreado
                href={DEWA_INSTAGRAM}
                target="_blank"
                rel="noreferrer"
                evento="partner_contact"
                props={{ slug: SLUG, canal: "instagram" }}
                className="inline-flex items-center gap-2 rounded-md border border-grafite/15 px-5 text-[15px] font-medium text-grafite transition hover:border-cobre hover:text-cobre-deep min-h-[3.25rem]"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.5} />
                @usedewa
              </LinkRastreado>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHAMADA FINAL ── */}
      {!membro && (
        <section className="mx-auto w-full max-w-[92rem] px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="relative isolate overflow-hidden rounded-[12px] bg-grafite px-6 py-14 text-center text-perola sm:px-10 sm:py-20">
            <img
              src={fotoDewa(dewaFotos.festa, 1400)}
              alt=""
              loading="lazy"
              className="absolute inset-0 -z-10 h-full w-full object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-grafite/80" />
            <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-tight">
              Ainda não é do Sanchez Clube?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-perola/75">
              Cadastre-se de graça e use seu cupom na Dewa e em todos os parceiros do clube.
            </p>
            <Link
              to="/cadastro"
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-cobre-deep px-6 text-[15px] font-semibold text-white transition hover:bg-grafite-deep min-h-[3.25rem]"
            >
              Quero fazer parte
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

// ── caixa do benefício: membro vê o cupom; visitante vê o convite ──
function Beneficio({ membro }: { membro: boolean }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(dewaBeneficio.cupom);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* navegador sem permissão: o cupom continua visível na tela */
    }
  }

  return (
    <div className="flex flex-col justify-between rounded-[10px] border border-cobre-line/40 bg-cobre/10 p-5 sm:p-6">
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-sm text-cobre-deep font-semibold">
            <BadgePercent className="h-4 w-4" strokeWidth={1.5} />
            Sua vantagem
          </p>
          {dewaBeneficio.exemplo && (
            <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-sm font-medium text-grafite-muted">
              valor de exemplo
            </span>
          )}
        </div>
        <p className="mt-3 font-display text-[2.25rem] leading-tight text-grafite sm:text-4xl">
          {dewaBeneficio.titulo}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-grafite-soft">{dewaBeneficio.detalhe}</p>
      </div>

      {membro ? (
        <button
          type="button"
          onClick={copiar}
          className="mt-5 flex items-center justify-between gap-3 rounded-[10px] border border-dashed border-cobre-line bg-white px-4 py-3 text-left transition hover:border-cobre"
        >
          <span>
            <span className="block text-sm text-grafite-muted font-semibold">
              Seu cupom
            </span>
            <span className="text-lg font-semibold text-grafite">
              {dewaBeneficio.cupom}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-cobre-deep">
            {copiado ? (
              <>
                <Check className="h-4 w-4" strokeWidth={1.8} /> Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" strokeWidth={1.5} /> Copiar
              </>
            )}
          </span>
        </button>
      ) : (
        <Link
          to="/cadastro"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-cobre-deep px-5 text-[15px] font-semibold text-white transition hover:bg-grafite-deep min-h-[3.25rem]"
        >
          <span className="sm:hidden">Pegar meu cupom</span>
          <span className="hidden sm:inline">Entrar no clube e pegar o cupom</span>
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
        </Link>
      )}
    </div>
  );
}
