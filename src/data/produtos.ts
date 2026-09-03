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

import imgXicaras from "@/assets/produtos/xicaras-vidro-canelado.jpg";
import imgMesaCabeceira from "@/assets/produtos/mesa-cabeceira-escandinava.jpg";
import imgBancoSapateira from "@/assets/produtos/banco-sapateira-veludo.jpg";
import imgQuadros from "@/assets/produtos/quadros-3d-folhas.jpg";
import imgPetisqueira from "@/assets/produtos/petisqueira-divisorias.jpg";

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

// Produtos reais da curadoria (todos via Shopee, link de afiliado).
// FOTO: pendente — salvar em src/assets/produtos/<slug>.jpg (recorte 1:1)
// e importar aqui no topo, depois setar `imagem:` em cada item.
export const produtos: Produto[] = [
  {
    slug: "xicaras-vidro-canelado",
    nome: "Jogo de Xícaras de Vidro Canelado",
    descricao:
      "Vidro canelado que brilha na luz — jogo de xícaras com pires pra servir café e chá com ar de bistrô. Delicado, atemporal, o charme que valoriza qualquer mesa posta.",
    preco: 175.9,
    canal: "shopee",
    link: "https://s.shopee.com.br/2VrRW0oYeS",
    destaque: true,
    tags: ["Casa", "Mesa posta"],
    imagem: imgXicaras,
  },
  {
    slug: "mesa-cabeceira-escandinava",
    nome: "Mesa de Cabeceira Retrô Escandinava",
    descricao:
      "Criado-mudo de linha escandinava, madeira e off-white com pés palito. Três nichos abertos pra deixar livros, plantas e o essencial da noite sempre à mão — organização quentinha ao lado da cama.",
    preco: 65.47,
    canal: "shopee",
    link: "https://s.shopee.com.br/7VG7TH7Ib4",
    tags: ["Móveis", "Quarto"],
    imagem: imgMesaCabeceira,
  },
  {
    slug: "banco-sapateira-veludo",
    nome: "Banco Sapateira com Veludo Rosê",
    descricao:
      "Assento estofado em veludo rosê sobre estrutura dourada — banco e sapateira no mesmo móvel. Na entrada ou no closet: você senta pra calçar e ainda organiza os pares nas duas prateleiras. Luxo funcional.",
    preco: 259.89,
    canal: "shopee",
    link: "https://s.shopee.com.br/4LJ5hUEHhp",
    destaque: true,
    tags: ["Móveis", "Organização"],
    imagem: imgBancoSapateira,
  },
  {
    slug: "quadros-3d-folhas",
    nome: "Dupla de Quadros Decorativos 3D",
    descricao:
      "Par de quadros com efeito 3D em relevo — folhagens em tons rosê e dourado que dão profundidade e sofisticação à parede. Vêm em dupla pra compor uma galeria certeira na sala ou no quarto.",
    preco: 49.99,
    canal: "shopee",
    link: "https://s.shopee.com.br/50YmUkO03B",
    tags: ["Decoração", "Parede"],
    imagem: imgQuadros,
  },
  {
    slug: "petisqueira-divisorias",
    nome: "Petisqueira Organizadora com Divisórias",
    descricao:
      "Caixa organizadora com divisórias removíveis, tampa e alça pra carregar — petisqueira que vai da geladeira à mesa sem bagunça. Ideal pra frutas, castanhas e petiscos numa recepção caprichada.",
    preco: 39.99,
    canal: "shopee",
    link: "https://s.shopee.com.br/9AOLSR38Wq",
    tags: ["Casa", "Cozinha"],
    imagem: imgPetisqueira,
  },
];
