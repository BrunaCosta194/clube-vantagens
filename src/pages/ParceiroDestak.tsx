import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Instagram, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import LinkRastreado from "@/components/LinkRastreado";
import { useSessao } from "@/lib/sessao";
import vestidoBranco from "@/assets/parceiros/destak/vestido-branco.jpg";
import logoDestak from "@/assets/parceiros/destak/destak-logo-card.png";
import {
  DESTAK_INSTAGRAM,
  DESTAK_NOME,
  DESTAK_WHATS,
  destakHistoria,
  destakPecas,
} from "@/data/destak";

const ease = [0.22, 1, 0.36, 1] as const;
const SLUG = "destak-office";

const aparecer = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

export default function ParceiroDestak() {
  const { usuario, carregando } = useSessao();
  const membro = !carregando && !!usuario;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-creme">
      {/* topo: voltar + Instagram */}
      <header className="mx-auto flex w-full max-w-[92rem] items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-grafite/15 px-4 py-2 text-sm font-medium text-grafite transition-colors hover:border-cobre hover:text-cobre-deep"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">Voltar ao clube</span>
          <span className="sm:hidden">Clube</span>
        </Link>
        <LinkRastreado
          href={DESTAK_WHATS}
          target="_blank"
          rel="noreferrer"
          evento="partner_contact"
          props={{ slug: SLUG, canal: "whatsapp", lugar: "topo" }}
          className="inline-flex items-center gap-2 rounded-full bg-[#2a9e6a] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={1.6} />
          Falar com a loja
        </LinkRastreado>
      </header>

      {/* ── TOPO: foto + nome ── */}
      <section className="mx-auto grid w-full max-w-[92rem] gap-8 px-4 pb-14 sm:px-8 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-14 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
          className="order-2 min-w-0 md:order-1"
        >
          <div className="flex items-center gap-4">
            <img
              src={logoDestak}
              alt="Logo da Destak Boutique"
              width={600}
              height={600}
              className="h-16 w-16 object-contain sm:h-20 sm:w-20"
            />
            <p className="text-[15px] font-semibold text-cobre-deep">Novo parceiro Sanchez Clube</p>
          </div>
          <h1 className="mt-5 font-display text-[clamp(3.25rem,11vw,7.5rem)] leading-[0.9] tracking-[-0.02em] text-grafite">
            Destak
            <br />
            Boutique
          </h1>
          <p className="mt-5 font-display text-2xl italic text-grafite-soft sm:text-3xl">
            44 anos vestindo gerações.
          </p>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-grafite-soft sm:text-base">
            {destakHistoria}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#pecas"
              className="inline-flex min-h-[3.25rem] items-center gap-2 rounded-md bg-cobre-deep px-6 text-[15px] font-semibold text-white transition hover:bg-grafite-deep"
            >
              Ver as peças
            </a>
            <LinkRastreado
              href={DESTAK_INSTAGRAM}
              target="_blank"
              rel="noreferrer"
              evento="partner_contact"
              props={{ slug: SLUG, canal: "instagram", lugar: "topo" }}
              className="inline-flex min-h-[3.25rem] items-center gap-2 rounded-md border border-grafite/15 px-6 text-[15px] font-medium text-grafite transition hover:border-cobre hover:text-cobre-deep"
            >
              <Instagram className="h-4 w-4" strokeWidth={1.5} />
              @destak_office
            </LinkRastreado>
          </div>
        </motion.div>

        <div className="order-1 min-w-0 md:order-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[34rem] overflow-hidden rounded-[12px] bg-creme-200">
            <motion.img
              initial={{ scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease }}
              src={vestidoBranco}
              fetchPriority="high"
              alt={`Modelo com vestido longo de um ombro só, andando na praia, ${DESTAK_NOME}`}
              className="h-full w-full object-cover object-[50%_20%]"
            />
          </div>
        </div>
      </section>

      {/* ── PEÇAS ── */}
      <section id="pecas" className="mx-auto w-full max-w-[92rem] scroll-mt-6 px-4 pb-16 pt-4 sm:px-8 sm:pb-24 sm:pt-8">
        <p className="text-sm font-semibold text-cobre-deep">Seleção da Yruena</p>
        <h2 className="h-display mt-2 text-[clamp(2.5rem,5.2vw,4.5rem)]">Peças para a estação</h2>

        <div className="mt-10 grid gap-16 sm:mt-14 md:gap-24">
          {destakPecas.map((p, i) => (
            <motion.article
              key={p.nome}
              {...aparecer}
              transition={{ duration: 0.8, ease }}
              className="grid gap-6 md:grid-cols-2 md:items-center md:gap-14"
            >
              <div className={`min-w-0 ${i % 2 === 1 ? "md:order-2" : ""}`}>
                <div
                  className={`mx-auto w-full max-w-[30rem] overflow-hidden rounded-[12px] bg-creme-200 ${p.proporcao}`}
                >
                  <img src={p.foto} alt={p.alt} loading="lazy" className="h-full w-full object-cover" />
                </div>
              </div>

              <div className="min-w-0 md:max-w-lg">
                <h3 className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.05] text-grafite">
                  {p.nome}
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-grafite-soft sm:text-base">
                  {p.descricao}
                </p>

                <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-grafite/10 bg-grafite/10">
                  <div className="bg-creme-100 p-4 sm:p-5">
                    <dt className="text-sm text-grafite-muted">Preço</dt>
                    <dd className="mt-1 font-display text-2xl text-grafite tabular-nums sm:text-3xl">
                      {p.preco}
                    </dd>
                  </div>
                  <div className="bg-creme-100 p-4 sm:p-5">
                    <dt className="text-sm text-grafite-muted">Tamanhos</dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {p.tamanhos.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-grafite/15 bg-white/70 px-3 py-1 text-sm font-semibold text-grafite"
                        >
                          {t}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>

                <LinkRastreado
                  href={DESTAK_WHATS}
                  target="_blank"
                  rel="noreferrer"
                  evento="product_click"
                  props={{ slug: SLUG, canal: "whatsapp", produto: p.nome }}
                  className="mt-6 inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-md bg-grafite px-6 text-[15px] font-semibold text-perola transition hover:bg-cobre-deep sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={1.6} />
                  Quero esta peça
                </LinkRastreado>
                <p className="mt-3 text-sm text-grafite-muted">
                  Abre a conversa com a loja no WhatsApp. Diga que veio pelo Sanchez Clube.
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── COMO USAR ── */}
      <section className="mx-auto w-full max-w-[92rem] px-4 pb-16 sm:px-8 sm:pb-24">
        <h2 className="h-display text-[clamp(2.25rem,4.5vw,3.5rem)]">Como comprar</h2>
        <ol className="mt-8 grid gap-2 sm:grid-cols-3">
          {[
            {
              t: "Escolha a peça",
              d: "Veja o modelo, o tamanho e o preço aqui na página.",
            },
            {
              t: "Chame no WhatsApp",
              d: "Toque em \"Quero esta peça\" e fale direto com a Destak Boutique.",
            },
            {
              t: "Diga que veio pelo clube",
              d: "Assim a loja sabe que você é do Sanchez Clube.",
            },
          ].map((p) => (
            <li key={p.t} className="rounded-[10px] bg-creme-100 px-6 py-7 sm:px-8 sm:py-9">
              <h3 className="font-display text-[clamp(1.5rem,2.2vw,1.9rem)] leading-tight text-grafite">
                {p.t}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-grafite">{p.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── CHAMADA FINAL ── */}
      {!membro && (
        <section className="bg-grafite py-16 text-center text-perola sm:py-20">
          <div className="mx-auto w-full max-w-2xl px-4 sm:px-8">
            <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-tight">
              Ainda não é do Sanchez Clube?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-perola/75">
              Cadastre-se de graça e aproveite as vantagens dos parceiros do clube.
            </p>
            <Link
              to="/cadastro"
              className="mt-7 inline-flex min-h-[3.25rem] items-center gap-2 rounded-md bg-cobre-deep px-6 text-[15px] font-semibold text-white transition hover:bg-cobre"
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
