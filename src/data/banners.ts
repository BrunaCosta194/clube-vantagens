// ─────────────────────────────────────────────────────────────
// BANNERS DO CARROSSEL — Bloco 4
//
// Fonte única da lista do carrossel do topo. Trocar/agendar banner = editar
// este arquivo + deploy; o histórico de quem já rodou fica no git. Admin de
// banners por tela é P2 (Bloco 11 do briefing) — até lá, é aqui.
//
// Este arquivo é só DADO: nenhum import de React/JSX. Isso mantém
// `bannersVigentes()` uma função pura (dá pra conferir sem DOM, só passando
// uma data) e deixa a lista pronta pra virar tabela no banco quando o admin
// chegar. O componente de cada banner é resolvido no `BannerCarousel`, por
// `id` — ver o mapa `COMPONENTES` lá.
// ─────────────────────────────────────────────────────────────

/** Ids curtos e ESTÁVEIS: vão na prop `banner` dos eventos `banner_view` /
 * `banner_click`. Renomear um id aqui corta a série histórica do banco —
 * os quatro primeiros já têm evento gravado em produção desde o Bloco 5. */
export type BannerId = "clube" | "bioreluz" | "insurance" | "loja" | "papo" | "premium";

export interface Banner {
  id: BannerId;
  /** Rótulo da campanha que vai no evento (`props.campanha`). Enquanto o
   * marketing não manda as campanhas reais, é o nome institucional da peça. */
  campanha: string;
  /** Para onde o clique leva: rota interna do React Router ou URL externa. */
  destino: string;
  /** "AAAA-MM-DD". Sem `inicio` vale desde sempre; sem `fim` não expira. */
  inicio?: string;
  fim?: string;
  /** `false` tira o banner do ar sem apagar a linha (mantém o histórico). */
  ativo: boolean;
  /** Ordem de exibição no carrossel (crescente). */
  ordem: number;
}

/** Props que o carrossel injeta em cada componente de banner. `posicao` e
 * `destino` vêm daqui — e não de constante dentro do banner — pra que o
 * evento `banner_click` reflita a lista VIGENTE: se um banner expirar, os de
 * baixo sobem e a posição registrada acompanha. */
export interface BannerProps {
  /** 1-based, dentro da lista vigente (é o "2" do contador "2 / 6"). */
  posicao: number;
  campanha: string;
  destino: string;
  /** Primeiro slide da vez: carrega com prioridade; o resto é lazy. */
  primeiro?: boolean;
}

// WhatsApp da Yruena (55 + DDD 11) — atendimento Premium. Continua sendo o
// destino que o BannerPremium já usava; só mudou de lugar, pra que TODO
// destino do carrossel esteja em um arquivo só.
const NUMERO_YRUENA = "5511971796030";
const MENSAGEM_PREMIUM = "Olá, Yruena! Tenho interesse no Sanchez Premium.";
export const DESTINO_PREMIUM = `https://wa.me/${NUMERO_YRUENA}?text=${encodeURIComponent(
  MENSAGEM_PREMIUM,
)}`;

/**
 * Ordem exigida pelo briefing (Bloco 4, item 1):
 * Comunidade Sanchez → BioReluz → Insurance & Santé → Loja → Papo → Premium.
 *
 * ⏳ PONTO DE EDIÇÃO: `campanha`, `inicio` e `fim` reais ainda não vieram do
 * marketing (pendência "Destino, campanha e período de cada banner" do
 * briefing). Por isso as janelas estão indefinidas — todo banner vale desde
 * sempre e não expira. Quando a campanha chegar, preencher `inicio`/`fim`
 * aqui: o carrossel passa a mostrar e a esconder sozinho, sem mexer em código.
 */
export const banners: Banner[] = [
  {
    id: "clube",
    campanha: "institucional-clube",
    destino: "/cadastro",
    ativo: true,
    ordem: 1,
  },
  {
    id: "bioreluz",
    campanha: "institucional-bioreluz",
    destino: "/parceiro/bioreluz",
    ativo: true,
    ordem: 2,
  },
  {
    id: "insurance",
    campanha: "institucional-insurance-sante",
    destino: "/parceiro/insurance-sante",
    ativo: true,
    ordem: 3,
  },
  {
    id: "loja",
    campanha: "institucional-loja",
    destino: "/loja",
    ativo: true,
    ordem: 4,
  },
  {
    id: "papo",
    campanha: "institucional-papo-de-aluguel",
    destino: "/papodealuguel",
    ativo: true,
    ordem: 5,
  },
  {
    id: "premium",
    campanha: "institucional-premium",
    destino: DESTINO_PREMIUM,
    ativo: true,
    ordem: 6,
  },
];

/** Data local como "AAAA-MM-DD". Comparar string com string (e não `Date`)
 * evita a armadilha do fuso: `new Date("2026-09-25")` é meia-noite em UTC,
 * que no Brasil (UTC-3) ainda é dia 24 às 21h — um banner que começa hoje
 * apareceria um dia antes. */
function diaLocalISO(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/**
 * Lista que deve ir ao ar agora: ativa, dentro da janela de datas e ordenada.
 * As duas pontas são opcionais — sem `inicio` vale desde sempre, sem `fim`
 * não expira. Pura de propósito: `bannersVigentes(new Date("2027-01-01"))`
 * responde como o carrossel vai estar naquele dia.
 *
 * Pode devolver lista VAZIA (todo mundo expirado/desativado) — quem chama
 * tem que aguentar isso; o `BannerCarousel` não renderiza nada nesse caso.
 */
export function bannersVigentes(hoje: Date = new Date()): Banner[] {
  const dia = diaLocalISO(hoje);
  return banners
    .filter((b) => b.ativo !== false)
    .filter((b) => (!b.inicio || b.inicio <= dia) && (!b.fim || dia <= b.fim))
    .sort((a, b) => a.ordem - b.ordem);
}
