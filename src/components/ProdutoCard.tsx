import { ShoppingBag } from "lucide-react";
import {
  formatarPreco,
  seloDoCanal,
  type Produto,
} from "@/data/produtos";

// Card de produto da Loja. Vitrine — o botão abre o link externo
// (Mercado Livre / Shopee) em outra aba. Selo derivado do canal.
export default function ProdutoCard({ produto }: { produto: Produto }) {
  const selo = seloDoCanal(produto.canal);
  const temPreco = produto.preco > 0;
  const emBreve = produto.link === "#";

  return (
    <div className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-cobre-line/20 bg-creme-100 shadow-lux-sm transition-shadow duration-500 hover:shadow-lux">
      {/* imagem (ou bloco cobre quando ainda não há foto) */}
      <div className="relative aspect-square w-full overflow-hidden bg-banner-clube">
        {produto.imagem && (
          <img
            src={produto.imagem}
            alt={produto.nome}
            className="h-full w-full object-cover transition-transform duration-700 ease-lux group-hover:scale-[1.04]"
          />
        )}
        {/* selo do canal */}
        <span
          className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.1em] ${
            produto.canal === "mercadolivre"
              ? "border-cobre bg-perola text-cobre-deep"
              : "border-shopee/40 bg-[#ECE8E0] text-shopee"
          }`}
        >
          {selo}
        </span>
        {produto.precoDe && temPreco && (
          <span className="absolute right-3 top-3 rounded-full bg-gatilho px-2.5 py-1 font-mono text-[10px] font-semibold text-gatilho-text">
            -{Math.round((1 - produto.preco / produto.precoDe) * 100)}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <h3 className="font-display text-sm font-semibold leading-tight text-grafite sm:text-lg">
          {produto.nome}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-grafite-soft sm:mt-1.5 sm:text-sm">
          {produto.descricao}
        </p>

        <div className="mt-3 flex items-end justify-between gap-3 border-t border-cobre-line/15 pt-3 sm:mt-4 sm:pt-4">
          <div>
            {produto.precoDe && temPreco && (
              <p className="font-mono text-[11px] text-grafite-muted line-through sm:text-xs">
                {formatarPreco(produto.precoDe)}
              </p>
            )}
            <p className="font-display text-base font-semibold text-cobre-deep sm:text-xl">
              {temPreco ? formatarPreco(produto.preco) : "A definir"}
            </p>
            {produto.canal === "mercadolivre" && temPreco && (
              <p className="mt-0.5 text-[10px] text-grafite-muted sm:text-[11px]">
                em até 2x
              </p>
            )}
          </div>
        </div>

        {emBreve ? (
          <span className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-creme-200 px-4 py-2 text-xs font-medium text-grafite-muted sm:mt-4 sm:px-5 sm:py-2.5 sm:text-sm">
            Em breve
          </span>
        ) : (
          <a
            href={produto.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-cobre px-4 py-2 text-xs font-medium text-perola transition-all duration-500 ease-lux hover:bg-cobre-deep active:scale-[0.98] sm:mt-4 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm">
            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
            {produto.canal === "mercadolivre" ? "Comprar" : "Ver na Shopee"}
          </a>
        )}
      </div>
    </div>
  );
}
