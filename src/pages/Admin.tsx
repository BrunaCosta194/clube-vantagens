import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSessao } from "../lib/sessao";
import {
  carregarMetricas,
  carregarOpcoesFiltro,
  ehAdmin,
  type PainelDispositivo,
  type PainelFiltros,
  type PainelMetricas,
  type PainelOpcoesFiltro,
  type PainelPeriodo,
  type PainelSituacao,
} from "../lib/painel";

// ─────────────────────────────────────────────────────────────
// ADMIN — Bloco 11 (painel de desempenho)
// Página autônoma (sem Navbar/Footer do site). Acesso restrito: exige
// sessão + is_admin() no banco. Todas as consultas passam pelas RPCs
// SECURITY DEFINER de supabase/migrations/0009_painel_admin.sql — nenhum
// dado pessoal (nome/e-mail/WhatsApp/CPF) chega aqui, só contagens.
// ─────────────────────────────────────────────────────────────

const PERIODOS: { valor: PainelPeriodo; rotulo: string }[] = [
  { valor: "7d", rotulo: "7 dias" },
  { valor: "30d", rotulo: "30 dias" },
  { valor: "90d", rotulo: "90 dias" },
  { valor: "custom", rotulo: "Personalizado" },
];

const DISPOSITIVOS: { valor: PainelDispositivo; rotulo: string }[] = [
  { valor: "mobile", rotulo: "Mobile" },
  { valor: "tablet", rotulo: "Tablet" },
  { valor: "desktop", rotulo: "Desktop" },
];

const SITUACOES: { valor: PainelSituacao; rotulo: string }[] = [
  { valor: "visitante", rotulo: "Visitante" },
  { valor: "membro", rotulo: "Membro" },
];

function numero(n: number): string {
  return n.toLocaleString("pt-BR");
}

