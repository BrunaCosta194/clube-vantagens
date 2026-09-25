import { type FormEvent, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout, { inputClass, labelClass } from "../components/AuthLayout";
import { criarMembro, normalizarDocumento } from "../lib/membros";
import { useSessao } from "../lib/sessao";
import { supabase } from "../lib/supabase";
import { getAtribuicao } from "../lib/atribuicao";
import { getLeadSalvo } from "../lib/ebook";
import { track } from "../lib/track";

function mensagemDeErro(erro: string): string {
  if (erro.includes("already registered") || erro.includes("already been registered")) {
    return "Este e-mail já está cadastrado. Tente fazer login.";
  }
  if (erro.includes("documento")) {
    return "Este CPF/CNPJ já está cadastrado.";
  }
  if (erro.includes("Password should be")) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }
  return "Não foi possível concluir o cadastro. Tente novamente.";
}

export default function Cadastro() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Se a URL do /cadastro não trouxer ?ref= (ex.: a pessoa entrou pela home
  // com ?ref=X&utm_... e navegou até aqui), cai no ref salvo pela atribuição
  // da sessão — ver src/lib/atribuicao.ts.
  const codigoRef = searchParams.get("ref") ?? getAtribuicao().ref;
  // pra onde voltar depois do cadastro (ex.: baixar o e-book)
  const next = searchParams.get("next");
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  const jaIniciouCadastro = useRef(false);

  function marcarInicioCadastro() {
    if (jaIniciouCadastro.current) return;
    jaIniciouCadastro.current = true;
    void track("club_signup_start", { tem_indicacao: !!codigoRef });
  }

  // Quem baixou o e-book nesta máquina (Bloco 6) já deu nome, e-mail e
  // WhatsApp — chegar aqui e digitar tudo de novo é atrito à toa. Entra como
  // valor INICIAL do useState: pré-preenche na primeira renderização e nunca
  // sobrescreve o que a pessoa digitar depois.
  const leadDoEbook = useMemo(() => getLeadSalvo(), []);
  const [nome, setNome] = useState(leadDoEbook?.nome ?? "");
  const [whatsapp, setWhatsapp] = useState(leadDoEbook?.whatsapp ?? "");
  const [email, setEmail] = useState(leadDoEbook?.email ?? "");
  const [documento, setDocumento] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [aceite, setAceite] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);
  const { usuario, carregando: lendoSessao } = useSessao();
  // O signUp cria sessão na hora. Sem esta marca, o guarda de "já logada"
  // dispararia no meio do cadastro e roubaria o destino do ?next=.
  const [enviou, setEnviou] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    const doc = normalizarDocumento(documento);
    if (doc.length !== 11 && doc.length !== 14) {
      setErro("CPF ou CNPJ inválido. Digite 11 dígitos (CPF) ou 14 (CNPJ).");
      return;
    }
    if (!aceite) {
      setErro("É preciso aceitar o uso dos seus dados para concluir o cadastro.");
      return;
    }

    setEnviou(true);
    setCarregando(true);
    const { data, error } = await criarMembro({
      nome,
      whatsapp,
      email,
      documento,
      senha,
      codigoRef,
      aceiteLgpd: aceite,
    });
    setCarregando(false);

    if (error) {
      setErro(mensagemDeErro(error.message));
      return;
    }

    // Sessão recém-criada pode não ter chegado ainda no listener do
    // SessaoProvider (cache de src/lib/sessao.tsx) — lê direto do storage
    // local (sem rede) pra mandar membro_id + access_token corretos juntos,
    // senão o RLS de public.eventos rejeita o insert (policy exige que
    // membro_id bata com o auth.uid() do token usado).
    const { data: sessaoAgora } = await supabase.auth.getSession();
    void track(
      "club_signup_complete",
      { tem_indicacao: !!codigoRef },
      { sessao: sessaoAgora.session },
    );

    if (data.session) {
      navigate(next || "/area");
    } else {
      setAguardandoConfirmacao(true);
    }
  }

  // Já logada: cadastro de novo criaria uma segunda conta sem querer.
  if (!lendoSessao && usuario && !enviou) return <Navigate to="/area" replace />;

  if (aguardandoConfirmacao) {
    return (
      <AuthLayout
        title="Confirme seu e-mail"
        subtitle={`Enviamos um link de confirmação para ${email}. Depois de confirmar, é só fazer login.`}
        footer={
          <Link to={loginHref} className="btn-quiet">
            Ir para o login
          </Link>
        }
      >
        <div />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle={
        codigoRef
          ? "Você foi indicado por um membro — seu bônus de boas-vindas já está garantido."
          : "Leva menos de dois minutos e você já começa a aproveitar as vantagens."
      }
      footer={
        <>
          Já é membro?{" "}
          <Link to={loginHref} className="font-medium text-terracota hover:underline">
            Fazer login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} onFocusCapture={marcarInicioCadastro} className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="nome">
            Nome completo
          </label>
          <input
            id="nome"
            className={inputClass}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="whatsapp">
            WhatsApp
          </label>
          <input
            id="whatsapp"
            className={inputClass}
            placeholder="(11) 99999-9999"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="documento">
            CPF ou CNPJ
          </label>
          <input
            id="documento"
            className={inputClass}
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            className={inputClass}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="confirmarSenha">
            Confirmar senha
          </label>
          <input
            id="confirmarSenha"
            type="password"
            className={inputClass}
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />
        </div>

        <label className="flex items-start gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-terracota"
            checked={aceite}
            onChange={(e) => setAceite(e.target.checked)}
          />
          <span>
            Autorizo o Clube Sanchez a usar meus dados (nome, WhatsApp, e-mail e
            CPF/CNPJ) para minha participação no clube e para contato comercial
            da Sanchez Imóveis, conforme a LGPD. Posso pedir a exclusão a
            qualquer momento.
          </span>
        </label>

        {erro && <p className="text-sm text-terracota-700">{erro}</p>}

        <button type="submit" disabled={carregando} className="btn-primary group w-full justify-center disabled:opacity-60">
          {carregando ? "Criando conta..." : "Criar minha conta"}
        </button>
      </form>
    </AuthLayout>
  );
}
