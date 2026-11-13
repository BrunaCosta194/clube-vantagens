import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgePercent,
  Check,
  Clock,
  Copy,
  Globe,
  Instagram,
  MapPin,
  MessageCircle,
  PlayCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import LinkRastreado from "@/components/LinkRastreado";
import { cardBeneficio } from "../../supabase/functions/_shared/parceiro-cadastro.ts";
import {
  abertoAgora,
  condicoesBeneficio,
  horariosTexto,
  linkInstagram,
  linkMapa,
  linkWhatsApp,
  type PerfilPagina,
} from "../../supabase/functions/_shared/parceiro-pagina.ts";

// ─────────────────────────────────────────────────────────────
// MODELO ÚNICO DA PÁGINA DO PARCEIRO (/parceiro/:slug).
// O mesmo componente mostra a página publicada, a prévia que o parceiro aprova
// pelo link e a prévia do painel. Nada aqui busca dados: quem usa passa o perfil
// e como achar o endereço de cada foto.
// ─────────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as const;

export interface CodigoMembro {
  /** Visitante logado? */
  membro: boolean;
  /** Código de desconto (só para membro). */
  codigo: string | null;
  /** O benefício usa código? (visitante não vê o código, mas sabe que existe) */
  temCodigo: boolean;
}

interface Props {
  perfil: PerfilPagina;
  urlFoto: (caminho: string | null) => string | null;
  /** Prévia: faixa no topo, sem contar cliques nas estatísticas. */
  previa?: boolean;
  codigo: CodigoMembro;
  /** Barra fixa no rodapé (botões de aprovar, na prévia do parceiro). */
  barra?: ReactNode;
}

function Saida({
  href,
  previa,
  slug,
  canal,
  className,
  children,
}: {
  href: string;
  previa?: boolean;
  slug: string;
  canal: string;
  className: string;
  children: ReactNode;
}) {
  if (previa) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <LinkRastreado
      href={href}
      target="_blank"
      rel="noreferrer"
      evento="partner_contact"
      props={{ slug, canal }}
      className={className}
    >
      {children}
    </LinkRastreado>
  );
}

const botaoClaro =
  "inline-flex min-h-[3.25rem] items-center gap-2 rounded-md border border-grafite/15 px-5 text-[15px] font-medium text-grafite transition hover:border-cobre hover:text-cobre-deep";
const botaoCheio =
  "inline-flex min-h-[3.25rem] items-center gap-2 rounded-md bg-cobre-deep px-5 text-[15px] font-semibold text-white transition hover:bg-grafite-deep";

