import { type FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout, { inputClass, labelClass } from "../components/AuthLayout";
import { mensagemErroAuth, pedirNovaSenha } from "../lib/membros";

export default function EsqueciSenha() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    const { error } = await pedirNovaSenha(email);
    setCarregando(false);
    if (error) {
      setErro(mensagemErroAuth(error));
      return;
    }
    setEnviado(true);
  }

  const voltar = (
    <Link to="/login" className="font-semibold text-cobre-deep underline decoration-cobre/50 underline-offset-4 hover:decoration-cobre-deep">
      Voltar para o login
    </Link>
  );

  // Mesma resposta exista ou não a conta: a tela não confirma quem é membro.
  if (enviado) {
    return (
      <AuthLayout
        title="Confira seu e-mail"
        subtitle={`Se houver uma conta com ${email.trim()}, enviamos um link para criar uma senha nova. Ele vale por 1 hora. Veja também a caixa de spam.`}
        footer={voltar}
      >
        <button type="button" onClick={() => setEnviado(false)} className="btn-quiet">
          Não chegou? Enviar de novo
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Esqueci minha senha"
      subtitle="Digite o e-mail da sua conta. Vamos mandar um link para você criar uma senha nova."
      footer={voltar}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass} htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {erro && <p className="text-sm text-gatilho">{erro}</p>}

        <button type="submit" disabled={carregando} className="btn-primary group w-full justify-center disabled:opacity-60">
          {carregando ? "Enviando..." : "Enviar link"}
        </button>
      </form>
    </AuthLayout>
  );
}
