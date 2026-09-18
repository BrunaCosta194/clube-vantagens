import { MessageCircle, MapPin, Instagram } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/marca/logo-cs.png";

// Contatos reais do clube.
const WHATSAPP = "5511971796030";
const MENSAGEM_WPP = "Olá! Tenho uma dúvida sobre o Sanchez Clube.";
const INSTAGRAM = "https://www.instagram.com/sanchezimoveisenegocios/";

// Mesmas âncoras da navbar: viram /#seção quando o usuário não está na home.
const navegacao = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#parceiros", label: "Parceiros" },
  { href: "#indique", label: "Indique & ganhe" },
  { href: "#cadastro", label: "Fazer parte" },
];

export default function Footer() {
  const { pathname } = useLocation();
  const naHome = pathname === "/";
  const hrefWpp = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAGEM_WPP)}`;

  return (
    <footer className="bg-grafite text-white/70">
      <div className="container-club grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src={logo} alt="Sanchez Clube" className="h-9 w-9 object-contain" />
            <span className="font-display text-lg font-semibold text-white">
              Sanchez Clube
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Clube de Vantagens da Sanchez Imóveis. Há 53 anos realizando
            negócios imobiliários em Mogi das Cruzes e no Alto Tietê.
          </p>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
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
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
            Contato
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={hrefWpp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <MessageCircle className="h-4 w-4 text-cobre-light" strokeWidth={1.5} />
                WhatsApp da Sanchez
              </a>
            </li>
            <li>
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <Instagram className="h-4 w-4 text-cobre-light" strokeWidth={1.5} />
                @sanchezimoveisenegocios
              </a>
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cobre-light" strokeWidth={1.5} />
              Mogi das Cruzes · SP
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-club flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Sanchez Imóveis · Sanchez Clube</p>
        </div>
      </div>
    </footer>
  );
}
