import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Link2,
  Link2Off,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useSessao } from "../lib/sessao";
import EditorPagina from "@/components/admin/EditorPagina";
import { publicar } from "@/lib/painelPagina";
import { parceiros as parceirosDoSite } from "@/data/parceiros";
import {
  abrirFicha,
  anotar,
  criarConvite,
  invalidarLink,
  linkDeDownload,
  linkDoCadastro,
  linksDosArquivos,
  linkWhats,
  listar,
  meusPapeis,
  mensagemConvite,
  mensagemPendencia,
  mudarStatus,
  numeroWhats,
  planilha,
  renovarLink,
  respostasDoParceiro,
  type CadastroLista,
  type Ficha,
} from "../lib/painelParceiros";
import {
  CANAIS_ORCAMENTO,
  DIAS,
  INFO_ORCAMENTO,
  MODALIDADES,
  OFERTA,
  PRECO_TIPO,
  STATUS,
  TITULO_ETAPA,
  cardBeneficio,
  limparRespostas,
  linkValido,
  pendencias as calcularPendencias,
  transicoesPara,
  type Dia,
  type Respostas,
  type Transicao,
} from "../../supabase/functions/_shared/parceiro-cadastro.ts";

// ─────────────────────────────────────────────────────────────
// /admin/parceiros — painel da coordenação do Portal do Parceiro.
// Spec: docs/superpowers/specs/2026-11-13-portal-cadastro-parceiros.md (seção 4)
//
// Acesso: papel `parceiros` (Júlia: tudo menos validar) ou `validacao`
// (Yruena: acompanha, anota e valida). Quem confere é o banco (0015); a tela só
// esconde o que a pessoa não pode fazer. A ficha abre por /admin/parceiros#<id>
// (é o link que vai no e-mail de aviso).
// ─────────────────────────────────────────────────────────────

type Grupo = "todos" | "revisar" | "preparacao" | "yruena" | "parceiro" | "publicados" | "parados" | "arquivados";

const GRUPOS: { valor: Grupo; rotulo: string; status?: string[] }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "revisar", rotulo: "Para revisar", status: ["cadastro_recebido"] },
  { valor: "preparacao", rotulo: "Em preparação", status: ["em_preparacao", "informacoes_incompletas", "ajustes_solicitados"] },
  { valor: "yruena", rotulo: "Aguardando a Yruena", status: ["aguardando_validacao"] },
  { valor: "parceiro", rotulo: "Com o parceiro", status: ["convite_enviado", "cadastro_iniciado", "aguardando_aprovacao"] },
  { valor: "publicados", rotulo: "Aprovados e publicados", status: ["aprovado", "publicado"] },
  { valor: "parados", rotulo: "Parados há 7+ dias" },
  { valor: "arquivados", rotulo: "Arquivados", status: ["arquivado"] },
];

const SETE_DIAS = 7 * 24 * 60 * 60 * 1000;

function parado(c: CadastroLista): boolean {
  if (["publicado", "arquivado", "aprovado"].includes(c.status)) return false;
  const ultimo = new Date(c.ultima_atividade_em ?? c.created_at).getTime();
  return Date.now() - ultimo > SETE_DIAS;
}

function noGrupo(c: CadastroLista, g: Grupo): boolean {
  if (g === "todos") return c.status !== "arquivado";
  if (g === "parados") return parado(c);
  return GRUPOS.find((x) => x.valor === g)!.status!.includes(c.status);
}

function haQuanto(iso: string | null): string {
  if (!iso) return "—";
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 2) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "ontem";
  if (d < 30) return `há ${d} dias`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

const dataHora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

function corStatus(s: string): string {
  if (["aprovado", "publicado"].includes(s)) return "text-[#2f7a45]";
  if (["informacoes_incompletas", "ajustes_solicitados"].includes(s)) return "text-terracota-600";
  if (["aguardando_validacao", "aguardando_aprovacao"].includes(s)) return "text-[#946410]";
  if (["cadastro_recebido", "em_preparacao"].includes(s)) return "text-cobre-deep";
  return "text-grafite-muted";
}

