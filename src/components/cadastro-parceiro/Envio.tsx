import { useRef, useState } from "react";
import { FileText, ImagePlus, Loader2, RotateCcw, Upload, X } from "lucide-react";
import {
  FalhaPortal,
  LIMITE_ARQUIVOS,
  problemaAntes,
  removerArquivo,
  subirArquivo,
  type ArquivoTela,
} from "@/lib/cadastroParceiro";
import type { TipoArquivo } from "../../../supabase/functions/_shared/parceiro-cadastro.ts";

// Envio de arquivos do Portal do Parceiro: escolhe um ou vários, sobe um de
// cada vez (com a foto já reduzida no aparelho), mostra miniatura, deixa
// excluir e tentar de novo o que falhou.

type Props = {
  codigo: string;
  tipo: TipoArquivo;
  itemId?: string;
  arquivos: ArquivoTela[];
  editavel: boolean;
  onMudou: (mudanca: { novo?: ArquivoTela; removido?: string; etapas_completas: number[] }) => void;
  accept: string;
  textoBotao: string;
  /** Aviso por arquivo (ex.: foto em pé para a capa). */
  aviso?: (a: ArquivoTela) => string | null;
  compacto?: boolean;
};

type Fila = { chave: string; arquivo: File; estado: "enviando" | "erro"; mensagem?: string };

const ehImagem = (mime: string) => /^image\/(jpeg|png|webp|svg\+xml)$/.test(mime);

