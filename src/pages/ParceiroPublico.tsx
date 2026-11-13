import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import PaginaParceiro from "@/components/PaginaParceiro";
import { useSessao } from "@/lib/sessao";
import { codigoDaPagina, paginaPublicada, urlPublica, type PaginaPublicada } from "@/lib/paginasParceiros";

// /parceiro/:slug — página publicada pelo Portal do Parceiro. As páginas feitas à
// mão (Dewa, Bioreluz, Insurance) têm rota própria e vêm antes no App.tsx.

export default function ParceiroPublico() {
  const { slug = "" } = useParams();
  const { usuario, carregando } = useSessao();
  const membro = !carregando && !!usuario;
  const [pagina, setPagina] = useState<PaginaPublicada | null | undefined>(undefined);
  const [erro, setErro] = useState(false);
  const [codigo, setCodigo] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    let vivo = true;
    setPagina(undefined);
    setErro(false);
    paginaPublicada(slug)
      .then((p) => vivo && setPagina(p))
      .catch(() => vivo && setErro(true));
    return () => {
      vivo = false;
    };
  }, [slug]);

  useEffect(() => {
    let vivo = true;
    setCodigo(null);
    if (membro && pagina?.temCodigo) void codigoDaPagina(slug).then((c) => vivo && setCodigo(c));
    return () => {
      vivo = false;
    };
  }, [membro, pagina, slug]);

  if (erro || pagina === null) {
    return (
      <main className="grid min-h-screen place-items-center bg-creme px-5">
        <div className="max-w-md text-center">
          <h1 className="h-display text-[clamp(2rem,6vw,3rem)]">
            {erro ? "Não conseguimos abrir esta página" : "Página não encontrada"}
          </h1>
          <p className="mt-3 text-[17px] text-grafite-soft">
            {erro ? "Confira sua internet e tente de novo." : "Este parceiro não está no clube agora."}
          </p>
          <Link to="/#parceiros" className="btn-primary mt-8 inline-flex">
            Ver os parceiros do clube
          </Link>
        </div>
      </main>
    );
  }

  if (pagina === undefined) {
    return (
      <main className="grid min-h-screen place-items-center bg-creme">
        <Loader2 className="h-6 w-6 animate-spin text-cobre-deep" aria-label="Carregando" />
      </main>
    );
  }

  return (
    <PaginaParceiro
      perfil={pagina.perfil}
      urlFoto={urlPublica}
      codigo={{ membro, codigo, temCodigo: pagina.temCodigo }}
    />
  );
}
