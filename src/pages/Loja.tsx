import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProdutoCard from "../components/ProdutoCard";
import { produtos, type CanalVenda } from "@/data/produtos";

type Filtro = "todos" | CanalVenda;

const filtros: { valor: Filtro; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "mercadolivre", label: "Entrega Sanchez" },
  { valor: "shopee", label: "Via Shopee" },
];

export default function Loja() {
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const lista =
    filtro === "todos"
      ? produtos
      : produtos.filter((p) => p.canal === filtro);

  return (
    <div className="min-h-screen bg-creme">
      <Navbar />
      <main className="pt-28 sm:pt-32">
        <header className="container-club">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cobre-deep">
            Loja Sanchez
          </p>
          <h1 className="mt-3 h-display text-[clamp(2.25rem,5.5vw,4rem)]">
            A loja do <span className="italic text-cobre">clube.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-grafite-soft">
            Produtos com curadoria Sanchez. Compra segura pelo Mercado Livre
            (em até 2x) ou pela Shopee — o selo em cada produto mostra o canal.
          </p>

          {/* filtro por canal */}
          <div className="mt-8 flex flex-wrap gap-2">
            {filtros.map((f) => (
              <button
                key={f.valor}
                onClick={() => setFiltro(f.valor)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  filtro === f.valor
                    ? "border-cobre bg-cobre text-perola"
                    : "border-cobre-line/30 text-grafite-soft hover:border-cobre hover:text-cobre-deep"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </header>

        <div className="container-club mt-10 pb-24 sm:mt-12">
          {lista.length === 0 ? (
            <p className="py-16 text-center text-grafite-muted">
              Nenhum produto neste canal ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {lista.map((p) => (
                <ProdutoCard key={p.slug} produto={p} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
