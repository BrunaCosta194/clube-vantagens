import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout, { inputClass, labelClass } from "../components/AuthLayout";
import { entrar } from "../lib/membros";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const { error } = await entrar(email, senha);
    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }

    navigate("/area");
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre com seu e-mail e senha para ver seu voucher e indicações."
      footer={
        <>
          Ainda não é membro?{" "}
          <Link to="/cadastro" className="font-medium text-terracota hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {erro && <p className="text-sm text-terracota-700">{erro}</p>}

        <button type="submit" disabled={carregando} className="btn-primary group w-full justify-center disabled:opacity-60">
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </AuthLayout>
  );
}
