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
    <main className="min-h-screen overflow-x-hidden bg-warm-wash">
      {/* topo: voltar + WhatsApp */}
      <header className="absolute inset-x-0 top-0 z-30 mx-auto flex w-full max-w-[92rem] items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-grafite/30 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-grafite/45"
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
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(145,63%,42%)] px-4 py-2 text-xs font-semibold text-white shadow-lux-sm transition hover:brightness-105"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={1.6} />
          Falar com a Dewa
        </LinkRastreado>
      </header>

      {/* ── TOPO: foto da Casa Dewa ── */}
      <section className="relative">
        <div className="relative h-[78svh] min-h-[30rem] w-full overflow-hidden sm:h-[72vh]">
          <img
            src={fotoDewa(dewaFotos.quintal, 1800)}
            alt="O Quintal da Casa Dewa à noite"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/75" />
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[92rem] px-5 pb-20 sm:px-8 sm:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease }}
              className="max-w-2xl"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-cobre-light" />
                Parceiro Sanchez Clube
              </span>
              <h1 className="mt-4 font-display text-[clamp(2.6rem,9vw,5.5rem)] font-semibold leading-[0.95] text-white">
                Dewa
              </h1>
              <p className="mt-3 font-display text-xl italic text-white/90 sm:text-2xl">
                Onde o bem existe.
              </p>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/80 sm:text-base">
                Moda em algodão, lifestyle e bem-estar, feita em Mogi das Cruzes
                desde 2008. Agora com condição exclusiva para quem é do clube.
              </p>
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
          className="relative z-10 -mt-12 grid gap-6 rounded-[2rem] border border-grafite/10 bg-creme p-6 shadow-lux sm:p-9 lg:grid-cols-[1.4fr_1fr] lg:gap-10"
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cobre-deep">
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
                    className="rounded-full border border-grafite/10 bg-white/60 px-3 py-1 text-xs text-grafite-soft"
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
        <h2 className="h-display text-[clamp(1.75rem,4vw,2.75rem)]">Como usar seu benefício</h2>
        <ol className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-6">
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
              className="rounded-[1.5rem] border border-grafite/10 bg-white/50 p-6"
            >
              <span className="font-mono text-xs font-medium text-cobre-deep">0{i + 1}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-grafite">{p.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-grafite-soft">{p.d}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ── PEÇAS ── */}
      <section className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 sm:py-24">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="h-display text-[clamp(1.75rem,4vw,2.75rem)]">Peças da Dewa</h2>
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
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-creme-200 sm:rounded-[1.5rem]">
                  <img
                    src={fotoDewa(p.foto, 700)}
                    alt={p.nome}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1.2s] ease-lux group-hover:scale-[1.05]"
                  />
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-grafite sm:left-3 sm:top-3 sm:text-[10px]">
                    {p.linha}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-medium leading-snug text-grafite sm:text-base">
                  {p.nome}
                </h3>
                <p className="mt-1 text-sm text-grafite-muted">
                  <span className="text-grafite-soft">{p.preco}</span>{" "}
                  · <span className="font-semibold text-cobre-deep">{p.precoPix}</span> no Pix
                </p>
              </LinkRastreado>
            </motion.div>
          ))}
        </div>

        {/* vantagens da loja */}
        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[1.5rem] border border-grafite/10 bg-grafite/10 sm:mt-14 lg:grid-cols-4">
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
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-tight">
              Mais que uma loja: a Casa Dewa
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-perola/70 md:justify-self-end md:text-right">
              Na Vila Oliveira, pertinho de muitos imóveis da Sanchez. Parte das vendas volta
              para quem precisa na cidade.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:mt-14 md:grid-cols-3">
            {dewaCasa.map((c, i) => (
              <motion.figure
                key={c.titulo}
                {...aparecer}
                transition={{ duration: 0.7, delay: i * 0.1, ease }}
              >
                <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem]">
                  <img
                    src={fotoDewa(c.foto, 800)}
                    alt={c.titulo}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="mt-4">
                  <p className="font-display text-lg font-semibold">{c.titulo}</p>
                  <p className="mt-1 text-sm leading-relaxed text-perola/70">{c.texto}</p>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── VISITE ── */}
      <section className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid overflow-hidden rounded-[2rem] border border-grafite/10 bg-creme shadow-lux md:grid-cols-2">
          <div className="aspect-[4/3] md:aspect-auto">
            <img
              src={fotoDewa(dewaFotos.fachada, 1000)}
              alt="Fachada da Casa Dewa"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <h2 className="h-display text-[clamp(1.6rem,3.5vw,2.4rem)]">Visite a Casa Dewa</h2>
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
                className="inline-flex items-center gap-2 rounded-full bg-cobre px-5 py-3 text-sm font-semibold text-white transition hover:bg-cobre-deep"
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
                className="inline-flex items-center gap-2 rounded-full border border-grafite/15 px-5 py-3 text-sm font-medium text-grafite transition hover:border-cobre hover:text-cobre-deep"
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
          <div className="rounded-[2rem] bg-grafite px-6 py-10 text-center text-perola sm:px-10 sm:py-14">
            <h2 className="font-display text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold">
              Ainda não é do Sanchez Clube?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-perola/75">
              Cadastre-se de graça e use seu cupom na Dewa e em todos os parceiros do clube.
            </p>
            <Link
              to="/cadastro"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-cobre px-6 py-3 text-sm font-semibold text-white transition hover:bg-cobre-deep"
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
    <div className="flex flex-col justify-between rounded-[1.5rem] border border-cobre-line/40 bg-cobre/10 p-5 sm:p-6">
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cobre-deep">
            <BadgePercent className="h-4 w-4" strokeWidth={1.5} />
            Sua vantagem
          </p>
          {dewaBeneficio.exemplo && (
            <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-[10px] font-medium text-grafite-muted">
              valor de exemplo
            </span>
          )}
        </div>
        <p className="mt-3 font-display text-3xl font-semibold text-grafite">
          {dewaBeneficio.titulo}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-grafite-soft">{dewaBeneficio.detalhe}</p>
      </div>

      {membro ? (
        <button
          type="button"
          onClick={copiar}
          className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-cobre-line bg-white px-4 py-3 text-left transition hover:border-cobre"
        >
          <span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-grafite-muted">
              Seu cupom
            </span>
            <span className="font-mono text-lg font-semibold tracking-wider text-grafite">
              {dewaBeneficio.cupom}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-cobre-deep">
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
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-cobre px-5 py-3 text-sm font-semibold text-white transition hover:bg-cobre-deep"
        >
          Entrar no clube e pegar o cupom
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
        </Link>
      )}
    </div>
  );
}
