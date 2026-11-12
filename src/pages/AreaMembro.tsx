import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BarChart3, Check, Copy, LogOut } from "lucide-react";
import { buscarMeuPerfil, buscarMinhasIndicacoes, linkIndicacao, sair, type Indicacao, type Membro } from "../lib/membros";
import { useSessao } from "../lib/sessao";
import { ehAdmin } from "../lib/painel";
import { VOUCHER_CADASTRO_LABEL } from "../lib/recompensas";
import { track } from "../lib/track";
import logo from "../assets/marca/logo-cs.png";

const statusLabel: Record<Indicacao["status"], string> = {
  cadastrado: "Cadastrado",
  convertido: "Convertido em cliente",
};

export default function AreaMembro() {
  const navigate = useNavigate();
  // Admin que abre /area cai direto no painel (sessão já salva não passa pelo
  // login). ?membro=1 = veio do painel pra ver a própria área de membro.
  const [searchParams] = useSearchParams();
  const verComoMembro = searchParams.get("membro") === "1";
  const { usuario, carregando: lendoSessao } = useSessao();
  const [perfil, setPerfil] = useState<Membro | null>(null);
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [copiado, setCopiado] = useState(false);
  // Admin (tabela public.admins) vê atalho pro painel /admin — nenhum outro
  // lugar do site leva até lá. Erro na checagem = trata como não-admin.
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    // Espera a sessão ser lida antes de decidir qualquer coisa — sem isso,
    // recarregar a página mandaria a pessoa logada pro login.
    if (lendoSessao) return;

    if (!usuario) {
      navigate("/login");
      return;
    }

    let ativo = true;

    async function carregar() {
      try {
        if (!verComoMembro && (await ehAdmin().catch(() => false))) {
          if (ativo) navigate("/admin", { replace: true });
          return;
        }
        const meuPerfil = await buscarMeuPerfil();
        if (!meuPerfil) {
          navigate("/login");
          return;
        }
        const [minhasIndicacoes, souAdmin] = await Promise.all([
          buscarMinhasIndicacoes(),
          ehAdmin().catch(() => false),
        ]);
        if (ativo) {
          setAdmin(souAdmin);
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
  }, [lendoSessao, usuario, navigate, verComoMembro]);

  async function handleSair() {
    await sair();
    // Volta pra home: o provider derruba a sessão e a navbar volta ao estado
    // de visitante na hora, sem reload.
    navigate("/");
  }

  async function copiarLink() {
    if (!perfil) return;
    await navigator.clipboard.writeText(linkIndicacao(perfil.codigo_indicacao));
    void track("referral_share", { canal: "copiar_link" });
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (lendoSessao || carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-creme">
        <p className="text-base text-grafite-soft">Carregando...</p>
      </div>
    );
  }

  if (!perfil) return null;

  return (
    <div className="min-h-screen bg-creme">
      <header className="bg-creme-100">
        <div className="container-club flex h-[72px] items-center justify-between gap-4 sm:h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="" className="h-10 w-10 object-contain" />
            <span className="font-display text-xl leading-none text-grafite sm:text-[22px]">
              Clube Sanchez
            </span>
          </Link>
          <div className="flex items-center gap-5">
            {admin && (
              <Link to="/admin" className="btn-quiet">
                <BarChart3 className="h-4 w-4" strokeWidth={1.75} />
                Painel
              </Link>
            )}
            <button onClick={handleSair} className="btn-quiet">
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container-club pb-28 pt-14 sm:pt-20 lg:pb-36">
        <h1 className="h-display text-[clamp(3rem,7vw,6rem)]">
          Olá, <span className="italic text-cobre-deep">{perfil.nome.split(" ")[0]}.</span>
        </h1>

        <div className="mt-12 grid gap-2 lg:grid-cols-12">
          <div className="rounded-[10px] bg-cobre-deep px-7 py-9 text-perola sm:px-10 sm:py-12 lg:col-span-5">
            <p className="text-[15px] text-perola/85">Seu voucher de boas-vindas</p>
            <p className="mt-3 font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-none tracking-[-0.03em]">
              {VOUCHER_CADASTRO_LABEL} de desconto
            </p>
          </div>

          <div className="rounded-[10px] bg-creme-100 px-7 py-9 sm:px-10 sm:py-12 lg:col-span-7">
            <p className="text-[15px] text-grafite-soft">Seu link de indicação</p>
            <p className="mt-3 break-all text-lg font-semibold text-grafite">
              {linkIndicacao(perfil.codigo_indicacao)}
            </p>
            <button onClick={copiarLink} className="btn-primary group mt-6">
              {copiado ? <Check className="h-[18px] w-[18px]" strokeWidth={1.75} /> : <Copy className="h-[18px] w-[18px]" strokeWidth={1.75} />}
              {copiado ? "Copiado!" : "Copiar link"}
            </button>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="h-display text-[clamp(2rem,4vw,3rem)]">Suas indicações</h2>

          {indicacoes.length === 0 ? (
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-grafite">
              Você ainda não indicou ninguém. Compartilhe seu link para convidar amigos.
            </p>
          ) : (
            <ul className="mt-6 grid gap-2">
              {indicacoes.map((ind) => (
                <li
                  key={ind.id}
                  className="flex items-center justify-between gap-4 rounded-[10px] bg-creme-100 px-6 py-5"
                >
                  <p className="text-base font-semibold text-grafite">{statusLabel[ind.status]}</p>
                  <p className="text-[15px] text-grafite-soft">
                    {new Date(ind.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
