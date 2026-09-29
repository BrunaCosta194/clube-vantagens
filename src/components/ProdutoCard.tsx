import { ShoppingBag } from "lucide-react";
import {
  formatarPreco,
  seloDoCanal,
  type Produto,
} from "@/data/produtos";
import LinkRastreado from "./LinkRastreado";

// Card de produto da Loja. Vitrine — o botão abre o link externo
// (Mercado Livre / Shopee) em outra aba. Selo derivado do canal.
export default function ProdutoCard({ produto }: { produto: Produto }) {
  const selo = seloDoCanal(produto.canal);
  const temPreco = produto.preco > 0;
  const emBreve = produto.link === "#";

  return (
    <div className="bezel group flex h-full flex-col transition-all duration-700 ease-lux hover:-translate-y-1 hover:shadow-[0_50px_90px_-45px_hsl(19_40%_14%/0.4)]">
      {/* imagem (ou bloco cobre quando ainda não há foto) */}
      <div className="bezel-core relative aspect-square w-full bg-banner-clube">
        {produto.imagem && (
          <img
            src={produto.imagem}
            alt={produto.nome}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1.2s] ease-lux group-hover:scale-[1.05]"
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

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-5 sm:px-4 sm:pb-4">
        <h3 className="font-display text-lg font-semibold leading-tight text-grafite">
          {produto.nome}
        </h3>
        <p className="mb-4 mt-1.5 line-clamp-2 text-sm leading-relaxed text-grafite-soft">
          {produto.descricao}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-cobre-line/15 pt-4">
          <div>
            {produto.precoDe && temPreco && (
              <p className="font-mono text-xs text-grafite-muted line-through">
                {formatarPreco(produto.precoDe)}
              </p>
            )}
            <p className="font-display text-xl font-semibold text-cobre-deep">
              {temPreco ? formatarPreco(produto.preco) : "A definir"}
            </p>
            {produto.canal === "mercadolivre" && temPreco && (
              <p className="mt-0.5 text-[11px] text-grafite-muted">
                em até 2x
              </p>
            )}
          </div>
        </div>

        {emBreve ? (
          <span className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-creme-200 px-5 py-2.5 text-sm font-medium text-grafite-muted">
            Em breve
          </span>
        ) : (
          <LinkRastreado
            href={produto.link}
            target="_blank"
            rel="noopener noreferrer"
            evento="product_click"
            props={{ produto: produto.slug, canal: produto.canal, destino: produto.link }}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-cobre-deep/30 px-5 py-2.5 text-sm font-medium text-cobre-deep transition-all duration-500 ease-lux hover:border-cobre-deep hover:bg-cobre-deep hover:text-perola active:scale-[0.98]"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            {produto.canal === "mercadolivre" ? "Comprar" : "Ver na Shopee"}
          </LinkRastreado>
        )}
      </div>
    </div>
  );
}
