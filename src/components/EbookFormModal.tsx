import { type FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Download, Loader2, Lock, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  EBOOK_SLUG,
  enviarLeadEBaixar,
  erroDoEmail,
  erroDoNome,
  erroDoWhatsapp,
} from "@/lib/ebook";
import { track } from "@/lib/track";

// Modal "Antes de baixar" — Bloco 6. Substitui o gate de cadastro do e-book:
// o visitante entrega nome/e-mail/WhatsApp e leva o PDF na hora.
//
// Duas regras do briefing moram aqui:
//   • o checkbox de comunicações é SEPARADO e OPCIONAL — recusar não impede
//     o download (por isso ele não entra em nenhuma validação);
//   • o download não depende do insert — `enviarLeadEBaixar` já dispara o PDF
//     mesmo com o banco fora, então a tela de sucesso é sempre honesta.

const ease = [0.22, 1, 0.36, 1] as const;

const inputCls =
  "w-full rounded-xl border border-grafite/15 bg-white px-3.5 py-2.5 text-sm text-grafite outline-none transition focus:border-cobre focus:ring-2 focus:ring-cobre/20";

type Props = {
  aberto: boolean;
  onClose: () => void;
  /** Avisa a página que o PDF já foi disparado (pra atualizar o texto de apoio). */
  onBaixado?: () => void;
};

export default function EbookFormModal({ aberto, onClose, onBaixado }: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [aceitaComunicacao, setAceitaComunicacao] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [baixou, setBaixou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const primeiroCampo = useRef<HTMLInputElement>(null);

  // Esc fecha + trava o scroll do fundo enquanto o modal está aberto.
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [aberto, onClose]);

  // Estado limpo a cada abertura (inclusive depois de um erro) e foco no
  // primeiro campo — quem abriu o modal veio pra digitar.
  useEffect(() => {
    if (!aberto) return;
    setErro(null);
    setBaixou(false);
    setEnviando(false);
    const t = setTimeout(() => primeiroCampo.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [aberto]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (enviando) return;

    const problema = erroDoNome(nome) ?? erroDoEmail(email) ?? erroDoWhatsapp(whatsapp);
    if (problema) {
      setErro(problema);
      return;
    }

    setErro(null);
    setEnviando(true);
    void track("ebook_form_submit", { material: EBOOK_SLUG });

    try {
      await enviarLeadEBaixar({ nome, email, whatsapp, aceitaComunicacao });
      setBaixou(true);
      onBaixado?.();
    } catch (err) {
      // `enviarLeadEBaixar` engole as falhas de banco; se caiu aqui foi algo
      // inesperado e o PDF pode não ter saído — aí sim é erro pra mostrar.
      console.error("[ebook] falha inesperada no envio do formulário:", err);
      setErro("Não foi possível concluir agora. Tente de novo em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
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
            aria-label="Antes de baixar o e-book"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.35, ease }}
            className="relative flex max-h-[94vh] w-full max-w-md flex-col overflow-hidden rounded-t-[2rem] border border-grafite/10 bg-creme shadow-lux sm:rounded-[2rem]"
          >
            {/* cabeçalho — cobre-deep atrás de pérola (contraste AA) */}
            <div className="relative bg-cobre-deep px-6 py-6">
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-perola/90 text-grafite shadow-lux-sm transition hover:bg-perola"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-perola/80">
                E-book grátis
              </p>
              <h2 className="mt-1.5 max-w-[16rem] font-display text-2xl font-semibold leading-tight text-perola">
                Antes de baixar
              </h2>
            </div>

            {baixou ? (
              /* ── sucesso ── */
              <div className="flex flex-col items-center gap-4 px-6 py-11 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-[hsl(145,63%,42%)]/12">
                  <CheckCircle2
                    className="h-9 w-9 text-[hsl(145,63%,38%)]"
                    strokeWidth={1.5}
                  />
                </span>
                <h3 className="font-display text-xl font-semibold text-grafite">
                  Download liberado!
                </h3>
                <p className="max-w-xs text-sm leading-relaxed text-grafite-soft">
                  O e-book já começou a baixar. Se não aparecer, confira a pasta
                  de downloads do seu navegador.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 rounded-full bg-grafite px-6 py-2.5 text-sm font-semibold text-perola transition hover:bg-grafite/90"
                >
                  Fechar
                </button>
              </div>
            ) : (
              /* ── formulário ── */
              <form onSubmit={enviar} className="flex-1 space-y-4 overflow-y-auto px-6 py-6" noValidate>
                <p className="text-sm leading-relaxed text-grafite-soft">
                  Preencha seus dados para receber o e-book e novos materiais do
                  Papo de Aluguel.
                </p>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-grafite-soft">
                    Nome completo *
                  </span>
                  <input
                    ref={primeiroCampo}
                    className={inputCls}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-grafite-soft">
                    E-mail *
                  </span>
                  <input
                    className={inputCls}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="voce@email.com"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-grafite-soft">
                    WhatsApp *
                  </span>
                  <input
                    className={inputCls}
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(11) 90000-0000"
                    required
                  />
                </label>

                {/* Opt-in separado: sem `required`, desmarcado por padrão. */}
                <div className="flex items-start gap-2.5 rounded-2xl bg-grafite/[0.03] px-4 py-3">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-grafite-muted" strokeWidth={1.5} />
                  <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-grafite-soft">
                    <input
                      type="checkbox"
                      checked={aceitaComunicacao}
                      onChange={(e) => setAceitaComunicacao(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-cobre"
                    />
                    <span>
                      Quero receber novidades e materiais do Clube Sanchez por
                      e-mail e WhatsApp. (opcional — o download é liberado do
                      mesmo jeito)
                    </span>
                  </label>
                </div>

                <p className="text-xs leading-relaxed text-grafite-muted">
                  Seus dados são usados para enviar o material e, se você
                  autorizar acima, novidades do clube. Veja a{" "}
                  <Link
                    to="/privacidade"
                    target="_blank"
                    rel="noopener"
                    className="font-medium text-cobre-deep underline underline-offset-2 hover:text-grafite"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </p>

                {erro && (
                  <p role="alert" className="text-xs font-medium text-terracota-700">
                    {erro}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-cobre-deep px-5 py-3.5 text-sm font-semibold text-perola shadow-lux-sm transition hover:bg-grafite disabled:opacity-60"
                >
                  {enviando ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                  ) : (
                    <Download className="h-4 w-4" strokeWidth={1.8} />
                  )}
                  {enviando ? "Preparando..." : "Baixar e-book grátis"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
