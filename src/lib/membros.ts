import { supabase } from "./supabase";
import { getAtribuicao } from "./atribuicao";

export interface Membro {
  id: string;
  nome: string;
  whatsapp: string;
  email: string;
  documento: string;
  codigo_indicacao: string;
  indicado_por: string | null;
  voucher_cadastro: string;
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

/** CPF (11) ou CNPJ (14) com os dígitos verificadores certos. Mesma conta de
 * public.documento_valido() (migration 0017), que confere de novo no banco:
 * mudar nos dois. */
export function documentoValido(documento: string): boolean {
  const doc = normalizarDocumento(documento);
  if (!/^(\d{11}|\d{14})$/.test(doc) || /^(\d)\1+$/.test(doc)) return false;
  const d = [...doc].map(Number);
  if (doc.length === 11) {
    const dv = (n: number) => ((d.slice(0, n).reduce((s, x, i) => s + x * (n + 1 - i), 0) * 10) % 11) % 10;
    return dv(9) === d[9] && dv(10) === d[10];
  }
  const pesos = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dv = (n: number) => {
    const r = d.slice(0, n).reduce((s, x, i) => s + x * pesos[i + 13 - n], 0) % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return dv(12) === d[12] && dv(13) === d[13];
}

/** Cria a conta no Supabase Auth. O registro em `membros` (e a indicação, se
 * houver `codigoRef`) é criado automaticamente por trigger no banco. */
export async function criarMembro(dados: DadosCadastro) {
  const atribuicao = getAtribuicao();
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
        // Atribuição da sessão (Bloco 5) — não muda o trigger nem a tabela
        // membros, só fica registrada no raw_user_meta_data pra consulta
        // futura (painel/Connect), igual o consentimento_lgpd_em acima.
        origem: atribuicao.origem,
        campanha: atribuicao.campanha,
        utm: atribuicao.utm,
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
