import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProdutoCard from "../components/ProdutoCard";
import { produtos, seloDoCanal, type CanalVenda } from "@/data/produtos";

type Filtro = "todos" | CanalVenda;

// canais que realmente têm produto agora (deriva os filtros/subtítulo).
// Ao voltar a vender por outro canal, o filtro e o texto se ajustam sozinhos.
const canaisAtivos = [...new Set(produtos.map((p) => p.canal))];

const filtros: { valor: Filtro; label: string }[] = [
  { valor: "todos", label: "Todos" },
  ...canaisAtivos.map((c) => ({ valor: c, label: seloDoCanal(c) })),
];

const soShopee =
  canaisAtivos.length === 1 && canaisAtivos[0] === "shopee";

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
            {soShopee
              ? "Produtos com curadoria Sanchez. Compra segura pela Shopee, com a confiança de quem já é do clube."
              : "Produtos com curadoria Sanchez. Compra segura pelo Mercado Livre (em até 2x) ou pela Shopee — o selo em cada produto mostra o canal."}
          </p>

          {/* filtro por canal — some quando só há um canal ativo */}
          <div
            className="mt-8 flex-wrap gap-2"
            style={{ display: filtros.length > 2 ? "flex" : "none" }}
          >
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
