import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Check, Copy, Globe, Instagram, MapPin, MessageCircle, PlayCircle } from "lucide-react";
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
//
// Visual no padrão do site da Sanchez (12/11): Playfair nos títulos, DM Sans no
// texto, sem degradê, sem sombra, sem rótulo em pílula. As fotos chegam do
// parceiro em qualquer formato (banner 3:1, post 4:5, quadrado), muitas com texto
// por cima; por isso nenhuma foto é cortada: capa e galeria aparecem inteiras, na
// proporção que vieram.
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

const caixa = "mx-auto w-full max-w-[80rem] px-4 sm:px-8";
const botaoClaro =
  "inline-flex min-h-[3.25rem] items-center gap-2 rounded-md border border-grafite/20 px-5 text-[15px] font-medium text-grafite transition hover:border-cobre hover:text-cobre-deep";
const botaoCheio =
  "inline-flex min-h-[3.25rem] items-center gap-2 rounded-md bg-cobre-deep px-5 text-[15px] font-semibold text-white transition hover:bg-grafite";
const tituloSecao = "font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.02em] text-grafite [text-wrap:balance]";

/** Seção com o título à esquerda e o conteúdo ao lado (no celular, um embaixo do outro). */
function Secao({ id, titulo, children }: { id?: string; titulo: string; children: ReactNode }) {
  return (
    <section id={id} className={caixa}>
      <div className="grid gap-8 border-t border-grafite/15 py-14 sm:py-20 lg:grid-cols-12 lg:gap-10">
        <h2 className={`${tituloSecao} lg:col-span-4`}>{titulo}</h2>
        <div className="min-w-0 lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}

export default function PaginaParceiro({ perfil: p, urlFoto, previa, codigo, barra }: Props) {
  const capa = urlFoto(p.capa);
  const [capaLarga, setCapaLarga] = useState(false);
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
  const itens = p.itens.map((i) => ({ ...i, url: urlFoto(i.foto) }));
  // Catálogo com foto vira grade; serviço sem foto vira lista com preço ao lado.
  const itensEmGrade = itens.length > 0 && itens.filter((i) => i.url).length * 2 >= itens.length;
  const temHorario = horarios.length > 0 || c.horaMarcada || !!c.horarioObs;

  return (
    <main className={`min-h-screen overflow-x-hidden bg-creme text-grafite ${barra ? "pb-36" : ""}`}>
      {previa && (
        <div className="sticky top-0 z-40 bg-grafite px-4 py-2.5 text-center text-sm font-semibold text-perola">
          Prévia, ainda não publicada
        </div>
      )}

      {/* topo: voltar + WhatsApp (na prévia não, para não brigar com o botão de fechar) */}
      {!previa && (
        <header className={`${caixa} flex items-center justify-between gap-3 py-4 sm:py-5`}>
          <Link
            to="/"
            className="inline-flex min-h-[2.75rem] items-center gap-2 text-[15px] font-medium text-grafite-soft transition-colors hover:text-cobre-deep"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Sanchez Clube
          </Link>
          {whats && (
            <Saida
              href={whats}
              slug={p.slug}
              canal="whatsapp"
              className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-md border border-grafite/20 px-4 text-sm font-semibold text-grafite transition hover:border-cobre hover:text-cobre-deep"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.6} />
              WhatsApp
            </Saida>
          )}
        </header>
      )}

      {/* ── TOPO: nome à esquerda, foto principal inteira à direita.
           Capa em formato de faixa (banner 3:1, 16:9) vai embaixo do nome, na largura toda. ── */}
      <section className={caixa}>
        <div
          className={`grid items-center gap-10 pb-14 sm:pb-20 lg:gap-14 ${capa && !capaLarga ? "lg:grid-cols-2" : ""} ${previa ? "pt-10" : "pt-6 sm:pt-10"}`}
        >
          <motion.div
            initial={{ y: 12 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="min-w-0"
          >
            {logo && (
              <span className="mb-8 inline-flex h-20 max-w-[16rem] items-center rounded-[10px] bg-[#FBF7F2] px-4 py-3">
                <img src={logo} alt={`Logo: ${p.nome}`} className="h-full w-auto max-w-full object-contain" />
              </span>
            )}
            <p className="text-[15px] font-semibold text-cobre-deep">
              Parceiro Sanchez Clube{p.categoria ? ` · ${p.categoria}` : ""}
            </p>
            <h1 className="mt-3 break-words font-display text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.98] tracking-[-0.025em] text-grafite [text-wrap:balance]">
              {p.nome}
            </h1>
            {p.frase && (
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-grafite-soft sm:text-lg">{p.frase}</p>
            )}
            {destaques.length > 0 && (
              <p className="mt-7 text-sm font-medium leading-relaxed text-grafite-muted">{destaques.join(" · ")}</p>
            )}
            <div className="mt-9 flex flex-wrap gap-3">
              {p.beneficio && (
                <a href="#vantagem" className={botaoCheio}>
                  Ver a vantagem do clube
                </a>
              )}
              {whats && (
                <Saida href={whats} previa={previa} slug={p.slug} canal="whatsapp" className={p.beneficio ? botaoClaro : botaoCheio}>
                  <MessageCircle className="h-4 w-4" strokeWidth={1.6} /> Falar no WhatsApp
                </Saida>
              )}
            </div>
          </motion.div>

          {capa && (
            <div className="min-w-0">
              <img
                src={capa}
                fetchPriority="high"
                alt={p.nome}
                onLoad={(e) => setCapaLarga(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight > 1.6)}
                className={`block h-auto max-w-full rounded-[12px] ${
                  capaLarga ? "w-full" : "mx-auto max-h-[min(78svh,44rem)] w-auto lg:mr-0"
                }`}
              />
            </div>
          )}
        </div>
      </section>

      {/* ── VANTAGEM: a faixa escura da página ── */}
      <Beneficio perfil={p} codigo={codigo} previa={previa} />

      {/* ── SOBRE ── */}
      {(p.sobre || p.diferenciais) && (
        <Secao titulo="Sobre">
          {p.sobre && (
            <p className="max-w-[65ch] whitespace-pre-line text-[17px] leading-[1.7] text-grafite-soft">{p.sobre}</p>
          )}
          {p.diferenciais && (
            <div className="mt-10 max-w-[65ch] border-l-2 border-cobre pl-5 sm:pl-6">
              <h3 className="font-display text-[22px] leading-tight text-grafite sm:text-[26px]">O que nos diferencia</h3>
              <p className="mt-2 whitespace-pre-line text-[16px] leading-[1.7] text-grafite-soft">{p.diferenciais}</p>
            </div>
          )}
          {p.tags.length > 0 && <p className="mt-8 text-sm font-medium text-grafite-muted">{p.tags.join(" · ")}</p>}
        </Secao>
      )}

      {/* ── PRODUTOS E SERVIÇOS ── */}
      {itens.length > 0 && (
        <Secao titulo="Produtos e serviços">
          {itensEmGrade ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3">
              {itens.map((i) => (
                <li key={i.id} className="flex min-w-0 flex-col">
                  <div className="aspect-[4/5] max-w-full overflow-hidden rounded-[10px] bg-creme-100">
                    {i.url ? (
                      <img src={i.url} alt={i.nome} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full place-items-center px-4 text-center font-display text-xl text-grafite-muted">{i.nome}</span>
                    )}
                  </div>
                  <h3 className="mt-3 break-words font-display text-[19px] leading-tight text-grafite sm:text-[22px]">{i.nome}</h3>
                  {i.descricao && <p className="mt-1 text-[15px] leading-relaxed text-grafite-soft">{i.descricao}</p>}
                  {i.preco && <p className="mt-2 text-[15px] font-semibold text-cobre-deep">{i.preco}</p>}
                  {i.video && <Video href={i.video} previa={previa} slug={p.slug} />}
                </li>
              ))}
            </ul>
          ) : (
            <ul className="divide-y divide-grafite/15 border-y border-grafite/15">
              {itens.map((i) => (
                <li key={i.id} className="grid gap-x-8 gap-y-2 py-6 sm:grid-cols-[1fr_auto] sm:py-7">
                  <div className="flex min-w-0 gap-4">
                    {i.url && (
                      <img src={i.url} alt={i.nome} loading="lazy" className="h-20 w-20 shrink-0 rounded-[8px] object-cover" />
                    )}
                    <div className="min-w-0">
                      <h3 className="break-words font-display text-[21px] leading-tight text-grafite sm:text-[24px]">{i.nome}</h3>
                      {i.descricao && <p className="mt-1.5 max-w-[60ch] text-[15px] leading-relaxed text-grafite-soft">{i.descricao}</p>}
                      {i.video && <Video href={i.video} previa={previa} slug={p.slug} />}
                    </div>
                  </div>
                  {i.preco && (
                    <p className="text-[16px] font-semibold tabular-nums text-cobre-deep sm:pt-1 sm:text-right">{i.preco}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Secao>
      )}

      {/* ── FOTOS: em colunas, cada uma inteira na proporção em que veio ── */}
      {galeria.length > 0 && (
        <section className={caixa}>
          <div className="border-t border-grafite/15 py-14 sm:py-20">
            <h2 className={tituloSecao}>Fotos</h2>
            <div className={`mt-10 gap-3 sm:gap-5 ${galeria.length === 1 ? "" : galeria.length === 2 ? "columns-2" : "columns-2 lg:columns-3"}`}>
              {galeria.map((u, i) => (
                <img
                  key={u}
                  src={u}
                  alt={`${p.nome}, foto ${i + 1}`}
                  loading="lazy"
                  className="mb-3 block h-auto w-full break-inside-avoid rounded-[10px] sm:mb-5"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ATENDIMENTO ── */}
      <Secao titulo="Atendimento">
        <dl className="divide-y divide-grafite/15 border-y border-grafite/15 text-[16px]">
          {c.endereco && (
            <Linha rotulo="Endereço">
              {c.endereco}
            </Linha>
          )}
          {temHorario && (
            <Linha rotulo="Horário">
              {aberto !== null && (
                <span className={`mb-1 block font-semibold ${aberto ? "text-[#2a7a52]" : "text-grafite"}`}>
                  {aberto ? "Aberto agora" : "Fechado agora"}
                </span>
              )}
              {horarios.map((h) => (
                <span key={h} className="block tabular-nums">
                  {h}
                </span>
              ))}
              {c.horaMarcada && <span className="block">Com hora marcada</span>}
              {c.horarioObs && <span className="block">{c.horarioObs}</span>}
            </Linha>
          )}
          {c.modalidades.length > 0 && <Linha rotulo="Como atende">{c.modalidades.join(", ")}</Linha>}
          {c.regioes.length > 0 && <Linha rotulo="Regiões">{c.regioes.join(", ")}</Linha>}
          {c.instagram && <Linha rotulo="Instagram">{c.instagram}</Linha>}
        </dl>
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
              <Instagram className="h-4 w-4" strokeWidth={1.5} /> Instagram
            </Saida>
          )}
          {c.site && (
            <Saida href={c.site} previa={previa} slug={p.slug} canal="site" className={botaoClaro}>
              <Globe className="h-4 w-4" strokeWidth={1.5} /> Site
            </Saida>
          )}
        </div>
      </Secao>

      {/* ── CHAMADA FINAL ── */}
      {!codigo.membro && !previa && (
        <section className={caixa}>
          <div className="grid gap-6 border-t border-grafite/15 py-14 sm:py-20 lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="lg:col-span-8">
              <h2 className={tituloSecao}>Ainda não é do Sanchez Clube?</h2>
              <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-grafite-soft">
                O cadastro é de graça e vale para usar a vantagem aqui e em todos os parceiros do clube.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Link to="/cadastro" className={botaoCheio}>
                Quero fazer parte
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {barra}
    </main>
  );
}

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <dt className="text-sm font-semibold text-grafite-muted sm:pt-0.5">{rotulo}</dt>
      <dd className="min-w-0 break-words text-grafite">{children}</dd>
    </div>
  );
}

function Video({ href, previa, slug }: { href: string; previa?: boolean; slug: string }) {
  return (
    <Saida
      href={href}
      previa={previa}
      slug={slug}
      canal="video"
      className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-grafite underline-offset-4 hover:underline"
    >
      <PlayCircle className="h-4 w-4" strokeWidth={1.6} /> Ver vídeo
    </Saida>
  );
}

// ── faixa da vantagem: membro vê o código; visitante vê o convite ──
function Beneficio({ perfil: p, codigo, previa }: { perfil: PerfilPagina; codigo: CodigoMembro; previa?: boolean }) {
  const [copiado, setCopiado] = useState(false);
  if (!p.beneficio) {
    // Página pública só existe com benefício validado; isto aparece na prévia montada antes.
    return (
      <section className={caixa}>
        <div className="mb-14 rounded-[10px] border border-dashed border-grafite/25 p-5 text-[15px] text-grafite-soft sm:p-6">
          Benefício ainda não confirmado.
        </div>
      </section>
    );
  }
  const card = cardBeneficio(p.beneficio.dados);
  const condicoes = condicoesBeneficio(p.beneficio.dados);
  const tituloLongo = card.titulo.length > 28;

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
    <section id="vantagem" className="scroll-mt-4 bg-grafite text-perola">
      <div className={`${caixa} grid gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:gap-10`}>
        <div className="min-w-0 lg:col-span-7">
          <p className="text-[15px] font-semibold text-cobre-light">Sua vantagem no Sanchez Clube</p>
          <p
            className={`mt-4 break-words font-display leading-[1.02] tracking-[-0.02em] [text-wrap:balance] ${
              tituloLongo ? "text-[clamp(2rem,4.2vw,3.25rem)]" : "text-[clamp(3rem,8vw,6rem)]"
            }`}
          >
            {card.titulo}
          </p>
          {card.detalhe && <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-perola/75">{card.detalhe}</p>}
        </div>

        <div className="flex min-w-0 flex-col justify-end gap-7 lg:col-span-5">
          {condicoes.length > 0 && (
            <ul className="flex flex-col gap-2.5 text-[15px] leading-relaxed text-perola/85">
              {condicoes.map((x) => (
                <li key={x} className="flex gap-2.5">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-cobre-light" strokeWidth={2} aria-hidden="true" />
                  <span className="min-w-0 break-words">{x}</span>
                </li>
              ))}
            </ul>
          )}

          {codigo.membro && codigo.codigo ? (
            <button
              type="button"
              onClick={() => void copiar(codigo.codigo!)}
              className="flex items-center justify-between gap-3 rounded-[10px] border border-dashed border-cobre-light/70 px-4 py-3.5 text-left transition hover:border-perola"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-perola/60">{previa ? "Código (membros veem aqui)" : "Seu código"}</span>
                <span className="break-all text-xl font-semibold tracking-wide text-perola">{codigo.codigo}</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-cobre-light">
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
            <p className="border-t border-perola/20 pt-5 text-[15px] text-perola">Você é membro: é só dizer que é do Sanchez Clube.</p>
          ) : (
            <Link
              to="/cadastro"
              className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 self-start rounded-md bg-perola px-6 text-[15px] font-semibold text-grafite transition hover:bg-white"
            >
              {codigo.temCodigo ? "Entrar no clube e pegar o código" : "Entrar no clube"}
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
