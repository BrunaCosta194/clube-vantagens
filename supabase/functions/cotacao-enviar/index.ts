// Edge Function: cotacao-enviar (cotação da Insurance & Santé, página /parceiro/insurance-sante)
//
// Antes a página gravava direto em `cotacoes` e subia os documentos no bucket
// `cotacoes-docs` com a chave anônima, por policies abertas a qualquer visitante
// (0005). Agora quem grava é esta função, com a service_role, depois de conferir:
//   • campo escondido `website` (preenchido = robô: responde ok e não grava);
//   • Cloudflare Turnstile (mesmo widget e secret do site da Sanchez);
//   • os dados do formulário e os arquivos anunciados (tipo, tamanho, quantidade);
//   • no máximo LIMITE_POR_HORA envios por IP na última hora (o IP nunca é gravado:
//     só um hash que muda todo dia, coluna ip_hash da 0013).
// Os documentos não passam pela função: ela devolve um link de upload de uso único
// por arquivo (createSignedUploadUrl), e o navegador sobe cada um direto no bucket,
// que continua recusando o que passa de 10 MB ou não é PDF/foto (0012).
//
//   POST { produto, categoria, nome, whatsapp, email, dados, arquivos: [{nome, tipo, tamanho}],
//          aceite: true, turnstile, website }
//   → 200 { ok: true, id, uploads: [{ caminho, token }] }   na ordem dos arquivos
//   → 400 { ok: false, erros: {campo: mensagem} }
//   → 403 { ok: false, erro: "robo" }      Turnstile recusou
//   → 429 { ok: false, erro: "limite" }    muitos envios do mesmo IP na última hora
//   → 500 { ok: false, erro: "falha" }
//
// Deploy (da pasta do clube-vantagens):
//   npx supabase functions deploy cotacao-enviar --project-ref yfdlvusoanyyetcgoafz --no-verify-jwt
// Secrets: TURNSTILE_SECRET e SITE_IP_SAL já existem no projeto (são do site da Sanchez).
// Novo: CLUBE_ORIGENS = endereços do Clube, separados por vírgula
//   npx supabase secrets set CLUBE_ORIGENS=https://clube-vantagens.vercel.app --project-ref yfdlvusoanyyetcgoafz
// (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY já vêm no runtime.)

import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  caminhosDosArquivos,
  hashDoIp,
  hojeBrasilia,
  ipDaRequisicao,
  LIMITE_POR_HORA,
  origemPermitida,
  pareceRobo,
  resultadoTurnstile,
  tokenTurnstilePlausivel,
  turnstileForaDoAr,
  type ResultadoTurnstile,
  validarCotacao,
} from "../_shared/cotacao.ts";

const URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TURNSTILE_SECRET = Deno.env.get("TURNSTILE_SECRET") ?? "";
const SAL = Deno.env.get("SITE_IP_SAL") ?? "";
const ORIGENS = (Deno.env.get("CLUBE_ORIGENS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

function cors(req: Request) {
  return {
    "Access-Control-Allow-Origin": origemPermitida(req.headers.get("origin"), ORIGENS),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

async function turnstile(token: unknown, ip: string | null): Promise<ResultadoTurnstile> {
  if (!tokenTurnstilePlausivel(token)) return "recusado";
  const form = new FormData();
  form.append("secret", TURNSTILE_SECRET);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  let resposta: unknown = null;
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(5_000),
    });
    if (r.ok) resposta = await r.json().catch(() => null);
    else {
      await r.body?.cancel().catch(() => undefined);
      // 4xx = a Cloudflare recusou o pedido (token malformado): não é "fora do ar".
      if (!turnstileForaDoAr(r.status)) return "recusado";
    }
  } catch {
    resposta = null;
  }
  return resultadoTurnstile(token, resposta, ORIGENS);
}

Deno.serve(async (req) => {
  const headers = cors(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ ok: false, erro: "método não permitido" }, 405);
  // Sem CLUBE_ORIGENS o CORS viraria "*" e o Turnstile aceitaria token de qualquer site.
  if (!TURNSTILE_SECRET || !SAL || ORIGENS.length === 0) {
    console.error("cotacao-enviar sem configuração: falta TURNSTILE_SECRET, SITE_IP_SAL ou CLUBE_ORIGENS");
    return json({ ok: false, erro: "falha" }, 500);
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return json({ ok: false, erros: { geral: "Envio inválido." } }, 400);
  }

  // robô que preencheu o campo escondido: finge que deu certo e não grava
  if (pareceRobo(corpo)) return json({ ok: true, id: null, uploads: [] });

  const v = validarCotacao(corpo);
  if (!v.ok) return json({ ok: false, erros: v.erros }, 400);
  const c = v.cotacao;

  const ip = ipDaRequisicao(req.headers);
  const t = await turnstile((corpo as Record<string, unknown>).turnstile, ip);
  if (t === "recusado") return json({ ok: false, erro: "robo" }, 403);
  if (t === "sem_resposta") console.error("cotacao-enviar: Turnstile sem resposta; cotação gravada sem a checagem");

  const ipHash = await hashDoIp(ip, hojeBrasilia(), SAL);
  if (ipHash) {
    const umaHora = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error } = await admin
      .from("cotacoes")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", umaHora);
    if (error) {
      console.error("cotacao-enviar, contagem:", error.message);
      return json({ ok: false, erro: "falha" }, 500);
    }
    if ((count ?? 0) >= LIMITE_POR_HORA) return json({ ok: false, erro: "limite" }, 429);
  }

  // Links de upload antes de gravar: se o Storage falhar, nada fica gravado pela metade.
  const id = crypto.randomUUID();
  const caminhos = caminhosDosArquivos(id, c.arquivos);
  const uploads: { caminho: string; token: string }[] = [];
  for (const caminho of caminhos) {
    const { data, error } = await admin.storage.from("cotacoes-docs").createSignedUploadUrl(caminho);
    if (error || !data) {
      console.error("cotacao-enviar, link de upload:", error?.message);
      return json({ ok: false, erro: "falha" }, 500);
    }
    uploads.push({ caminho: data.path, token: data.token });
  }

  const { error } = await admin.from("cotacoes").insert({
    id,
    produto: c.produto,
    categoria: c.categoria,
    nome: c.nome,
    whatsapp: c.whatsapp,
    email: c.email,
    dados: c.dados,
    documentos: caminhos,
    consentimento_lgpd_em: new Date().toISOString(),
    ip_hash: ipHash,
    robo_checado: t === "ok",
  });
  if (error) {
    console.error("cotacao-enviar, gravação:", error.message);
    return json({ ok: false, erro: "falha" }, 500);
  }

  return json({ ok: true, id, uploads });
});
