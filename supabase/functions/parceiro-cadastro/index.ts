// Edge Function: parceiro-cadastro (Portal do Parceiro, página /cadastro-parceiro)
// Spec: docs/superpowers/specs/2026-11-13-portal-cadastro-parceiros.md
//
// O parceiro não tem conta: o link pessoal traz um código de 64 caracteres
// (/cadastro-parceiro#<codigo>). Toda chamada manda esse código; a função calcula o
// hash, acha o cadastro (só guardamos o hash) e só mexe nele. Tabelas e bucket não
// têm nenhuma policy (migration 0015): só esta função, com a service_role, chega lá.
//
//   POST { acao, codigo, ... }
//   abrir                                   → cadastro, arquivos (com link de 1 h para ver), pendências
//   salvar          { etapa?, dados?, versao, etapa_atual? }   → { versao, etapas_completas }
//                   409 conflito (outra pessoa salvou antes): devolve as respostas atuais
//   upload          { tipo, nome, mime, tamanho, item_id?, largura?, altura? } → { id, caminho, token }
//   confirmar_upload { id }                 → arquivo (confere no Storage o que realmente subiu)
//   remover_arquivo { id }
//   enviar          { autorizacao: true }   → 400 { erros: Pendencia[] } se faltar o mínimo
//   pedir_correcao  { mensagem }            → depois do envio, avisa a equipe pelo histórico
//   previa                                  → página montada pela equipe (status aguardando_aprovacao
//                   ou aprovado): { perfil, hash, fotos: { caminho: link de 1 h } }
//   aprovar         { hash, nome }          → registra a aprovação do conteúdo exato (hash) · 409 mudou
//   pedir_ajuste    { hash, nome, comentario } → registra o pedido e volta para a equipe
//   limpar_rascunhos (sem código)           → apaga rascunhos parados há RASCUNHO_DIAS (cadastro
//                   + arquivos no Storage). Chamada todo dia pelo pg_cron (0015). Não precisa de
//                   senha: só apaga o que a regra da 0015 já manda apagar, chamar de novo não muda nada.
//
// Erros: 404 link_invalido · 410 link_vencido · 409 nao_editavel | conflito · 400 invalido | limite
//
// Deploy (da pasta do clube-vantagens):
//   npx supabase functions deploy parceiro-cadastro --project-ref yfdlvusoanyyetcgoafz --no-verify-jwt
// Usa CLUBE_ORIGENS (o mesmo da cotacao-enviar). SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY vêm no runtime.
//
// Aviso de cadastro novo por e-mail (Resend). Sem as três variáveis abaixo, a função
// funciona normalmente e só não manda o aviso:
//   RESEND_API_KEY   chave do Resend
//   AVISO_REMETENTE  ex.: "Clube Sanchez <avisos@dominio-verificado>"
//   AVISO_EMAILS     destinatários separados por vírgula (e-mail operacional da coordenação + 1)
// O e-mail leva só o nome da empresa, a data e o link do painel: nenhum dado pessoal.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { hashDoIp, hojeBrasilia, ipDaRequisicao, origemPermitida } from "../_shared/cotacao.ts";
import { fotosDoPerfil, limparPerfil } from "../_shared/parceiro-pagina.ts";
import {
  ARQUIVOS,
  caminhoArquivo,
  codigoComFormato,
  editavel,
  ETAPAS,
  etapasCompletas,
  hashCodigo,
  idItemValido,
  LIMPAR,
  limparBeneficio,
  limparRespostas,
  pendencias,
  problemaArquivo,
  RASCUNHO_DIAS,
  STATUS_EDITAVEIS,
  TERMOS_VERSAO,
  textoBeneficio,
  type ArquivoResumo,
  type NomeEtapa,
  type Respostas,
  type TipoArquivo,
} from "../_shared/parceiro-cadastro.ts";

const URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ORIGENS = (Deno.env.get("CLUBE_ORIGENS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const BUCKET = "parceiros-cadastro";
const LINK_VER_SEGUNDOS = 60 * 60;
const UPLOAD_ABANDONADO_MS = 60 * 60 * 1000;
const CORRECOES_POR_DIA = 5;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const AVISO_REMETENTE = Deno.env.get("AVISO_REMETENTE") ?? "";
const AVISO_EMAILS = (Deno.env.get("AVISO_EMAILS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const SAL = Deno.env.get("SITE_IP_SAL") ?? ""; // o mesmo da cotacao-enviar; sem ele, a aprovação fica sem ip_hash

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

type Obj = Record<string, unknown>;

interface Cadastro {
  id: string;
  status: string;
  slug: string | null;
  token_expira_em: string;
  convite_empresa: string;
  convite_contato: string | null;
  respostas: unknown;
  versao: number;
  etapa_atual: number;
  etapas_completas: number[];
  beneficio_confirmado_texto: string | null;
  autorizacao_uso_em: string | null;
  enviado_em: string | null;
}

interface LinhaArquivo {
  id: string;
  tipo: TipoArquivo;
  item_id: string | null;
  caminho: string;
  nome_original: string;
  mime: string;
  tamanho: number;
  largura: number | null;
  altura: number | null;
  confirmado: boolean;
  created_at: string;
}

const COLUNAS_ARQUIVO = "id, tipo, item_id, caminho, nome_original, mime, tamanho, largura, altura, confirmado, created_at";

function cors(req: Request) {
  return {
    "Access-Control-Allow-Origin": origemPermitida(req.headers.get("origin"), ORIGENS),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

class Falha extends Error {}

async function historico(cadastroId: string, acao: string, detalhe: Obj = {}, autor = "parceiro") {
  const { error } = await admin.from("parceiros_historico").insert({ cadastro_id: cadastroId, autor, acao, detalhe });
  if (error) console.error("parceiro-cadastro, histórico:", error.message);
}

async function arquivosConfirmados(cadastroId: string): Promise<LinhaArquivo[]> {
  const { data, error } = await admin
    .from("parceiros_arquivos")
    .select(COLUNAS_ARQUIVO)
    .eq("cadastro_id", cadastroId)
    .eq("confirmado", true)
    .order("created_at");
  if (error) throw new Falha(error.message);
  return (data ?? []) as LinhaArquivo[];
}

/** Arquivo como a tela vê: sem o caminho interno, com link de 1 h para a miniatura. */
async function paraTela(linhas: LinhaArquivo[]) {
  const links = new Map<string, string>();
  if (linhas.length) {
    const { data } = await admin.storage.from(BUCKET).createSignedUrls(
      linhas.map((a) => a.caminho),
      LINK_VER_SEGUNDOS,
    );
    for (const l of data ?? []) if (l.path && l.signedUrl) links.set(l.path, l.signedUrl);
  }
  return linhas.map((a) => ({
    id: a.id,
    tipo: a.tipo,
    item_id: a.item_id,
    nome: a.nome_original,
    mime: a.mime,
    tamanho: a.tamanho,
    largura: a.largura,
    altura: a.altura,
    url: links.get(a.caminho) ?? null,
  }));
}

async function apagarArquivos(linhas: Pick<LinhaArquivo, "id" | "caminho">[]) {
  if (!linhas.length) return;
  const { error } = await admin.storage.from(BUCKET).remove(linhas.map((a) => a.caminho));
  if (error) console.error("parceiro-cadastro, remover do Storage:", error.message);
  await admin.from("parceiros_arquivos").delete().in("id", linhas.map((a) => a.id));
}

/** Aviso à coordenação. Nunca derruba o envio do parceiro: se falhar, só registra no log. */
async function avisarCoordenacao(c: Cadastro, reenvio: boolean, origem: string) {
  if (!RESEND_API_KEY || !AVISO_REMETENTE || !AVISO_EMAILS.length) return;
  const empresa = limparRespostas(c.respostas).negocio?.nomeEmpresa || c.convite_empresa;
  const quando = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });
  const link = `${origem}/admin/parceiros#${c.id}`;
  const esc = (t: string) => t.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
  const titulo = reenvio ? `Cadastro atualizado: ${empresa}` : `Novo cadastro de parceiro: ${empresa}`;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: AVISO_REMETENTE,
        to: AVISO_EMAILS,
        subject: titulo,
        text: `${titulo}\nEnviado em ${quando}.\n\nAbrir no painel: ${link}`,
        html: `<p><strong>${esc(titulo)}</strong></p><p>Enviado em ${esc(quando)}.</p><p><a href="${esc(link)}">Abrir no painel</a></p>`,
      }),
      signal: AbortSignal.timeout(6_000),
    });
    if (!r.ok) console.error("parceiro-cadastro, aviso por e-mail:", r.status, await r.text().catch(() => ""));
  } catch (e) {
    console.error("parceiro-cadastro, aviso por e-mail:", e instanceof Error ? e.message : e);
  }
}

