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

  // reseta ao trocar de produto
  useEffect(() => {
    setDados({});
    setNome("");
    setWhatsapp("");
    setEmail("");
    setArquivos([]);
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
    setArquivos((prev) => [...prev, ...Array.from(lista)]);
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

      setEnviado(true);
    } catch (err) {
      console.error(err);
      setErro("Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-grafite/15 bg-white px-3.5 py-2.5 text-sm text-grafite outline-none transition focus:border-cobre focus:ring-2 focus:ring-cobre/20";

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
            className="absolute inset-0 bg-grafite/60 backdrop-blur-sm"
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
            className="relative flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] border border-grafite/10 bg-creme shadow-lux sm:rounded-[2rem]"
          >
            {/* cabeçalho */}
            <div className="flex items-start justify-between gap-3 border-b border-grafite/10 bg-white px-6 py-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cobre-deep">
                  Faça sua cotação
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold text-grafite">
                  {produto.nome}
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-grafite/10 text-grafite transition hover:bg-grafite/5"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {enviado ? (
              /* ── sucesso ── */
              <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-[hsl(145,63%,42%)]/12">
                  <CheckCircle2
                    className="h-9 w-9 text-[hsl(145,63%,38%)]"
                    strokeWidth={1.5}
                  />
                </span>
                <h4 className="font-display text-xl font-semibold text-grafite">
                  Cotação enviada!
                </h4>
                <p className="max-w-xs text-sm leading-relaxed text-grafite-soft">
                  A Yruena recebeu seu pedido de {produto.nome} e vai te
                  retornar pelo WhatsApp com a cotação. Fique de olho!
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 rounded-full bg-grafite px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-grafite/90"
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
                <div className="flex items-center gap-3 rounded-2xl border border-cobre-line/40 bg-cobre/10 px-4 py-3">
                  <ShieldCheck
                    className="h-5 w-5 shrink-0 text-cobre-deep"
                    strokeWidth={1.5}
                  />
                  <p className="text-xs leading-relaxed text-grafite-soft">
                    Cotação <strong>sem compromisso</strong>. Seus dados são
                    tratados com sigilo e usados só para calcular sua proposta.
                  </p>
                </div>

                {/* base */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-grafite-soft">
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
                    <span className="mb-1 block text-xs font-medium text-grafite-soft">
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
                    <span className="mb-1 block text-xs font-medium text-grafite-soft">
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
                        <span className="mb-1 block text-xs font-medium text-grafite-soft">
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
                    <span className="text-xs font-medium text-grafite-soft">
                      Documentos para a simulação
                    </span>
                    <span className="font-mono text-[10px] text-grafite-muted">
                      opcional agora
                    </span>
                  </div>

                  {produto.docsExigidos.length > 0 && (
                    <ul className="mb-3 space-y-1">
                      {produto.docsExigidos.map((d) => (
                        <li
                          key={d}
                          className="flex items-center gap-2 text-xs text-grafite-soft"
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-grafite/25 bg-white px-4 py-4 text-sm font-medium text-grafite-soft transition hover:border-cobre hover:text-cobre-deep"
                  >
                    <FileUp className="h-4 w-4" strokeWidth={1.5} />
                    Anexar arquivos (PDF, foto...)
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => addArquivos(e.target.files)}
                  />

                  {arquivos.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {arquivos.map((f, i) => (
                        <li
                          key={`${f.name}-${i}`}
                          className="flex items-center gap-2 rounded-lg border border-grafite/10 bg-white px-3 py-2 text-xs text-grafite"
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
                <div className="flex items-start gap-2.5 rounded-2xl bg-grafite/[0.03] px-4 py-3">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-grafite-muted" strokeWidth={1.5} />
                  <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-grafite-soft">
                    <input
                      type="checkbox"
                      checked={aceite}
                      onChange={(e) => setAceite(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-cobre"
                    />
                    <span>
                      Autorizo o uso dos meus dados e documentos exclusivamente
                      para a análise desta cotação, conforme a LGPD.
                    </span>
                  </label>
                </div>

                {erro && (
                  <p className="text-xs font-medium text-terracota">{erro}</p>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-cobre px-5 py-3.5 text-sm font-semibold text-perola shadow-card transition hover:bg-cobre-deep disabled:opacity-60"
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
