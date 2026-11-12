import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { X, ExternalLink, Instagram, MessageCircle, BadgePercent, ArrowRight } from "lucide-react";
import type { Parceiro } from "@/data/parceiros";
import LinkRastreado from "./LinkRastreado";

type Props = {
  parceiro: Parceiro | null;
  onClose: () => void;
};

export default function ParceiroModal({ parceiro, onClose }: Props) {
  const isInstagram = parceiro?.site?.includes("instagram.com") ?? false;

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
            className="absolute inset-0 bg-grafite/70"
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
            className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[12px] bg-creme shadow-[0_30px_90px_rgba(45,26,15,0.3)] sm:rounded-[12px]"
          >
            {/* imagem */}
            <div className="relative bg-[#FBF8F3]">
              <img
                src={parceiro.imagem}
                alt={parceiro.nome}
                className="h-48 w-full object-contain px-10 py-8 sm:h-56"
              />
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-creme text-grafite transition-colors hover:bg-grafite hover:text-perola"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <p className="text-[15px] text-grafite-soft">{parceiro.categoria}</p>
              <h3 className="mt-1 font-display text-[clamp(2rem,4vw,2.5rem)] leading-tight text-grafite">
                {parceiro.nome}
              </h3>

              {/* voucher destaque (só quando o parceiro tem vantagem anunciada) */}
              {parceiro.voucher && (
                <div className="mt-5 flex items-center gap-3 rounded-[10px] bg-creme-100 px-5 py-4">
                  <BadgePercent className="h-5 w-5 shrink-0 text-cobre-deep" strokeWidth={1.5} />
                  <div>
                    <p className="text-[15px] text-grafite-soft">
                      Sua vantagem
                    </p>
                    <p className="text-lg font-semibold text-cobre-deep">{parceiro.voucher}</p>
                  </div>
                </div>
              )}

              <p className="mt-5 text-[17px] leading-relaxed text-grafite">
                {parceiro.descricao}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {parceiro.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-creme-100 px-3 py-1.5 text-sm text-grafite"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* ações */}
            <div className="bg-creme-100 p-5 sm:px-8">
              <div className="flex flex-wrap gap-3">
                <LinkRastreado
                  href={parceiro.site ?? "#"}
                  target={parceiro.site ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-disabled={!parceiro.site}
                  evento="partner_contact"
                  props={{ slug: parceiro.slug, canal: "site" }}
                  className={`inline-flex min-h-[3.25rem] flex-1 items-center justify-center gap-2 rounded-md px-5 text-[15px] font-semibold transition-colors ${
                    parceiro.site
                      ? "border border-grafite text-grafite hover:bg-grafite hover:text-perola"
                      : "cursor-not-allowed bg-creme-200 text-grafite-soft"
                  }`}
                >
                  {isInstagram ? (
                    <Instagram className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  {parceiro.site ? (isInstagram ? "Instagram" : "Visitar site") : "Site em breve"}
                </LinkRastreado>
                <LinkRastreado
                  href={parceiro.whatsapp ?? "#"}
                  target={parceiro.whatsapp ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-disabled={!parceiro.whatsapp}
                  evento="partner_contact"
                  props={{ slug: parceiro.slug, canal: "whatsapp" }}
                  className={`inline-flex min-h-[3.25rem] flex-1 items-center justify-center gap-2 rounded-md px-5 text-[15px] font-semibold transition-colors ${
                    parceiro.whatsapp
                      ? "bg-[#2a9e6a] text-white hover:bg-[#23855a]"
                      : "cursor-not-allowed bg-creme-200 text-grafite-soft"
                  }`}
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                  {parceiro.whatsapp ? "WhatsApp" : "WhatsApp em breve"}
                </LinkRastreado>
              </div>
              <Link
                to="/cadastro"
                onClick={onClose}
                className="mt-3 flex min-h-[3.25rem] items-center justify-center gap-2 rounded-md bg-cobre-deep px-5 text-[15px] font-semibold text-perola transition-colors hover:bg-grafite"
              >
                Quero este benefício
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
