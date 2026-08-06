import { supabase } from "./supabase";

export interface Membro {
  id: string;
  nome: string;
  whatsapp: string;
  email: string;
  documento: string;
  codigo_indicacao: string;
  indicado_por: string | null;
  voucher_cadastro: number;
  status: "lead" | "membro" | "cliente";
  origem: string;
  consentimento_lgpd_em: string | null;
  created_at: string;
}

export interface Indicacao {
  id: string;
  indicador_id: string;
  indicado_id: string;
  status: "cadastrado" | "convertido";
  created_at: string;
}

export interface DadosCadastro {
  nome: string;
  whatsapp: string;
  email: string;
  documento: string;
  senha: string;
  codigoRef: string | null;
  aceiteLgpd: boolean;
}

/** Remove tudo que não é dígito. CPF/CNPJ é a chave de cruzamento com o
 * Sanchez Connect; precisa ser gravado só com dígitos (sem . - /) dos dois
 * lados, senão o match por documento quebra. */
export function normalizarDocumento(documento: string): string {
  return documento.replace(/\D/g, "");
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
        documento: normalizarDocumento(dados.documento),
        codigo_ref: dados.codigoRef,
        // Prova de consentimento LGPD: fica no raw_user_meta_data do auth.users
        // (trilha imutável) e é copiado pra membros.consentimento_lgpd_em pelo
        // trigger. null nunca deve acontecer — form exige o aceite.
        consentimento_lgpd_em: dados.aceiteLgpd ? new Date().toISOString() : null,
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
