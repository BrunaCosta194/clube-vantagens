import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Eye, ImagePlus, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import PaginaParceiro from "@/components/PaginaParceiro";
import type { Ficha } from "@/lib/painelParceiros";
import {
  baixarDoParceiro,
  fotoProcessavel,
  limparFotosSoltas,
  linksDasFotos,
  salvarPerfil,
  subirFotoPagina,
} from "@/lib/painelPagina";
import { SEGMENTOS } from "../../../supabase/functions/_shared/parceiro-cadastro.ts";
import {
  GALERIA_MAX,
  ITENS_PAGINA_MAX,
  SLUGS_RESERVADOS,
  faltaNaPagina,
  fotosDoPerfil,
  horariosTexto,
  limparPerfil,
  perfilDasRespostas,
  slugValido,
  type ItemPagina,
  type PerfilPagina,
} from "../../../supabase/functions/_shared/parceiro-pagina.ts";

// ─────────────────────────────────────────────────────────────
// Seção "Página" da ficha do parceiro (/admin/parceiros).
// Quem tem o papel `parceiros` monta e edita; quem só tem `validacao` vê a prévia.
// As respostas do parceiro ficam intactas: a página é uma cópia editável.
// ─────────────────────────────────────────────────────────────

type Alvo = "logo" | "capa" | "galeria" | { item: string };

const campo = "min-h-11 w-full rounded-md border border-grafite/20 bg-white px-3 text-[15px] text-grafite";
const area = "min-h-24 w-full rounded-md border border-grafite/20 bg-white px-3 py-2 text-[15px] text-grafite";
const botao =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-grafite/20 bg-white px-4 text-[15px] font-semibold text-grafite transition hover:border-grafite/40 disabled:opacity-50";
const iconeBotao = "grid h-9 w-9 place-items-center rounded-md border border-grafite/15 bg-white text-grafite disabled:opacity-40";

const ANTES_DE_ENVIAR = ["convite_enviado", "cadastro_iniciado", "arquivado"];
const JA_FOI_AO_PARCEIRO = ["aguardando_aprovacao", "aprovado", "publicado"];

const dataHora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "";

function novoId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
}

function Rotulo({ r, dica, children }: { r: string; dica?: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-sm font-semibold text-grafite">
        {r} {dica && <span className="font-normal text-grafite-muted">({dica})</span>}
      </span>
      {children}
    </label>
  );
}

