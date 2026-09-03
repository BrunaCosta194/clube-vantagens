// ─────────────────────────────────────────────────────────────
// REGRA DE RECOMPENSA — ponto único de ajuste.
// A Yruena vai calibrar esse valor. É só mudar aqui.
// ─────────────────────────────────────────────────────────────

/**
 * Benefício de boas-vindas que todo cadastro recebe.
 * Agora é um desconto percentual — rótulo pronto pra exibir na UI.
 */
export const VOUCHER_CADASTRO_LABEL = "5%";

/**
 * Nota de rodapé do voucher (letras menores).
 * O desconto só vale onde a Sanchez controla o preço — parceiros e produtos
 * próprios. Itens de Shopee/Mercado Livre são venda por afiliado, sem margem
 * pra desconto.
 */
export const VOUCHER_CADASTRO_NOTA =
  "Válido somente em parceiros e produtos próprios do clube. Não se aplica a itens da Shopee ou Mercado Livre (venda por afiliado).";

/** Rótulo amigável do programa, reutilizável na UI. */
export const NOME_PROGRAMA = "Indique & Ganhe";
