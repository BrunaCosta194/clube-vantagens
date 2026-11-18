import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout, { inputClass, labelClass } from "../components/AuthLayout";
import { entrar, mensagemErroAuth, reenviarConfirmacao } from "../lib/membros";
import { ehAdmin } from "../lib/painel";
import { useSessao } from "../lib/sessao";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next");
  const { usuario, carregando: lendoSessao } = useSessao();
  // Login leva pra home: quem já é membro conhece o voucher e quer navegar.
  // Admin vai direto pro painel. O ?next= (gate do e-book) tem prioridade.
  const destino = next || "/";
  const cadastroHref = next ? `/cadastro?next=${encodeURIComponent(next)}` : "/cadastro";
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  // E-mail não confirmado: mostra o botão de mandar o link de novo.
  const [naoConfirmado, setNaoConfirmado] = useState(false);
  const [reenvio, setReenvio] = useState<"enviando" | "enviado" | string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setNaoConfirmado(false);
    setReenvio(null);
    setCarregando(true);

    const { error } = await entrar(email, senha);
    setCarregando(false);

    if (error) {
      setErro(mensagemErroAuth(error));
      setNaoConfirmado(error.code === "email_not_confirmed");
      return;
    }

    if (!next && (await ehAdmin().catch(() => false))) {
      navigate("/admin");
      return;
    }
    navigate(destino);
  }

  async function handleReenviar() {
    setReenvio("enviando");
    const { error } = await reenviarConfirmacao(email);
    setReenvio(error ? mensagemErroAuth(error) : "enviado");
  }

  // Já logada: não faz sentido mostrar o formulário — entrar de novo só
  // arrisca desfazer a sessão que já está valendo.
  if (!lendoSessao && usuario) return <Navigate to={destino} replace />;

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre com seu e-mail e senha para ver seu voucher e indicações."
      footer={
        <>
          Ainda não é membro?{" "}
          <Link to={cadastroHref} className="font-semibold text-cobre-deep underline decoration-cobre/50 underline-offset-4 hover:decoration-cobre-deep">
            Criar conta
          </Link>
        </>
      }
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

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label className={labelClass} htmlFor="senha">
              Senha
            </label>
            <Link
              to={email.trim() ? `/esqueci-senha?email=${encodeURIComponent(email.trim())}` : "/esqueci-senha"}
              className="mb-2 text-[15px] text-cobre-deep underline decoration-cobre/50 underline-offset-4 hover:decoration-cobre-deep"
            >
              Esqueci minha senha
            </Link>
          </div>
          <input
            id="senha"
            type="password"
            autoComplete="current-password"
            className={inputClass}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        {erro && <p className="text-sm text-gatilho">{erro}</p>}

        {naoConfirmado && (
          <div className="text-sm text-grafite">
            {reenvio === "enviado" ? (
              <p>Pronto, mandamos um link novo. Abra o mais recente que chegar.</p>
            ) : (
              <>
                <button type="button" onClick={handleReenviar} disabled={reenvio === "enviando"} className="btn-quiet disabled:opacity-60">
                  {reenvio === "enviando" ? "Enviando..." : "Reenviar link de confirmação"}
                </button>
                {reenvio && reenvio !== "enviando" && <p className="mt-2 text-gatilho">{reenvio}</p>}
              </>
            )}
          </div>
        )}

        <button type="submit" disabled={carregando} className="btn-primary group w-full justify-center disabled:opacity-60">
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </AuthLayout>
  );
}