export default function Envio({
  codigo,
  tipo,
  itemId,
  arquivos,
  editavel,
  onMudou,
  accept,
  textoBotao,
  aviso,
  compacto,
}: Props) {
  const regra = LIMITE_ARQUIVOS[tipo];
  const multiplo = !regra.unico;
  const input = useRef<HTMLInputElement>(null);
  const [fila, setFila] = useState<Fila[]>([]);
  const [recusados, setRecusados] = useState<string[]>([]);
  const [removendo, setRemovendo] = useState<string | null>(null);

  const enviando = fila.filter((f) => f.estado === "enviando").length;
  const cabem = multiplo ? Math.max(0, regra.max - arquivos.length - enviando) : 1;

  async function enviarUm(chave: string, f: File) {
    setFila((q) => q.map((x) => (x.chave === chave ? { ...x, estado: "enviando", mensagem: undefined } : x)));
    try {
      const r = await subirArquivo(codigo, tipo, f, itemId);
      setFila((q) => q.filter((x) => x.chave !== chave));
      onMudou({ novo: r.arquivo, etapas_completas: r.etapas_completas });
    } catch (e) {
      const mensagem =
        e instanceof FalhaPortal && e.corpo.mensagem
          ? String(e.corpo.mensagem)
          : `${f.name}: não conseguimos enviar. Confira a internet e tente de novo.`;
      setFila((q) => q.map((x) => (x.chave === chave ? { ...x, estado: "erro", mensagem } : x)));
    }
  }

  async function escolher(lista: FileList | null) {
    if (!lista || !lista.length) return;
    const novos = Array.from(lista);
    const problemas: string[] = [];
    const validos = novos.filter((f) => {
      const p = problemaAntes(tipo, f);
      if (p) problemas.push(p);
      return !p;
    });
    if (validos.length > cabem) problemas.push(`Cabem mais ${cabem} arquivo${cabem === 1 ? "" : "s"} aqui.`);
    setRecusados(problemas);
    if (input.current) input.current.value = "";

    const itens = validos.slice(0, cabem).map((arquivo) => ({
      chave: `${arquivo.name}-${arquivo.size}-${Math.random().toString(36).slice(2)}`,
      arquivo,
      estado: "enviando" as const,
    }));
    setFila((q) => [...q, ...itens]);
    // Um de cada vez: no 4G, vários ao mesmo tempo falham mais.
    for (const it of itens) await enviarUm(it.chave, it.arquivo);
  }

  async function remover(id: string) {
    setRemovendo(id);
    try {
      const r = await removerArquivo(codigo, id);
      onMudou({ removido: id, etapas_completas: r.etapas_completas });
    } catch {
      setRecusados(["Não conseguimos excluir agora. Tente de novo."]);
    } finally {
      setRemovendo(null);
    }
  }

  const grade = tipo === "galeria" || tipo === "item";

  return (
    <div className="flex flex-col gap-3">
      {(arquivos.length > 0 || fila.length > 0) && (
        <ul className={grade ? "grid grid-cols-3 gap-2 sm:grid-cols-4" : "flex flex-col gap-2"}>
          {arquivos.map((a) => {
            const alerta = aviso?.(a);
            return (
              <li key={a.id} className={grade ? "" : "flex flex-col gap-2"}>
                <div
                  className={`relative overflow-hidden rounded-md border border-grafite/15 bg-white ${
                    grade ? "aspect-square" : "flex items-center gap-3 p-2"
                  }`}
                >
                  {a.url && ehImagem(a.mime) ? (
                    <img
                      src={a.url}
                      alt={a.nome}
                      className={
                        grade
                          ? "h-full w-full object-cover"
                          : `h-16 w-16 shrink-0 rounded ${tipo === "logo" ? "object-contain" : "object-cover"}`
                      }
                    />
                  ) : (
                    <span
                      className={`grid shrink-0 place-items-center bg-creme-100 text-cobre-deep ${
                        grade ? "h-full w-full" : "h-16 w-16 rounded"
                      }`}
                    >
                      <FileText className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                  )}
                  {!grade && (
                    <span className="min-w-0 flex-1 truncate text-[15px] text-grafite" title={a.nome}>
                      {a.nome}
                    </span>
                  )}
                  {editavel && (
                    <button
                      type="button"
                      onClick={() => remover(a.id)}
                      disabled={removendo === a.id}
                      aria-label={`Excluir ${a.nome}`}
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-grafite/75 text-white transition hover:bg-grafite ${
                        grade ? "absolute right-1.5 top-1.5" : ""
                      }`}
                    >
                      {removendo === a.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <X className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  )}
                </div>
                {alerta && !grade && (
                  <p className="rounded-md bg-[#F7E6CF] px-3 py-2 text-sm leading-relaxed text-grafite">{alerta}</p>
                )}
              </li>
            );
          })}
          {fila.map((f) => (
            <li
              key={f.chave}
              className={`flex items-center gap-2 rounded-md border border-dashed border-cobre-line bg-white p-2 text-sm text-grafite ${
                grade ? "col-span-3 sm:col-span-4" : ""
              }`}
            >
              {f.estado === "enviando" ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cobre-deep" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">Enviando {f.arquivo.name}…</span>
                </>
              ) : (
                <>
                  <span className="min-w-0 flex-1 text-terracota-600">{f.mensagem}</span>
                  <button
                    type="button"
                    onClick={() => enviarUm(f.chave, f.arquivo)}
                    className="inline-flex min-h-9 items-center gap-1 font-semibold text-cobre-deep"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" /> Tentar de novo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFila((q) => q.filter((x) => x.chave !== f.chave))}
                    aria-label="Desistir deste arquivo"
                    className="grid h-9 w-9 place-items-center text-grafite-muted"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {editavel && cabem > 0 && (
        <>
          <input
            ref={input}
            id={`envio-${tipo}${itemId ? `-${itemId}` : ""}`}
            type="file"
            accept={accept}
            multiple={multiplo}
            className="sr-only"
            onChange={(e) => escolher(e.target.files)}
          />
          <button
            type="button"
            onClick={() => input.current?.click()}
            className={`inline-flex items-center justify-center gap-2 rounded-md border-[1.5px] border-dashed border-cobre-line bg-white px-4 font-semibold text-cobre-deep transition hover:bg-cobre/5 ${
              compacto ? "min-h-11 text-sm" : "min-h-[3.25rem] text-[15px]"
            }`}
          >
            {tipo === "referencia" || tipo === "logo" ? (
              <Upload className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <ImagePlus className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            )}
            {arquivos.length && !multiplo ? "Trocar arquivo" : textoBotao}
          </button>
        </>
      )}

      {recusados.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm font-semibold text-terracota-600">
          {recusados.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