function resumo(c: Cadastro) {
  return {
    status: c.status,
    editavel: editavel(c.status),
    slug: c.status === "publicado" ? c.slug : null,
    empresa: c.convite_empresa,
    contato: c.convite_contato,
    respostas: limparRespostas(c.respostas),
    versao: c.versao,
    etapa_atual: c.etapa_atual,
    etapas_completas: c.etapas_completas,
    autorizado: !!c.autorizacao_uso_em,
    enviado_em: c.enviado_em,
  };
}

/** Apaga os rascunhos vencidos: primeiro os arquivos no Storage, depois o cadastro. */
async function limparRascunhos(): Promise<number> {
  const { data, error } = await admin.rpc("parceiros_rascunhos_vencidos", { p_dias: RASCUNHO_DIAS });
  if (error) throw new Falha(error.message);
  const ids = ((data as string[] | null) ?? []).slice(0, 50);
  let apagados = 0;
  for (const id of ids) {
    // Lista as pastas do Storage (pega também upload que nunca foi confirmado).
    const caminhos: string[] = [];
    for (const tipo of Object.keys(ARQUIVOS)) {
      const { data: lista, error: erroLista } = await admin.storage.from(BUCKET).list(`${id}/${tipo}`, { limit: 1000 });
      if (erroLista) throw new Falha(erroLista.message);
      for (const o of lista ?? []) if (o.id) caminhos.push(`${id}/${tipo}/${o.name}`);
    }
    if (caminhos.length) {
      const { error: erroRemover } = await admin.storage.from(BUCKET).remove(caminhos);
      if (erroRemover) throw new Falha(erroRemover.message);
    }
    // Confere de novo o status: cadastro enviado nunca é apagado aqui.
    const { error: erroApagar, count } = await admin
      .from("parceiros_cadastro")
      .delete({ count: "exact" })
      .eq("id", id)
      .in("status", ["convite_enviado", "cadastro_iniciado"])
      .is("enviado_em", null);
    if (erroApagar) throw new Falha(erroApagar.message);
    apagados += count ?? 0;
  }
  return apagados;
}

