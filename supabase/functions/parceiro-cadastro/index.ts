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
//
// Erros: 404 link_invalido · 410 link_vencido · 409 nao_editavel | conflito · 400 invalido | limite
//
// Deploy (da pasta do clube-vantagens):
//   npx supabase functions deploy parceiro-cadastro --project-ref yfdlvusoanyyetcgoafz --no-verify-jwt
// Usa CLUBE_ORIGENS (o mesmo da cotacao-enviar). SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY vêm no runtime.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { origemPermitida } from "../_shared/cotacao.ts";
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

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

type Obj = Record<string, unknown>;

interface Cadastro {
  id: string;
  status: string;
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

function resumo(c: Cadastro) {
  return {
    status: c.status,
    editavel: editavel(c.status),
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

  if (!codigoComFormato(corpo.codigo)) return json({ ok: false, erro: "link_invalido" }, 404);

  try {
    const { data: achado, error: erroBusca } = await admin
      .from("parceiros_cadastro")
      .select(
        "id, status, token_expira_em, convite_empresa, convite_contato, respostas, versao, etapa_atual, etapas_completas, beneficio_confirmado_texto, autorizacao_uso_em, enviado_em",
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
        .select("versao")
        .maybeSingle();
      if (error) throw new Falha(error.message);
      if (!salvo) {
        // outra aba ou outra pessoa salvou antes: devolve o que está gravado
        return json({ ok: false, erro: "conflito", cadastro: resumo(cad) }, 409);
      }
      if (cad.status === "convite_enviado") await historico(cad.id, "cadastro_iniciado");
      if (mudanca.beneficio_confirmado_em) await historico(cad.id, "beneficio_confirmado", { texto: mudanca.beneficio_confirmado_texto });

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
      const regra = ARQUIVOS[tipo];
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
      const { error } = await admin
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
        .eq("id", cad.id);
      if (error) throw new Falha(error.message);
      await historico(cad.id, reenvio ? "cadastro_reenviado" : "cadastro_enviado", {
        faltando_para_publicar: p.publicacao.map((x) => x.texto),
      });
      // TODO bloco E: e-mail para a coordenação (decisão D3).
      return json({ ok: true, pendencias: p });
    }

    return json({ ok: false, erro: "invalido" }, 400);
  } catch (e) {
    console.error("parceiro-cadastro:", e instanceof Error ? e.message : e);
    return json({ ok: false, erro: "falha" }, 500);
  }
});