export default function EditorPagina({
  ficha,
  podeEditar,
  urlsDoParceiro,
  onSalvou,
}: {
  ficha: Ficha;
  podeEditar: boolean;
  urlsDoParceiro: Map<string, string>;
  onSalvou: () => Promise<void> | void;
}) {
  const c = ficha.cadastro;
  const salvo = useMemo(() => (ficha.perfil ? limparPerfil(ficha.perfil.conteudo) : null), [ficha.perfil]);
  const [perfil, setPerfil] = useState<PerfilPagina | null>(salvo);
  const [sujo, setSujo] = useState(false);
  const [fotos, setFotos] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [escolhendo, setEscolhendo] = useState<Alvo | null>(null);
  const [previa, setPrevia] = useState(false);

  useEffect(() => {
    setPerfil(salvo);
    setSujo(false);
  }, [salvo]);

  // Links das fotos da página (bucket privado), conforme aparecem.
  const caminhos = perfil ? fotosDoPerfil(perfil) : [];
  const faltamLinks = caminhos.filter((x) => !fotos[x]).join("|");
  useEffect(() => {
    if (!faltamLinks) return;
    void linksDasFotos(faltamLinks.split("|")).then((m) => setFotos((f) => ({ ...f, ...m })));
  }, [faltamLinks]);

  const editavel = podeEditar && !ANTES_DE_ENVIAR.includes(c.status);
  const imagensDoParceiro = ficha.arquivos.filter((a) => fotoProcessavel(a.mime));

  function mudar(patch: Partial<PerfilPagina>) {
    setPerfil((p) => (p ? { ...p, ...patch } : p));
    setSujo(true);
  }
  function mudarContato(patch: Partial<PerfilPagina["contato"]>) {
    setPerfil((p) => (p ? { ...p, contato: { ...p.contato, ...patch } } : p));
    setSujo(true);
  }
  function mudarItem(id: string, patch: Partial<ItemPagina>) {
    setPerfil((p) => (p ? { ...p, itens: p.itens.map((i) => (i.id === id ? { ...i, ...patch } : i)) } : p));
    setSujo(true);
  }

  async function gravar(p: PerfilPagina, msg: string) {
    await salvarPerfil(c.id, p);
    await limparFotosSoltas(c.id, fotosDoPerfil(p)).catch(() => undefined);
    setSujo(false);
    setAviso(msg);
    await onSalvou();
  }

  function erroDoBanco(e: unknown): string {
    const m = (e as { message?: string })?.message ?? "";
    if (/endereço|foto inválida|página só pode/.test(m)) return m.charAt(0).toUpperCase() + m.slice(1) + ".";
    return "Não foi possível salvar agora. Tente de novo.";
  }

  /** Primeira versão: respostas + fotos do parceiro, já reprocessadas. */
  async function montar() {
    setOcupado("Montando a página e preparando as fotos…");
    setAviso(null);
    const p = perfilDasRespostas(c.respostas, c.convite_empresa);
    const problemas: string[] = [];
    const importar = async (caminho: string, logo: boolean, nome: string) => {
      try {
        const r = await subirFotoPagina(c.id, await baixarDoParceiro(caminho), logo);
        if (!r) problemas.push(`${nome}: o navegador não abriu o arquivo`);
        return r;
      } catch {
        problemas.push(`${nome}: falhou ao copiar`);
        return null;
      }
    };
    const doTipo = (t: string) => imagensDoParceiro.filter((a) => a.tipo === t && a.usar !== false);
    const logo = ficha.arquivos.find((a) => a.tipo === "logo");
    if (logo && fotoProcessavel(logo.mime)) p.logo = await importar(logo.caminho, true, "Logo");
    else if (logo) problemas.push("Logo em PDF, AI ou EPS: converta para PNG e suba aqui");
    const capa = doTipo("capa")[0];
    if (capa) p.capa = await importar(capa.caminho, false, "Foto principal");
    for (const g of doTipo("galeria").slice(0, GALERIA_MAX)) {
      const r = await importar(g.caminho, false, g.nome);
      if (r) p.galeria.push(r);
    }
    for (const it of p.itens) {
      const f = doTipo("item").find((a) => a.item_id === it.id);
      if (f) it.foto = await importar(f.caminho, false, it.nome);
    }
    try {
      await gravar(p, problemas.length ? `Página montada. Atenção: ${problemas.join("; ")}.` : "Página montada. Revise os textos e salve.");
    } catch (e) {
      setPerfil(p);
      setSujo(true);
      setAviso(erroDoBanco(e));
    } finally {
      setOcupado(null);
    }
  }

  async function salvar() {
    if (!perfil) return;
    setOcupado("Salvando…");
    setAviso(null);
    try {
      await gravar(perfil, "Página salva.");
    } catch (e) {
      setAviso(erroDoBanco(e));
    } finally {
      setOcupado(null);
    }
  }

  async function usarFoto(alvo: Alvo, origem: Blob) {
    setEscolhendo(null);
    setOcupado("Preparando a foto…");
    setAviso(null);
    try {
      const caminho = await subirFotoPagina(c.id, origem, alvo === "logo");
      if (!caminho) {
        setAviso("O navegador não conseguiu abrir esse arquivo. Use JPG, PNG ou WEBP (logo em PDF/AI/EPS: converta para PNG antes).");
        return;
      }
      if (alvo === "logo") mudar({ logo: caminho });
      else if (alvo === "capa") mudar({ capa: caminho });
      else if (alvo === "galeria") setPerfil((p) => (p ? { ...p, galeria: [...p.galeria, caminho].slice(0, GALERIA_MAX) } : p));
      else mudarItem(alvo.item, { foto: caminho });
      setSujo(true);
    } catch {
      setAviso("Não foi possível subir a foto. Tente de novo.");
    } finally {
      setOcupado(null);
    }
  }

  // ── sem página ainda ─────────────────────────────────────────────────────
  if (!perfil) {
    return (
      <div className="flex flex-col gap-3">
        {ANTES_DE_ENVIAR.includes(c.status) ? (
          <p>A página pode ser montada depois que o parceiro enviar o cadastro.</p>
        ) : podeEditar ? (
          <>
            <p>
              Monta a primeira versão com as respostas e as fotos do parceiro (reprocessadas: sai a localização e qualquer dado
              escondido). Depois é só revisar os textos.
            </p>
            <button type="button" className="btn-primary self-start" disabled={!!ocupado} onClick={() => void montar()}>
              {ocupado ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="h-4 w-4" aria-hidden="true" />}
              Montar a página com as respostas
            </button>
          </>
        ) : (
          <p>A equipe ainda não montou a página.</p>
        )}
        {ocupado && <p className="text-sm text-grafite-muted">{ocupado}</p>}
        {aviso && <p className="rounded-md bg-creme-100 px-4 py-3 text-grafite">{aviso}</p>}
      </div>
    );
  }

  const falta = faltaNaPagina(perfil);
  const slugProblema = !slugValido(perfil.slug)
    ? "use letras minúsculas, números e hífen"
    : SLUGS_RESERVADOS.includes(perfil.slug)
      ? "já é de uma página feita à mão"
      : "";
  const versao = ficha.beneficio_versoes.find((v) => v.id === perfil.beneficio?.versao_id);
  const ultima = ficha.aprovacoes[0];
  const urlFoto = (x: string | null) => (x ? fotos[x] ?? null : null);

  const Foto = ({ caminho, alvo, logo }: { caminho: string | null; alvo: Alvo; logo?: boolean }) => (
    <div className="flex flex-col gap-2">
      {caminho && urlFoto(caminho) ? (
        <img
          src={urlFoto(caminho)!}
          alt=""
          className={`aspect-[4/3] w-full rounded border border-grafite/10 bg-creme-100 ${logo ? "object-contain p-2" : "object-cover"}`}
        />
      ) : (
        <span className="grid aspect-[4/3] w-full place-items-center rounded border border-dashed border-grafite/25 text-sm text-grafite-muted">
          sem foto
        </span>
      )}
      {editavel && (
        <button type="button" className="text-left text-sm font-semibold text-cobre-deep" onClick={() => setEscolhendo(alvo)}>
          {caminho ? "Trocar" : "Escolher foto"}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* situação */}
      <div className="flex flex-col gap-1 text-[15px]">
        {ficha.perfil && <p>Salva em {dataHora(ficha.perfil.updated_at)}.</p>}
        {ficha.perfil?.publicado_em && (
          <p>
            <span className="font-semibold text-grafite">No ar desde {dataHora(ficha.perfil.publicado_em)}</span>
            {ficha.perfil.publicado_hash === ficha.perfil.conteudo_hash
              ? " (é esta versão)."
              : ": a versão no ar é anterior às últimas mudanças; ela continua no ar até a nova ser publicada."}{" "}
            <a className="font-semibold text-cobre-deep underline underline-offset-4" href={`/parceiro/${salvo?.slug}`} target="_blank" rel="noreferrer">
              Abrir a página
            </a>
          </p>
        )}
        {ultima && (
          <p>
            <span className="font-semibold text-grafite">
              {ultima.decisao === "aprovado" ? "Aprovada" : "Ajuste pedido"} por {ultima.nome} em {dataHora(ultima.criado_em)}
            </span>
            {ultima.conteudo_hash === ficha.perfil?.conteudo_hash ? " (esta versão)" : " (numa versão anterior)"}
            {ultima.comentario ? `: “${ultima.comentario}”` : "."}
          </p>
        )}
        <p>
          <span className="font-semibold text-grafite">Benefício na página:</span>{" "}
          {versao
            ? `versão confirmada em ${dataHora(versao.confirmado_em)} (${versao.situacao === "validado" ? "validada" : versao.situacao === "confirmado" ? "aguardando a validação" : "substituída: salve de novo para atualizar"}).`
            : "o parceiro ainda não confirmou. Ele vem do cadastro e não é editado aqui."}
        </p>
        {falta.length > 0 && <p className="font-semibold text-terracota-600">Falta para mandar para a validação: {falta.join(", ")}.</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={botao} onClick={() => setPrevia(true)}>
          <Eye className="h-4 w-4" aria-hidden="true" /> Ver prévia
        </button>
        {editavel && (
          <button type="button" className="btn-primary" disabled={!sujo || !!ocupado || !!slugProblema} onClick={() => void salvar()}>
            {ocupado === "Salvando…" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {sujo ? "Salvar a página" : "Salvo"}
          </button>
        )}
      </div>
      {editavel && JA_FOI_AO_PARCEIRO.includes(c.status) && (
        <p className="rounded-md bg-creme-100 px-4 py-3 text-sm text-grafite">
          A página já foi para o parceiro. Salvar uma mudança volta o status para “Em preparação”: ela precisa de nova validação e
          nova aprovação{c.status === "publicado" ? ". A versão publicada continua no ar até lá" : ""}.
        </p>
      )}
      {ocupado && ocupado !== "Salvando…" && <p className="text-sm text-grafite-muted">{ocupado}</p>}
      {aviso && (
        <p className="rounded-md bg-creme-100 px-4 py-3 text-grafite" role="status">
          {aviso}
        </p>
      )}

      {/* texto e endereço */}
      <fieldset disabled={!editavel} className="grid gap-4 sm:grid-cols-2">
        <Rotulo r="Nome">
          <input className={campo} value={perfil.nome} maxLength={120} onChange={(e) => mudar({ nome: e.target.value })} />
        </Rotulo>
        <Rotulo r="Endereço da página" dica={slugProblema || `/parceiro/${perfil.slug}`}>
          <input
            className={`${campo} ${slugProblema ? "border-terracota-600" : ""}`}
            value={perfil.slug}
            maxLength={60}
            onChange={(e) => mudar({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
          />
        </Rotulo>
        <Rotulo r="Categoria">
          <input className={campo} list="segmentos-pagina" value={perfil.categoria} maxLength={60} onChange={(e) => mudar({ categoria: e.target.value })} />
          <datalist id="segmentos-pagina">
            {SEGMENTOS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Rotulo>
        <div className="grid grid-cols-2 gap-4">
          <Rotulo r="Fundada em">
            <input className={campo} inputMode="numeric" value={perfil.anoFundacao} maxLength={4} onChange={(e) => mudar({ anoFundacao: e.target.value.replace(/\D/g, "") })} />
          </Rotulo>
          <Rotulo r="Cidade">
            <input className={campo} value={perfil.cidade} maxLength={80} onChange={(e) => mudar({ cidade: e.target.value })} />
          </Rotulo>
        </div>
        <div className="sm:col-span-2">
          <Rotulo r="Frase de apresentação" dica="topo da página e card da vitrine">
            <input className={campo} value={perfil.frase} maxLength={200} onChange={(e) => mudar({ frase: e.target.value })} />
          </Rotulo>
        </div>
        <Rotulo r="Sobre a empresa">
          <textarea className={area} value={perfil.sobre} maxLength={2000} onChange={(e) => mudar({ sobre: e.target.value })} />
        </Rotulo>
        <Rotulo r="Diferenciais">
          <textarea className={area} value={perfil.diferenciais} maxLength={1000} onChange={(e) => mudar({ diferenciais: e.target.value })} />
        </Rotulo>
        <div className="sm:col-span-2">
          <Rotulo r="Etiquetas" dica={`separadas por vírgula, até 6`}>
            <input
              className={campo}
              defaultValue={perfil.tags.join(", ")}
              key={perfil.tags.join("|")}
              onBlur={(e) => mudar({ tags: [...new Set(e.target.value.split(",").map((t) => t.trim()).filter(Boolean))].slice(0, 6) })}
            />
          </Rotulo>
        </div>
      </fieldset>

      {/* fotos */}
      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        <div>
          <p className="mb-2 text-sm font-semibold text-grafite">Logo</p>
          <Foto caminho={perfil.logo} alvo="logo" logo />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-grafite">Foto principal</p>
          <div className="max-w-sm">
            <Foto caminho={perfil.capa} alvo="capa" />
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-grafite">
          Galeria <span className="font-normal text-grafite-muted">({perfil.galeria.length} de {GALERIA_MAX})</span>
        </p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {perfil.galeria.map((g, i) => (
            <li key={g} className="flex flex-col gap-2">
              {urlFoto(g) ? (
                <img src={urlFoto(g)!} alt="" className="aspect-[4/5] w-full rounded border border-grafite/10 object-cover" />
              ) : (
                <span className="aspect-[4/5] w-full rounded bg-creme-100" />
              )}
              {editavel && (
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    className={iconeBotao}
                    aria-label="Mover para a esquerda"
                    disabled={i === 0}
                    onClick={() => {
                      const n = [...perfil.galeria];
                      [n[i - 1], n[i]] = [n[i], n[i - 1]];
                      mudar({ galeria: n });
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={iconeBotao}
                    aria-label="Mover para a direita"
                    disabled={i === perfil.galeria.length - 1}
                    onClick={() => {
                      const n = [...perfil.galeria];
                      [n[i + 1], n[i]] = [n[i], n[i + 1]];
                      mudar({ galeria: n });
                    }}
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button type="button" className={iconeBotao} aria-label="Tirar da galeria" onClick={() => mudar({ galeria: perfil.galeria.filter((x) => x !== g) })}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </li>
          ))}
          {editavel && perfil.galeria.length < GALERIA_MAX && (
            <li>
              <button
                type="button"
                className="grid aspect-[4/5] w-full place-items-center rounded border border-dashed border-grafite/25 text-sm font-semibold text-cobre-deep"
                onClick={() => setEscolhendo("galeria")}
              >
                <span className="flex flex-col items-center gap-1">
                  <Plus className="h-5 w-5" aria-hidden="true" /> Foto
                </span>
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* produtos e serviços */}
      <div>
        <p className="mb-2 text-sm font-semibold text-grafite">
          Produtos e serviços <span className="font-normal text-grafite-muted">({perfil.itens.length} de {ITENS_PAGINA_MAX})</span>
        </p>
        <ul className="flex flex-col gap-4">
          {perfil.itens.map((it) => (
            <li key={it.id} className="grid gap-3 rounded-md border border-grafite/10 p-3 sm:grid-cols-[8rem_1fr]">
              <Foto caminho={it.foto} alvo={{ item: it.id }} />
              <fieldset disabled={!editavel} className="grid gap-3 sm:grid-cols-2">
                <Rotulo r="Nome">
                  <input className={campo} value={it.nome} maxLength={120} onChange={(e) => mudarItem(it.id, { nome: e.target.value })} />
                </Rotulo>
                <Rotulo r="Preço" dica="como aparece">
                  <input className={campo} value={it.preco} maxLength={60} placeholder="Sob consulta" onChange={(e) => mudarItem(it.id, { preco: e.target.value })} />
                </Rotulo>
                <div className="sm:col-span-2">
                  <Rotulo r="Descrição">
                    <input className={campo} value={it.descricao} maxLength={300} onChange={(e) => mudarItem(it.id, { descricao: e.target.value })} />
                  </Rotulo>
                </div>
                {editavel && (
                  <div className="flex flex-wrap gap-3 sm:col-span-2">
                    {it.foto && (
                      <button type="button" className="text-sm font-semibold text-grafite-soft" onClick={() => mudarItem(it.id, { foto: null })}>
                        Tirar a foto
                      </button>
                    )}
                    <button type="button" className="text-sm font-semibold text-terracota-600" onClick={() => mudar({ itens: perfil.itens.filter((x) => x.id !== it.id) })}>
                      Tirar este item
                    </button>
                  </div>
                )}
              </fieldset>
            </li>
          ))}
        </ul>
        {editavel && perfil.itens.length < ITENS_PAGINA_MAX && (
          <button
            type="button"
            className={`${botao} mt-3`}
            onClick={() => mudar({ itens: [...perfil.itens, { id: novoId(), nome: "", descricao: "", preco: "", foto: null, video: "" }] })}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Item
          </button>
        )}
      </div>

      {/* atendimento */}
      <fieldset disabled={!editavel} className="grid gap-4 sm:grid-cols-2">
        <Rotulo r="WhatsApp">
          <input className={campo} inputMode="tel" value={perfil.contato.whatsapp} maxLength={20} onChange={(e) => mudarContato({ whatsapp: e.target.value.replace(/\D/g, "") })} />
        </Rotulo>
        <Rotulo r="Instagram">
          <input className={campo} value={perfil.contato.instagram} maxLength={40} onChange={(e) => mudarContato({ instagram: e.target.value })} />
        </Rotulo>
        <Rotulo r="Site">
          <input className={campo} value={perfil.contato.site} maxLength={300} onChange={(e) => mudarContato({ site: e.target.value })} />
        </Rotulo>
        <Rotulo r="Endereço" dica="gera o “Como chegar”">
          <input className={campo} value={perfil.contato.endereco} maxLength={240} onChange={(e) => mudarContato({ endereco: e.target.value })} />
        </Rotulo>
        <Rotulo r="Como atende" dica="separado por vírgula">
          <input
            className={campo}
            defaultValue={perfil.contato.modalidades.join(", ")}
            key={`m${perfil.contato.modalidades.join("|")}`}
            onBlur={(e) => mudarContato({ modalidades: e.target.value.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6) })}
          />
        </Rotulo>
        <Rotulo r="Cidades atendidas" dica="separadas por vírgula">
          <input
            className={campo}
            defaultValue={perfil.contato.regioes.join(", ")}
            key={`r${perfil.contato.regioes.join("|")}`}
            onBlur={(e) => mudarContato({ regioes: e.target.value.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 15) })}
          />
        </Rotulo>
        <div className="flex flex-col gap-1.5 text-[15px]">
          <span className="text-sm font-semibold text-grafite">Horário <span className="font-normal text-grafite-muted">(vem do cadastro)</span></span>
          <span>{horariosTexto(perfil.contato.horarios).join(" · ") || "sem horário fixo"}</span>
          <label className="mt-1 flex items-center gap-2">
            <input type="checkbox" checked={perfil.contato.horaMarcada} onChange={(e) => mudarContato({ horaMarcada: e.target.checked })} />
            Atende com hora marcada
          </label>
        </div>
        <Rotulo r="Observação do horário">
          <input className={campo} value={perfil.contato.horarioObs} maxLength={300} onChange={(e) => mudarContato({ horarioObs: e.target.value })} />
        </Rotulo>
      </fieldset>

      {/* escolher foto */}
      {escolhendo && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true" aria-label="Escolher foto">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-lg bg-white p-5 sm:rounded-lg sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-display text-[22px] text-grafite">Escolher foto</h4>
              <button type="button" className={iconeBotao} aria-label="Fechar" onClick={() => setEscolhendo(null)}>
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 text-sm text-grafite-soft">Enviadas pelo parceiro:</p>
            {imagensDoParceiro.length === 0 && <p className="mt-2 text-[15px]">Nenhuma foto enviada pelo parceiro.</p>}
            <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {imagensDoParceiro.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className="block w-full overflow-hidden rounded border border-grafite/10 hover:border-cobre"
                    onClick={() => void baixarDoParceiro(a.caminho).then((b) => usarFoto(escolhendo, b)).catch(() => setAviso("Não foi possível baixar a foto do parceiro."))}
                  >
                    {urlsDoParceiro.get(a.caminho) ? (
                      <img src={urlsDoParceiro.get(a.caminho)} alt={a.nome} className="aspect-square w-full bg-creme-100 object-cover" />
                    ) : (
                      <span className="grid aspect-square w-full place-items-center bg-creme-100 p-1 text-xs text-grafite-muted">{a.nome}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <label className={`${botao} mt-4 cursor-pointer`}>
              <Upload className="h-4 w-4" aria-hidden="true" /> Subir do computador
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void usarFoto(escolhendo, f);
                }}
              />
            </label>
          </div>
        </div>
      )}

      {/* prévia */}
      {previa && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-creme" role="dialog" aria-modal="true" aria-label="Prévia da página">
          <button
            type="button"
            className="fixed right-4 top-14 z-50 inline-flex items-center gap-2 rounded-full bg-grafite px-4 py-2 text-sm font-semibold text-perola"
            onClick={() => setPrevia(false)}
          >
            <X className="h-4 w-4" aria-hidden="true" /> Fechar prévia
          </button>
          <PaginaParceiro
            perfil={perfil}
            urlFoto={urlFoto}
            previa
            codigo={{
              membro: true,
              codigo: perfil.beneficio?.dados.codigo || null,
              temCodigo: !!perfil.beneficio?.dados.codigo,
            }}
          />
        </div>
      )}
    </div>
  );
}
