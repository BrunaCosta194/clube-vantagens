import { useEffect, useState } from "react";
import { ArrowLeft, Check, Loader2, Pencil } from "lucide-react";
import PaginaParceiro from "@/components/PaginaParceiro";
import { decidirPagina, FalhaPortal, previa } from "@/lib/cadastroParceiro";
import type { PerfilPagina } from "../../../supabase/functions/_shared/parceiro-pagina.ts";

// Prévia da página, pelo link pessoal do parceiro (status aguardando_aprovacao).
// "Aprovar" grava o hash do conteúdo exato que ele está vendo; se a equipe mudar a
// página enquanto isso, a função recusa (conflito) e a prévia recarrega.

interface Props {
  codigo: string;
  responsavel: string;
  /** Já aprovou: só mostra a página, sem os botões. */
  somenteVer: boolean;
  onVoltar: () => void;
  onDecidiu: () => void;
}

export default function Aprovacao({ codigo, responsavel, somenteVer, onVoltar, onDecidiu }: Props) {
  const [dados, setDados] = useState<{ perfil: PerfilPagina; hash: string; fotos: Record<string, string> } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [modo, setModo] = useState<"" | "aprovar" | "ajuste">("");
  const [nome, setNome] = useState(responsavel);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function carregar() {
    setErro(null);
    try {
      setDados(await previa(codigo));
    } catch {
      setErro("Não conseguimos abrir a prévia agora. Confira a internet e tente de novo.");
    }
  }

  useEffect(() => {
    void carregar();
    window.scrollTo({ top: 0 });
  }, [codigo]);

  async function decidir() {
    if (!dados || !nome.trim() || (modo === "ajuste" && !comentario.trim())) return;
    setEnviando(true);
    setAviso(null);
    try {
      await decidirPagina(codigo, { aprovar: modo === "aprovar", hash: dados.hash, nome, comentario });
      onDecidiu();
    } catch (e) {
      if (e instanceof FalhaPortal && e.codigo === "conflito") {
        setAviso("A equipe acabou de atualizar sua página. Confira a versão nova antes de decidir.");
        setModo("");
        await carregar();
      } else {
        setAviso("Não conseguimos registrar agora. Tente de novo em instantes.");
      }
    } finally {
      setEnviando(false);
    }
  }

  if (erro) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-5 py-16">
        <p className="text-[17px] text-grafite">{erro}</p>
        <div className="flex gap-3">
          <button type="button" className="btn-primary" onClick={() => void carregar()}>
            Tentar de novo
          </button>
          <button type="button" className="btn-quiet" onClick={onVoltar}>
            Voltar
          </button>
        </div>
      </div>
    );
  }
  if (!dados) {
    return (
      <div className="grid min-h-screen place-items-center bg-creme">
        <Loader2 className="h-6 w-6 animate-spin text-cobre-deep" aria-label="Carregando a prévia" />
      </div>
    );
  }

  const urlFoto = (c: string | null) => (c ? dados.fotos[c] ?? null : null);
  const codigoBeneficio = dados.perfil.beneficio?.dados.codigo || null;

  const barra = (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-grafite/10 bg-white px-4 py-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {aviso && (
          <p className="text-[15px] font-semibold text-terracota-600" role="status">
            {aviso}
          </p>
        )}
        {somenteVer ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] font-semibold text-grafite">Você aprovou esta página. A equipe vai publicar em breve.</p>
            <button type="button" className="btn-quiet" onClick={onVoltar}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar
            </button>
          </div>
        ) : modo === "" ? (
          <>
            <p className="text-[15px] text-grafite">Confira tudo com calma. Está como você quer?</p>
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <button type="button" className="btn-primary justify-center" onClick={() => setModo("aprovar")}>
                <Check className="h-5 w-5" aria-hidden="true" /> Aprovar minha página
              </button>
              <button
                type="button"
                className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-md border border-grafite/20 bg-white px-5 text-[15px] font-semibold text-grafite"
                onClick={() => setModo("ajuste")}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" /> Pedir ajuste
              </button>
              <button type="button" className="btn-quiet justify-center" onClick={onVoltar}>
                Voltar
              </button>
            </div>
          </>
        ) : (
          <>
            {modo === "ajuste" && (
              <>
                <label htmlFor="ajuste" className="text-[15px] font-semibold text-grafite">
                  O que precisa mudar?
                </label>
                <textarea
                  id="ajuste"
                  className="min-h-24 rounded-md border border-grafite/20 bg-white px-4 py-3 text-base"
                  maxLength={2000}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
              </>
            )}
            <label htmlFor="nome-aprovador" className="text-[15px] font-semibold text-grafite">
              Seu nome
            </label>
            <input
              id="nome-aprovador"
              className="min-h-12 rounded-md border border-grafite/20 bg-white px-4 text-base"
              maxLength={120}
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            {modo === "aprovar" && (
              <p className="text-sm text-grafite-soft">
                Ao aprovar, registramos a data, a hora, o seu nome e o conteúdo exato desta página. Se algo mudar depois, pedimos
                sua aprovação de novo.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary"
                disabled={enviando || !nome.trim() || (modo === "ajuste" && !comentario.trim())}
                onClick={() => void decidir()}
              >
                {enviando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {modo === "aprovar" ? "Confirmar aprovação" : "Enviar pedido de ajuste"}
              </button>
              <button type="button" className="btn-quiet" onClick={() => setModo("")} disabled={enviando}>
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <PaginaParceiro
      perfil={dados.perfil}
      urlFoto={urlFoto}
      previa
      codigo={{ membro: !!codigoBeneficio, codigo: codigoBeneficio, temCodigo: !!codigoBeneficio }}
      barra={barra}
    />
  );
}
