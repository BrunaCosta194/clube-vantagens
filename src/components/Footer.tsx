import { MessageCircle, MapPin, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-grafite text-white/70">
      <div className="container-club grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-terracota font-display text-lg font-semibold text-white">
              S
            </span>
            <span className="font-display text-lg font-semibold text-white">
              Comunidade Sanchez
            </span>
          </div>
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
            <li><a href="#como-funciona" className="hover:text-white">Como funciona</a></li>
            <li><a href="#parceiros" className="hover:text-white">Parceiros</a></li>
            <li><a href="#indique" className="hover:text-white">Indique & ganhe</a></li>
            <li><a href="#cadastro" className="hover:text-white">Fazer parte</a></li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
            Contato
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            {/* TODO: preencher com os contatos reais da Sanchez */}
            <li>
              <a href="#" className="inline-flex items-center gap-2 hover:text-white">
                <MessageCircle className="h-4 w-4 text-dourado-soft" strokeWidth={1.5} />
                WhatsApp da Sanchez
              </a>
            </li>
            <li>
              <a href="#" className="inline-flex items-center gap-2 hover:text-white">
                <Instagram className="h-4 w-4 text-dourado-soft" strokeWidth={1.5} />
                @sanchezimoveis
              </a>
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-dourado-soft" strokeWidth={1.5} />
              Mogi das Cruzes · SP
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-club flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Sanchez Imóveis · Comunidade Sanchez</p>
          <p>Clube de Vantagens · Protótipo para aprovação</p>
        </div>
      </div>
    </footer>
  );
}
