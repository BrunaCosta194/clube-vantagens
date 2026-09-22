import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, UserRound, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/marca/logo-cs.png";
import { primeiroNome, useSessao } from "@/lib/sessao";

type NavLink = { label: string; href?: string; to?: string };

// Menu recomendado no briefing (Clube Sanchez é a marca/logo à esquerda,
// Minha área é o botão à direita — não entram nessa lista).
const links: NavLink[] = [
  { label: "Loja", to: "/loja" },
  { label: "Comunidade Sanchez", to: "/cadastro" },
  { href: "#parceiros", label: "Parceiros" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#indique", label: "Indique e ganhe" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [aberto, setAberto] = useState(false);
  const location = useLocation();
  const naHome = location.pathname === "/";
  const { usuario, nome, carregando } = useSessao();
  // Enquanto lê a sessão do localStorage, segura o estado de visitante: piscar
  // "Entrar" e trocar por "Minha área" logo depois fica pior que esperar.
  const logada = !carregando && usuario !== null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // trava o scroll do fundo enquanto o menu do celular está aberto
  useEffect(() => {
    document.body.style.overflow = aberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [aberto]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-6">
      <nav
        className={`flex items-center gap-1 rounded-full border transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-2 ${
          scrolled
            ? "border-grafite/10 bg-creme/80 py-2 pl-3 pr-2 shadow-lux-sm backdrop-blur-xl"
            : "border-white/10 bg-grafite/5 py-2.5 pl-4 pr-2.5 backdrop-blur-md"
        }`}
      >
        <Link
          to="/"
          onClick={() => {
            // já na home: rola pro topo em vez de só trocar a rota
            if (naHome) window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2.5 pr-1 sm:pr-2"
        >
          <img src={logo} alt="Clube Sanchez" className="h-9 w-9 object-contain" />
          <span className="hidden font-display text-[15px] font-semibold leading-none text-grafite sm:block">
            Clube Sanchez
          </span>
        </Link>

        <div className="mx-1 hidden items-center gap-1 lg:flex">
          {links.map((l) =>
            l.to ? (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-grafite-soft transition-colors duration-300 hover:bg-grafite/5 hover:text-grafite"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={naHome ? l.href : `/${l.href}`}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-grafite-soft transition-colors duration-300 hover:bg-grafite/5 hover:text-grafite"
              >
                {l.label}
              </a>
            ),
          )}
        </div>

        {/* Minha área — único botão de acesso: leva pro login quando
            deslogado, pra área do membro quando logado. Cobre a antiga
            dupla Entrar/Fazer parte (o menu já leva pro cadastro). */}
        {logada && (
          <span className="hidden px-3 py-2 text-sm font-medium text-grafite-soft sm:block sm:px-3.5">
            Olá, {primeiroNome(nome)}
          </span>
        )}
        <Link
          to={logada ? "/area" : "/login"}
          className="group inline-flex items-center gap-2 rounded-full bg-cobre-deep py-2 pl-4 pr-2 text-sm font-medium text-perola transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-grafite active:scale-[0.98]"
        >
          Minha área
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <UserRound className="h-3.5 w-3.5" strokeWidth={1.5} />
          </span>
        </Link>

        {/* menu do celular/tablet — a partir de lg os links já aparecem inteiros */}
        <button
          onClick={() => setAberto((v) => !v)}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          className="ml-0.5 grid h-10 w-10 place-items-center rounded-full text-grafite transition-colors hover:bg-grafite/5 lg:hidden"
        >
          {aberto ? (
            <X className="h-5 w-5" strokeWidth={1.5} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          )}
        </button>
      </nav>

      <AnimatePresence>
        {aberto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAberto(false)}
              className="fixed inset-0 -z-10 bg-grafite/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-4 top-[calc(100%+0.5rem)] rounded-[1.75rem] border border-grafite/10 bg-creme p-3 shadow-lux lg:hidden"
            >
              {/* No celular/tablet a saudação não cabe na barra; aparece aqui. */}
              {logada && (
                <p className="border-b border-grafite/10 px-4 pb-3 pt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-grafite-soft">
                  Olá, {primeiroNome(nome)}
                </p>
              )}

              {links.map((l) =>
                l.to ? (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setAberto(false)}
                    className="block rounded-2xl px-4 py-3.5 text-[15px] font-medium text-grafite transition-colors hover:bg-grafite/5"
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.href}
                    href={naHome ? l.href : `/${l.href}`}
                    onClick={() => setAberto(false)}
                    className="block rounded-2xl px-4 py-3.5 text-[15px] font-medium text-grafite transition-colors hover:bg-grafite/5"
                  >
                    {l.label}
                  </a>
                ),
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
