import { forwardRef } from "react";
import type { AnchorHTMLAttributes } from "react";
import { track, type NomeEvento } from "@/lib/track";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Nome do evento (um dos 14 de `src/lib/track.ts`). */
  evento: NomeEvento;
  /** Props do evento — nunca dado pessoal (nome/e-mail/whatsapp/CPF), só
   * ids/slugs/rótulos curtos. */
  props?: Record<string, unknown>;
};

/** `<a>` comum que dispara `track()` no clique antes de seguir o link. Pensado
 * pra links externos (WhatsApp, site do parceiro, Shopee, Instagram) — o
 * `track()` já usa `fetch(..., { keepalive: true })` por baixo, então o
 * evento sobrevive à navegação/descarregamento da página. Evita repetir essa
 * lógica em cada componente que tem um link de saída. */
const LinkRastreado = forwardRef<HTMLAnchorElement, Props>(function LinkRastreado(
  { evento, props: propsDoEvento, onClick, children, ...resto },
  ref,
) {
  return (
    <a
      ref={ref}
      {...resto}
      onClick={(e) => {
        void track(evento, propsDoEvento);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
});

export default LinkRastreado;
