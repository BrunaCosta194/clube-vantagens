// ─────────────────────────────────────────────────────────────
// DESTAK BOUTIQUE — dados da página /parceiro/destak-office (17/11/2026).
// Loja de moda feminina, "44 anos vestindo gerações" (Instagram @destak_office).
// Peças, preços, logo e WhatsApp passados pela Yruena em 17/11 para o post do
// Instagram. Fotos em src/assets/parceiros/destak/ (enviadas pela loja).
// Por enquanto SEM benefício para membros (decisão de 17/11). Quando houver,
// incluir aqui e voltar com a caixa "Sua vantagem" na página e o `voucher` do card.
// Ainda faltam: endereço e horário.
// ─────────────────────────────────────────────────────────────

import vestidoBrancoDetalhe from "@/assets/parceiros/destak/vestido-branco-detalhe.jpg";
import vestidoVermelho from "@/assets/parceiros/destak/vestido-vermelho.jpg";
import macacao from "@/assets/parceiros/destak/macacao.jpg";

export const DESTAK_NOME = "Destak Boutique";
export const DESTAK_INSTAGRAM = "https://www.instagram.com/destak_office";
/** Link de mensagem do WhatsApp Business da loja (não aceita texto pronto). */
export const DESTAK_WHATS = "https://wa.me/message/QAUBQ7YGWITYP1";

export const destakHistoria =
  "Há 44 anos a Destak Boutique veste mulheres de várias gerações, muitas vezes mãe, filha e neta. Peças com corte de alfaiataria e tecidos naturais, que vão do escritório ao fim de semana sem perder a elegância.";

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
  {
    nome: "Macacão com nó na cintura",
    descricao:
      "Malha fluida, pantalona e nó que valoriza a cintura. Conforto com elegância, do dia à noite.",
    tamanhos: ["P", "M", "G"],
    preco: "R$ 659,00",
    foto: macacao,
    alt: "Modelo com macacão marrom de malha fluida, nó na cintura e bolsa de palha colorida",
    proporcao: "aspect-[866/1128]",
  },
];
