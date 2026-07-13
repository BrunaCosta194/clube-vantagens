import { supabase } from "./supabase";

export interface Membro {
  id: string;
  nome: string;
  whatsapp: string;
  email: string;
  documento: string;
  codigo_indicacao: string;
  indicado_por: string | null;
  pontos: number;
  status: "lead" | "membro" | "cliente";
  origem: string;
  created_at: string;
}

export interface Indicacao {
  id: string;
  indicador_id: string;
  indicado_id: string;
  status: "cadastrado" | "convertido";
  pontos_gerados: number;
  created_at: string;
}

export interface DadosCadastro {
  nome: string;
  whatsapp: string;
  email: string;
  documento: string;
  senha: string;
  codigoRef: string | null;
}

/** Cria a conta no Supabase Auth. O registro em `membros` (e a indicação, se
 * houver `codigoRef`) é criado automaticamente por trigger no banco. */
export async function criarMembro(dados: DadosCadastro) {
  return supabase.auth.signUp({
    email: dados.email,
    password: dados.senha,
    options: {
      data: {
        nome: dados.nome,
        whatsapp: dados.whatsapp,
        documento: dados.documento,
        codigo_ref: dados.codigoRef,
      },
    },
  });
}

export async function entrar(email: string, senha: string) {
  return supabase.auth.signInWithPassword({ email, password: senha });
}

export async function sair() {
  return supabase.auth.signOut();
}

export async function buscarMeuPerfil(): Promise<Membro | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from("membros")
    .select("*")
    .eq("id", auth.user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function buscarMinhasIndicacoes(): Promise<Indicacao[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data, error } = await supabase
    .from("indicacoes")
    .select("*")
    .eq("indicador_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export function linkIndicacao(codigoIndicacao: string): string {
  return `${window.location.origin}/cadastro?ref=${codigoIndicacao}`;
}
