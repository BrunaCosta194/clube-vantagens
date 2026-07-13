import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ExternalLink, MessageCircle, BadgePercent, ArrowRight } from "lucide-react";
import type { Parceiro } from "@/data/parceiros";

type Props = {
  parceiro: Parceiro | null;
  onClose: () => void;
};

export default function ParceiroModal({ parceiro, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = parceiro ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [parceiro, onClose]);

  return (
    <AnimatePresence>
      {parceiro && (
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
            aria-label={parceiro.nome}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[2rem] border border-grafite/10 bg-creme shadow-lux sm:rounded-[2rem]"
          >
            {/* imagem */}
            <div className="relative">
              <img
                src={parceiro.imagem}
                alt={parceiro.nome}
                className="h-44 w-full object-cover sm:h-52"
              />
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-creme/90 text-grafite shadow-lux-sm backdrop-blur-sm transition hover:bg-creme"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <span
                className="absolute bottom-4 left-4 rounded-full px-3 py-1 text-xs font-semibold text-white shadow"
                style={{ backgroundColor: parceiro.cor }}
              >
                {parceiro.categoria}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-7">
              <h3 className="font-display text-2xl font-semibold text-grafite">
                {parceiro.nome}
              </h3>

              {/* voucher destaque */}
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dourado/30 bg-dourado/10 px-4 py-3">
                <BadgePercent className="h-5 w-5 shrink-0 text-dourado-deep" strokeWidth={1.5} />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-dourado-deep">
                    Sua vantagem
                  </p>
                  <p className="font-semibold text-grafite">{parceiro.voucher}</p>
                </div>
              </div>

              <p className="mt-5 leading-relaxed text-grafite-soft">
                {parceiro.descricao}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {parceiro.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-grafite/10 bg-white px-3 py-1 text-xs font-medium text-grafite-soft"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* ações */}
            <div className="border-t border-grafite/10 bg-white p-5">
              <div className="flex flex-wrap gap-3">
                <a
                  href={parceiro.site ?? "#"}
                  target={parceiro.site ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-disabled={!parceiro.site}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                    parceiro.site
                      ? "border border-grafite/15 bg-white text-grafite hover:border-terracota/40 hover:text-terracota-700"
                      : "cursor-not-allowed border border-grafite/10 bg-grafite/5 text-grafite-muted"
                  }`}
                >
                  <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                  {parceiro.site ? "Visitar site" : "Site em breve"}
                </a>
                <a
                  href={
                    parceiro.whatsapp
                      ? `https://wa.me/${parceiro.whatsapp}`
                      : "#"
                  }
                  target={parceiro.whatsapp ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-disabled={!parceiro.whatsapp}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                    parceiro.whatsapp
                      ? "bg-[hsl(145,63%,42%)] text-white hover:brightness-105"
                      : "cursor-not-allowed bg-grafite/5 text-grafite-muted"
                  }`}
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                  {parceiro.whatsapp ? "WhatsApp" : "WhatsApp em breve"}
                </a>
              </div>
              <a
                href="#cadastro"
                onClick={onClose}
                className="mt-3 flex items-center justify-center gap-2 rounded-full bg-terracota px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-terracota-600"
              >
                Quero este benefício
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
