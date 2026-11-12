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
      <main className="pt-[104px] sm:pt-[128px]">
        <header className="container-club">
          <p className="eyebrow">Loja Sanchez</p>
          <h1 className="mt-3 h-display text-[clamp(3rem,7vw,6rem)]">
            A loja do <span className="italic text-cobre-deep">clube.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-grafite">
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
                className={`min-h-11 rounded-full px-5 text-[15px] font-semibold transition-colors duration-300 ${
                  filtro === f.valor
                    ? "bg-grafite text-perola"
                    : "bg-creme-100 text-grafite hover:bg-creme-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </header>

        <div className="container-club mt-14 pb-28 sm:mt-16 lg:pb-36">
          {lista.length === 0 ? (
            <p className="py-16 text-lg text-grafite">
              Nenhum produto neste canal ainda.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
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
