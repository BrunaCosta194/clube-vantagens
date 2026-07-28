import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// STUB — página do Sanchez Premium (nível aspiracional, paleta escura própria).
// TODO: copy real — curadoria, segurança jurídica, investimentos imobiliários.
export default function Premium() {
  return (
    <div className="min-h-screen bg-banner-premium text-perola">
      <header className="container-club flex items-center justify-between py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-perola/80 transition-colors hover:text-perola"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Voltar ao clube
        </Link>
        <span className="font-mono text-xs uppercase tracking-[0.22em] text-cobre-light">
          Sanchez Premium
        </span>
      </header>

      <main className="container-club flex min-h-[70vh] flex-col justify-center py-16">
        <h1 className="max-w-3xl font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.98]">
          Curadoria, segurança jurídica{" "}
          <span className="italic text-cobre-light">e investimentos.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-perola/75">
          {/* TODO: copy real do Premium — proposta de alto padrão, curadoria
              de imóveis, segurança jurídica e investimentos imobiliários. */}
          Página em construção. O nível de quem busca exclusividade e curadoria
          completa em cada negócio imobiliário.
        </p>

        <div className="mt-9">
          <Link
            to="/cadastro"
            className="inline-flex items-center rounded-full border border-perola/40 px-6 py-3 text-sm font-medium text-perola transition-all duration-500 ease-lux hover:border-perola hover:bg-perola/5 active:scale-[0.98]"
          >
            Falar com a curadoria
          </Link>
        </div>
      </main>
    </div>
  );
}
