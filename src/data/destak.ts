// ─────────────────────────────────────────────────────────────
// DESTAK OFFICE — dados da página /parceiro/destak-office (17/11/2026).
// Loja de moda feminina, "44 anos vestindo gerações". Peças e preços
// passados pela Yruena em 17/11 para o post do Instagram.
// Fotos em src/assets/parceiros/destak/ (enviadas pela loja).
// Ainda faltam: benefício confirmado, WhatsApp, endereço e logo da loja.
// Enquanto não houver WhatsApp, o "Quero" abre a conversa no Instagram.
// ─────────────────────────────────────────────────────────────

import vestidoBrancoDetalhe from "@/assets/parceiros/destak/vestido-branco-detalhe.jpg";
import vestidoVermelho from "@/assets/parceiros/destak/vestido-vermelho.jpg";

export const DESTAK_INSTAGRAM = "https://www.instagram.com/destak_office";
/** Abre a conversa (Direct) com a loja no Instagram. */
export const DESTAK_DIRECT = "https://ig.me/m/destak_office";

/**
 * Benefício do membro. Sem `cupom`, a página pede para o membro avisar a loja
 * que é do Sanchez Clube. TODO: confirmar % / valor com a Yruena.
 */
export const destakBeneficio: { titulo: string; detalhe: string; cupom?: string } = {
  titulo: "Condição exclusiva",
  detalhe:
    "para membros do Sanchez Clube. Na hora da compra, avise a loja que você é do clube.",
};

export const destakHistoria =
  "Há 44 anos a Destak Office veste mulheres de várias gerações, muitas vezes mãe, filha e neta. Peças com corte de alfaiataria e tecidos naturais, que vão do escritório ao fim de semana sem perder a elegância.";

export type PecaDestak = {
  nome: string;
  descricao: string;
  tamanhos: string[];
  preco: string;
  foto: string;
  alt: string;
  /** Proporção da foto inteira (classe aspect-*). */
  proporcao: string;
};

// Tamanhos e preços passados pela Yruena em 17/11/2026.
export const destakPecas: PecaDestak[] = [
  {
    nome: "Vestido longo vermelho",
    descricao:
      "Corte reto com recortes no busto, decote desenhado e costas nadador. Tecido com toque de linho.",
    tamanhos: ["P/M", "G"],
    preco: "R$ 839,00",
    foto: vestidoVermelho,
    alt: "Modelo com vestido longo vermelho, de frente, em close e de costas",
    proporcao: "aspect-[9/16]",
  },
  {
    nome: "Vestido longo branco de um ombro só",
    descricao:
      "Malha leve e texturizada, assimétrico, de um ombro só. Vai da praia ao jantar.",
    tamanhos: ["38/40"],
    preco: "R$ 699,00",
    foto: vestidoBrancoDetalhe,
    alt: "Modelo com vestido longo claro de um ombro só, andando na praia",
    proporcao: "aspect-[4/5]",
  },
];

