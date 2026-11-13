import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, CloudOff, Loader2, MessageCircle, Pencil } from "lucide-react";
import logo from "@/assets/marca/logo-cs.png";
import {
  CardBeneficioTela,
  EtapaBeneficioTela,
  EtapaContatoTela,
  EtapaFotosTela,
  EtapaNegocioTela,
  EtapaOrcamentoTela,
  EtapaProdutosTela,
  type Erros,
} from "@/components/cadastro-parceiro/etapas";
import { Aviso, Caixa, TituloEtapa } from "@/components/cadastro-parceiro/ui";
import {
  abrir,
  codigoDaUrl,
  enviar,
  FalhaPortal,
  pedirCorrecao,
  salvar,
  type ArquivoTela,
  type CadastroTela,
  type ErroPortal,
} from "@/lib/cadastroParceiro";
import { track } from "@/lib/track";
import {
  ARQUIVOS,
  DIAS,
  ETAPAS,
  MODALIDADES,
  OFERTA,
  PRECO_TIPO,
  TITULO_ETAPA,
  VAZIO,
  pendencias as calcularPendencias,
  type Dia,
  type NomeEtapa,
  type Pendencia,
  type Pendencias,
  type Respostas,
} from "../../supabase/functions/_shared/parceiro-cadastro.ts";

// ─────────────────────────────────────────────────────────────
// PORTAL DO PARCEIRO — /cadastro-parceiro#<codigo>
// Spec: docs/superpowers/specs/2026-11-13-portal-cadastro-parceiros.md
//
// Telas: 0 boas-vindas · 1–6 etapas · 7 revisão · 8 conclusão/andamento.
// Salva sozinho 1,5 s depois da última mudança (e ao trocar de tela). Se a
// internet cair, guarda uma cópia no aparelho e tenta de novo quando voltar.
// Página sem menu do site, sem botão flutuante e sem script de terceiros.
// ─────────────────────────────────────────────────────────────

const COORDENACAO_WPP = "5511996628696"; // Papo de Aluguel (briefing da Júlia)
const ESPERA_SALVAR_MS = 1500;
const REVISAO = 7;
const CONCLUSAO = 8;

type Completas = Required<Respostas>;

function completar(r: Respostas): Completas {
  return {
    negocio: r.negocio ?? VAZIO.negocio(),
    beneficio: r.beneficio ?? VAZIO.beneficio(),
    produtos: r.produtos ?? VAZIO.produtos(),
    fotos: r.fotos ?? VAZIO.fotos(),
    contato: r.contato ?? VAZIO.contato(),
    orcamento: r.orcamento ?? VAZIO.orcamento(),
  };
}

function mensagemDoCampo(p: Pendencia): string {
  if (p.campo === "confirmado") return "Marque para confirmar o benefício.";
  if (p.campo === "whatsapp") return "Confira o WhatsApp, com DDD.";
  if (["tipo", "segmento", "comoUsar", "modalidades"].includes(p.campo)) return "Escolha uma opção.";
  return "Preencha este campo.";
}

function linkCoordenacao(empresa: string, texto?: string) {
  const msg = texto ?? `Olá! Sou da ${empresa} e estou no cadastro do Clube Sanchez.`;
  return `https://wa.me/${COORDENACAO_WPP}?text=${encodeURIComponent(msg)}`;
}

// ── Backup no aparelho (internet caiu no meio) ────────────────────────────────

type Backup = { versao: number; sujas: NomeEtapa[]; respostas: Respostas };
const chaveBackup = (codigo: string) => `clube_parceiro_${codigo.slice(0, 16)}`;

function lerBackup(codigo: string): Backup | null {
  try {
    const t = localStorage.getItem(chaveBackup(codigo));
    return t ? (JSON.parse(t) as Backup) : null;
  } catch {
    return null;
  }
}
function gravarBackup(codigo: string, b: Backup | null) {
  try {
    if (b) localStorage.setItem(chaveBackup(codigo), JSON.stringify(b));
    else localStorage.removeItem(chaveBackup(codigo));
  } catch {
    // modo privado ou armazenamento cheio: segue sem cópia local
  }
}

// ─────────────────────────────────────────────────────────────

