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

  return (
    <footer className="bg-grafite text-white/70">
      <div className="container-club grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.85fr_0.85fr_0.85fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src={logo} alt="Clube Sanchez" className="h-9 w-9 object-contain" />
            <span className="font-display text-lg font-semibold text-white">
              Clube Sanchez
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Há {anosDeSanchez()} anos, a Sanchez Imóveis realiza negócios
            imobiliários em Mogi das Cruzes e no Alto Tietê. O Clube Sanchez
            amplia essa história e conecta nossa comunidade a parceiros,
            soluções, vantagens e novas oportunidades.
          </p>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/60">
            Navegação
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {navegacao.map((l) => (
              <li key={l.href}>
                <a
                  href={naHome ? l.href : `/${l.href}`}
                  className="hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/60">
            Empresas do grupo
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {empresasDoGrupo.map((e) =>
              e.externo ? (
                <li key={e.href}>
                  <a
                    href={e.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    {e.label}
                  </a>
                </li>
              ) : (
                <li key={e.href}>
                  <Link to={e.href} className="hover:text-white">
                    {e.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/60">
            Contato
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <LinkRastreado
                href={hrefWpp}
                target="_blank"
                rel="noopener noreferrer"
                evento="social_click"
                props={{ rede: "whatsapp", local: "footer" }}
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <MessageCircle className="h-4 w-4 text-cobre-light" strokeWidth={1.5} />
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
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <Instagram className="h-4 w-4 text-cobre-light" strokeWidth={1.5} />
                @sanchezimoveisenegocios
              </LinkRastreado>
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cobre-light" strokeWidth={1.5} />
              Mogi das Cruzes · SP
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-club flex flex-col items-center justify-between gap-2 pb-24 pt-6 text-xs text-white/60 sm:flex-row sm:pb-6">
          <p>© {new Date().getFullYear()} Sanchez Imóveis · Clube Sanchez</p>
          <p className="font-medium text-white/75">{ASSINATURA}</p>
        </div>
      </div>
    </footer>
  );
}
