import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout, { inputClass, labelClass } from "../components/AuthLayout";
import { mensagemErroAuth, trocarSenha } from "../lib/membros";
import { useSessao } from "../lib/sessao";

// Destino do link de "esqueci minha senha": o link já entra logado, então
// aqui é só gravar a senha nova na conta da sessão.
export default function NovaSenha() {
  const navigate = useNavigate();
  const { usuario, carregando: lendoSessao } = useSessao();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    setCarregando(true);
    const { error } = await trocarSenha(senha);
    setCarregando(false);
    if (error) {
      setErro(mensagemErroAuth(error));
      return;
    }
    navigate("/area", { replace: true });
  }

  if (lendoSessao) return <div className="min-h-screen bg-creme" />;

  if (!usuario) {
    return (
      <AuthLayout
        title="Link vencido"
        subtitle="Este link de senha nova já foi usado ou passou do prazo de 1 hora. Peça um novo e abra o mais recente que chegar."
        footer={
          <Link to="/login" className="font-semibold text-cobre-deep underline decoration-cobre/50 underline-offset-4 hover:decoration-cobre-deep">
            Voltar para o login
          </Link>
        }
      >
        <Link to="/esqueci-senha" className="btn-primary group w-full justify-center">
          Pedir um novo link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Crie uma senha nova"
      subtitle={usuario.email ? `Para a conta ${usuario.email}.` : "Escolha a senha que você vai usar para entrar."}
      footer={
        <Link to="/area" className="font-semibold text-cobre-deep underline decoration-cobre/50 underline-offset-4 hover:decoration-cobre-deep">
          Deixar para depois
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass} htmlFor="senha">
            Senha nova
          </label>
          <input
            id="senha"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="confirmar">
            Confirmar senha nova
          </label>
          <input
            id="confirmar"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />
        </div>

        {erro && <p className="text-sm text-gatilho">{erro}</p>}

        <button type="submit" disabled={carregando} className="btn-primary group w-full justify-center disabled:opacity-60">
          {carregando ? "Salvando..." : "Salvar senha nova"}
        </button>
      </form>
    </AuthLayout>
  );
}
