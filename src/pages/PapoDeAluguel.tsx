import { ArrowLeft, Mic } from "lucide-react";
import { Link } from "react-router-dom";

// STUB — página do Papo de Aluguel. Estrutura e paleta prontas;
// TODO: copy real, captura de e-book, mentoria e links de podcast/Instagram.
export default function PapoDeAluguel() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-banner-papo text-papo-texto">
      <div className="pointer-events-none absolute -right-20 top-0 h-[60vh] w-2/3 bg-[radial-gradient(60%_70%_at_80%_10%,rgba(89,208,240,0.16),transparent_60%)]" />

      <header className="container-club relative flex items-center justify-between py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-papo-texto/80 transition-colors hover:text-papo-texto"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Voltar ao clube
        </Link>
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-papo-laranja">
          <Mic className="h-4 w-4" strokeWidth={1.5} />
          Papo de Aluguel
        </span>
      </header>

      <main className="container-club relative flex min-h-[70vh] flex-col justify-center py-16">
        <h1 className="max-w-3xl font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.98]">
          Corretagem não é bico,{" "}
          <span className="italic text-papo-laranja">é profissão.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-papo-texto/80">
          {/* TODO: copy real do Papo de Aluguel — proposta do podcast,
              autoridade do corretor, o que a audiência ganha. */}
          Página em construção. O podcast que transforma a forma como o
          mercado enxerga a corretagem de locação.
        </p>

        <div className="mt-9 flex flex-wrap gap-4">
          <a
            href="#"
            className="inline-flex items-center rounded-full bg-papo-laranja px-6 py-3 text-sm font-medium text-papo-azul transition-all duration-500 ease-lux hover:brightness-105 active:scale-[0.98]"
          >
            {/* TODO: link real do e-book / captura de e-mail */}
            Baixe o e-book grátis
          </a>
          <a
            href="#"
            className="inline-flex items-center rounded-full border border-papo-texto/30 px-6 py-3 text-sm font-medium text-papo-texto transition-all duration-500 ease-lux hover:border-papo-texto hover:bg-white/5"
          >
            {/* TODO: link do podcast/Instagram */}
            Ouça o podcast
          </a>
        </div>
      </main>
    </div>
  );
}
