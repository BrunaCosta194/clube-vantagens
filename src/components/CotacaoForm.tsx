import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  FileUp,
  Loader2,
  Lock,
  MessageCircle,
  Paperclip,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import type { ProdutoInsurance } from "@/data/insuranceProdutos";
import { track } from "@/lib/track";
import { DOC_QTD_MAX, DOC_TIPOS, problemaDoArquivo } from "@/lib/cotacoes";

const ease = [0.22, 1, 0.36, 1] as const;

// WhatsApp da Yruena — a cotação chega aqui.
const YRUENA_WPP = "5511971796030";

type Props = {
  produto: ProdutoInsurance | null;
  categoria?: string;
  onClose: () => void;
  /** Fase B2: substituir o envio-MVP por gravação no Supabase + notificação. */
  onEnviar?: (payload: CotacaoPayload) => Promise<void>;
};

export type CotacaoPayload = {
  produto: string;
  categoria?: string;
  nome: string;
  whatsapp: string;
  email: string;
  dados: Record<string, string>;
  arquivos: File[];
};

export default function CotacaoForm({
  produto,
  categoria,
  onClose,
  onEnviar,
}: Props) {
  const [dados, setDados] = useState<Record<string, string>>({});
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [aceite, setAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [avisoArquivos, setAvisoArquivos] = useState<string | null>(null);

  // reseta ao trocar de produto
  useEffect(() => {
    setDados({});
    setNome("");
    setWhatsapp("");
    setEmail("");
    setArquivos([]);
    setAvisoArquivos(null);
    setAceite(false);
    setEnviado(false);
    setErro(null);
  }, [produto?.slug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = produto ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [produto, onClose]);

  if (!produto) return null;

  function addArquivos(lista: FileList | null) {
    if (!lista) return;
    const novos = Array.from(lista);
    const problemas = novos.map(problemaDoArquivo).filter((p): p is string => !!p);
    const validos = novos.filter((f) => !problemaDoArquivo(f));
    const cabem = Math.max(0, DOC_QTD_MAX - arquivos.length);
    if (validos.length > cabem) {
      problemas.push(`No máximo ${DOC_QTD_MAX} arquivos por cotação.`);
    }
    setAvisoArquivos(problemas.length ? problemas.join(" ") : null);
    setArquivos((prev) => [...prev, ...validos.slice(0, cabem)]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removerArquivo(i: number) {
    setArquivos((prev) => prev.filter((_, idx) => idx !== i));
  }

  // resumo pro WhatsApp da Yruena (MVP — docs ficam no Supabase na Fase B2)
  function montarResumo(prod: ProdutoInsurance): string {
    const linhas = [
      `*Nova cotação — ${prod.nome}*`,
      categoria ? `Categoria: ${categoria}` : "",
      `Nome: ${nome}`,
      `WhatsApp: ${whatsapp}`,
      email ? `E-mail: ${email}` : "",
      "",
      ...prod.campos.map((c) => `${c.label}: ${dados[c.name] ?? "—"}`),
      "",
      `Documentos anexados: ${arquivos.length} arquivo(s)`,
    ].filter(Boolean);
    return linhas.join("\n");
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!produto) return;

    if (!nome.trim() || !whatsapp.trim()) {
      setErro("Preencha ao menos nome e WhatsApp.");
      return;
    }
    if (!aceite) {
      setErro("É preciso aceitar o tratamento dos dados para enviar.");
      return;
    }

    setEnviando(true);
    try {
      const payload: CotacaoPayload = {
        produto: produto.nome,
        categoria,
        nome,
        whatsapp,
        email,
        dados,
        arquivos,
      };

      // Persiste (Fase B2: grava no Supabase — tabela cotacoes + Storage).
      // Sem onEnviar (Fase B1), só registra no console.
      if (onEnviar) {
        await onEnviar(payload);
      } else {
        console.log("[cotacao] payload:", payload);
      }

      // Notifica a Yruena no WhatsApp com o resumo. Os documentos, quando há
      // persistência, já ficaram salvos no bucket privado.
      const texto = encodeURIComponent(montarResumo(produto));
      window.open(`https://wa.me/${YRUENA_WPP}?text=${texto}`, "_blank");

      void track("partner_contact", {
        slug: "insurance-sante",
        canal: "atendimento",
        produto: produto.slug,
      });

      setEnviado(true);
    } catch (err) {
      console.error(err);
      setErro("Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  const inputCls =
    "min-h-[3.25rem] w-full rounded-md border border-grafite/20 bg-white px-4 py-3 text-base text-grafite placeholder:text-grafite-muted outline-none transition-colors focus:border-cobre-deep focus:ring-2 focus:ring-cobre/20";

  return (
    <AnimatePresence>
      {produto && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-grafite/70"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Cotação — ${produto.nome}`}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.35, ease }}
            className="relative flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[12px] bg-creme shadow-[0_30px_90px_rgba(45,26,15,0.3)] sm:rounded-[12px]"
          >
            {/* cabeçalho */}
            <div className="flex items-start justify-between gap-3 bg-creme-100 px-6 py-6">
              <div>
                <p className="text-[15px] font-semibold text-cobre-deep">
                  Faça sua cotação
                </p>
                <h3 className="mt-1 font-display text-[26px] leading-tight text-grafite">
                  {produto.nome}
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-creme text-grafite transition-colors hover:bg-grafite hover:text-perola"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {enviado ? (
              /* ── sucesso ── */
              <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-[#2a9e6a]/12">
                  <CheckCircle2
                    className="h-9 w-9 text-[#23855a]"
                    strokeWidth={1.5}
                  />
                </span>
                <h4 className="font-display text-[26px] leading-tight text-grafite">
                  Cotação enviada!
                </h4>
                <p className="max-w-xs text-base leading-relaxed text-grafite">
                  A Yruena recebeu seu pedido de {produto.nome} e vai te
                  retornar pelo WhatsApp com a cotação. Fique de olho!
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 min-h-11 rounded-md bg-grafite px-6 text-[15px] font-semibold text-white transition hover:bg-grafite/90"
                >
                  Fechar
                </button>
              </div>
            ) : (
              /* ── formulário ── */
              <form
                onSubmit={enviar}
                className="flex-1 space-y-5 overflow-y-auto px-6 py-6"
              >
                {/* mensagem de confiança no topo */}
                <div className="flex items-center gap-3 rounded-[10px] bg-creme-100 px-4 py-4">
                  <ShieldCheck
                    className="h-5 w-5 shrink-0 text-cobre-deep"
                    strokeWidth={1.5}
                  />
                  <p className="text-sm leading-relaxed text-grafite">
                    Cotação <strong>sem compromisso</strong>. Seus dados são
                    tratados com sigilo e usados só para calcular sua proposta.
                  </p>
                </div>

                {/* base */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="sm:col-span-2">
                    <span className="mb-1.5 block text-[15px] font-semibold text-grafite">
                      Nome completo *
                    </span>
                    <input
                      className={inputCls}
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[15px] font-semibold text-grafite">
                      WhatsApp *
                    </span>
                    <input
                      className={inputCls}
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(11) 90000-0000"
                      inputMode="tel"
                      required
                    />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[15px] font-semibold text-grafite">
                      E-mail
                    </span>
                    <input
                      className={inputCls}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="voce@email.com"
                    />
                  </label>
                </div>

                {/* campos do produto */}
                {produto.campos.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {produto.campos.map((c) => (
                      <label
                        key={c.name}
                        className={c.full ? "sm:col-span-2" : ""}
                      >
                        <span className="mb-1.5 block text-[15px] font-semibold text-grafite">
                          {c.label}
                        </span>
                        {c.tipo === "select" ? (
                          <select
                            className={inputCls}
                            value={dados[c.name] ?? ""}
                            onChange={(e) =>
                              setDados((d) => ({ ...d, [c.name]: e.target.value }))
                            }
                          >
                            <option value="">Selecione...</option>
                            {c.opcoes?.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className={inputCls}
                            type={c.tipo === "number" ? "number" : c.tipo === "date" ? "date" : "text"}
                            placeholder={c.placeholder}
                            value={dados[c.name] ?? ""}
                            onChange={(e) =>
                              setDados((d) => ({ ...d, [c.name]: e.target.value }))
                            }
                          />
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {/* upload de documentos */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[15px] font-semibold text-grafite">
                      Documentos para a simulação
                    </span>
                    <span className="text-sm text-grafite-soft">
                      opcional agora
                    </span>
                  </div>

                  {produto.docsExigidos.length > 0 && (
                    <ul className="mb-3 space-y-1">
                      {produto.docsExigidos.map((d) => (
                        <li
                          key={d}
                          className="flex items-center gap-2 text-sm text-grafite"
                        >
                          <span className="h-1 w-1 rounded-full bg-cobre" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-grafite/40 bg-white px-4 py-4 text-[15px] font-semibold text-grafite transition-colors hover:border-cobre-deep hover:text-cobre-deep"
                  >
                    <FileUp className="h-4 w-4" strokeWidth={1.5} />
                    Anexar arquivos (PDF, foto...)
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept={DOC_TIPOS.join(",")}
                    className="hidden"
                    onChange={(e) => addArquivos(e.target.files)}
                  />
                  <p className="mt-2 text-sm text-grafite-soft">
                    PDF ou foto, até 10 MB cada (no máximo {DOC_QTD_MAX}).
                  </p>
                  {avisoArquivos && (
                    <p role="alert" className="mt-1 text-sm font-semibold text-gatilho">
                      {avisoArquivos}
                    </p>
                  )}

                  {arquivos.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {arquivos.map((f, i) => (
                        <li
                          key={`${f.name}-${i}`}
                          className="flex items-center gap-2 rounded-md bg-white px-3 py-2.5 text-sm text-grafite"
                        >
                          <Paperclip className="h-3.5 w-3.5 shrink-0 text-grafite-muted" strokeWidth={1.5} />
                          <span className="min-w-0 flex-1 truncate">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => removerArquivo(i)}
                            aria-label="Remover"
                            className="text-grafite-muted transition hover:text-terracota"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* segurança + LGPD */}
                <div className="flex items-start gap-2.5 rounded-[10px] bg-creme-100 px-4 py-4">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-grafite-muted" strokeWidth={1.5} />
                  <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-grafite">
                    <input
                      type="checkbox"
                      checked={aceite}
                      onChange={(e) => setAceite(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-cobre-deep"
                    />
                    <span>
                      Autorizo o uso dos meus dados e documentos exclusivamente
                      para a análise desta cotação, conforme a LGPD.
                    </span>
                  </label>
                </div>

                {erro && (
                  <p className="text-sm font-semibold text-gatilho">{erro}</p>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="flex w-full items-center justify-center gap-2 min-h-[3.25rem] rounded-md bg-cobre-deep px-5 text-[15px] font-semibold text-perola transition-colors hover:bg-grafite disabled:opacity-60"
                >
                  {enviando ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                  ) : (
                    <MessageCircle className="h-4 w-4" strokeWidth={1.6} />
                  )}
                  {enviando ? "Enviando..." : "Enviar cotação"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
