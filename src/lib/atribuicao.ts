// ─────────────────────────────────────────────────────────────
// ATRIBUIÇÃO DE CAMPANHA — Bloco 5 (fundação de mensuração)
// Captura utm_*, ?ref= e o host de referência na primeira página da sessão
// e guarda em sessionStorage. Primeiro toque da sessão vence: navegações
// internas depois (ex.: home → parceiro → cadastro) não apagam a origem
// original — a não ser que a URL atual traga UTM novo (aí atualiza).
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "clube_atribuicao";

const CAMPOS_UTM = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export interface Atribuicao {
  /** utm_source > host do referrer (fora do próprio domínio) > "direto". */
  origem: string;
  /** utm_campaign, quando houver. */
  campanha: string | null;
  /** Todos os utm_* capturados, como vieram na URL. */
  utm: Record<string, string>;
  /** Código de indicação (?ref=) da URL que originou a sessão. */
  ref: string | null;
}

function lerUtmDaUrl(params: URLSearchParams): Record<string, string> {
  const utm: Record<string, string> = {};
  for (const campo of CAMPOS_UTM) {
    const valor = params.get(campo);
    if (valor) utm[campo] = valor;
  }
  return utm;
}

/** Host do `document.referrer`, ignorando quando é o próprio domínio
 * (navegação interna não conta como "origem externa"). */
function hostDoReferrer(): string | null {
  if (typeof document === "undefined" || !document.referrer) return null;
  try {
    const url = new URL(document.referrer);
    if (url.host === window.location.host) return null;
    return url.host;
  } catch {
    return null;
  }
}

function salvar(atribuicao: Atribuicao) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(atribuicao));
  } catch {
    // storage indisponível (privado/bloqueado) — segue sem persistir
  }
}

function ler(): Atribuicao | null {
  try {
    const bruto = sessionStorage.getItem(STORAGE_KEY);
    return bruto ? (JSON.parse(bruto) as Atribuicao) : null;
  } catch {
    return null;
  }
}

/** Chamar 1x na carga do app (main.tsx). Lê a URL atual e decide se cria,
 * mantém ou atualiza a atribuição salva da sessão. */
export function iniciarAtribuicao(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const utmDaUrl = lerUtmDaUrl(params);
  const refDaUrl = params.get("ref");
  const existente = ler();
  const temUtmNovo = Object.keys(utmDaUrl).length > 0;

  if (existente && !temUtmNovo) {
    // Primeiro toque já registrado e a URL atual não traz UTM novo: mantém.
    // Só complementa o ref se a atribuição salva ainda não tiver um — cobre
    // o caso de a pessoa entrar direto e só esbarrar num link com ?ref=
    // depois, navegando dentro do site.
    if (refDaUrl && !existente.ref) {
      salvar({ ...existente, ref: refDaUrl });
    }
    return;
  }

  if (existente && temUtmNovo) {
    // UTM novo na URL atual sobrepõe a atribuição salva (ex.: campanha nova
    // clicada durante a mesma sessão).
    salvar({
      origem: utmDaUrl.utm_source ?? existente.origem,
      campanha: utmDaUrl.utm_campaign ?? existente.campanha,
      utm: { ...existente.utm, ...utmDaUrl },
      ref: refDaUrl ?? existente.ref,
    });
    return;
  }

  // Primeiro toque da sessão.
  salvar({
    origem: utmDaUrl.utm_source ?? hostDoReferrer() ?? "direto",
    campanha: utmDaUrl.utm_campaign ?? null,
    utm: utmDaUrl,
    ref: refDaUrl,
  });
}

/** Atribuição da sessão atual — nunca null (cai pra "direto" sem UTM/ref). */
export function getAtribuicao(): Atribuicao {
  return ler() ?? { origem: "direto", campanha: null, utm: {}, ref: null };
}