export default function CadastroParceiro() {
  const { hash } = useLocation();
  const codigo = useMemo(() => codigoDaUrl(hash), [hash]);

  const [estado, setEstado] = useState<"carregando" | "pronto" | ErroPortal>("carregando");
  const [cadastro, setCadastro] = useState<CadastroTela | null>(null);
  const [respostas, setRespostas] = useState<Completas>(() => completar({}));
  const [arquivos, setArquivos] = useState<ArquivoTela[]>([]);
  const [tela, setTela] = useState(0);
  const [voltarParaRevisao, setVoltarParaRevisao] = useState(false);
  const [mostrarErros, setMostrarErros] = useState(false);
  const [salvo, setSalvo] = useState<{ quando: Date | null; estado: "ok" | "salvando" | "offline" }>({
    quando: null,
    estado: "ok",
  });
  const [aviso, setAviso] = useState<string | null>(null);

  const respostasRef = useRef(respostas);
  const versao = useRef(0);
  const sujas = useRef(new Set<NomeEtapa>());
  const telaSuja = useRef(false);
  const telaRef = useRef(0);
  const editavelRef = useRef(false);
  const ocupado = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const entrouNaTela = useRef(Date.now());

  // ── carregar ─────────────────────────────────────────────────────────────
  const carregar = useCallback(
    async (manterTela = false) => {
      if (!codigo) return setEstado("link_invalido");
      try {
        const r = await abrir(codigo);
        const c = r.cadastro;
        let resp = completar(c.respostas);
        if (!resp.negocio.nomeEmpresa) resp = { ...resp, negocio: { ...resp.negocio, nomeEmpresa: c.empresa } };
        if (!resp.negocio.responsavel && c.contato) resp = { ...resp, negocio: { ...resp.negocio, responsavel: c.contato } };

        // Cópia no aparelho de mudanças que não chegaram ao servidor (só se ninguém salvou depois).
        const b = lerBackup(codigo);
        sujas.current.clear();
        if (b && b.versao === c.versao && b.sujas.length && c.editavel) {
          const doBackup = completar(b.respostas);
          for (const e of b.sujas) {
            (resp as Record<NomeEtapa, unknown>)[e] = doBackup[e];
            sujas.current.add(e);
          }
        } else if (b) gravarBackup(codigo, null);

        versao.current = c.versao;
        editavelRef.current = c.editavel;
        respostasRef.current = resp;
        setRespostas(resp);
        setCadastro(c);
        setArquivos(r.arquivos);
        if (!manterTela) {
          const inicial = !c.editavel || c.enviado_em ? CONCLUSAO : 0;
          setTela(inicial);
          telaRef.current = inicial;
        }
        setEstado("pronto");
        if (sujas.current.size) agendar(0);
      } catch (e) {
        setEstado(e instanceof FalhaPortal ? e.codigo : "rede");
      }
    },
    [codigo],
  );

  useEffect(() => {
    void carregar();
    void track("parceiro_cadastro_abriu");
  }, [carregar]);

  useEffect(() => {
    const antes = document.title;
    document.title = "Cadastro de parceiro · Clube Sanchez";
    return () => {
      document.title = antes;
    };
  }, []);

  // ── salvar ───────────────────────────────────────────────────────────────
  const descarregar = useCallback(async () => {
    if (!codigo || ocupado.current) return;
    if (!sujas.current.size && !telaSuja.current) return;
    ocupado.current = true;
    setSalvo((s) => ({ ...s, estado: "salvando" }));
    let etapa: NomeEtapa | undefined;
    try {
      while (sujas.current.size || telaSuja.current) {
        etapa = sujas.current.values().next().value;
        if (etapa) sujas.current.delete(etapa);
        telaSuja.current = false;
        const r = await salvar(codigo, {
          etapa,
          dados: etapa ? respostasRef.current[etapa] : undefined,
          versao: versao.current,
          etapa_atual: telaRef.current,
        });
        versao.current = r.versao;
        etapa = undefined;
        setCadastro((c) => (c ? { ...c, versao: r.versao, etapas_completas: r.etapas_completas, status: c.status === "convite_enviado" ? "cadastro_iniciado" : c.status } : c));
      }
      gravarBackup(codigo, null);
      setSalvo({ quando: new Date(), estado: "ok" });
    } catch (e) {
      if (etapa) sujas.current.add(etapa);
      const erro = e instanceof FalhaPortal ? e.codigo : "rede";
      if (erro === "conflito" || erro === "nao_editavel") {
        sujas.current.clear();
        gravarBackup(codigo, null);
        setAviso(
          erro === "conflito"
            ? "Outra pessoa salvou mudanças neste cadastro ao mesmo tempo. Carregamos a versão mais recente: confira a etapa antes de seguir."
            : "Nossa equipe já começou a preparar sua página, então o cadastro não pode mais ser alterado por aqui.",
        );
        ocupado.current = false;
        await carregar(erro === "conflito");
        return;
      }
      gravarBackup(codigo, { versao: versao.current, sujas: [...sujas.current], respostas: respostasRef.current });
      setSalvo((s) => ({ ...s, estado: "offline" }));
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void descarregar(), 8000);
    } finally {
      ocupado.current = false;
    }
  }, [codigo, carregar]);

  const agendar = useCallback(
    (ms = ESPERA_SALVAR_MS) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void descarregar(), ms);
    },
    [descarregar],
  );

  useEffect(() => {
    const online = () => void descarregar();
    const sair = (e: BeforeUnloadEvent) => {
      if (sujas.current.size) e.preventDefault();
    };
    window.addEventListener("online", online);
    window.addEventListener("beforeunload", sair);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("beforeunload", sair);
      window.clearTimeout(timer.current);
    };
  }, [descarregar]);

  function mudar<K extends NomeEtapa>(etapa: K, patch: Partial<Completas[K]>) {
    const novo = { ...respostasRef.current, [etapa]: { ...respostasRef.current[etapa], ...patch } } as Completas;
    respostasRef.current = novo;
    setRespostas(novo);
    sujas.current.add(etapa);
    if (codigo) gravarBackup(codigo, { versao: versao.current, sujas: [...sujas.current], respostas: novo });
    agendar();
  }

  function onArquivos(m: { novo?: ArquivoTela; removido?: string; etapas_completas: number[] }) {
    setArquivos((lista) => {
      let l = lista;
      if (m.removido) l = l.filter((a) => a.id !== m.removido);
      if (m.novo) {
        const n = m.novo;
        if (ARQUIVOS[n.tipo].unico) l = l.filter((a) => !(a.tipo === n.tipo && (n.tipo !== "item" || a.item_id === n.item_id)));
        l = [...l, n];
      }
      return l;
    });
    setCadastro((c) => (c ? { ...c, etapas_completas: m.etapas_completas } : c));
  }

  // ── navegação ────────────────────────────────────────────────────────────
  function irPara(n: number) {
    const anterior = telaRef.current;
    if (anterior >= 1 && anterior <= REVISAO && anterior !== n) {
      void track("parceiro_cadastro_etapa", {
        etapa: anterior,
        segundos: Math.round((Date.now() - entrouNaTela.current) / 1000),
      });
    }
    entrouNaTela.current = Date.now();
    telaRef.current = n;
    setTela(n);
    setMostrarErros(false);
    setAviso(null);
    if (n <= REVISAO && editavelRef.current) {
      telaSuja.current = true;
      agendar(0);
    }
    window.scrollTo({ top: 0 });
  }

  const pend = useMemo(() => calcularPendencias(respostas, arquivos), [respostas, arquivos]);
  const etapaDaTela: NomeEtapa | null = tela >= 1 && tela <= 6 ? ETAPAS[tela - 1] : null;
  const faltasDaTela = etapaDaTela ? pend.envio.filter((p) => p.etapa === etapaDaTela) : [];
  const erros: Erros = {};
  if (mostrarErros) for (const p of faltasDaTela) erros[p.campo] = mensagemDoCampo(p);

  function continuar(mesmoAssim = false) {
    if (!mesmoAssim && faltasDaTela.length) {
      setMostrarErros(true);
      requestAnimationFrame(() => {
        const alvo = document.querySelector(`[data-campo="${faltasDaTela[0].campo}"]`);
        alvo?.scrollIntoView({ behavior: "smooth", block: "center" });
        (alvo?.querySelector("input, textarea, button") as HTMLElement | null)?.focus({ preventScroll: true });
      });
      return;
    }
    if (voltarParaRevisao) {
      setVoltarParaRevisao(false);
      return irPara(REVISAO);
    }
    // Quem disse que não trabalha com orçamento já tem a etapa 6 respondida: segue para a revisão.
    irPara(Math.min(tela + 1, REVISAO));
  }

  function editarEtapa(n: number) {
    setVoltarParaRevisao(true);
    irPara(n);
  }

  // ── telas de erro ────────────────────────────────────────────────────────
  if (estado === "carregando") {
    return (
      <Moldura>
        <div className="grid min-h-[60vh] place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-cobre-deep" aria-label="Carregando seu cadastro" />
        </div>
      </Moldura>
    );
  }
  if (estado !== "pronto" || !cadastro || !codigo) {
    const titulo =
      estado === "link_vencido"
        ? "Este link venceu"
        : estado === "link_invalido"
          ? "Este link não é mais válido"
          : "Não conseguimos abrir seu cadastro";
    const texto =
      estado === "link_vencido" || estado === "link_invalido"
        ? "Peça um link novo para a coordenação do Clube. Ela manda pelo WhatsApp."
        : "Confira a internet e tente de novo. Se continuar, fale com a coordenação.";
    return (
      <Moldura>
        <div className="mx-auto flex max-w-xl flex-col gap-6 px-5 py-16">
          <TituloEtapa titulo={titulo} texto={texto} />
          <div className="flex flex-wrap gap-3">
            {estado !== "link_vencido" && estado !== "link_invalido" && (
              <button type="button" className="btn-primary" onClick={() => { setEstado("carregando"); void carregar(); }}>
                Tentar de novo
              </button>
            )}
            <a className="btn-quiet" href={linkCoordenacao("minha empresa", "Olá! Preciso de ajuda com o link do cadastro do Clube Sanchez.")} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Falar com a coordenação
            </a>
          </div>
        </div>
      </Moldura>
    );
  }

  const empresa = respostas.negocio.nomeEmpresa || cadastro.empresa;
  const temMaterial = !!respostas.negocio.materialLink || arquivos.some((a) => a.tipo === "referencia");
  const editavel = cadastro.editavel;

  // ── boas-vindas ──────────────────────────────────────────────────────────
  if (tela === 0) {
    const retomando = cadastro.status !== "convite_enviado" && cadastro.etapa_atual > 0;
    return (
      <Moldura>
        <div className="bg-grafite px-5 pb-10 pt-8 text-perola">
          <div className="mx-auto max-w-xl">
            <Marca claro />
            <h1 className="mt-10 font-display text-[clamp(2.1rem,8vw,3.2rem)] leading-[1.08] tracking-[-0.02em]">
              Olá, {cadastro.empresa}! Sua empresa está chegando ao Clube Sanchez!
            </h1>
          </div>
        </div>
        <div className="mx-auto flex max-w-xl flex-col gap-6 px-5 py-10 text-[17px] leading-relaxed text-grafite">
          <p>
            Queremos apresentar seu negócio, valorizar sua história e mostrar tudo o que sua empresa tem a oferecer à nossa
            comunidade.
          </p>
          <p>Preparamos algumas etapas para conhecer melhor sua marca e construir sua página exclusiva no nosso site.</p>
          <p>
            Não se preocupe em criar textos perfeitos. Nossa equipe vai organizar as informações e apresentar a página para sua
            aprovação antes da publicação.
          </p>
          <button
            type="button"
            className="btn-primary group mt-2 justify-center"
            onClick={() => irPara(retomando ? Math.min(Math.max(cadastro.etapa_atual, 1), REVISAO) : 1)}
          >
            {retomando ? "Continuar de onde parei" : "Começar meu cadastro"}
            <ArrowRight className="btn-primary-icon h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex flex-col gap-3 border-t border-grafite/10 pt-6 text-[15px]">
            <p>
              <strong>Cerca de 15 minutos.</strong> Você pode parar e continuar depois por este mesmo link: tudo fica salvo.
            </p>
            <p className="text-grafite-soft">
              Ajuda ter em mãos: o logo, de 3 a 6 fotos da empresa, o benefício que você quer oferecer e o link do site ou
              catálogo, se tiver.
            </p>
          </div>
        </div>
      </Moldura>
    );
  }

  // ── conclusão / andamento ────────────────────────────────────────────────
  if (tela === CONCLUSAO) {
    return (
      <Moldura>
        <Conclusao
          cadastro={cadastro}
          empresa={empresa}
          faltaParaPublicar={pend.publicacao}
          codigo={codigo}
          onEditar={() => irPara(REVISAO)}
          onVer={() => irPara(REVISAO)}
        />
      </Moldura>
    );
  }

  // ── etapas e revisão ─────────────────────────────────────────────────────
  const naRevisao = tela === REVISAO;
  return (
    <Moldura>
      <header className="sticky top-0 z-30 border-b border-grafite/10 bg-creme/95 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <div className="mx-auto max-w-xl">
          <div className="flex items-center justify-between gap-3">
            <Marca />
            <IndicadorSalvo salvo={salvo} />
          </div>
          <div className="mt-3 flex justify-between text-sm text-grafite-muted">
            <span>{naRevisao ? "Revisão" : `Etapa ${tela} de 7`}</span>
            <span>{etapaDaTela ? TITULO_ETAPA[etapaDaTela] : "Tudo certo?"}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-creme-200" role="progressbar" aria-valuemin={1} aria-valuemax={7} aria-valuenow={tela}>
            <div className="h-full rounded-full bg-cobre transition-[width] duration-300" style={{ width: `${(tela / 7) * 100}%` }} />
          </div>
        </div>
      </header>

      <main className="px-5 pb-40 pt-8">
        <div className="mx-auto max-w-xl">
        {aviso && (
          <div className="mb-6">
            <Aviso tom="atencao">{aviso}</Aviso>
          </div>
        )}
        {!editavel && (
          <div className="mb-6">
            <Aviso>Este é o cadastro que você enviou. Para mudar alguma coisa, fale com a coordenação.</Aviso>
          </div>
        )}

        {tela === 1 && (
          <EtapaNegocioTela dados={respostas.negocio} mudar={(p) => mudar("negocio", p)} erros={erros} editavel={editavel} codigo={codigo} arquivos={arquivos} onArquivos={onArquivos} />
        )}
        {tela === 2 && (
          <EtapaBeneficioTela dados={respostas.beneficio} mudar={(p) => mudar("beneficio", p)} erros={erros} editavel={editavel} empresa={empresa} />
        )}
        {tela === 3 && (
          <EtapaProdutosTela dados={respostas.produtos} mudar={(p) => mudar("produtos", p)} erros={erros} editavel={editavel} temMaterial={temMaterial} codigo={codigo} arquivos={arquivos} onArquivos={onArquivos} />
        )}
        {tela === 4 && (
          <EtapaFotosTela dados={respostas.fotos} mudar={(p) => mudar("fotos", p)} erros={erros} editavel={editavel} temMaterial={temMaterial} codigo={codigo} arquivos={arquivos} onArquivos={onArquivos} />
        )}
        {tela === 5 && <EtapaContatoTela dados={respostas.contato} mudar={(p) => mudar("contato", p)} erros={erros} editavel={editavel} />}
        {tela === 6 && <EtapaOrcamentoTela dados={respostas.orcamento} mudar={(p) => mudar("orcamento", p)} erros={erros} editavel={editavel} />}
        {naRevisao && (
          <Revisao
            respostas={respostas}
            arquivos={arquivos}
            pend={pend}
            editavel={editavel}
            codigo={codigo}
            onEditar={editarEtapa}
            onEnviado={async () => {
              void track("parceiro_cadastro_enviou");
              await carregar(true);
              irPara(CONCLUSAO);
            }}
            onVoltar={cadastro.enviado_em || !editavel ? () => irPara(CONCLUSAO) : undefined}
            antesDeEnviar={async () => {
              window.clearTimeout(timer.current);
              await descarregar();
              return sujas.current.size === 0;
            }}
          />
        )}

        {mostrarErros && faltasDaTela.length > 0 && (
          <div className="mt-8 flex flex-col gap-3 rounded-md bg-creme-100 p-4 text-[15px] text-grafite">
            <p>Faltam alguns campos desta etapa. Você pode completar agora ou seguir e voltar depois.</p>
            <button type="button" className="btn-quiet self-start" onClick={() => continuar(true)}>
              Seguir e completar depois
            </button>
          </div>
        )}
        </div>
      </main>

      {!naRevisao && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-grafite/10 bg-creme px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <div className="mx-auto flex max-w-xl gap-3">
            <button
              type="button"
              onClick={() => (voltarParaRevisao ? (setVoltarParaRevisao(false), irPara(REVISAO)) : irPara(tela - 1))}
              className="inline-flex min-h-[3.25rem] flex-[0_0_34%] items-center justify-center gap-2 rounded-md border border-grafite/20 bg-white text-[15px] font-semibold text-grafite"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {voltarParaRevisao ? "Revisão" : "Voltar"}
            </button>
            <button type="button" onClick={() => continuar()} className="btn-primary group flex-1 justify-center">
              {voltarParaRevisao ? "Salvar e revisar" : tela === 6 ? "Revisar" : "Continuar"}
              <ArrowRight className="btn-primary-icon h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </Moldura>
  );
}