export default function PaginaParceiro({ perfil: p, urlFoto, previa, codigo, barra }: Props) {
  const capa = urlFoto(p.capa);
  const logo = urlFoto(p.logo);
  const c = p.contato;
  const whats = linkWhatsApp(c.whatsapp, `Olá! Vi a página de vocês no Sanchez Clube.`);
  const insta = linkInstagram(c.instagram);
  const mapa = linkMapa(c.endereco);
  const horarios = horariosTexto(c.horarios);
  const aberto = abertoAgora(c.horarios);
  const anos = p.anoFundacao ? new Date().getFullYear() - Number(p.anoFundacao) : 0;
  const destaques = [
    anos >= 2 ? `Há ${anos} anos` : p.anoFundacao ? `Desde ${p.anoFundacao}` : "",
    p.cidade,
    c.modalidades.join(" · "),
  ].filter(Boolean);
  const galeria = p.galeria.map((f) => urlFoto(f)).filter((u): u is string => !!u);
  const temVisita = !!(c.endereco || horarios.length || c.horaMarcada || c.regioes.length);

  return (
    <main className={`min-h-screen overflow-x-hidden bg-creme ${barra ? "pb-36" : ""}`}>
      {previa && (
        <div className="sticky top-0 z-40 bg-grafite px-4 py-2.5 text-center text-sm font-semibold text-perola">
          Prévia, ainda não publicada
        </div>
      )}

      {/* topo: voltar + WhatsApp */}
      <header
        className={`absolute inset-x-0 z-30 mx-auto flex w-full max-w-[92rem] items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5 ${previa ? "top-10" : "top-0"}`}
      >
        {previa ? (
          <span />
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/55"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Voltar ao clube</span>
            <span className="sm:hidden">Clube</span>
          </Link>
        )}
        {whats && (
          <Saida
            href={whats}
            previa={previa}
            slug={p.slug}
            canal="whatsapp"
            className="inline-flex items-center gap-2 rounded-full bg-[#2a9e6a] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.6} />
            <span>Falar no WhatsApp</span>
          </Saida>
        )}
      </header>

      {/* ── TOPO: foto principal ── */}
      <section className="relative">
        <div className="relative h-[78svh] min-h-[30rem] max-h-[52rem] w-full overflow-hidden bg-grafite sm:h-[72vh]">
          {capa && (
            <motion.img
              initial={{ scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease }}
              src={capa}
              fetchPriority="high"
              alt={p.nome}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/45" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-black/60 via-black/15 to-transparent md:block" />

          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[92rem] px-5 pb-24 sm:px-8 sm:pb-28">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease }}
              className="max-w-2xl"
            >
              <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-cobre-light" />
                Parceiro Sanchez Clube{p.categoria ? ` · ${p.categoria}` : ""}
              </span>
              <h1 className="mt-5 break-words font-display text-[clamp(3rem,11vw,7rem)] leading-[0.92] tracking-[-0.02em] text-white">
                {p.nome}
              </h1>
              {p.frase && <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-white/85 sm:text-lg">{p.frase}</p>}
              {destaques.length > 0 && (
                <ul className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/20 pt-5 text-sm font-semibold text-white/75">
                  {destaques.map((d, i) => (
                    <li key={d} className="flex items-center gap-4">
                      {i > 0 && <span aria-hidden className="h-3 w-px bg-white/30" />}
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SOBRE + BENEFÍCIO ── */}
      <section className="mx-auto w-full max-w-[92rem] px-4 sm:px-8">
        <div className="relative z-10 -mt-14 grid gap-6 rounded-[12px] border border-grafite/10 bg-creme p-5 sm:p-9 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
          <div className="min-w-0">
            <div className="flex items-center gap-4">
              {logo && (
                <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-[#FBF7F2] p-2 sm:h-20 sm:w-20">
                  <img src={logo} alt={`Logo: ${p.nome}`} className="h-full w-full object-contain" />
                </span>
              )}
              <p className="text-sm font-semibold text-cobre-deep">Sobre a empresa</p>
            </div>
            {p.sobre && <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-grafite-soft sm:text-base">{p.sobre}</p>}
            {p.diferenciais && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-grafite">Diferenciais</p>
                <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-grafite-soft sm:text-base">{p.diferenciais}</p>
              </div>
            )}
            {p.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-full border border-grafite/10 bg-white/60 px-3 py-1 text-sm text-grafite-soft">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Beneficio perfil={p} codigo={codigo} previa={previa} />
        </div>
      </section>

      {/* ── PRODUTOS E SERVIÇOS ── */}
      {p.itens.length > 0 && (
        <section className="mx-auto w-full max-w-[92rem] px-5 pt-16 sm:px-8 sm:pt-24">
          <h2 className="h-display text-[clamp(2.25rem,4.8vw,4rem)]">Produtos e serviços</h2>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:mt-12 sm:gap-x-6 lg:grid-cols-4">
            {p.itens.map((i) => {
              const f = urlFoto(i.foto);
              return (
                <li key={i.id} className="min-w-0">
                  {f && (
                    <div className="aspect-square overflow-hidden rounded-[10px] bg-creme-100">
                      <img src={f} alt={i.nome} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <h3 className={`${f ? "mt-3" : ""} break-words font-display text-[20px] leading-tight text-grafite sm:text-[22px]`}>{i.nome}</h3>
                  {i.descricao && <p className="mt-1 text-[15px] leading-relaxed text-grafite-soft">{i.descricao}</p>}
                  {i.preco && <p className="mt-2 text-[15px] font-semibold text-cobre-deep">{i.preco}</p>}
                  {i.video && (
                    <Saida href={i.video} previa={previa} slug={p.slug} canal="video" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-grafite underline-offset-4 hover:underline">
                      <PlayCircle className="h-4 w-4" strokeWidth={1.6} /> Ver vídeo
                    </Saida>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ── GALERIA ── */}
      {galeria.length > 0 && (
        <section className="mx-auto w-full max-w-[92rem] px-5 pt-16 sm:px-8 sm:pt-24">
          <h2 className="h-display text-[clamp(2.25rem,4.8vw,4rem)]">Fotos</h2>
          <div className="-mx-5 mt-10 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mt-12 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
            {galeria.map((u, i) => (
              <div key={u} className="aspect-[4/5] w-[80%] shrink-0 snap-start overflow-hidden rounded-[10px] sm:w-[45%] md:w-auto">
                <img src={u} alt={`${p.nome}, foto ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
          {galeria.length > 1 && <p className="mt-4 text-sm font-semibold text-grafite-muted md:hidden">Deslize para ver mais →</p>}
        </section>
      )}

      {/* ── ONDE ENCONTRAR ── */}
      <section className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 sm:py-24">
        <div className="rounded-[12px] border border-grafite/10 bg-creme-100 p-6 sm:p-10 lg:p-14">
          <h2 className="h-display text-[clamp(2.25rem,4.5vw,3.5rem)]">Atendimento</h2>
          {temVisita && (
            <ul className="mt-6 grid gap-5 text-[15px] text-grafite-soft md:grid-cols-2">
              {c.endereco && (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-cobre" strokeWidth={1.5} />
                  <span>{c.endereco}</span>
                </li>
              )}
              {(horarios.length > 0 || c.horaMarcada || c.horarioObs) && (
                <li className="flex gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-cobre" strokeWidth={1.5} />
                  <span>
                    {aberto !== null && (
                      <span className={`mb-1 block font-semibold ${aberto ? "text-[#2a7a52]" : "text-grafite"}`}>
                        {aberto ? "Aberto agora" : "Fechado agora"}
                      </span>
                    )}
                    {horarios.map((h) => (
                      <span key={h} className="block">
                        {h}
                      </span>
                    ))}
                    {c.horaMarcada && <span className="block">Atendimento com hora marcada</span>}
                    {c.horarioObs && <span className="block">{c.horarioObs}</span>}
                  </span>
                </li>
              )}
              {c.regioes.length > 0 && (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-cobre" strokeWidth={1.5} />
                  <span>Atende em {c.regioes.join(", ")}</span>
                </li>
              )}
            </ul>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {whats && (
              <Saida href={whats} previa={previa} slug={p.slug} canal="whatsapp" className={botaoCheio}>
                <MessageCircle className="h-4 w-4" strokeWidth={1.6} /> WhatsApp
              </Saida>
            )}
            {mapa && (
              <Saida href={mapa} previa={previa} slug={p.slug} canal="mapa" className={botaoClaro}>
                <MapPin className="h-4 w-4" strokeWidth={1.6} /> Como chegar
              </Saida>
            )}
            {insta && (
              <Saida href={insta} previa={previa} slug={p.slug} canal="instagram" className={botaoClaro}>
                <Instagram className="h-4 w-4" strokeWidth={1.5} /> {c.instagram}
              </Saida>
            )}
            {c.site && (
              <Saida href={c.site} previa={previa} slug={p.slug} canal="site" className={botaoClaro}>
                <Globe className="h-4 w-4" strokeWidth={1.5} /> Site
              </Saida>
            )}
          </div>
        </div>
      </section>

      {/* ── CHAMADA FINAL ── */}
      {!codigo.membro && !previa && (
        <section className="mx-auto w-full max-w-[92rem] px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="rounded-[12px] bg-grafite px-6 py-14 text-center text-perola sm:px-10 sm:py-20">
            <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-tight">Ainda não é do Sanchez Clube?</h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-perola/75">
              Cadastre-se de graça e use seu benefício aqui e em todos os parceiros do clube.
            </p>
            <Link to="/cadastro" className="mt-7 inline-flex min-h-[3.25rem] items-center gap-2 rounded-md bg-cobre-deep px-6 text-[15px] font-semibold text-white transition hover:bg-grafite-deep">
              Quero fazer parte
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
            </Link>
          </div>
        </section>
      )}

      {barra}
    </main>
  );
}

// ── caixa do benefício: membro vê o código; visitante vê o convite ──
function Beneficio({ perfil: p, codigo, previa }: { perfil: PerfilPagina; codigo: CodigoMembro; previa?: boolean }) {
  const [copiado, setCopiado] = useState(false);
  if (!p.beneficio) {
    return (
      <div className="rounded-[10px] border border-dashed border-grafite/20 p-5 text-[15px] text-grafite-soft sm:p-6">
        Benefício ainda não confirmado.
      </div>
    );
  }
  const card = cardBeneficio(p.beneficio.dados);
  const condicoes = condicoesBeneficio(p.beneficio.dados);

  async function copiar(texto: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* navegador sem permissão: o código continua visível */
    }
  }

  return (
    <div className="flex min-w-0 flex-col justify-between rounded-[10px] border border-cobre-line/40 bg-cobre/10 p-5 sm:p-6">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-cobre-deep">
          <BadgePercent className="h-4 w-4" strokeWidth={1.5} />
          Sua vantagem
        </p>
        <p className="mt-3 break-words font-display text-[2.1rem] leading-tight text-grafite sm:text-4xl">{card.titulo}</p>
        {card.detalhe && <p className="mt-1 text-[15px] leading-relaxed text-grafite-soft">{card.detalhe}</p>}
        {condicoes.length > 0 && (
          <ul className="mt-4 flex flex-col gap-1.5 text-[15px] leading-relaxed text-grafite-soft">
            {condicoes.map((x) => (
              <li key={x} className="flex gap-2">
                <Check className="mt-1 h-4 w-4 shrink-0 text-cobre-deep" strokeWidth={2} aria-hidden="true" />
                <span className="min-w-0 break-words">{x}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {codigo.membro && codigo.codigo ? (
        <button
          type="button"
          onClick={() => void copiar(codigo.codigo!)}
          className="mt-5 flex items-center justify-between gap-3 rounded-[10px] border border-dashed border-cobre-line bg-white px-4 py-3 text-left transition hover:border-cobre"
        >
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-grafite-muted">{previa ? "Código (membros veem aqui)" : "Seu código"}</span>
            <span className="break-all text-lg font-semibold text-grafite">{codigo.codigo}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-cobre-deep">
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
      ) : codigo.membro ? (
        <p className="mt-5 rounded-[10px] bg-white px-4 py-3 text-[15px] text-grafite">Você é membro: é só dizer que é do Sanchez Clube.</p>
      ) : (
        <Link
          to="/cadastro"
          className="mt-5 inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-md bg-cobre-deep px-5 text-[15px] font-semibold text-white transition hover:bg-grafite-deep"
        >
          {codigo.temCodigo ? "Entrar no clube e pegar o código" : "Entrar no clube"}
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
        </Link>
      )}
    </div>
  );
}
