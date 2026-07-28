// ─────────────────────────────────────────────────────────────
// LOJA SANCHEZ — produtos (array editável, fonte única de verdade).
// A seção da home (LojaSecao) e a página /loja leem daqui.
//
// Vitrine com checkout EXTERNO: cada produto abre `link` em outra aba.
//   canal "mercadolivre" → parcela até 2x, selo "Entrega Sanchez"
//   canal "shopee"       → selo "Via Shopee" (cinza neutro, guia de identidade)
//
// Imagens: por enquanto `imagem` é opcional — sem foto o card mostra um
// bloco cobre. Ao receber as fotos, salvar em src/assets/produtos/ e
// importar aqui (padrão de src/data/parceiros.ts), recortando para 1:1.
// ─────────────────────────────────────────────────────────────

export type CanalVenda = "mercadolivre" | "shopee";

export type Produto = {
  slug: string;
  nome: string;
  descricao: string;
  /** Preço à vista, em reais (número). Ex.: 79.9 */
  preco: number;
  /** Preço "de" (riscado) quando em oferta. Opcional. */
  precoDe?: number;
  /** Canal externo onde a compra acontece. Deriva o selo. */
  canal: CanalVenda;
  /** URL externa do anúncio (Mercado Livre ou Shopee). */
  link: string;
  /** Foto do produto (import de src/assets/produtos/...). Opcional por ora. */
  imagem?: string;
  /** Aparece em destaque na home. */
  destaque?: boolean;
  tags: string[];
};

/** Rótulo do selo a partir do canal (guia de identidade). */
export function seloDoCanal(canal: CanalVenda): string {
  return canal === "mercadolivre" ? "Entrega Sanchez" : "Via Shopee";
}

/** Formata número em reais (pt-BR). */
export function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// TODO(Bruna/Yruena): substituir por produtos reais — nome, preço, foto,
// canal e link de cada anúncio. Os itens abaixo são placeholders.
export const produtos: Produto[] = [
  {
    slug: "xicaras-sanchez",
    nome: "Jogo de xícaras Sanchez", // TODO: nome real
    descricao:
      "As xícaras que apareceram no nosso Instagram. Curadoria Sanchez.", // TODO
    preco: 0, // TODO: preço real
    canal: "mercadolivre",
    link: "#", // TODO: link do anúncio no Mercado Livre
    destaque: true,
    tags: ["Casa", "Curadoria"],
  },
  {
    slug: "produto-2",
    nome: "Produto 2", // TODO
    descricao: "Descrição do produto.", // TODO
    preco: 0, // TODO
    canal: "mercadolivre",
    link: "#", // TODO
    tags: ["TODO"],
  },
  {
    slug: "produto-3",
    nome: "Produto 3", // TODO
    descricao: "Descrição do produto.", // TODO
    preco: 0, // TODO
    canal: "shopee",
    link: "#", // TODO: link do anúncio na Shopee
    tags: ["TODO"],
  },
  {
    slug: "produto-4",
    nome: "Produto 4", // TODO
    descricao: "Descrição do produto.", // TODO
    preco: 0, // TODO
    canal: "shopee",
    link: "#", // TODO
    tags: ["TODO"],
  },
];
