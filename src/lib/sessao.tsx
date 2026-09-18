import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface Sessao {
  sessao: Session | null;
  usuario: User | null;
  /** Nome de exibição do membro logado. null quando não há sessão. */
  nome: string | null;
  /** true até a sessão guardada no localStorage ser lida. */
  carregando: boolean;
}

const SessaoContext = createContext<Sessao | null>(null);

/** Nome pra saudação. Vem do metadata do signUp (`criarMembro` grava `nome`
 * lá), sem precisar consultar a tabela `membros` em toda página. Se faltar,
 * usa o trecho antes do @ do e-mail. */
function nomeDoUsuario(usuario: User | null): string | null {
  if (!usuario) return null;
  const doMetadata = usuario.user_metadata?.nome;
  if (typeof doMetadata === "string" && doMetadata.trim()) return doMetadata.trim();
  return usuario.email?.split("@")[0] ?? null;
}

/** Fonte única da sessão. Um listener pra aplicação inteira — assim navbar e
 * área do membro nunca discordam sobre quem está logado. */
export function SessaoProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return;
      setSessao(data.session);
      setCarregando(false);
    });

    // Cobre login, logout e refresh de token — inclusive feitos em outra aba.
    const { data: inscricao } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      if (!ativo) return;
      setSessao(novaSessao);
      setCarregando(false);
    });

    return () => {
      ativo = false;
      inscricao.subscription.unsubscribe();
    };
  }, []);

  const valor = useMemo<Sessao>(() => {
    const usuario = sessao?.user ?? null;
    return { sessao, usuario, nome: nomeDoUsuario(usuario), carregando };
  }, [sessao, carregando]);

  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>;
}

export function useSessao(): Sessao {
  const contexto = useContext(SessaoContext);
  if (!contexto) {
    throw new Error("useSessao precisa estar dentro de <SessaoProvider>");
  }
  return contexto;
}

/** Primeiro nome, pra saudação curta na navbar. */
export function primeiroNome(nome: string | null): string {
  return nome?.split(" ")[0] ?? "";
}
