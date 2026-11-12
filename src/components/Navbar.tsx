import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, UserRound, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import QuemSomos from "./QuemSomos";
import logo from "@/assets/marca/logo-cs.png";
import { primeiroNome, useSessao } from "@/lib/sessao";

type NavLink = { label: string; href?: string; to?: string; modal?: true };

// Menu recomendado no briefing (Clube Sanchez é a marca/logo à esquerda,
// Minha área é o botão à direita — não entram nessa lista). "Quem somos"
// (modal institucional) mantido a pedido da Bruna. "Comunidade Sanchez"
// saiu do menu a pedido dela (29/09) — o cadastro fica no 1º banner.
const links: NavLink[] = [
  { label: "Quem somos", modal: true },
  { label: "Loja", to: "/loja" },
  { href: "#parceiros", label: "Parceiros" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#contato", label: "Contato" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [quemSomos, setQuemSomos] = useState(false);
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

  const linkDesktop =
    "inline-flex min-h-11 items-center text-[15px] font-semibold text-grafite transition-colors duration-200 hover:text-cobre-deep";
  const linkCelular =
    "block w-full py-4 text-left font-display text-2xl text-grafite transition-colors hover:text-cobre-deep";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || aberto ? "bg-creme-100" : "bg-creme"
      }`}
    >
      <nav className="container-club flex h-[72px] items-center gap-6 sm:h-20">
        <Link
          to="/"
          onClick={() => {
            // já na home: rola pro topo em vez de só trocar a rota
            if (naHome) window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex shrink-0 items-center gap-3"
        >
          <img src={logo} alt="" className="h-10 w-10 object-contain" />
          <span className="font-display text-xl leading-none text-grafite sm:text-[22px]">
            Clube Sanchez
          </span>
        </Link>

        <div className="ml-auto hidden items-center gap-8 xl:flex">
          {links.map((l) =>
            l.modal ? (
              <button key={l.label} onClick={() => setQuemSomos(true)} className={linkDesktop}>
                {l.label}
              </button>
            ) : l.to ? (
              <Link key={l.to} to={l.to} className={linkDesktop}>
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={naHome ? l.href : `/${l.href}`} className={linkDesktop}>
                {l.label}
              </a>
            ),
          )}
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-4 xl:ml-0">
          {/* Minha área — único botão de acesso: leva pro login quando
              deslogado, pra área do membro quando logado. */}
          {logada && (
            <span className="hidden text-[15px] text-grafite-soft sm:block">
              Olá, {primeiroNome(nome)}
            </span>
          )}
          <Link
            to={logada ? "/area" : "/login"}
            aria-label="Minha área"
            className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-cobre-deep text-[15px] font-semibold text-grafite transition-colors duration-200 hover:bg-cobre-deep hover:text-perola sm:px-5"
          >
            <UserRound className="h-[18px] w-[18px]" strokeWidth={1.75} />
            <span className="hidden sm:inline">Minha área</span>
          </Link>

          {/* menu do celular/tablet — a partir de xl os links já aparecem inteiros */}
          <button
            onClick={() => setAberto((v) => !v)}
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={aberto}
            className="grid h-11 w-11 place-items-center rounded-full text-grafite transition-colors hover:bg-grafite/5 xl:hidden"
          >
            {aberto ? (
              <X className="h-6 w-6" strokeWidth={1.5} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 top-[72px] overflow-y-auto bg-creme-100 sm:top-20 xl:hidden"
          >
            <div className="container-club pb-10 pt-4">
              {/* No celular a saudação não cabe na barra; aparece aqui. */}
              {logada && (
                <p className="pb-2 text-[15px] text-grafite-soft">Olá, {primeiroNome(nome)}</p>
              )}
              {links.map((l) =>
                l.modal ? (
                  <button
                    key={l.label}
                    onClick={() => {
                      setAberto(false);
                      setQuemSomos(true);
                    }}
                    className={linkCelular}
                  >
                    {l.label}
                  </button>
                ) : l.to ? (
                  <Link key={l.to} to={l.to} onClick={() => setAberto(false)} className={linkCelular}>
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.href}
                    href={naHome ? l.href : `/${l.href}`}
                    onClick={() => setAberto(false)}
                    className={linkCelular}
                  >
                    {l.label}
                  </a>
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <QuemSomos aberto={quemSomos} onClose={() => setQuemSomos(false)} />
    </header>
  );
}
