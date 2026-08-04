import { supabase } from "./supabase";

// E-book "Papo de Aluguel" — download com gate de cadastro (só membros).
// O arquivo mora em /public; o gate é a checagem de sessão antes de baixar.
export const EBOOK_SLUG = "papo-de-aluguel";
export const EBOOK_URL = "/ebook-papo-de-aluguel.pdf";
export const EBOOK_FILENAME = "Papo de Aluguel - E-book Sanchez.pdf";

/** Dispara o download do PDF no navegador. */
export function baixarEbook() {
  const a = document.createElement("a");
  a.href = EBOOK_URL;
  a.download = EBOOK_FILENAME;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** True se existe sessão logada (lê do storage local — funciona offline). */
export async function temSessao(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

/** Registra QUEM baixou o e-book. Best-effort: só grava com o banco ativo.
 * Depende da tabela `ebook_downloads` (migration 0003). Nunca bloqueia o
 * download — se o banco estiver fora, engole o erro. */
export async function registrarDownloadEbook() {
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    await supabase
      .from("ebook_downloads")
      .insert({ membro_id: auth.user.id, ebook: EBOOK_SLUG });
  } catch {
    // banco pausado / offline — o download segue mesmo assim
  }
}