function percentual(parte: number, total: number): string {
  if (!total) return "—";
  return `${((parte / total) * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function hojeYYYYMMDD(): string {
  const agora = new Date();
  const y = agora.getFullYear();
  const m = String(agora.getMonth() + 1).padStart(2, "0");
  const d = String(agora.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function diasAtrasYYYYMMDD(dias: number): string {
  const agora = new Date();
  agora.setDate(agora.getDate() - dias);
  const y = agora.getFullYear();
  const m = String(agora.getMonth() + 1).padStart(2, "0");
  const d = String(agora.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Rótulo pra "Todos" nos selects — valor "" no <select> vira null no filtro. */
const TODOS = "";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-grafite-muted">
      {children}
    </p>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.5rem] border border-cobre-line/20 bg-white/70 p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

function Tabela({
  colunas,
  linhas,
  vazio = "Sem dados no período",
}: {
  colunas: string[];
  linhas: (string | number)[][];
  vazio?: string;
}) {
  if (linhas.length === 0) {
    return <p className="mt-4 text-sm text-grafite-muted">{vazio}</p>;
  }
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-cobre-line/20 text-left">
            {colunas.map((coluna) => (
              <th key={coluna} className="whitespace-nowrap py-2 pr-4 font-mono text-[11px] uppercase tracking-[0.12em] text-grafite-muted">
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => (
            <tr key={i} className="border-b border-cobre-line/10 last:border-0">
              {linha.map((valor, j) => (
                <td key={j} className="whitespace-nowrap py-2.5 pr-4 text-grafite">
                  {valor}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BarraFunil({ rotulo, valor, base }: { rotulo: string; valor: number; base: number }) {
  const largura = base > 0 ? Math.max((valor / base) * 100, valor > 0 ? 2 : 0) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-grafite">{rotulo}</span>
        <span className="font-mono text-grafite-muted">
          {numero(valor)} · {percentual(valor, base)}
        </span>
      </div>
      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-creme-200">
        <div className="h-full rounded-full bg-cobre" style={{ width: `${largura}%` }} />
      </div>
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const { usuario, carregando: lendoSessao } = useSessao();

  const [admin, setAdmin] = useState<boolean | null>(null);
  const [checandoAcesso, setChecandoAcesso] = useState(true);

  const [opcoes, setOpcoes] = useState<PainelOpcoesFiltro>({ campanhas: [], origens: [], refs: [] });
  const [metricas, setMetricas] = useState<PainelMetricas | null>(null);
  const [carregandoMetricas, setCarregandoMetricas] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [periodo, setPeriodo] = useState<PainelPeriodo>("7d");
  const [inicioCustom, setInicioCustom] = useState(diasAtrasYYYYMMDD(7));
  const [fimCustom, setFimCustom] = useState(hojeYYYYMMDD());
  const [campanha, setCampanha] = useState<string>(TODOS);
  const [origem, setOrigem] = useState<string>(TODOS);
  const [ref, setRef] = useState<string>(TODOS);
  const [dispositivo, setDispositivo] = useState<string>(TODOS);
  const [situacao, setSituacao] = useState<string>(TODOS);

  // robots noindex — painel interno, nunca deve indexar.
  useEffect(() => {
    const tituloAnterior = document.title;
    document.title = "Painel · Clube Sanchez";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => {
      document.title = tituloAnterior;
      document.head.removeChild(meta);
    };
  }, []);

  // Gate de sessão + is_admin().
  useEffect(() => {
    if (lendoSessao) return;

    if (!usuario) {
      navigate("/login?next=/admin");
      return;
    }

    let ativo = true;
    ehAdmin()
      .then((resultado) => {
        if (ativo) setAdmin(resultado);
      })
      .catch(() => {
        if (ativo) setAdmin(false);
      })
      .finally(() => {
        if (ativo) setChecandoAcesso(false);
      });

    return () => {
      ativo = false;
    };
  }, [lendoSessao, usuario, navigate]);

  // Opções de filtro — só depois de confirmar acesso.
  useEffect(() => {
    if (!admin) return;
    let ativo = true;
    carregarOpcoesFiltro()
      .then((resultado) => {
        if (ativo) setOpcoes(resultado);
      })
      .catch(() => {
        // opções de filtro são só conveniência — falhar aqui não trava o painel
      });
    return () => {
      ativo = false;
    };
  }, [admin]);

  const filtros = useMemo<PainelFiltros>(
    () => ({
      periodo,
      inicio: periodo === "custom" ? inicioCustom : undefined,
      fim: periodo === "custom" ? fimCustom : undefined,
      campanha: campanha || null,
      origem: origem || null,
      ref: ref || null,
      dispositivo: (dispositivo || null) as PainelDispositivo | null,
      situacao: (situacao || null) as PainelSituacao | null,
    }),
    [periodo, inicioCustom, fimCustom, campanha, origem, ref, dispositivo, situacao],
  );

  useEffect(() => {
    if (!admin) return;
    // período personalizado incompleto — espera as duas datas antes de buscar
    if (periodo === "custom" && (!inicioCustom || !fimCustom)) return;

    let ativo = true;
    setCarregandoMetricas(true);
    setErro(null);

    carregarMetricas(filtros)
      .then((resultado) => {
        if (ativo) setMetricas(resultado);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar as métricas agora. Tente de novo em instantes.");
      })
      .finally(() => {
        if (ativo) setCarregandoMetricas(false);
      });

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, filtros]);

  if (lendoSessao || checandoAcesso) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-creme">
        <p className="text-sm text-grafite-muted">Carregando...</p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-creme px-6">
        <div className="max-w-sm text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-grafite-muted">Painel</p>
          <h1 className="h-display mt-3 text-2xl">Sem acesso ao painel</h1>
          <p className="mt-3 text-sm text-grafite-muted">
            Essa área é restrita à equipe do Clube Sanchez. Se você acha que deveria ter acesso, fale com quem administra o painel.
          </p>
          <Link to="/" className="btn-quiet mt-6 inline-flex">
            Voltar ao site
          </Link>
        </div>
      </div>
    );
  }

  const m = metricas;
  const totalEventosPorEvento = m ? m.por_evento.reduce((acc, x) => acc + x.total, 0) : 0;
  const maiorSessoesDia = m ? Math.max(1, ...m.por_dia.map((d) => d.sessoes)) : 1;

  return (
    <div className="min-h-screen bg-creme pb-24">
      <header className="border-b border-cobre-line/20 bg-white/60 backdrop-blur-sm">
        <div className="container-club flex flex-wrap items-center justify-between gap-3 py-5">
          <div>
            <Eyebrow>Clube Sanchez</Eyebrow>
            <h1 className="h-display mt-1 text-[clamp(1.4rem,3vw,1.9rem)]">Painel de desempenho</h1>
          </div>
          <Link to="/" className="btn-quiet">
            Voltar ao site
          </Link>
        </div>
      </header>

      <div className="container-club mt-8">
        {/* ── Filtros ─────────────────────────────────────────── */}
        <Card>
          <Eyebrow>Período</Eyebrow>
          <div className="mt-3 flex flex-wrap gap-2">
            {PERIODOS.map((p) => (
              <button
                key={p.valor}
                onClick={() => setPeriodo(p.valor)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  periodo === p.valor
                    ? "border-cobre bg-cobre text-white"
                    : "border-cobre-line/30 text-grafite hover:border-cobre"
                }`}
              >
                {p.rotulo}
              </button>
            ))}
          </div>

          {periodo === "custom" && (
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-grafite-muted">De</span>
                <input
                  type="date"
                  value={inicioCustom}
                  max={fimCustom}
                  onChange={(e) => setInicioCustom(e.target.value)}
                  className="rounded-lg border border-cobre-line/30 bg-white px-3 py-1.5 text-grafite"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-grafite-muted">Até</span>
                <input
                  type="date"
                  value={fimCustom}
                  min={inicioCustom}
                  max={hojeYYYYMMDD()}
                  onChange={(e) => setFimCustom(e.target.value)}
                  className="rounded-lg border border-cobre-line/30 bg-white px-3 py-1.5 text-grafite"
                />
              </label>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-grafite-muted">Campanha</span>
              <select
                value={campanha}
                onChange={(e) => setCampanha(e.target.value)}
                className="rounded-lg border border-cobre-line/30 bg-white px-3 py-1.5 text-grafite"
              >
                <option value={TODOS}>Todas</option>
                {opcoes.campanhas.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-grafite-muted">Origem</span>
              <select
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                className="rounded-lg border border-cobre-line/30 bg-white px-3 py-1.5 text-grafite"
              >
                <option value={TODOS}>Todas</option>
                {opcoes.origens.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-grafite-muted">Código de indicação</span>
              <select
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                className="rounded-lg border border-cobre-line/30 bg-white px-3 py-1.5 text-grafite"
              >
                <option value={TODOS}>Todos</option>
                {opcoes.refs.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-grafite-muted">Dispositivo</span>
              <select
                value={dispositivo}
                onChange={(e) => setDispositivo(e.target.value)}
                className="rounded-lg border border-cobre-line/30 bg-white px-3 py-1.5 text-grafite"
              >
                <option value={TODOS}>Todos</option>
                {DISPOSITIVOS.map((d) => (
                  <option key={d.valor} value={d.valor}>
                    {d.rotulo}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-grafite-muted">Situação</span>
              <select
                value={situacao}
                onChange={(e) => setSituacao(e.target.value)}
                className="rounded-lg border border-cobre-line/30 bg-white px-3 py-1.5 text-grafite"
              >
                <option value={TODOS}>Todos</option>
                {SITUACOES.map((s) => (
                  <option key={s.valor} value={s.valor}>
                    {s.rotulo}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Card>

        {erro && (
          <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>
        )}

        {carregandoMetricas && !m && (
          <p className="mt-8 text-sm text-grafite-muted">Carregando métricas...</p>
        )}

        {m && (
          <div className={carregandoMetricas ? "mt-8 opacity-60 transition-opacity" : "mt-8 transition-opacity"}>
            {/* ── KPIs ───────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Card>
                <Eyebrow>Sessões</Eyebrow>
                <p className="h-display mt-2 text-[clamp(1.6rem,3vw,2.2rem)]">{numero(m.totais.sessoes)}</p>
              </Card>
              <Card>
                <Eyebrow>Eventos</Eyebrow>
                <p className="h-display mt-2 text-[clamp(1.6rem,3vw,2.2rem)]">{numero(m.totais.eventos)}</p>
              </Card>
              <Card>
                <Eyebrow>Membros ativos</Eyebrow>
                <p className="h-display mt-2 text-[clamp(1.6rem,3vw,2.2rem)]">{numero(m.totais.membros_ativos)}</p>
              </Card>
              <Card>
                <Eyebrow>Novos membros</Eyebrow>
                <p className="h-display mt-2 text-[clamp(1.6rem,3vw,2.2rem)]">{numero(m.novos_membros)}</p>
              </Card>
            </div>

            {/* ── Sessões por dia ────────────────────────────── */}
            <Card className="mt-6">
              <Eyebrow>Sessões por dia</Eyebrow>
              {m.por_dia.length === 0 ? (
                <p className="mt-4 text-sm text-grafite-muted">Sem dados no período</p>
              ) : (
                <div className="mt-5 flex h-40 items-end gap-1 overflow-x-auto">
                  {m.por_dia.map((d) => (
                    <div
                      key={d.dia}
                      title={`${new Date(`${d.dia}T00:00:00`).toLocaleDateString("pt-BR")} — ${numero(d.sessoes)} sessões, ${numero(d.eventos)} eventos`}
                      className="flex min-w-[10px] flex-1 flex-col items-center justify-end"
                    >
                      <div
                        className="w-full rounded-t bg-cobre"
                        style={{ height: `${Math.max((d.sessoes / maiorSessoesDia) * 100, d.sessoes > 0 ? 4 : 1)}%` }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* ── Eventos por tipo ───────────────────────────── */}
            <Card className="mt-6">
              <Eyebrow>Eventos por tipo</Eyebrow>
              <Tabela
                colunas={["Evento", "Total", "%"]}
                linhas={m.por_evento.map((x) => [x.nome, numero(x.total), percentual(x.total, totalEventosPorEvento)])}
              />
            </Card>

            {/* ── Banners ────────────────────────────────────── */}
            <Card className="mt-6">
              <Eyebrow>Banners</Eyebrow>
              <Tabela
                colunas={["Banner", "Views", "Cliques", "CTR"]}
                linhas={m.banners.map((b) => [b.banner, numero(b.views), numero(b.cliques), percentual(b.cliques, b.views)])}
              />
            </Card>

            {/* ── Funil e-book ───────────────────────────────── */}
            <Card className="mt-6">
              <Eyebrow>Funil do e-book</Eyebrow>
              <div className="mt-5 space-y-4">
                <BarraFunil rotulo="Abriu o formulário" valor={m.funil_ebook.abriu_form} base={m.funil_ebook.abriu_form} />
                <BarraFunil rotulo="Enviou o formulário" valor={m.funil_ebook.enviou_form} base={m.funil_ebook.abriu_form} />
                <BarraFunil rotulo="Baixou o e-book" valor={m.funil_ebook.baixou} base={m.funil_ebook.abriu_form} />
                <BarraFunil rotulo="Virou membro" valor={m.funil_ebook.virou_membro} base={m.funil_ebook.abriu_form} />
              </div>
            </Card>

            {/* ── Parceiros ──────────────────────────────────── */}
            <Card className="mt-6">
              <Eyebrow>Parceiros</Eyebrow>
              <Tabela
                colunas={["Slug", "Aberturas", "Contatos (WhatsApp)", "Contatos (site)"]}
                linhas={m.parceiros.map((p) => [p.slug, numero(p.aberturas), numero(p.contatos_whatsapp), numero(p.contatos_site)])}
              />
            </Card>

            {/* ── Produtos ───────────────────────────────────── */}
            <Card className="mt-6">
              <Eyebrow>Produtos</Eyebrow>
              <Tabela
                colunas={["Produto", "Canal", "Cliques"]}
                linhas={m.produtos.map((p) => [p.produto, p.canal, numero(p.cliques)])}
              />
            </Card>

            {/* ── Cadastros por origem ───────────────────────── */}
            <Card className="mt-6">
              <Eyebrow>Cadastros por origem</Eyebrow>
              <Tabela
                colunas={["Origem", "Campanha", "Iniciados", "Completos", "Taxa"]}
                linhas={m.cadastros_por_origem.map((c) => [
                  c.origem,
                  c.campanha,
                  numero(c.iniciados),
                  numero(c.completos),
                  percentual(c.completos, c.iniciados),
                ])}
              />
            </Card>

            {/* ── Indicações ─────────────────────────────────── */}
            <Card className="mt-6">
              <Eyebrow>Indicações</Eyebrow>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-grafite-muted">Compartilhamentos</p>
                  <p className="h-display mt-1 text-xl">{numero(m.indicacoes.compartilhamentos)}</p>
                </div>
                <div>
                  <p className="text-xs text-grafite-muted">Cadastradas</p>
                  <p className="h-display mt-1 text-xl">{numero(m.indicacoes.cadastradas)}</p>
                </div>
                <div>
                  <p className="text-xs text-grafite-muted">Convertidas</p>
                  <p className="h-display mt-1 text-xl">{numero(m.indicacoes.convertidas)}</p>
                </div>
              </div>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-grafite-muted">
                Top códigos
              </p>
              <Tabela
                colunas={["Código", "Indicações"]}
                linhas={m.indicacoes.top_codigos.map((t) => [t.codigo, numero(t.indicacoes)])}
              />
            </Card>

            {/* ── Contato & redes ────────────────────────────── */}
            <div className="mt-6 grid gap-6 [&>*]:min-w-0 lg:grid-cols-2">
              <Card>
                <Eyebrow>Redes sociais</Eyebrow>
                <Tabela
                  colunas={["Rede", "Local", "Cliques"]}
                  linhas={m.social.map((s) => [s.rede, s.local, numero(s.cliques)])}
                />
              </Card>
              <Card>
                <Eyebrow>Mapa</Eyebrow>
                <Tabela
                  colunas={["Tipo", "Localização", "Total"]}
                  linhas={m.mapa.map((x) => [x.tipo, x.localizacao, numero(x.total)])}
                />
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