// ── Peças da página ───────────────────────────────────────────────────────────

function Moldura({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-creme text-grafite">
      <meta name="robots" content="noindex, nofollow" />
      <meta name="referrer" content="no-referrer" />
      {children}
    </div>
  );
}

function Marca({ claro }: { claro?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <img src={logo} alt="" className="h-9 w-9 object-contain" />
      <span className={`font-display text-[19px] leading-none ${claro ? "text-perola" : "text-grafite"}`}>Clube Sanchez</span>
    </span>
  );
}

function IndicadorSalvo({ salvo }: { salvo: { quando: Date | null; estado: "ok" | "salvando" | "offline" } }) {
  if (salvo.estado === "salvando")
    return (
      <span className="flex items-center gap-1.5 text-sm text-grafite-muted" aria-live="polite">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Salvando…
      </span>
    );
  if (salvo.estado === "offline")
    return (
      <span className="flex items-center gap-1.5 text-sm font-semibold text-terracota-600" aria-live="polite">
        <CloudOff className="h-3.5 w-3.5" aria-hidden="true" /> Sem conexão, guardado no aparelho
      </span>
    );
  if (!salvo.quando) return null;
  return (
    <span className="flex items-center gap-1.5 text-sm text-grafite-muted" aria-live="polite">
      <Check className="h-3.5 w-3.5" aria-hidden="true" /> Salvo às{" "}
      {salvo.quando.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

// ── Revisão ───────────────────────────────────────────────────────────────────

function Bloco({ titulo, n, onEditar, editavel, children }: { titulo: string; n: number; onEditar: (n: number) => void; editavel: boolean; children: ReactNode }) {
  return (
    <section className="rounded-md border border-grafite/15 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-[22px] leading-tight text-grafite">{titulo}</h2>
        {editavel && (
          <button type="button" onClick={() => onEditar(n)} className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-cobre-deep">
            <Pencil className="h-4 w-4" aria-hidden="true" /> Editar
          </button>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-1.5 text-[15px] leading-relaxed text-grafite-soft">{children}</div>
    </section>
  );
}

function Linha({ r, v }: { r: string; v: ReactNode }) {
  if (!v) return null;
  return (
    <p>
      <span className="font-semibold text-grafite">{r}:</span> {v}
    </p>
  );
}

/** "Seg a sex 9h–18h · Sáb 9h–13h": junta dias seguidos com o mesmo horário. */
function horarioResumo(h: Completas["contato"]["horarios"]): string {
  const dias = Object.keys(DIAS) as Dia[];
  const curto = (d: Dia) => DIAS[d].slice(0, 3);
  const hora = (t: string) => t.replace(/^0/, "").replace(":00", "h").replace(/:(\d\d)$/, "h$1");
  const grupos: { de: Dia; ate: Dia; faixa: string }[] = [];
  for (const d of dias) {
    const x = h[d];
    if (!x) continue;
    const faixa = `${hora(x.abre)}–${hora(x.fecha)}`;
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.faixa === faixa && dias.indexOf(ultimo.ate) === dias.indexOf(d) - 1) ultimo.ate = d;
    else grupos.push({ de: d, ate: d, faixa });
  }
  return grupos
    .map((g) => `${g.de === g.ate ? curto(g.de) : `${curto(g.de)} a ${curto(g.ate).toLowerCase()}`} ${g.faixa}`)
    .join(" · ");
}

function Revisao({
  respostas: r,
  arquivos,
  pend,
  editavel,
  codigo,
  onEditar,
  onEnviado,
  onVoltar,
  antesDeEnviar,
}: {
  respostas: Completas;
  arquivos: ArquivoTela[];
  pend: Pendencias;
  editavel: boolean;
  codigo: string;
  onEditar: (n: number) => void;
  onEnviado: () => Promise<void>;
  onVoltar?: () => void;
  antesDeEnviar: () => Promise<boolean>;
}) {
  const [autorizo, setAutorizo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const n = r.negocio;
  const c = r.contato;
  const logo = arquivos.find((a) => a.tipo === "logo");
  const capa = arquivos.find((a) => a.tipo === "capa");
  const galeria = arquivos.filter((a) => a.tipo === "galeria").length;
  const itens = r.produtos.itens.filter((i) => i.nome);
  const enviado = !!onVoltar && editavel;
  const numeroEtapa = (e: Pendencia["etapa"]) => (e === "revisao" ? REVISAO : ETAPAS.indexOf(e) + 1);

  async function enviarAgora() {
    setErro(null);
    if (!autorizo) return setErro("Para enviar, marque que aceita as Condições de participação.");
    setEnviando(true);
    try {
      if (!(await antesDeEnviar())) {
        setErro("Não conseguimos salvar suas últimas mudanças. Confira a internet e tente de novo.");
        return;
      }
      await enviar(codigo);
      await onEnviado();
    } catch (e) {
      if (e instanceof FalhaPortal && Array.isArray(e.corpo.erros)) {
        setErro(`Ainda falta: ${(e.corpo.erros as Pendencia[]).map((p) => p.texto).join(", ")}.`);
      } else setErro("Não conseguimos enviar agora. Confira a internet e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <TituloEtapa
        titulo={editavel ? "Sua empresa está quase pronta para fazer parte do Clube Sanchez!" : "O que você enviou"}
        texto={editavel ? "Confira o resumo. Você pode voltar e editar qualquer parte." : undefined}
      />
      <div className="flex flex-col gap-4">
        {pend.envio.length > 0 && editavel && (
          <div className="rounded-md border-l-4 border-gatilho bg-[#F9E5D9] px-4 py-4 text-[15px] text-grafite">
            <p className="font-semibold">Para enviar, falta:</p>
            <ul className="mt-2 flex flex-col gap-1">
              {pend.envio.map((p) => (
                <li key={p.etapa + p.campo}>
                  <button type="button" className="text-left underline decoration-cobre/50 underline-offset-4" onClick={() => onEditar(numeroEtapa(p.etapa))}>
                    {p.texto} <span className="text-grafite-muted">({p.etapa === "revisao" ? "revisão" : TITULO_ETAPA[p.etapa]})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Bloco titulo="Seu negócio" n={1} onEditar={onEditar} editavel={editavel}>
          <Linha r="Empresa" v={n.nomeEmpresa} />
          <Linha r="Responsável" v={n.responsavel} />
          <Linha r="Segmento" v={n.segmento === "Outros" ? n.segmentoOutro || "Outros" : n.segmento} />
          <Linha r="Cidade" v={n.cidade} />
          <Linha r="Começou em" v={n.anoFundacao} />
          {n.oQueFaz && <p className="whitespace-pre-line">{n.oQueFaz}</p>}
          <Linha r="Material de referência" v={[n.materialLink, ...arquivos.filter((a) => a.tipo === "referencia").map((a) => a.nome)].filter(Boolean).join(" · ")} />
        </Bloco>

        <Bloco titulo="Benefício" n={2} onEditar={onEditar} editavel={editavel}>
          <CardBeneficioTela b={r.beneficio} />
          <p className={r.beneficio.confirmado ? "text-grafite" : "font-semibold text-terracota-600"}>
            {r.beneficio.confirmado ? "Benefício confirmado." : "Benefício ainda não confirmado."}
          </p>
        </Bloco>

        <Bloco titulo="Produtos e serviços" n={3} onEditar={onEditar} editavel={editavel}>
          <Linha r="Oferece" v={r.produtos.oferta ? OFERTA[r.produtos.oferta] : ""} />
          {itens.length ? (
            <ul className="flex flex-col gap-1">
              {itens.map((i) => (
                <li key={i.id}>
                  {i.nome}
                  {i.precoTipo && (
                    <span className="text-grafite-muted">
                      {" "}
                      · {i.precoTipo === "consulta" ? PRECO_TIPO.consulta : `${i.precoTipo === "apartir" ? "a partir de " : ""}R$ ${i.preco}`}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum item cadastrado.</p>
          )}
        </Bloco>

        <Bloco titulo="Fotos e marca" n={4} onEditar={onEditar} editavel={editavel}>
          <div className="flex gap-3">
            {[logo, capa].map((a, i) =>
              a?.url && a.mime.startsWith("image/") && a.mime !== "image/heic" ? (
                <img key={i} src={a.url} alt={i ? "Foto principal" : "Logo"} className={`h-20 rounded border border-grafite/10 bg-white ${i ? "w-32 object-cover" : "w-20 object-contain"}`} />
              ) : null,
            )}
          </div>
          <p>
            Logo: {logo ? "enviado" : "falta"} · Foto principal: {capa ? "enviada" : "falta"} · Mais fotos: {galeria}
          </p>
        </Bloco>

        <Bloco titulo="Contato" n={5} onEditar={onEditar} editavel={editavel}>
          <Linha r="Atendimento" v={c.modalidades.map((m) => (m === "outro" && c.modalidadeOutra ? c.modalidadeOutra : MODALIDADES[m as keyof typeof MODALIDADES])).join(", ")} />
          <Linha r="WhatsApp" v={c.whatsapp} />
          <Linha r="Instagram" v={c.instagram} />
          <Linha r="Site" v={c.site} />
          <Linha r="Endereço" v={c.rua ? `${c.rua}, ${c.numero}${c.complemento ? ` ${c.complemento}` : ""} · ${c.bairro} · ${c.cidadeEndereco}/${c.uf}` : ""} />
          <Linha r="Horário" v={c.horaMarcada ? "Com hora marcada" : horarioResumo(c.horarios)} />
          <Linha r="Regiões" v={[...c.regioes, c.regiaoOutra].filter(Boolean).join(", ")} />
        </Bloco>

        <Bloco titulo="Orçamentos" n={6} onEditar={onEditar} editavel={editavel}>
          <p>{r.orcamento.trabalha === "sim" ? "Trabalha com orçamento." : r.orcamento.trabalha === "nao" ? "Não trabalha com orçamento." : "Não respondido."}</p>
        </Bloco>

        {pend.publicacao.length > 0 && (
          <Aviso>
            <strong>Para publicar a página ainda falta:</strong> {pend.publicacao.map((p) => p.texto).join(", ")}. Você pode enviar
            assim mesmo e mandar o que falta depois, por este mesmo link.
          </Aviso>
        )}
        {pend.recomendado.length > 0 && (
          <p className="text-[15px] leading-relaxed text-grafite-soft">
            <strong className="text-grafite">Deixa a página mais completa (não é obrigatório):</strong>{" "}
            {pend.recomendado.map((p) => p.texto.toLowerCase()).join(", ")}.
          </p>
        )}

        {editavel && (
          <>
            <Caixa id="autorizacao" marcada={autorizo} onChange={setAutorizo}>
              Li e aceito as{" "}
              <a href="/condicoes-parceiro" target="_blank" rel="noreferrer" className="font-semibold text-cobre-deep underline underline-offset-4">
                Condições de participação
              </a>{" "}
              e autorizo o uso do nome, do logo, das fotos, das informações e do benefício enviados no site e nos canais do
              Clube Sanchez, conforme a{" "}
              <a href="/privacidade" target="_blank" rel="noreferrer" className="font-semibold text-cobre-deep underline underline-offset-4">
                Política de privacidade
              </a>
              .
            </Caixa>
            {erro && <p className="text-[15px] font-semibold text-terracota-600" role="alert">{erro}</p>}
            <button type="button" onClick={enviarAgora} disabled={enviando || pend.envio.length > 0} className="btn-primary group justify-center disabled:cursor-not-allowed disabled:opacity-60">
              {enviando ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
              {enviado ? "Enviar de novo com as mudanças" : "Enviar meu cadastro"}
            </button>
          </>
        )}
        {onVoltar && (
          <button type="button" className="btn-quiet self-start" onClick={onVoltar}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar ao andamento
          </button>
        )}
      </div>
    </>
  );
}

// ── Conclusão e andamento ─────────────────────────────────────────────────────

const PASSOS = [
  { rotulo: "Cadastro recebido", status: ["cadastro_recebido", "informacoes_incompletas"] },
  // A validação da Yruena é interna: para o parceiro, a página ainda está em preparação.
  { rotulo: "Em preparação", status: ["em_preparacao", "aguardando_validacao", "ajustes_solicitados"] },
  { rotulo: "Aguardando sua aprovação", status: ["aguardando_aprovacao"] },
  { rotulo: "Publicado", status: ["aprovado", "publicado"] },
];

function Conclusao({
  cadastro,
  empresa,
  faltaParaPublicar,
  codigo,
  onEditar,
  onVer,
}: {
  cadastro: CadastroTela;
  empresa: string;
  faltaParaPublicar: Pendencia[];
  codigo: string;
  onEditar: () => void;
  onVer: () => void;
}) {
  const passo = PASSOS.findIndex((p) => p.status.includes(cadastro.status));
  const [correcao, setCorrecao] = useState("");
  const [abrirCorrecao, setAbrirCorrecao] = useState(false);
  const [estadoCorrecao, setEstadoCorrecao] = useState<"" | "enviando" | "ok" | "erro">("");

  async function mandarCorrecao() {
    if (!correcao.trim()) return;
    setEstadoCorrecao("enviando");
    try {
      await pedirCorrecao(codigo, correcao);
      setEstadoCorrecao("ok");
      setCorrecao("");
      setAbrirCorrecao(false);
    } catch {
      setEstadoCorrecao("erro");
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-5 pb-16 pt-8">
      <Marca />
      <span className="mt-6 grid h-16 w-16 place-items-center rounded-full bg-cobre/12">
        <CheckCircle2 className="h-9 w-9 text-cobre-deep" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h1 className="h-display text-[clamp(2rem,7vw,2.75rem)]">Cadastro recebido com sucesso!</h1>
      <div className="flex flex-col gap-4 text-[17px] leading-relaxed text-grafite">
        <p>Obrigado por compartilhar um pouco mais sobre sua empresa!</p>
        <p>Nossa equipe vai organizar os materiais e preparar sua página dentro do Clube Sanchez.</p>
        <p>
          Assim que a primeira versão estiver pronta, entraremos em contato para que você possa conferir e aprovar as informações
          antes da publicação.
        </p>
        <p>Estamos felizes em construir essa parceria com você!</p>
      </div>

      <ol className="mt-2 flex flex-col gap-3 border-t border-grafite/10 pt-6">
        {PASSOS.map((p, i) => (
          <li key={p.rotulo} className={`flex items-center gap-3 text-[15px] ${i <= passo ? "font-semibold text-grafite" : "text-grafite-muted"}`}>
            <span className={`grid h-6 w-6 place-items-center rounded-full border-[1.5px] ${i <= passo ? "border-cobre-deep bg-cobre-deep text-perola" : "border-grafite/25"}`}>
              {i <= passo && <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />}
            </span>
            {p.rotulo}
            {i === passo && <span className="sr-only">(etapa atual)</span>}
          </li>
        ))}
      </ol>
      {cadastro.status === "informacoes_incompletas" && (
        <Aviso tom="atencao">Nossa equipe pediu para completar algumas informações. Toque em “Completar meu cadastro”.</Aviso>
      )}

      {cadastro.editavel && faltaParaPublicar.length > 0 && (
        <Aviso>
          <strong>Para publicar sua página ainda falta:</strong> {faltaParaPublicar.map((p) => p.texto).join(", ")}.
        </Aviso>
      )}

      <p className="text-[15px] text-grafite-soft">Guarde este link: por ele você acompanha o andamento da sua página.</p>

      <div className="flex flex-col gap-3">
        {cadastro.editavel ? (
          <button type="button" className="btn-primary group justify-center" onClick={onEditar}>
            Completar meu cadastro
            <ArrowRight className="btn-primary-icon h-5 w-5" aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="btn-quiet self-start" onClick={onVer}>
            Ver o que enviei
          </button>
        )}
        <a
          className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-md border border-grafite/20 bg-white px-6 text-[15px] font-semibold text-grafite"
          href={linkCoordenacao(empresa, `Olá! Acabei de enviar o cadastro da ${empresa} no Clube Sanchez.`)}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> Falar com a coordenação
        </a>
        <p className="text-center text-sm text-grafite-muted">WhatsApp da coordenação: +55 11 99662-8696</p>
      </div>

      {!cadastro.editavel && (
        <div className="border-t border-grafite/10 pt-6">
          {estadoCorrecao === "ok" && <p className="mb-3 text-[15px] font-semibold text-cobre-deep">Recebemos seu pedido. A equipe vai ajustar e te avisa.</p>}
          {abrirCorrecao ? (
            <div className="flex flex-col gap-3">
              <label htmlFor="correcao" className="text-[15px] font-semibold text-grafite">
                O que precisa corrigir?
              </label>
              <textarea id="correcao" className="min-h-28 rounded-md border border-grafite/20 bg-white px-4 py-3 text-base" value={correcao} maxLength={1000} onChange={(e) => setCorrecao(e.target.value)} />
              {estadoCorrecao === "erro" && <p className="text-sm font-semibold text-terracota-600">Não conseguimos enviar agora. Tente de novo.</p>}
              <button type="button" className="btn-primary justify-center" onClick={mandarCorrecao} disabled={estadoCorrecao === "enviando" || !correcao.trim()}>
                Enviar pedido de correção
              </button>
            </div>
          ) : (
            <button type="button" className="btn-quiet" onClick={() => setAbrirCorrecao(true)}>
              Preciso corrigir algo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
