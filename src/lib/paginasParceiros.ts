import { supabase } from "./supabase";
import { limparPerfil, type PerfilPagina } from "../../supabase/functions/_shared/parceiro-pagina.ts";

// ─────────────────────────────────────────────────────────────
// PÁGINAS PUBLICADAS PELO PORTAL DO PARCEIRO (migration 0016).
// O visitante só chega a `parceiros_publicados()`: o que está no ar, sem o
// código de desconto. O código vem de `parceiro_codigo()`, só para quem está logado.
// ─────────────────────────────────────────────────────────────

export interface PaginaPublicada {
  slug: string;
  perfil: PerfilPagina;
  temCodigo: boolean;
}

const BUCKET_PUBLICO = "parceiros-publico";

let cache: Promise<PaginaPublicada[]> | null = null;

/** Todas as páginas no ar (a vitrine usa; a lista é pequena). Falha vira lista vazia. */
export function paginasPublicadas(): Promise<PaginaPublicada[]> {
  cache ??= (async () => {
    const { data, error } = await supabase.rpc("parceiros_publicados");
    if (error) throw error;
    return ((data as { slug: string; conteudo: unknown; tem_codigo: boolean }[] | null) ?? []).map((x) => ({
      slug: x.slug,
      perfil: limparPerfil(x.conteudo),
      temCodigo: x.tem_codigo,
    }));
  })().catch(() => {
    cache = null;
    return [];
  });
  return cache;
}

/** Uma página. null = não existe ou não está no ar; erro de rede sobe. */
export async function paginaPublicada(slug: string): Promise<PaginaPublicada | null> {
  const { data, error } = await supabase.rpc("parceiros_publicados", { p_slug: slug });
  if (error) throw error;
  const x = ((data as { slug: string; conteudo: unknown; tem_codigo: boolean }[] | null) ?? [])[0];
  return x ? { slug: x.slug, perfil: limparPerfil(x.conteudo), temCodigo: x.tem_codigo } : null;
}

/** Código de desconto da página (só para membro logado). */
export async function codigoDaPagina(slug: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("parceiro_codigo", { p_slug: slug });
  if (error) return null;
  return typeof data === "string" && data ? data : null;
}

export function urlPublica(caminho: string | null): string | null {
  if (!caminho) return null;
  return supabase.storage.from(BUCKET_PUBLICO).getPublicUrl(caminho).data.publicUrl;
}

export { BUCKET_PUBLICO };
