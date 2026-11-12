import { MessageCircle, MapPin, Instagram } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/marca/logo-cs.png";
import { ASSINATURA, anosDeSanchez } from "@/lib/marca";
import LinkRastreado from "./LinkRastreado";

// Contatos reais do clube.
const WHATSAPP = "5511971796030";
const MENSAGEM_WPP = "Olá! Tenho uma dúvida sobre o Clube Sanchez.";
const INSTAGRAM = "https://www.instagram.com/sanchezimoveisenegocios/";

// Mesmas âncoras da navbar: viram /#seção quando o usuário não está na home.
const navegacao = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#parceiros", label: "Parceiros" },
  { href: "#indique", label: "Indique & ganhe" },
  { href: "#cadastro", label: "Fazer parte" },
];

// Empresas do grupo — destaque institucional, separado dos parceiros.
const empresasDoGrupo = [
  { label: "Sanchez Imóveis", href: "https://sanchezimoveis.com.br", externo: true },
  { label: "BioReluz", href: "/parceiro/bioreluz", externo: false },
  { label: "Insurance & Santé", href: "/parceiro/insurance-sante", externo: false },
];

export default function Footer() {
  const { pathname } = useLocation();
  const naHome = pathname === "/";
  const hrefWpp = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAGEM_WPP)}`;

  const titulo = "text-[15px] text-perola/60";
  const link = "transition-colors duration-200 hover:text-cobre-light";

  return (
    <footer className="bg-premium text-perola">
      <div className="container-club grid gap-12 pb-12 pt-20 sm:grid-cols-2 sm:pt-28 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src={logo} alt="" className="h-10 w-10 object-contain" />
            <span className="font-display text-[22px] leading-none">Clube Sanchez</span>
          </Link>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-perola/85">
            Há {anosDeSanchez()} anos, a Sanchez Imóveis realiza negócios
            imobiliários em Mogi das Cruzes e no Alto Tietê. O Clube Sanchez
            amplia essa história e conecta nossa comunidade a parceiros,
            soluções, vantagens e novas oportunidades.
          </p>
        </div>

        <div className="lg:col-span-2">
          <p className={titulo}>Navegação</p>
          <ul className="mt-4 space-y-3 text-base">
            {navegacao.map((l) => (
              <li key={l.href}>
                <a href={naHome ? l.href : `/${l.href}`} className={link}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <p className={titulo}>Empresas do grupo</p>
          <ul className="mt-4 space-y-3 text-base">
            {empresasDoGrupo.map((e) =>
              e.externo ? (
                <li key={e.href}>
                  <a href={e.href} target="_blank" rel="noopener noreferrer" className={link}>
                    {e.label}
                  </a>
                </li>
              ) : (
                <li key={e.href}>
                  <Link to={e.href} className={link}>
                    {e.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <p className={titulo}>Contato</p>
          <ul className="mt-4 space-y-3 text-base">
            <li>
              <LinkRastreado
                href={hrefWpp}
                target="_blank"
                rel="noopener noreferrer"
                evento="social_click"
                props={{ rede: "whatsapp", local: "footer" }}
                className={`inline-flex items-center gap-2 ${link}`}
              >
                <MessageCircle className="h-4 w-4 text-cobre-light" strokeWidth={1.75} />
                WhatsApp da Sanchez
              </LinkRastreado>
            </li>
            <li>
              <LinkRastreado
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                evento="social_click"
                props={{ rede: "instagram", local: "footer" }}
                className={`inline-flex items-center gap-2 break-all ${link}`}
              >
                <Instagram className="h-4 w-4 shrink-0 text-cobre-light" strokeWidth={1.75} />
                @sanchezimoveisenegocios
              </LinkRastreado>
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cobre-light" strokeWidth={1.75} />
              Mogi das Cruzes · SP
            </li>
          </ul>
        </div>
      </div>

      {/* fecho: o nome do clube de ponta a ponta */}
      <div className="container-club overflow-hidden" aria-hidden="true">
        <p className="whitespace-nowrap font-display text-[clamp(3.5rem,13.4vw,12.5rem)] leading-[0.9] tracking-[-0.04em] text-cobre-light">
          Clube Sanchez
        </p>
      </div>

      <div className="container-club flex flex-col justify-between gap-2 pb-28 pt-8 text-[15px] text-perola/70 sm:flex-row sm:pb-10">
        <p>
          © {new Date().getFullYear()} Sanchez Imóveis · Clube Sanchez ·{" "}
          <Link to="/privacidade" className="underline underline-offset-4 hover:text-perola">
            Privacidade
          </Link>
        </p>
        <p className="font-semibold text-perola/85">{ASSINATURA}</p>
      </div>
    </footer>
  );
}
