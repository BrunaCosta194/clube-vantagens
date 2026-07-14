import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Copy, LogOut } from "lucide-react";
import { buscarMeuPerfil, buscarMinhasIndicacoes, linkIndicacao, sair, type Indicacao, type Membro } from "../lib/membros";

const statusLabel: Record<Indicacao["status"], string> = {
  cadastrado: "Cadastrado",
  convertido: "Convertido em cliente",
};

export default function AreaMembro() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Membro | null>(null);
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const meuPerfil = await buscarMeuPerfil();
        if (!meuPerfil) {
          navigate("/login");
          return;
        }
        const minhasIndicacoes = await buscarMinhasIndicacoes();
        if (ativo) {
          setPerfil(meuPerfil);
          setIndicacoes(minhasIndicacoes);
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [navigate]);

  async function handleSair() {
    await sair();
    navigate("/login");
  }

  async function copiarLink() {
    if (!perfil) return;
    await navigator.clipboard.writeText(linkIndicacao(perfil.codigo_indicacao));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-wash">
        <p className="text-sm text-grafite-muted">Carregando...</p>
      </div>
    );
  }

  if (!perfil) return null;

  return (
    <div className="min-h-screen bg-warm-wash pb-24">
      <header className="border-b border-grafite/10 bg-white/50 backdrop-blur-sm">
        <div className="container-club flex items-center justify-between py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-grafite font-display text-base font-semibold text-creme">
              S
            </span>
            <span className="font-display text-[15px] font-semibold text-grafite">
              Comunidade Sanchez
            </span>
          </Link>
          <button onClick={handleSair} className="btn-quiet">
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Sair
          </button>
        </div>
      </header>

      <div className="container-club pt-12">
        <h1 className="h-display text-[clamp(1.8rem,4vw,2.6rem)]">
          Olá, {perfil.nome.split(" ")[0]}.
        </h1>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="bezel">
            <div className="bezel-core bg-club-panel px-7 py-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/80">
                Seu voucher de boas-vindas
              </span>
              <p className="mt-3 font-display text-[clamp(2.4rem,6vw,3.4rem)] font-semibold text-white">
                {perfil.voucher_cadastro.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>

          <div className="bezel">
            <div className="bezel-core bg-white/70 px-7 py-8 backdrop-blur-sm">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-grafite-muted">
                Seu link de indicação
              </span>
              <p className="mt-3 truncate font-mono text-sm text-grafite-soft">
                {linkIndicacao(perfil.codigo_indicacao)}
              </p>
              <button onClick={copiarLink} className="btn-primary group mt-5">
                {copiado ? <Check className="h-4 w-4" strokeWidth={1.5} /> : <Copy className="h-4 w-4" strokeWidth={1.5} />}
                {copiado ? "Copiado!" : "Copiar link"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="h-display text-xl">Suas indicações</h2>

          {indicacoes.length === 0 ? (
            <p className="mt-4 text-sm text-grafite-muted">
              Você ainda não indicou ninguém. Compartilhe seu link para convidar amigos.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {indicacoes.map((ind) => (
                <div
                  key={ind.id}
                  className="flex items-center justify-between rounded-2xl border border-grafite/10 bg-white/60 px-5 py-4"
                >
                  <p className="text-sm font-medium text-grafite">{statusLabel[ind.status]}</p>
                  <p className="text-xs text-grafite-muted">
                    {new Date(ind.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
