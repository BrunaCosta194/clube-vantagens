// ─────────────────────────────────────────────────────────────
// MARCA — nomenclatura e dados institucionais únicos do Clube Sanchez.
// Ponto único de ajuste: mude aqui, reflete em todo o site.
// ─────────────────────────────────────────────────────────────

/** Ano de fundação da Sanchez Imóveis. Confirmado pela Yruena em 22/09/2026. */
export const ANO_FUNDACAO = 1973;

/**
 * Tempo de mercado da Sanchez, calculado a partir do ano de fundação —
 * nunca precisa de atualização manual.
 */
export function anosDeSanchez(): number {
  return new Date().getFullYear() - ANO_FUNDACAO;
}

/** Assinatura oficial da marca — sempre estes dizeres, nesta ordem. */
export const ASSINATURA = "Clube Sanchez. Onde a comunidade faz negócios.";