function Etiqueta({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold ${corStatus(status)}`}>
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
      {STATUS[status as keyof typeof STATUS] ?? status}
    </span>
  );
}

function nomeDe(c: { respostas: Respostas; convite_empresa: string }) {
  return c.respostas.negocio?.nomeEmpresa || c.convite_empresa;
}

function segmentoDe(r: Respostas) {
  const n = r.negocio;
  if (!n?.segmento) return "";
  return n.segmento === "Outros" ? n.segmentoOutro || "Outros" : n.segmento;
}

async function copiar(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}

function baixar(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const botao =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-grafite/20 bg-white px-4 text-[15px] font-semibold text-grafite transition hover:border-grafite/40 disabled:opacity-50";

// ─────────────────────────────────────────────────────────────

export default function AdminParceiros() {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { usuario, carregando: lendoSessao } = useSessao();
  const [papeis, setPapeis] = useState<string[] | null>(null);
  const [lista, setLista] = useState<CadastroLista[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [grupo, setGrupo] = useState<Grupo>("todos");
  const [busca, setBusca] = useState("");
  const [novoConvite, setNovoConvite] = useState(false);

  const idAberto = /^#[0-9a-f-]{36}$/.test(hash) ? hash.slice(1) : null;

  useEffect(() => {
    const antes = document.title;
    document.title = "Parceiros · Painel · Clube Sanchez";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => {
      document.title = antes;
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    if (lendoSessao) return;
    if (!usuario) {
      navigate(`/login?next=${encodeURIComponent("/admin/parceiros" + hash)}`);
      return;
    }
    meusPapeis()
      .then(setPapeis)
      .catch(() => setPapeis([]));
  }, [lendoSessao, usuario, navigate, hash]);

  const podeVer = !!papeis && (papeis.includes("parceiros") || papeis.includes("validacao"));
  const ehEquipe = !!papeis?.includes("parceiros");

  const recarregar = useCallback(async () => {
    try {
      setErro(null);
      setLista(await listar());
    } catch {
      setErro("Não foi possível carregar os cadastros agora. Tente de novo em instantes.");
    }
  }, []);

  useEffect(() => {
    if (podeVer) void recarregar();
  }, [podeVer, recarregar]);

  // A Yruena cai direto no que espera por ela.
  useEffect(() => {
    if (lista && papeis && !papeis.includes("parceiros") && lista.some((c) => c.status === "aguardando_validacao")) {
      setGrupo("yruena");
    }
  }, [lista, papeis]);

  const filtrada = useMemo(() => {
    if (!lista) return [];
    const q = busca.trim().toLowerCase();
    return lista.filter(
      (c) => noGrupo(c, grupo) && (!q || `${nomeDe(c)} ${c.convite_contato ?? ""} ${segmentoDe(c.respostas)}`.toLowerCase().includes(q)),
    );
  }, [lista, grupo, busca]);

  if (lendoSessao || papeis === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-creme">
        <Loader2 className="h-6 w-6 animate-spin text-cobre-deep" aria-label="Carregando" />
      </div>
    );
  }

  if (!podeVer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-creme px-6">
        <div className="max-w-sm text-center">
          <h1 className="h-display text-2xl">Sem acesso aos parceiros</h1>
          <p className="mt-3 text-[15px] text-grafite-soft">
            Essa área é da coordenação do Clube. Se você deveria ter acesso, peça para a Bruna liberar.
          </p>
          <Link to="/" className="btn-quiet mt-6 inline-flex">
            Voltar ao site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creme pb-24">
      <header className="border-b border-grafite/10 bg-white/60">
        <div className="container-club flex flex-wrap items-center justify-between gap-3 py-5">
          <div>
            <p className="text-sm font-semibold text-grafite-muted">Clube Sanchez · Painel</p>
            <h1 className="h-display mt-1 text-[clamp(1.5rem,3vw,2rem)]">Parceiros</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {papeis.includes("painel") && (
              <Link to="/admin" className="btn-quiet">
                Métricas do site
              </Link>
            )}
            <Link to="/" className="btn-quiet">
              Voltar ao site
            </Link>
          </nav>
        </div>
      </header>

      <main className="container-club pt-8">
        {erro && <p className="mb-6 rounded-md bg-[#F9E5D9] px-4 py-3 text-[15px] text-grafite">{erro}</p>}

        {idAberto ? (
          <FichaTela
            id={idAberto}
            papeis={papeis}
            onVoltar={() => {
              navigate("/admin/parceiros");
              void recarregar();
            }}
            onMudou={recarregar}
          />
        ) : novoConvite ? (
          <NovoConvite
            jaConvidados={new Set((lista ?? []).map((c) => c.convite_empresa.toLowerCase()))}
            onFechar={() => {
              setNovoConvite(false);
              void recarregar();
            }}
            onAbrir={(id) => {
              setNovoConvite(false);
              navigate(`/admin/parceiros#${id}`);
            }}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              {ehEquipe && (
                <button type="button" className="btn-primary" onClick={() => setNovoConvite(true)}>
                  <Plus className="h-5 w-5" aria-hidden="true" /> Novo convite
                </button>
              )}
              <button
                type="button"
                className={botao}
                onClick={() => lista && baixar(planilha(filtrada), `parceiros-clube-${new Date().toISOString().slice(0, 10)}.csv`)}
                disabled={!filtrada.length}
              >
                <Download className="h-4 w-4" aria-hidden="true" /> Exportar planilha
              </button>
              <button type="button" className={botao} onClick={() => void recarregar()} aria-label="Atualizar lista">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por situação">
              {GRUPOS.map((g) => {
                const n = lista ? lista.filter((c) => noGrupo(c, g.valor)).length : 0;
                const ativo = grupo === g.valor;
                return (
                  <button
                    key={g.valor}
                    type="button"
                    role="tab"
                    aria-selected={ativo}
                    onClick={() => setGrupo(g.valor)}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm ${
                      ativo ? "border-cobre-deep bg-cobre/10 font-semibold text-cobre-deep" : "border-grafite/15 bg-white text-grafite"
                    }`}
                  >
                    {g.rotulo}
                    <span className="tabular-nums text-grafite-muted">{n}</span>
                  </button>
                );
              })}
            </div>

            <label className="relative mt-4 block max-w-sm">
              <span className="sr-only">Buscar</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grafite-muted" aria-hidden="true" />
              <input
                className="min-h-11 w-full rounded-md border border-grafite/20 bg-white pl-9 pr-3 text-[15px]"
                placeholder="Buscar empresa, contato ou segmento"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </label>

            {lista === null ? (
              <div className="mt-10 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-cobre-deep" aria-label="Carregando" />
              </div>
            ) : filtrada.length === 0 ? (
              <p className="mt-10 text-[15px] text-grafite-soft">
                {lista.length === 0
                  ? "Nenhum convite ainda. Comece por “Novo convite”: dá para puxar os dados de um parceiro que já está no site."
                  : "Nenhum cadastro nesta situação."}
              </p>
            ) : (
              <Lista itens={filtrada} onAbrir={(id) => navigate(`/admin/parceiros#${id}`)} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ── Lista ─────────────────────────────────────────────────────────────────────

function Faltas({ c }: { c: CadastroLista }) {
  const faltas = [...(c.enviado_em ? [] : c.pendencias.envio), ...c.pendencias.publicacao];
  if (!faltas.length) return <span className="text-sm text-grafite-muted">—</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {faltas.slice(0, 3).map((p) => (
        <span key={p.campo} className="rounded bg-terracota-600/10 px-1.5 py-0.5 text-xs font-semibold text-terracota-600">
          {p.texto.toLowerCase()}
        </span>
      ))}
      {faltas.length > 3 && <span className="text-xs text-grafite-muted">+{faltas.length - 3}</span>}
    </span>
  );
}

function Progresso({ c }: { c: CadastroLista }) {
  const pct = Math.round((c.etapas_completas.length / 6) * 100);
  return (
    <span className="flex items-center gap-2 text-sm tabular-nums text-grafite-soft">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-creme-200">
        <span className="block h-full rounded-full bg-cobre" style={{ width: `${pct}%` }} />
      </span>
      {pct}%
    </span>
  );
}

function Lista({ itens, onAbrir }: { itens: CadastroLista[]; onAbrir: (id: string) => void }) {
  return (
    <>
      {/* celular: cartões */}
      <ul className="mt-6 flex flex-col gap-3 md:hidden">
        {itens.map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => onAbrir(c.id)} className="flex w-full flex-col gap-2 rounded-md border border-grafite/15 bg-white p-4 text-left">
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-[16px] font-semibold text-grafite">{nomeDe(c)}</span>
                  <span className="block text-sm text-grafite-muted">{segmentoDe(c.respostas) || "Segmento não informado"}</span>
                </span>
                <span className={`text-sm ${parado(c) ? "font-semibold text-terracota-600" : "text-grafite-muted"}`}>
                  {haQuanto(c.ultima_atividade_em ?? c.created_at)}
                </span>
              </span>
              <Etiqueta status={c.status} />
              <span className="flex flex-wrap items-center gap-3">
                <Progresso c={c} />
                <Faltas c={c} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* computador: tabela */}
      <div className="mt-6 hidden overflow-x-auto rounded-md border border-grafite/15 bg-white md:block">
        <table className="w-full min-w-[760px] border-collapse text-[15px]">
          <thead>
            <tr className="border-b border-grafite/10 text-left text-sm text-grafite-muted">
              <th className="px-4 py-3 font-semibold">Empresa</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Progresso</th>
              <th className="px-4 py-3 font-semibold">Falta</th>
              <th className="px-4 py-3 font-semibold">Última atividade</th>
              <th className="px-4 py-3 font-semibold">Na equipe</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((c) => (
              <tr key={c.id} className="cursor-pointer border-b border-grafite/5 last:border-0 hover:bg-creme-100" onClick={() => onAbrir(c.id)}>
                <td className="px-4 py-3">
                  <button type="button" className="text-left font-semibold text-grafite hover:text-cobre-deep" onClick={() => onAbrir(c.id)}>
                    {nomeDe(c)}
                  </button>
                  <span className="block text-sm text-grafite-muted">{segmentoDe(c.respostas)}</span>
                </td>
                <td className="px-4 py-3">
                  <Etiqueta status={c.status} />
                </td>
                <td className="px-4 py-3">
                  <Progresso c={c} />
                </td>
                <td className="px-4 py-3">
                  <Faltas c={c} />
                </td>
                <td className={`whitespace-nowrap px-4 py-3 text-sm ${parado(c) ? "font-semibold text-terracota-600" : "text-grafite-soft"}`}>
                  {haQuanto(c.ultima_atividade_em ?? c.created_at)}
                </td>
                <td className="px-4 py-3 text-sm text-grafite-soft">{c.responsavel_equipe ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Link recém-gerado (só dá para ver uma vez) ────────────────────────────────

function LinkGerado({ link, contato, empresa, whatsapp, preenchido }: { link: string; contato: string; empresa: string; whatsapp: string | null; preenchido: boolean }) {
  const [copiado, setCopiado] = useState(false);
  const mensagem = mensagemConvite(contato, empresa, link, preenchido);
  return (
    <div className="flex flex-col gap-3 rounded-md border border-cobre-line bg-white p-5">
      <p className="text-[15px] font-semibold text-grafite">Link gerado. Ele só aparece agora: mande antes de sair desta tela.</p>
      <input
        readOnly
        value={link}
        onFocus={(e) => e.currentTarget.select()}
        className="min-h-11 w-full rounded-md border border-grafite/20 bg-creme-100 px-3 font-mono text-sm text-grafite"
        aria-label="Link do cadastro"
      />
      <div className="flex flex-wrap gap-2">
        <a className="btn-primary" href={linkWhats(whatsapp, mensagem)} target="_blank" rel="noreferrer">
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> Enviar pelo WhatsApp
        </a>
        <button
          type="button"
          className={botao}
          onClick={async () => {
            setCopiado(await copiar(link));
          }}
        >
          {copiado ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copiado ? "Copiado" : "Copiar link"}
        </button>
      </div>
      {!whatsapp && <p className="text-sm text-grafite-muted">Sem WhatsApp do contato: o WhatsApp abre para você escolher a conversa.</p>}
      <p className="text-sm text-grafite-muted">Se perder o link, é só gerar outro na ficha do parceiro. O anterior para de funcionar.</p>
    </div>
  );
}

// ── Novo convite ──────────────────────────────────────────────────────────────

function NovoConvite({ jaConvidados, onFechar, onAbrir }: { jaConvidados: Set<string>; onFechar: () => void; onAbrir: (id: string) => void }) {
  const [doSite, setDoSite] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [contato, setContato] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [criado, setCriado] = useState<{ id: string; codigo: string } | null>(null);

  const parceiro = parceirosDoSite.find((p) => p.slug === doSite);
  const respostas: Respostas = parceiro ? respostasDoParceiro(parceiro) : {};

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    if (!empresa.trim()) return setErro("Informe o nome da empresa.");
    setErro(null);
    setEnviando(true);
    try {
      const r = await criarConvite({
        empresa: empresa.trim(),
        contato: contato.trim(),
        whatsapp,
        respostas: { ...respostas, negocio: respostas.negocio ? { ...respostas.negocio, nomeEmpresa: empresa.trim(), responsavel: contato.trim() } : undefined },
      });
      setCriado(r);
    } catch {
      setErro("Não foi possível criar o convite. Confira se você tem acesso e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  const campo = "min-h-11 w-full rounded-md border border-grafite/20 bg-white px-3 text-[15px] text-grafite";

  return (
    <div className="max-w-xl">
      <button type="button" className="btn-quiet" onClick={onFechar}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar para a lista
      </button>
      <h2 className="h-display mt-4 text-[clamp(1.6rem,4vw,2.2rem)]">Novo convite</h2>

      {criado ? (
        <div className="mt-6 flex flex-col gap-4">
          <LinkGerado
            link={linkDoCadastro(criado.codigo)}
            contato={contato}
            empresa={empresa}
            whatsapp={numeroWhats(whatsapp)}
            preenchido={!!parceiro}
          />
          <button type="button" className="btn-quiet self-start" onClick={() => onAbrir(criado.id)}>
            Abrir a ficha do parceiro
          </button>
        </div>
      ) : (
        <form onSubmit={criar} className="mt-6 flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[15px] font-semibold text-grafite">Puxar dados de um parceiro que já está no site <span className="font-normal text-grafite-muted">(opcional)</span></span>
            <select
              className={campo}
              value={doSite}
              onChange={(e) => {
                setDoSite(e.target.value);
                const p = parceirosDoSite.find((x) => x.slug === e.target.value);
                if (p) {
                  setEmpresa(p.nome);
                  const wa = p.whatsapp?.match(/wa\.me\/(\d{12,13})/);
                  if (wa && !whatsapp) setWhatsapp(wa[1]);
                }
              }}
            >
              <option value="">Empresa nova</option>
              {parceirosDoSite.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.nome}
                  {jaConvidados.has(p.nome.toLowerCase()) ? " (já tem convite)" : ""}
                </option>
              ))}
            </select>
          </label>
          {parceiro && (
            <p className="rounded-md bg-creme-100 px-4 py-3 text-sm leading-relaxed text-grafite">
              Vai preenchido: nome, segmento, descrição
              {respostas.contato?.whatsapp ? ", WhatsApp" : ""}
              {respostas.contato?.instagram ? ", Instagram" : respostas.contato?.site ? ", site" : ""}
              {respostas.beneficio ? ` e o benefício (${cardBeneficio(respostas.beneficio).titulo}), que o parceiro precisa confirmar de novo` : ""}. O
              parceiro confere e completa o resto.
            </p>
          )}
          <label className="flex flex-col gap-2">
            <span className="text-[15px] font-semibold text-grafite">Nome da empresa</span>
            <input className={campo} value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[15px] font-semibold text-grafite">Nome do contato <span className="font-normal text-grafite-muted">(opcional)</span></span>
            <input className={campo} value={contato} onChange={(e) => setContato(e.target.value)} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[15px] font-semibold text-grafite">WhatsApp do contato <span className="font-normal text-grafite-muted">(opcional, para mandar o link)</span></span>
            <input className={campo} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} inputMode="tel" placeholder="(11) 90000-0000" />
          </label>
          {erro && <p className="text-[15px] font-semibold text-terracota-600">{erro}</p>}
          <button type="submit" className="btn-primary self-start" disabled={enviando}>
            {enviando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Criar convite e gerar link
          </button>
        </form>
      )}
    </div>
  );
}

// ── Ficha ─────────────────────────────────────────────────────────────────────

function Secao({ titulo, children, acao }: { titulo: string; children: ReactNode; acao?: ReactNode }) {
  return (
    <section className="rounded-md border border-grafite/10 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-display text-[22px] leading-tight text-grafite">{titulo}</h3>
        {acao}
      </div>
      <div className="mt-4 flex flex-col gap-2 text-[15px] leading-relaxed text-grafite-soft">{children}</div>
    </section>
  );
}

function L({ r, v }: { r: string; v: ReactNode }) {
  if (v === null || v === undefined || v === "" || (Array.isArray(v) && !v.length)) return null;
  return (
    <p className="min-w-0 break-words">
      <span className="font-semibold text-grafite">{r}:</span> {v}
    </p>
  );
}

const ROTULO_ACAO: Record<string, string> = {
  convite_criado: "Convite criado",
  cadastro_iniciado: "Parceiro começou o cadastro",
  cadastro_enviado: "Parceiro enviou o cadastro",
  cadastro_reenviado: "Parceiro reenviou com mudanças",
  beneficio_confirmado: "Parceiro confirmou o benefício",
  parceiro_pediu_correcao: "Parceiro pediu correção",
  link_renovado: "Link novo gerado",
  link_invalidado: "Link invalidado",
  responsavel: "Responsável na equipe",
  nota: "Nota",
  status: "Status",
  pagina_montada: "Página montada",
  pagina_editada: "Página editada",
  pagina_aprovada: "Parceiro aprovou a página",
  pagina_ajuste: "Parceiro pediu ajuste na página",
};

function FichaTela({ id, papeis, onVoltar, onMudou }: { id: string; papeis: string[]; onVoltar: () => void; onMudou: () => void }) {
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [urls, setUrls] = useState<Map<string, string>>(new Map());
  const [acao, setAcao] = useState<Transicao | null>(null);
  const [nota, setNota] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [linkNovo, setLinkNovo] = useState<string | null>(null);
  const [confirmarInvalidar, setConfirmarInvalidar] = useState(false);
  const [responsavel, setResponsavel] = useState("");
  const [notaInterna, setNotaInterna] = useState("");
  const ehEquipe = papeis.includes("parceiros");

  const carregar = useCallback(async () => {
    try {
      const f = await abrirFicha(id);
      setFicha(f);
      setResponsavel(f.cadastro.responsavel_equipe ?? "");
      const imagens = f.arquivos.filter((a) => /^image\/(jpeg|png|webp|svg\+xml)$/.test(a.mime)).map((a) => a.caminho);
      setUrls(await linksDosArquivos(imagens));
    } catch {
      setErro("Não foi possível abrir este cadastro.");
    }
  }, [id]);

  useEffect(() => {
    setFicha(null);
    setLinkNovo(null);
    void carregar();
  }, [carregar]);

  async function fazer(f: () => Promise<unknown>, ok: string) {
    setOcupado(true);
    setAviso(null);
    try {
      await f();
      setAviso(ok);
      setAcao(null);
      setNota("");
      setNotaInterna("");
      await carregar();
      onMudou();
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? "";
      setAviso(
        msg.includes("ainda não confirmou o benefício")
          ? "O parceiro ainda não confirmou o benefício: não dá para validar."
          : /monte a página|aprovação do parceiro|aprovar a página|versão validada|logo e foto|foto ainda não/.test(msg)
            ? msg.charAt(0).toUpperCase() + msg.slice(1) + "."
            : "Não foi possível fazer isso agora.",
      );
    } finally {
      setOcupado(false);
    }
  }

  if (erro) return <p className="text-[15px] text-grafite">{erro}</p>;
  if (!ficha) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-cobre-deep" aria-label="Carregando" />
      </div>
    );
  }

  const c = ficha.cadastro;
  const r = limparRespostas(c.respostas);
  const empresa = r.negocio?.nomeEmpresa || c.convite_empresa;
  const contatoNome = r.negocio?.responsavel || c.convite_contato || "";
  const whats = numeroWhats(r.contato?.whatsapp) ?? numeroWhats(c.convite_whatsapp);
  const pend = calcularPendencias(r, ficha.arquivos);
  const faltasParaCobrar = [...(c.enviado_em ? [] : pend.envio), ...pend.publicacao].map((p) => p.texto);
  const acoes = transicoesPara(c.status, papeis);
  const vencido = new Date(c.token_expira_em).getTime() < Date.now();
  const diasLink = Math.ceil((new Date(c.token_expira_em).getTime() - Date.now()) / 86400000);
  const b = r.beneficio;
  const n = r.negocio;
  const ct = r.contato;
  const p = r.produtos;
  const o = r.orcamento;
  const arquivosPorTipo = (t: string) => ficha.arquivos.filter((a) => a.tipo === t);

  return (
    <div className="flex flex-col gap-6">
      <button type="button" className="btn-quiet self-start" onClick={onVoltar}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Todos os parceiros
      </button>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="h-display text-[clamp(1.8rem,4vw,2.6rem)]">{empresa}</h2>
          <p className="mt-1 text-[15px] text-grafite-soft">
            {[segmentoDe(r), n?.cidade, contatoNome && `contato: ${contatoNome}`].filter(Boolean).join(" · ")}
          </p>
        </div>
        <Etiqueta status={c.status} />
      </div>

      {aviso && <p className="rounded-md bg-creme-100 px-4 py-3 text-[15px] text-grafite" role="status">{aviso}</p>}

      {/* O que fazer agora */}
      {acoes.length > 0 && (
        <Secao titulo="Próximo passo">
          {c.status === "aguardando_validacao" && papeis.includes("validacao") && (
            <p>
              Confira a página (botão “Ver prévia”, na seção Página) e o benefício. Ao validar, a versão confirmada do benefício fica
              registrada como validada por você e a página vai para o parceiro aprovar.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {acoes.map((t, i) => (
              <button
                key={t.para + t.rotulo}
                type="button"
                disabled={ocupado}
                onClick={() =>
                  t.para === "publicado"
                    ? void fazer(() => publicar(id, ficha.perfil?.conteudo), "Página publicada: já aparece no site e na vitrine.")
                    : t.pedeNota
                      ? setAcao(t)
                      : void fazer(() => mudarStatus(id, t.para), `Status: ${STATUS[t.para]}.`)
                }
                className={i === 0 && t.para !== "arquivado" ? "btn-primary" : botao}
              >
                {t.rotulo}
              </button>
            ))}
          </div>
          {acao && (
            <div className="mt-2 flex flex-col gap-2 rounded-md bg-creme-100 p-4">
              <label htmlFor="nota-acao" className="font-semibold text-grafite">
                {acao.rotulo}: o que aconteceu? <span className="font-normal text-grafite-muted">(fica no histórico)</span>
              </label>
              <textarea id="nota-acao" className="min-h-20 rounded-md border border-grafite/20 bg-white px-3 py-2" value={nota} onChange={(e) => setNota(e.target.value)} />
              <div className="flex gap-2">
                <button type="button" className="btn-primary" disabled={ocupado} onClick={() => void fazer(() => mudarStatus(id, acao.para, nota), `Status: ${STATUS[acao.para]}.`)}>
                  Confirmar
                </button>
                <button type="button" className={botao} onClick={() => setAcao(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </Secao>
      )}
      {c.status === "arquivado" && ehEquipe && acoes.length === 0 && (
        <button
          type="button"
          className={`${botao} self-start`}
          onClick={() => void fazer(() => mudarStatus(id, c.enviado_em ? "cadastro_recebido" : "cadastro_iniciado"), "Cadastro reaberto.")}
        >
          Reabrir cadastro arquivado
        </button>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Secao
          titulo="O que falta"
          acao={
            ehEquipe && faltasParaCobrar.length > 0 ? (
              <a className="btn-quiet" href={linkWhats(whats, mensagemPendencia(contatoNome, empresa, faltasParaCobrar))} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Cobrar pelo WhatsApp
              </a>
            ) : undefined
          }
        >
          {!c.enviado_em && <p className="font-semibold text-grafite">O parceiro ainda não enviou o cadastro.</p>}
          {!c.enviado_em && pend.envio.length > 0 && <L r="Para enviar" v={pend.envio.map((x) => x.texto).join(", ")} />}
          <L r="Para publicar" v={pend.publicacao.map((x) => x.texto).join(", ") || "nada, logo e foto principal enviados"} />
          <L r="Recomendado" v={pend.recomendado.map((x) => x.texto).join(", ")} />
          <L r="Etapas completas" v={`${c.etapas_completas.length} de 6`} />
        </Secao>

        <Secao titulo="Link do parceiro">
          <p>
            {vencido
              ? "O link não funciona mais (venceu ou foi invalidado)."
              : `Funciona por mais ${diasLink} dia${diasLink === 1 ? "" : "s"} (até ${new Date(c.token_expira_em).toLocaleDateString("pt-BR")}).`}{" "}
            O link só aparece na hora em que é gerado.
          </p>
          {linkNovo && <LinkGerado link={linkNovo} contato={contatoNome} empresa={empresa} whatsapp={whats} preenchido={false} />}
          {ehEquipe && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={botao}
                disabled={ocupado}
                onClick={() =>
                  void fazer(async () => {
                    const codigo = await renovarLink(id);
                    setLinkNovo(linkDoCadastro(codigo));
                  }, "Link novo gerado. O anterior parou de funcionar.")
                }
              >
                <Link2 className="h-4 w-4" aria-hidden="true" /> Gerar novo link
              </button>
              {!vencido &&
                (confirmarInvalidar ? (
                  <>
                    <button
                      type="button"
                      className={`${botao} border-terracota-600 text-terracota-600`}
                      onClick={() => {
                        setConfirmarInvalidar(false);
                        setLinkNovo(null);
                        void fazer(() => invalidarLink(id), "Link invalidado. Ninguém mais entra por ele.");
                      }}
                    >
                      Confirmar: invalidar
                    </button>
                    <button type="button" className={botao} onClick={() => setConfirmarInvalidar(false)}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button type="button" className={botao} onClick={() => setConfirmarInvalidar(true)}>
                    <Link2Off className="h-4 w-4" aria-hidden="true" /> Invalidar link
                  </button>
                ))}
            </div>
          )}
        </Secao>
      </div>

      <Secao titulo="Página">
        <EditorPagina ficha={ficha} podeEditar={ehEquipe} urlsDoParceiro={urls} onSalvou={async () => { await carregar(); onMudou(); }} />
      </Secao>

      <Secao titulo="Benefício">
        {b && cardBeneficio(b).titulo ? (
          <div className="rounded-md border border-grafite/10 bg-creme-100 p-4">
            <p className="font-display text-[24px] leading-tight text-cobre-deep">{cardBeneficio(b).titulo}</p>
            {cardBeneficio(b).detalhe && <p className="mt-1">{cardBeneficio(b).detalhe}</p>}
            {cardBeneficio(b).codigo && <p className="mt-2 text-sm font-semibold tracking-wide text-cobre-deep">{cardBeneficio(b).codigo}</p>}
          </div>
        ) : (
          <p>Benefício ainda não preenchido.</p>
        )}
        <p className={b?.confirmado ? "text-grafite" : "font-semibold text-terracota-600"}>
          {b?.confirmado ? "Confirmado pelo parceiro." : "Ainda não confirmado pelo parceiro."}
        </p>
        {ficha.beneficio_versoes.length > 0 && (
          <div className="mt-2">
            <p className="font-semibold text-grafite">Versões registradas</p>
            <ol className="mt-2 flex flex-col gap-3">
              {ficha.beneficio_versoes.map((v) => (
                <li key={v.id} className={`rounded-md border p-3 text-sm ${v.situacao === "substituido" ? "border-grafite/10 text-grafite-muted" : "border-cobre-line/50"}`}>
                  <p className="font-semibold">
                    {v.situacao === "validado" ? "Validada" : v.situacao === "confirmado" ? "Confirmada, aguardando validação" : "Substituída"} · confirmada em{" "}
                    {dataHora(v.confirmado_em)}
                    {v.confirmado_por ? ` por ${v.confirmado_por}` : ""}
                    {v.validado_em ? ` · validada em ${dataHora(v.validado_em)}${v.validado_por ? ` por ${v.validado_por}` : ""}` : ""}
                  </p>
                  <p className="mt-1 whitespace-pre-line">{v.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Secao>

      <div className="grid gap-6 lg:grid-cols-2">
        <Secao titulo={TITULO_ETAPA.negocio}>
          <L r="Empresa" v={n?.nomeEmpresa} />
          <L r="Responsável" v={n?.responsavel} />
          <L r="Segmento" v={segmentoDe(r)} />
          <L r="Começou em" v={n?.anoFundacao} />
          <L r="Cidade" v={n?.cidade} />
          {n?.oQueFaz && <p className="whitespace-pre-line text-grafite">{n.oQueFaz}</p>}
          <L r="Diferenciais" v={n?.diferenciais} />
          <L
            r="Site ou catálogo"
            v={
              n?.materialLink ? (
                <a href={n.materialLink.startsWith("http") ? n.materialLink : `https://${n.materialLink}`} target="_blank" rel="noreferrer" className="text-cobre-deep underline">
                  {n.materialLink}
                </a>
              ) : null
            }
          />
        </Secao>

        <Secao titulo={TITULO_ETAPA.contato}>
          <L r="Atendimento" v={ct?.modalidades.map((m) => (m === "outro" && ct.modalidadeOutra ? ct.modalidadeOutra : MODALIDADES[m as keyof typeof MODALIDADES])).join(", ")} />
          <L r="WhatsApp" v={ct?.whatsapp} />
          <L r="Instagram" v={ct?.instagram} />
          <L r="Site" v={ct?.site} />
          <L r="Endereço" v={ct?.rua ? `${ct.rua}, ${ct.numero}${ct.complemento ? ` ${ct.complemento}` : ""} · ${ct.bairro} · ${ct.cidadeEndereco}/${ct.uf} · CEP ${ct.cep}` : ""} />
          <L
            r="Horário"
            v={
              ct?.horaMarcada
                ? "Só com hora marcada"
                : ct
                  ? (Object.keys(DIAS) as Dia[]).filter((d) => ct.horarios[d]).map((d) => `${DIAS[d]} ${ct.horarios[d]!.abre}–${ct.horarios[d]!.fecha}`).join(" · ")
                  : ""
            }
          />
          <L r="Obs. do horário" v={ct?.horarioObs} />
          <L r="Regiões" v={[...(ct?.regioes ?? []), ct?.regiaoOutra].filter(Boolean).join(", ")} />
        </Secao>

        <Secao titulo={TITULO_ETAPA.produtos}>
          <L r="Oferece" v={p?.oferta ? OFERTA[p.oferta] : ""} />
          {p?.itens.length ? (
            <ul className="flex flex-col gap-2">
              {p.itens.map((i) => {
                const foto = ficha.arquivos.find((a) => a.tipo === "item" && a.item_id === i.id);
                return (
                  <li key={i.id} className="flex gap-3">
                    {foto && urls.get(foto.caminho) && <img src={urls.get(foto.caminho)} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />}
                    <span className="min-w-0">
                      <span className="font-semibold text-grafite">{i.nome || "(sem nome)"}</span>
                      {i.precoTipo && (
                        <span className="text-grafite-muted">
                          {" "}
                          · {i.precoTipo === "consulta" ? PRECO_TIPO.consulta : `${i.precoTipo === "apartir" ? "a partir de " : ""}R$ ${i.preco}`}
                        </span>
                      )}
                      {i.descricao && <span className="block">{i.descricao}</span>}
                      {linkValido(i.video) && (
                        <a href={linkValido(i.video) ?? undefined} target="_blank" rel="noreferrer" className="text-sm text-cobre-deep underline">
                          vídeo
                        </a>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>Nenhum item cadastrado.</p>
          )}
        </Secao>

        <Secao titulo={TITULO_ETAPA.orcamento}>
          <p>{o?.trabalha === "sim" ? "Trabalha com orçamento." : o?.trabalha === "nao" ? "Não trabalha com orçamento." : "Não respondido."}</p>
          {o?.trabalha === "sim" && (
            <>
              <L r="Precisa receber" v={o.informacoes.map((x) => INFO_ORCAMENTO[x as keyof typeof INFO_ORCAMENTO]).join(", ")} />
              <L r="Mais" v={o.informacaoOutra} />
              <L r="Documentos" v={o.documentos} />
              <L r="Prefere receber por" v={o.canais.map((x) => CANAIS_ORCAMENTO[x as keyof typeof CANAIS_ORCAMENTO]).join(", ")} />
              <L r="E-mail" v={o.email} />
            </>
          )}
        </Secao>
      </div>

      <Secao titulo="Arquivos">
        {ficha.arquivos.length === 0 && <p>Nenhum arquivo enviado.</p>}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {(["logo", "capa", "galeria", "item", "referencia"] as const).flatMap((t) =>
            arquivosPorTipo(t).map((a) => (
              <li key={a.id} className="flex min-w-0 flex-col gap-1.5">
                <span className="text-sm font-semibold text-grafite">
                  {{ logo: "Logo", capa: "Foto principal", galeria: "Galeria", item: "Foto de produto", referencia: "Material" }[t]}
                </span>
                {urls.get(a.caminho) ? (
                  <img
                    src={urls.get(a.caminho)}
                    alt={a.nome}
                    className={`aspect-[4/3] w-full rounded border border-grafite/10 bg-creme-100 ${t === "logo" ? "object-contain p-2" : "object-cover"}`}
                  />
                ) : (
                  <span className="grid aspect-[4/3] w-full place-items-center rounded border border-grafite/10 bg-creme-100 text-cobre-deep">
                    <FileText className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                )}
                <span className="truncate text-xs text-grafite-muted" title={a.nome}>
                  {a.nome}
                </span>
                <span className="text-xs text-grafite-muted">
                  {a.largura && a.altura ? `${a.largura}×${a.altura} · ` : ""}
                  {(a.tamanho / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB
                </span>
                <button
                  type="button"
                  className="inline-flex min-h-9 items-center gap-1 self-start text-sm font-semibold text-cobre-deep"
                  onClick={async () => {
                    const u = await linkDeDownload(a.caminho, a.nome);
                    if (u) window.location.href = u;
                  }}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" /> Baixar
                </button>
              </li>
            )),
          )}
        </ul>
      </Secao>

      <div className="grid gap-6 lg:grid-cols-2">
        <Secao titulo="Notas e responsável">
          {ehEquipe && (
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-sm font-semibold text-grafite">Responsável na equipe</span>
                <input className="min-h-11 rounded-md border border-grafite/20 bg-white px-3" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
              </label>
              <button
                type="button"
                className={botao}
                disabled={ocupado || responsavel === (c.responsavel_equipe ?? "")}
                onClick={() => void fazer(() => anotar(id, null, responsavel), "Responsável salvo.")}
              >
                Salvar
              </button>
            </div>
          )}
          <label htmlFor="nota" className="mt-2 text-sm font-semibold text-grafite">
            Nota interna <span className="font-normal text-grafite-muted">(o parceiro não vê)</span>
          </label>
          <textarea id="nota" className="min-h-20 rounded-md border border-grafite/20 bg-white px-3 py-2" value={notaInterna} onChange={(e) => setNotaInterna(e.target.value)} />
          <button type="button" className={`${botao} self-start`} disabled={ocupado || !notaInterna.trim()} onClick={() => void fazer(() => anotar(id, notaInterna), "Nota salva.")}>
            Salvar nota
          </button>
        </Secao>

        <Secao titulo="Histórico">
          <ol className="flex flex-col gap-2.5">
            {ficha.historico.map((h, i) => {
              const d = h.detalhe as { para?: string; de?: string; nota?: string; mensagem?: string; responsavel?: string; texto?: string };
              return (
                <li key={i} className="text-sm">
                  <span className="text-grafite-muted">{dataHora(h.quando)}</span> ·{" "}
                  <span className="font-semibold text-grafite">
                    {ROTULO_ACAO[h.acao] ?? h.acao}
                    {h.acao === "status" && d.para ? `: ${STATUS[d.para as keyof typeof STATUS] ?? d.para}` : ""}
                    {h.acao === "responsavel" ? `: ${d.responsavel ?? "ninguém"}` : ""}
                  </span>{" "}
                  <span className="text-grafite-muted">({h.autor === "parceiro" ? "parceiro" : h.autor === "sql" ? "SQL" : h.autor})</span>
                  {(d.nota || d.mensagem) && <span className="mt-0.5 block whitespace-pre-line text-grafite">“{d.nota || d.mensagem}”</span>}
                </li>
              );
            })}
          </ol>
          <p className="mt-2 text-sm text-grafite-muted">
            Aceite das Condições: {c.autorizacao_uso_em ? `${dataHora(c.autorizacao_uso_em)} (versão ${c.autorizacao_termos_versao})` : "ainda não"}.
          </p>
        </Secao>
      </div>

      <p className="text-sm text-grafite-muted">
        <ExternalLink className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
        A edição do texto da página e a prévia para o parceiro chegam no próximo passo (perfil da página).
      </p>
    </div>
  );
}