Deno.serve(async (req) => {
  const headers = cors(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ ok: false, erro: "metodo" }, 405);

  let corpo: Obj;
  try {
    const lido = await req.json();
    corpo = lido && typeof lido === "object" ? (lido as Obj) : {};
  } catch {
    return json({ ok: false, erro: "invalido" }, 400);
  }

  if (corpo.acao === "limpar_rascunhos") {
    try {
      return json({ ok: true, apagados: await limparRascunhos() });
    } catch (e) {
      console.error("limpar_rascunhos", e);
      return json({ ok: false, erro: "falha" }, 500);
    }
  }

  if (!codigoComFormato(corpo.codigo)) return json({ ok: false, erro: "link_invalido" }, 404);

  try {
    const { data: achado, error: erroBusca } = await admin
      .from("parceiros_cadastro")
      .select(
        "id, status, slug, token_expira_em, convite_empresa, convite_contato, respostas, versao, etapa_atual, etapas_completas, beneficio_confirmado_texto, autorizacao_uso_em, enviado_em",
      )
      .eq("token_hash", await hashCodigo(corpo.codigo))
      .maybeSingle();
    if (erroBusca) throw new Falha(erroBusca.message);
    const cad = achado as Cadastro | null;
    if (!cad || cad.status === "arquivado") return json({ ok: false, erro: "link_invalido" }, 404);
    if (new Date(cad.token_expira_em).getTime() < Date.now()) return json({ ok: false, erro: "link_vencido" }, 410);

    const agora = new Date().toISOString();
    const acao = corpo.acao;

    // ── abrir ──────────────────────────────────────────────────────────────
    if (acao === "abrir") {
      const arquivos = await arquivosConfirmados(cad.id);
      const respostas = limparRespostas(cad.respostas);
      return json({
        ok: true,
        cadastro: resumo(cad),
        arquivos: await paraTela(arquivos),
        pendencias: pendencias(respostas, arquivos),
      });
    }

    // ── pedir correção (depois de enviado) ─────────────────────────────────
    if (acao === "pedir_correcao") {
      const mensagem = typeof corpo.mensagem === "string" ? corpo.mensagem.trim().slice(0, 1000) : "";
      if (!mensagem) return json({ ok: false, erro: "invalido" }, 400);
      const umDia = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await admin
        .from("parceiros_historico")
        .select("id", { count: "exact", head: true })
        .eq("cadastro_id", cad.id)
        .eq("acao", "parceiro_pediu_correcao")
        .gte("quando", umDia);
      if ((count ?? 0) >= CORRECOES_POR_DIA) return json({ ok: false, erro: "limite" }, 429);
      await historico(cad.id, "parceiro_pediu_correcao", { mensagem });
      await admin.from("parceiros_cadastro").update({ ultima_atividade_em: agora }).eq("id", cad.id);
      return json({ ok: true });
    }

    // ── prévia da página e decisão do parceiro ─────────────────────────────
    if (acao === "previa") {
      if (cad.status !== "aguardando_aprovacao" && cad.status !== "aprovado") {
        return json({ ok: false, erro: "nao_editavel", status: cad.status }, 409);
      }
      const { data: perfil, error } = await admin
        .from("parceiros_perfil")
        .select("conteudo, conteudo_hash")
        .eq("cadastro_id", cad.id)
        .maybeSingle();
      if (error) throw new Falha(error.message);
      if (!perfil) return json({ ok: false, erro: "nao_editavel", status: cad.status }, 409);
      const conteudo = limparPerfil(perfil.conteudo);
      const caminhos = fotosDoPerfil(conteudo).filter((c) => c.startsWith(`${cad.id}/pagina/`));
      const fotos: Record<string, string> = {};
      if (caminhos.length) {
        const { data } = await admin.storage.from(BUCKET).createSignedUrls(caminhos, LINK_VER_SEGUNDOS);
        for (const l of data ?? []) if (l.path && l.signedUrl) fotos[l.path] = l.signedUrl;
      }
      return json({ ok: true, perfil: conteudo, hash: perfil.conteudo_hash, fotos });
    }

    if (acao === "aprovar" || acao === "pedir_ajuste") {
      const nome = typeof corpo.nome === "string" ? corpo.nome.replace(/\s+/g, " ").trim().slice(0, 120) : "";
      const comentario = typeof corpo.comentario === "string" ? corpo.comentario.trim().slice(0, 2000) : "";
      const hash = typeof corpo.hash === "string" && /^[0-9a-f]{64}$/.test(corpo.hash) ? corpo.hash : "";
      if (!nome || !hash || (acao === "pedir_ajuste" && !comentario)) return json({ ok: false, erro: "invalido" }, 400);
      const ipHash = SAL ? await hashDoIp(ipDaRequisicao(req.headers), hojeBrasilia(), SAL) : null;
      const { data: resultado, error } = await admin.rpc("parceiro_pagina_decidir", {
        p_id: cad.id,
        p_hash: hash,
        p_decisao: acao === "aprovar" ? "aprovado" : "ajuste",
        p_nome: nome,
        p_comentario: comentario || null,
        p_ip_hash: ipHash,
      });
      if (error) throw new Falha(error.message);
      if (resultado === "mudou") return json({ ok: false, erro: "conflito" }, 409);
      if (resultado !== "ok") return json({ ok: false, erro: "nao_editavel", status: cad.status }, 409);
      return json({ ok: true, status: acao === "aprovar" ? "aprovado" : "ajustes_solicitados" });
    }

    // Daqui para baixo, tudo muda o cadastro.
    if (!editavel(cad.status)) return json({ ok: false, erro: "nao_editavel", status: cad.status }, 409);

    // ── salvar ─────────────────────────────────────────────────────────────
    if (acao === "salvar") {
      if (typeof corpo.versao !== "number") return json({ ok: false, erro: "invalido" }, 400);
      const respostas: Respostas = limparRespostas(cad.respostas);
      const mudanca: Obj = { ultima_atividade_em: agora, updated_at: agora };

      if (corpo.etapa !== undefined) {
        if (!(ETAPAS as readonly unknown[]).includes(corpo.etapa)) return json({ ok: false, erro: "invalido" }, 400);
        const etapa = corpo.etapa as NomeEtapa;
        (respostas as Record<string, unknown>)[etapa] = LIMPAR[etapa](corpo.dados);

        if (etapa === "beneficio") {
          // A confirmação vale para o texto exato do benefício. Mudou o benefício, a tela
          // desmarca; se vier marcado com texto novo, é uma confirmação nova.
          const b = limparBeneficio(corpo.dados);
          const texto = textoBeneficio(b);
          if (!b.confirmado) {
            mudanca.beneficio_confirmado_em = null;
            mudanca.beneficio_confirmado_texto = null;
          } else if (cad.beneficio_confirmado_texto !== texto) {
            mudanca.beneficio_confirmado_em = agora;
            mudanca.beneficio_confirmado_texto = texto;
          }
        }
        mudanca.respostas = respostas;
      }

      if (typeof corpo.etapa_atual === "number" && corpo.etapa_atual >= 0 && corpo.etapa_atual <= 8) {
        mudanca.etapa_atual = Math.floor(corpo.etapa_atual);
      }

      const arquivos = await arquivosConfirmados(cad.id);
      const completas = etapasCompletas(respostas, arquivos);
      mudanca.etapas_completas = completas;
      mudanca.versao = cad.versao + 1;
      if (cad.status === "convite_enviado") mudanca.status = "cadastro_iniciado";

      const { data: salvo, error } = await admin
        .from("parceiros_cadastro")
        .update(mudanca)
        .eq("id", cad.id)
        .eq("versao", corpo.versao)
        // a equipe pode ter mudado o status entre a leitura lá em cima e esta gravação
        .in("status", [...STATUS_EDITAVEIS])
        .select("versao")
        .maybeSingle();
      if (error) throw new Falha(error.message);
      if (!salvo) {
        // outra aba ou outra pessoa salvou antes: devolve o que está gravado
        return json({ ok: false, erro: "conflito", cadastro: resumo(cad) }, 409);
      }
      if (mudanca.beneficio_confirmado_em === null && cad.beneficio_confirmado_texto) {
        // Tirou a confirmação: a versão que estava confirmada deixa de valer. Sem isto a
        // página seria montada com um benefício que o parceiro já desfez.
        await admin
          .from("parceiros_beneficio_versoes")
          .update({ situacao: "substituido" })
          .eq("cadastro_id", cad.id)
          .neq("situacao", "substituido");
        await historico(cad.id, "beneficio_desconfirmado");
      }
      if (cad.status === "convite_enviado") await historico(cad.id, "cadastro_iniciado");
      if (mudanca.beneficio_confirmado_em) {
        // Versão nova do benefício: a anterior deixa de valer (inclusive uma já validada).
        await admin
          .from("parceiros_beneficio_versoes")
          .update({ situacao: "substituido" })
          .eq("cadastro_id", cad.id)
          .neq("situacao", "substituido");
        const { error: erroVersao } = await admin.from("parceiros_beneficio_versoes").insert({
          cadastro_id: cad.id,
          texto: mudanca.beneficio_confirmado_texto,
          dados: respostas.beneficio,
          confirmado_por: respostas.negocio?.responsavel || null,
          confirmado_em: agora,
        });
        if (erroVersao) console.error("parceiro-cadastro, versão do benefício:", erroVersao.message);
        await historico(cad.id, "beneficio_confirmado", { texto: mudanca.beneficio_confirmado_texto });
      }

      return json({
        ok: true,
        versao: salvo.versao,
        etapas_completas: completas,
        pendencias: pendencias(respostas, arquivos),
      });
    }

    // ── upload: devolve o link de uso único ────────────────────────────────
    if (acao === "upload") {
      const tipo = corpo.tipo as TipoArquivo;
      // hasOwn: "constructor", "toString" etc. existem em todo objeto e não são tipos de arquivo
      const regra = typeof corpo.tipo === "string" && Object.hasOwn(ARQUIVOS, corpo.tipo) ? ARQUIVOS[tipo] : undefined;
      const nome = typeof corpo.nome === "string" ? corpo.nome.slice(0, 200) : "";
      const mime = typeof corpo.mime === "string" ? corpo.mime : "";
      const tamanho = typeof corpo.tamanho === "number" ? corpo.tamanho : NaN;
      if (!regra || !nome) return json({ ok: false, erro: "invalido" }, 400);
      const problema = problemaArquivo(tipo, nome, mime, tamanho);
      if (problema) return json({ ok: false, erro: "invalido", mensagem: problema }, 400);
      const itemId = tipo === "item" ? corpo.item_id : null;
      if (tipo === "item" && !idItemValido(itemId)) return json({ ok: false, erro: "invalido" }, 400);

      // Uploads que começaram e nunca terminaram (aba fechada no meio) somem aqui.
      const { data: todos, error: erroLista } = await admin
        .from("parceiros_arquivos")
        .select(COLUNAS_ARQUIVO)
        .eq("cadastro_id", cad.id);
      if (erroLista) throw new Falha(erroLista.message);
      const linhas = (todos ?? []) as LinhaArquivo[];
      const limite = Date.now() - UPLOAD_ABANDONADO_MS;
      const abandonados = linhas.filter((a) => !a.confirmado && new Date(a.created_at).getTime() < limite);
      await apagarArquivos(abandonados);
      const ativos = linhas.filter((a) => !abandonados.includes(a));

      // Tipos de arquivo único são trocados ao confirmar; os outros têm limite de quantidade.
      if (!regra.unico) {
        const doTipo = ativos.filter((a) => a.tipo === tipo).length;
        if (doTipo >= regra.max) {
          return json({ ok: false, erro: "limite", mensagem: `No máximo ${regra.max} arquivos aqui.` }, 400);
        }
      } else if (tipo === "item") {
        const itensComFoto = new Set(ativos.filter((a) => a.tipo === "item").map((a) => a.item_id));
        itensComFoto.add(itemId as string);
        if (itensComFoto.size > regra.max) return json({ ok: false, erro: "limite" }, 400);
      }
      // Teto geral contra abuso (pedidos que nunca confirmam).
      if (ativos.length >= 40) return json({ ok: false, erro: "limite" }, 400);

      const id = crypto.randomUUID();
      const caminho = caminhoArquivo(cad.id, tipo, id, nome);
      const { data: link, error: erroLink } = await admin.storage.from(BUCKET).createSignedUploadUrl(caminho);
      if (erroLink || !link) throw new Falha(erroLink?.message ?? "sem link de upload");

      const inteiro = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 && v < 100000 ? Math.round(v) : null);
      const { error } = await admin.from("parceiros_arquivos").insert({
        id,
        cadastro_id: cad.id,
        tipo,
        item_id: itemId,
        caminho,
        nome_original: nome,
        mime,
        tamanho,
        largura: inteiro(corpo.largura),
        altura: inteiro(corpo.altura),
      });
      if (error) throw new Falha(error.message);
      return json({ ok: true, id, caminho: link.path, token: link.token });
    }

    // ── confirmar upload: confere o que chegou de fato ─────────────────────
    if (acao === "confirmar_upload") {
      const { data: achadoArq } = await admin
        .from("parceiros_arquivos")
        .select(COLUNAS_ARQUIVO)
        .eq("id", typeof corpo.id === "string" ? corpo.id : "")
        .eq("cadastro_id", cad.id)
        .maybeSingle();
      const arq = achadoArq as LinhaArquivo | null;
      if (!arq) return json({ ok: false, erro: "invalido" }, 400);

      const pasta = arq.caminho.slice(0, arq.caminho.lastIndexOf("/"));
      const arquivo = arq.caminho.slice(arq.caminho.lastIndexOf("/") + 1);
      const { data: lista } = await admin.storage.from(BUCKET).list(pasta, { search: arquivo, limit: 5 });
      const objeto = (lista ?? []).find((o) => o.name === arquivo);
      const meta = (objeto?.metadata ?? {}) as { size?: number; mimetype?: string };
      if (!objeto) {
        await apagarArquivos([arq]);
        return json({ ok: false, erro: "invalido", mensagem: "O arquivo não chegou. Tente de novo." }, 400);
      }
      const tamanhoReal = typeof meta.size === "number" ? meta.size : arq.tamanho;
      const mimeReal = meta.mimetype || arq.mime;
      const problema = problemaArquivo(arq.tipo, arq.nome_original, mimeReal, tamanhoReal);
      if (problema) {
        await apagarArquivos([arq]);
        return json({ ok: false, erro: "invalido", mensagem: problema }, 400);
      }

      const { error } = await admin
        .from("parceiros_arquivos")
        .update({ confirmado: true, tamanho: tamanhoReal, mime: mimeReal })
        .eq("id", arq.id);
      if (error) throw new Falha(error.message);

      // Logo, capa e foto de um item: o novo substitui o anterior.
      if (ARQUIVOS[arq.tipo].unico) {
        let q = admin
          .from("parceiros_arquivos")
          .select("id, caminho")
          .eq("cadastro_id", cad.id)
          .eq("tipo", arq.tipo)
          .neq("id", arq.id);
        if (arq.tipo === "item") q = q.eq("item_id", arq.item_id ?? "");
        const { data: antigos } = await q;
        await apagarArquivos((antigos ?? []) as Pick<LinhaArquivo, "id" | "caminho">[]);
      }

      const arquivos = await arquivosConfirmados(cad.id);
      const completas = etapasCompletas(limparRespostas(cad.respostas), arquivos);
      await admin
        .from("parceiros_cadastro")
        .update({ etapas_completas: completas, ultima_atividade_em: agora })
        .eq("id", cad.id);

      const [paraVer] = await paraTela([{ ...arq, confirmado: true, tamanho: tamanhoReal, mime: mimeReal }]);
      return json({ ok: true, arquivo: paraVer, etapas_completas: completas });
    }

    // ── remover arquivo ────────────────────────────────────────────────────
    if (acao === "remover_arquivo") {
      const { data: arq } = await admin
        .from("parceiros_arquivos")
        .select("id, caminho")
        .eq("id", typeof corpo.id === "string" ? corpo.id : "")
        .eq("cadastro_id", cad.id)
        .maybeSingle();
      if (arq) await apagarArquivos([arq as Pick<LinhaArquivo, "id" | "caminho">]);
      const arquivos = await arquivosConfirmados(cad.id);
      const completas = etapasCompletas(limparRespostas(cad.respostas), arquivos);
      await admin
        .from("parceiros_cadastro")
        .update({ etapas_completas: completas, ultima_atividade_em: agora })
        .eq("id", cad.id);
      return json({ ok: true, etapas_completas: completas });
    }

    // ── enviar ─────────────────────────────────────────────────────────────
    if (acao === "enviar") {
      if (corpo.autorizacao !== true) {
        return json(
          { ok: false, erro: "invalido", erros: [{ etapa: "revisao", campo: "autorizacao", texto: "Autorização de uso dos materiais" }] },
          400,
        );
      }
      const respostas = limparRespostas(cad.respostas);
      const arquivos = await arquivosConfirmados(cad.id);
      const p = pendencias(respostas, arquivos as ArquivoResumo[]);
      if (p.envio.length) return json({ ok: false, erro: "invalido", erros: p.envio }, 400);

      const reenvio = !!cad.enviado_em;
      const { data: enviado, error } = await admin
        .from("parceiros_cadastro")
        .update({
          status: "cadastro_recebido",
          enviado_em: cad.enviado_em ?? agora,
          autorizacao_uso_em: agora,
          autorizacao_termos_versao: TERMOS_VERSAO,
          etapas_completas: etapasCompletas(respostas, arquivos),
          ultima_atividade_em: agora,
          updated_at: agora,
        })
        .eq("id", cad.id)
        // a equipe pode ter mudado o status entre a leitura lá em cima e esta gravação
        .in("status", [...STATUS_EDITAVEIS])
        .select("id")
        .maybeSingle();
      if (error) throw new Falha(error.message);
      if (!enviado) return json({ ok: false, erro: "nao_editavel" }, 409);
      await historico(cad.id, reenvio ? "cadastro_reenviado" : "cadastro_enviado", {
        faltando_para_publicar: p.publicacao.map((x) => x.texto),
      });
      const origem = origemPermitida(req.headers.get("origin"), ORIGENS);
      await avisarCoordenacao(cad, reenvio, origem === "*" ? "https://clube-vantagens.vercel.app" : origem);
      return json({ ok: true, pendencias: p });
    }

    return json({ ok: false, erro: "invalido" }, 400);
  } catch (e) {
    console.error("parceiro-cadastro:", e instanceof Error ? e.message : e);
    return json({ ok: false, erro: "falha" }, 500);
  }
});
