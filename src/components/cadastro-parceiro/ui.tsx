import type { ReactNode } from "react";
import { Check } from "lucide-react";

// Peças do formulário do Portal do Parceiro. Pensadas para o celular:
// campos altos, botões de escolha grandes e um campo por linha.

export const inputCls =
  "min-h-[3.25rem] w-full rounded-md border border-grafite/20 bg-white px-4 py-3 text-base text-grafite placeholder:text-grafite-muted transition-colors focus:border-cobre-deep focus:outline-none focus:ring-2 focus:ring-cobre/20 aria-[invalid=true]:border-terracota-600";

type CampoProps = {
  id: string;
  rotulo: ReactNode;
  opcional?: boolean;
  ajuda?: ReactNode;
  erro?: string | null;
  children: ReactNode;
};

export function Campo({ id, rotulo, opcional, ajuda, erro, children }: CampoProps) {
  return (
    <div className="flex flex-col gap-2" data-campo={id}>
      <label htmlFor={id} className="text-[15px] font-semibold leading-snug text-grafite">
        {rotulo}
        {opcional && <span className="font-normal text-grafite-muted"> (opcional)</span>}
      </label>
      {ajuda && <p className="-mt-1 text-sm leading-relaxed text-grafite-soft">{ajuda}</p>}
      {children}
      {erro && (
        <p id={`${id}-erro`} className="text-sm font-semibold text-terracota-600">
          {erro}
        </p>
      )}
    </div>
  );
}

/** Grupo de botões de escolha (sem <label for>; usa fieldset/legend). */
export function Grupo({
  id,
  rotulo,
  opcional,
  ajuda,
  erro,
  children,
}: CampoProps) {
  return (
    <fieldset className="flex flex-col gap-2" data-campo={id} id={id} tabIndex={-1}>
      <legend className="mb-2 text-[15px] font-semibold leading-snug text-grafite">
        {rotulo}
        {opcional && <span className="font-normal text-grafite-muted"> (opcional)</span>}
      </legend>
      {ajuda && <p className="-mt-1 mb-1 text-sm leading-relaxed text-grafite-soft">{ajuda}</p>}
      {children}
      {erro && <p className="text-sm font-semibold text-terracota-600">{erro}</p>}
    </fieldset>
  );
}

type Opcao<T extends string> = { valor: T; rotulo: string };

export function opcoesDe<T extends string>(mapa: Record<T, string>): Opcao<T>[] {
  return (Object.keys(mapa) as T[]).map((valor) => ({ valor, rotulo: mapa[valor] }));
}

const chipCls = (ativo: boolean) =>
  `inline-flex min-h-11 items-center gap-2 rounded-md border px-4 py-2 text-left text-[15px] transition-colors ${
    ativo
      ? "border-cobre-deep bg-cobre/10 font-semibold text-cobre-deep"
      : "border-grafite/20 bg-white text-grafite hover:border-grafite/40"
  }`;

export function Escolha<T extends string>({
  opcoes,
  valor,
  onChange,
  nome,
}: {
  opcoes: Opcao<T>[];
  valor: T | "";
  onChange: (v: T | "") => void;
  nome: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={nome}>
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          role="radio"
          aria-checked={valor === o.valor}
          className={chipCls(valor === o.valor)}
          onClick={() => onChange(valor === o.valor ? "" : o.valor)}
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}

export function Varias<T extends string>({
  opcoes,
  valores,
  onChange,
}: {
  opcoes: Opcao<T>[];
  valores: string[];
  onChange: (v: T[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map((o) => {
        const ativo = valores.includes(o.valor);
        return (
          <button
            key={o.valor}
            type="button"
            role="checkbox"
            aria-checked={ativo}
            className={chipCls(ativo)}
            onClick={() =>
              onChange(ativo ? (valores.filter((v) => v !== o.valor) as T[]) : ([...valores, o.valor] as T[]))
            }
          >
            {ativo && <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" />}
            {o.rotulo}
          </button>
        );
      })}
    </div>
  );
}

export function Caixa({
  id,
  marcada,
  onChange,
  children,
  erro,
}: {
  id: string;
  marcada: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
  erro?: string | null;
}) {
  return (
    <div data-campo={id}>
      <label
        htmlFor={id}
        className={`flex cursor-pointer items-start gap-3 rounded-md border bg-white px-4 py-4 text-[15px] leading-relaxed text-grafite ${
          erro ? "border-terracota-600" : "border-grafite/15"
        }`}
      >
        <input
          id={id}
          type="checkbox"
          checked={marcada}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 accent-[#894C36]"
        />
        <span>{children}</span>
      </label>
      {erro && <p className="mt-2 text-sm font-semibold text-terracota-600">{erro}</p>}
    </div>
  );
}

export function TituloEtapa({ titulo, texto }: { titulo: string; texto?: ReactNode }) {
  return (
    <header className="mb-8">
      <h1 className="h-display text-[clamp(2rem,7vw,2.75rem)]">{titulo}</h1>
      {texto && <p className="mt-3 text-[17px] leading-relaxed text-grafite-soft">{texto}</p>}
    </header>
  );
}

export function Aviso({ children, tom = "info" }: { children: ReactNode; tom?: "info" | "atencao" }) {
  return (
    <div
      className={`rounded-md px-4 py-3 text-[15px] leading-relaxed ${
        tom === "atencao" ? "border-l-4 border-gatilho bg-[#F9E5D9] text-grafite" : "bg-creme-100 text-grafite"
      }`}
    >
      {children}
    </div>
  );
}
