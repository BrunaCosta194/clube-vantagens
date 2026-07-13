// ─────────────────────────────────────────────────────────────
// REGRAS DE PONTOS — ponto único de ajuste.
// A Yruena vai calibrar esses valores. É só mudar aqui.
// ─────────────────────────────────────────────────────────────

/** Pontos de boas-vindas que o INDICADO ganha ao se cadastrar por indicação. */
export const PONTOS_CADASTRO = 50;

/** Pontos que quem INDICOU ganha quando o indicado se cadastra. */
export const PONTOS_INDICACAO = 100;

/**
 * Recompensa MAIOR de quem indicou quando o indicado converte (vira cliente
 * Sanchez). Esse passo será marcado pelo Sanchez Connect — aqui só reservamos
 * a constante; NÃO implementamos a lógica de conversão neste projeto.
 */
export const PONTOS_CONVERSAO = 500;

/** Rótulo amigável do programa, reutilizável na UI. */
export const NOME_PROGRAMA = "Indique & Ganhe";
