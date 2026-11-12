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
    <div className="group flex h-full flex-col">
      {/* foto (ou bloco cobre quando ainda não há foto) */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[10px] bg-creme-200">
        {produto.imagem && (
          <img
            src={produto.imagem}
            alt={produto.nome}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1.2s] ease-lux group-hover:scale-[1.04]"
          />
        )}
        {/* selo do canal */}
        <span
          className={`absolute left-3 top-3 rounded-[4px] px-2.5 py-1.5 text-[13px] font-semibold ${
            produto.canal === "mercadolivre" ? "bg-cobre-deep text-perola" : "bg-perola text-grafite"
          }`}
        >
          {selo}
        </span>
        {produto.precoDe && temPreco && (
          <span className="absolute right-3 top-3 rounded-[4px] bg-gatilho px-2.5 py-1.5 text-[13px] font-semibold text-gatilho-text">
            -{Math.round((1 - produto.preco / produto.precoDe) * 100)}%
          </span>
        )}
      </div>

      <h3 className="mt-4 font-display text-[19px] leading-tight text-grafite sm:mt-5 sm:text-[22px]">
        {produto.nome}
      </h3>
      <p className="mt-2 line-clamp-2 hidden text-base leading-relaxed text-grafite sm:block">
        {produto.descricao}
      </p>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-2 pt-4">
        <div>
          {produto.precoDe && temPreco && (
            <p className="text-sm text-grafite-muted line-through">
              {formatarPreco(produto.precoDe)}
            </p>
          )}
          <p className="text-xl font-semibold sm:text-[22px] tracking-[-0.02em] text-grafite">
            {temPreco ? formatarPreco(produto.preco) : "A definir"}
          </p>
          {produto.canal === "mercadolivre" && temPreco && (
            <p className="text-sm text-grafite-soft">em até 2x</p>
          )}
        </div>

        {emBreve ? (
          <span className="text-[15px] font-semibold text-grafite-muted">Em breve</span>
        ) : (
          <LinkRastreado
            href={produto.link}
            target="_blank"
            rel="noopener noreferrer"
            evento="product_click"
            props={{ produto: produto.slug, canal: produto.canal, destino: produto.link }}
            className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-cobre-deep underline decoration-cobre/50 underline-offset-[6px] transition-colors hover:text-grafite hover:decoration-grafite"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
            {produto.canal === "mercadolivre" ? "Comprar" : "Ver na Shopee"}
          </LinkRastreado>
        )}
      </div>
    </div>
  );
}
