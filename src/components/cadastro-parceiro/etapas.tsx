import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from "lucide-react";
import Envio from "./Envio";
import { Aviso, Caixa, Campo, Escolha, Grupo, TituloEtapa, Varias, inputCls, opcoesDe } from "./ui";
import { buscarCep, novoIdItem, type ArquivoTela } from "@/lib/cadastroParceiro";
import {
  CANAIS_ORCAMENTO,
  COMO_USAR,
  DIAS,
  INFO_ORCAMENTO,
  ITENS_MAX,
  MODALIDADES,
  OFERTA,
  ONDE_USAR,
  PRECO_TIPO,
  REGIOES,
  REGRAS,
  SEGMENTOS,
  TIPOS_BENEFICIO,
  cardBeneficio,
  instagramNormalizado,
  linkValido,
  videoValido,
  type Dia,
  type EtapaBeneficio,
  type EtapaContato,
  type EtapaFotos,
  type EtapaNegocio,
  type EtapaOrcamento,
  type EtapaProdutos,
  type ItemOferta,
  type Regra,
} from "../../../supabase/functions/_shared/parceiro-cadastro.ts";

// As seis etapas do Portal do Parceiro. Cada uma recebe as próprias respostas e
// devolve as mudanças; quem salva é a página (CadastroParceiro.tsx).

export type Erros = Record<string, string>;

type Base<T> = {
  dados: T;
  mudar: (patch: Partial<T>) => void;
  erros: Erros;
  editavel: boolean;
};

type ComArquivos = {
  codigo: string;
  arquivos: ArquivoTela[];
  onArquivos: (m: { novo?: ArquivoTela; removido?: string; etapas_completas: number[] }) => void;
};

const ACCEPT_FOTO = "image/jpeg,image/png,image/webp";
const ACCEPT_LOGO = "image/png,image/svg+xml,application/pdf,.ai,.eps,image/jpeg,image/webp";

// ── Etapa 1 ───────────────────────────────────────────────────────────────────

export function EtapaNegocioTela({
  dados: d,
  mudar,
  erros,
  editavel,
  codigo,
  arquivos,
  onArquivos,
}: Base<EtapaNegocio> & ComArquivos) {
  const anoAtual = new Date().getFullYear();
  const ano = Number(d.anoFundacao);
  const anos = d.anoFundacao.length === 4 && ano > 1800 && ano <= anoAtual ? anoAtual - ano : null;
  return (
    <>
      <TituloEtapa
        titulo="Vamos conhecer seu negócio?"
        texto="Escreva do seu jeito. Nossa equipe organiza o texto e mostra para você aprovar antes de publicar."
      />
      <div className="flex flex-col gap-7">
        <Campo id="nomeEmpresa" rotulo="Nome comercial da empresa" erro={erros.nomeEmpresa}>
          <input
            id="nomeEmpresa"
            className={inputCls}
            value={d.nomeEmpresa}
            onChange={(e) => mudar({ nomeEmpresa: e.target.value })}
            autoComplete="organization"
            aria-invalid={!!erros.nomeEmpresa}
            disabled={!editavel}
          />
        </Campo>
        <Campo id="responsavel" rotulo="Nome do responsável" erro={erros.responsavel}>
          <input
            id="responsavel"
            className={inputCls}
            value={d.responsavel}
            onChange={(e) => mudar({ responsavel: e.target.value })}
            autoComplete="name"
            aria-invalid={!!erros.responsavel}
            disabled={!editavel}
          />
        </Campo>
        <Grupo id="segmento" rotulo="Segmento de atuação" erro={erros.segmento}>
          <Escolha
            nome="Segmento"
            opcoes={SEGMENTOS.map((s) => ({ valor: s, rotulo: s }))}
            valor={d.segmento as (typeof SEGMENTOS)[number] | ""}
            onChange={(v) => editavel && mudar({ segmento: v })}
          />
        </Grupo>
        {d.segmento === "Outros" && (
          <Campo id="segmentoOutro" rotulo="Qual é o segmento?" erro={erros.segmentoOutro}>
            <input
              id="segmentoOutro"
              className={inputCls}
              value={d.segmentoOutro}
              onChange={(e) => mudar({ segmentoOutro: e.target.value })}
              disabled={!editavel}
            />
          </Campo>
        )}
        <Campo
          id="anoFundacao"
          rotulo="Em que ano a empresa começou?"
          opcional
          ajuda={anos !== null && anos > 0 ? `No site vai aparecer “há ${anos} ano${anos === 1 ? "" : "s"}”.` : undefined}
        >
          <input
            id="anoFundacao"
            className={inputCls}
            value={d.anoFundacao}
            onChange={(e) => mudar({ anoFundacao: e.target.value.replace(/\D/g, "").slice(0, 4) })}
            inputMode="numeric"
            placeholder="Ex.: 2008"
            disabled={!editavel}
          />
        </Campo>
        <Campo id="cidade" rotulo="Em qual cidade a empresa está?" erro={erros.cidade}>
          <input
            id="cidade"
            className={inputCls}
            value={d.cidade}
            onChange={(e) => mudar({ cidade: e.target.value })}
            autoComplete="address-level2"
            aria-invalid={!!erros.cidade}
            disabled={!editavel}
          />
        </Campo>
        <Campo
          id="oQueFaz"
          rotulo="O que sua empresa faz?"
          ajuda="Pode ser em poucas linhas. Conte o que vocês vendem ou fazem e para quem."
          erro={erros.oQueFaz}
        >
          <textarea
            id="oQueFaz"
            className={`${inputCls} min-h-32`}
            value={d.oQueFaz}
            onChange={(e) => mudar({ oQueFaz: e.target.value })}
            placeholder="Ex.: Fazemos limpeza de sofás e impermeabilização de estofados em Mogi e região."
            aria-invalid={!!erros.oQueFaz}
            disabled={!editavel}
          />
        </Campo>
        <Campo id="diferenciais" rotulo="O que diferencia sua empresa das demais?" opcional>
          <textarea
            id="diferenciais"
            className={`${inputCls} min-h-28`}
            value={d.diferenciais}
            onChange={(e) => mudar({ diferenciais: e.target.value })}
            placeholder="Ex.: Atendimento no mesmo dia, garantia de 1 ano, produto feito aqui na cidade."
            disabled={!editavel}
          />
        </Campo>

        <div className="flex flex-col gap-4 rounded-md bg-creme-100 p-5">
          <div>
            <p className="text-[15px] font-semibold text-grafite">
              Já tem site, catálogo ou apresentação? <span className="font-normal text-grafite-muted">(opcional)</span>
            </p>
            <p className="mt-1 text-sm leading-relaxed text-grafite-soft">
              Se mandar, as etapas de produtos e de fotos ficam opcionais: montamos a partir do seu material.
            </p>
          </div>
          <Campo id="materialLink" rotulo="Link" erro={erros.materialLink}>
            <input
              id="materialLink"
              className={inputCls}
              value={d.materialLink}
              onChange={(e) => mudar({ materialLink: e.target.value })}
              inputMode="url"
              placeholder="Site, catálogo online ou Google Drive"
              disabled={!editavel}
            />
          </Campo>
          <Envio
            codigo={codigo}
            tipo="referencia"
            arquivos={arquivos.filter((a) => a.tipo === "referencia")}
            editavel={editavel}
            onMudou={onArquivos}
            accept="application/pdf"
            textoBotao="Enviar PDF (até 25 MB)"
          />
        </div>
      </div>
    </>
  );
}

// ── Etapa 2 ───────────────────────────────────────────────────────────────────

export function CardBeneficioTela({ b }: { b: EtapaBeneficio }) {
  const c = cardBeneficio(b);
  return (
    <div className="rounded-md border border-grafite/15 bg-white p-5" aria-live="polite">
      <p className="text-sm text-grafite-muted">É assim que aparece no site</p>
      {c.titulo ? (
        <>
          <p className="mt-2 font-display text-[26px] leading-tight text-cobre-deep">{c.titulo}</p>
          {c.detalhe && <p className="mt-1 text-[15px] leading-relaxed text-grafite-soft">{c.detalhe}</p>}
          {c.codigo && (
            <span className="mt-3 inline-block rounded border border-dashed border-cobre px-2.5 py-1 text-sm font-semibold tracking-wide text-cobre-deep">
              {c.codigo}
            </span>
          )}
        </>
      ) : (
        <p className="mt-2 text-[15px] text-grafite-soft">Escolha o tipo e preencha o valor para ver a prévia.</p>
      )}
    </div>
  );
}

export function EtapaBeneficioTela({
  dados: b,
  mudar: mudarBruto,
  erros,
  editavel,
  empresa,
}: Base<EtapaBeneficio> & { empresa: string }) {
  // Qualquer mudança no benefício desfaz a confirmação: o parceiro confirma o texto exato.
  const mudar = (p: Partial<EtapaBeneficio>) =>
    editavel && mudarBruto("confirmado" in p ? p : { ...p, confirmado: false });
  const regra = (r: Regra) => b.regras.includes(r);

  return (
    <>
      <TituloEtapa
        titulo="Qual vantagem sua empresa vai oferecer?"
        texto="É a parte mais importante: o Clube existe para dar benefícios reais aos membros."
      />
      <div className="flex flex-col gap-7">
        <Grupo id="tipo" rotulo="Tipo de benefício" erro={erros.tipo}>
          <Escolha nome="Tipo de benefício" opcoes={opcoesDe(TIPOS_BENEFICIO)} valor={b.tipo} onChange={(v) => mudar({ tipo: v })} />
        </Grupo>

        {b.tipo === "percentual" && (
          <Campo id="percentual" rotulo="De quantos por cento?" erro={erros.percentual}>
            <div className="relative max-w-[10rem]">
              <input
                id="percentual"
                className={`${inputCls} pr-10`}
                value={b.percentual}
                onChange={(e) => mudar({ percentual: e.target.value.replace(/[^\d,]/g, "").slice(0, 5) })}
                inputMode="decimal"
                placeholder="10"
                aria-invalid={!!erros.percentual}
                disabled={!editavel}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-grafite-muted">%</span>
            </div>
          </Campo>
        )}
        {b.tipo === "reais" && (
          <Campo id="valorReais" rotulo="De quantos reais?" erro={erros.valorReais}>
            <div className="relative max-w-[12rem]">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-grafite-muted">R$</span>
              <input
                id="valorReais"
                className={`${inputCls} pl-11`}
                value={b.valorReais}
                onChange={(e) => mudar({ valorReais: e.target.value.replace(/[^\d,]/g, "").slice(0, 10) })}
                inputMode="decimal"
                placeholder="100"
                aria-invalid={!!erros.valorReais}
                disabled={!editavel}
              />
            </div>
          </Campo>
        )}
        {b.tipo === "brinde" && (
          <Campo id="brinde" rotulo="Qual é o brinde?" erro={erros.brinde}>
            <input
              id="brinde"
              className={inputCls}
              value={b.brinde}
              onChange={(e) => mudar({ brinde: e.target.value })}
              placeholder="Ex.: kit de limpeza para estofados"
              aria-invalid={!!erros.brinde}
              disabled={!editavel}
            />
          </Campo>
        )}
        {b.tipo === "servico" && (
          <Campo id="servico" rotulo="Qual serviço sai sem custo?" erro={erros.servico}>
            <input
              id="servico"
              className={inputCls}
              value={b.servico}
              onChange={(e) => mudar({ servico: e.target.value })}
              placeholder="Ex.: visita técnica, primeira avaliação"
              aria-invalid={!!erros.servico}
              disabled={!editavel}
            />
          </Campo>
        )}
        {b.tipo && (
          <Campo
            id="descricao"
            rotulo={b.tipo === "especial" || b.tipo === "outro" ? "Descreva o benefício" : "Em quê vale? Algum detalhe?"}
            opcional={b.tipo !== "especial" && b.tipo !== "outro"}
            erro={erros.descricao}
          >
            <textarea
              id="descricao"
              className={`${inputCls} min-h-24`}
              value={b.descricao}
              onChange={(e) => mudar({ descricao: e.target.value })}
              placeholder={
                b.tipo === "percentual" || b.tipo === "reais"
                  ? "Ex.: em toda a coleção, menos itens em promoção"
                  : "Ex.: condição especial de parcelamento para membros"
              }
              aria-invalid={!!erros.descricao}
              disabled={!editavel}
            />
          </Campo>
        )}

        <Grupo id="ondeUsar" rotulo="Onde o benefício pode ser usado?" ajuda="Pode marcar mais de um.">
          <Varias opcoes={opcoesDe(ONDE_USAR)} valores={b.ondeUsar} onChange={(v) => mudar({ ondeUsar: v })} />
        </Grupo>
        {b.ondeUsar.includes("outro") && (
          <Campo id="ondeOutro" rotulo="Onde mais?">
            <input id="ondeOutro" className={inputCls} value={b.ondeOutro} onChange={(e) => mudar({ ondeOutro: e.target.value })} disabled={!editavel} />
          </Campo>
        )}

        <Grupo id="comoUsar" rotulo="Como o membro usa a vantagem?" erro={erros.comoUsar}>
          <Escolha
            nome="Como usar"
            opcoes={opcoesDe(COMO_USAR)}
            valor={b.comoUsar as keyof typeof COMO_USAR | ""}
            onChange={(v) => mudar({ comoUsar: v })}
          />
        </Grupo>
        {b.comoUsar === "codigo" && (
          <div className="flex flex-col gap-3">
            <Campo id="codigo" rotulo="Qual é o código?" ajuda="Se ainda não tiver um, marque a opção abaixo.">
              <input
                id="codigo"
                className={`${inputCls} uppercase`}
                value={b.codigo}
                onChange={(e) => mudar({ codigo: e.target.value.toUpperCase().replace(/\s/g, "").slice(0, 40) })}
                placeholder="Ex.: SANCHEZCLUBE"
                autoCapitalize="characters"
                disabled={!editavel || b.clubeCriaCodigo}
              />
            </Campo>
            <Caixa id="clubeCriaCodigo" marcada={b.clubeCriaCodigo} onChange={(v) => mudar({ clubeCriaCodigo: v, codigo: v ? "" : b.codigo })}>
              Quero que o Clube crie o código
            </Caixa>
          </div>
        )}
        {b.comoUsar === "outro" && (
          <Campo id="comoOutro" rotulo="Como funciona?">
            <input id="comoOutro" className={inputCls} value={b.comoOutro} onChange={(e) => mudar({ comoOutro: e.target.value })} disabled={!editavel} />
          </Campo>
        )}

        <Grupo id="regras" rotulo="O benefício tem regras?" opcional ajuda="Marque as que valem e conte o detalhe.">
          <Varias opcoes={opcoesDe(REGRAS)} valores={b.regras} onChange={(v) => mudar({ regras: v })} />
        </Grupo>
        {regra("valor_minimo") && (
          <Campo id="regraValorMinimo" rotulo="Valor mínimo da compra">
            <div className="relative max-w-[12rem]">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-grafite-muted">R$</span>
              <input
                id="regraValorMinimo"
                className={`${inputCls} pl-11`}
                value={b.regraValorMinimo}
                onChange={(e) => mudar({ regraValorMinimo: e.target.value.replace(/[^\d,]/g, "").slice(0, 10) })}
                inputMode="decimal"
                disabled={!editavel}
              />
            </div>
          </Campo>
        )}
        {regra("quantidade") && (
          <Campo id="regraQuantidade" rotulo="Qual o limite?">
            <input
              id="regraQuantidade"
              className={inputCls}
              value={b.regraQuantidade}
              onChange={(e) => mudar({ regraQuantidade: e.target.value })}
              placeholder="Ex.: 1 uso por mês por membro"
              disabled={!editavel}
            />
          </Campo>
        )}
        {regra("restricoes") && (
          <Campo id="regraRestricoes" rotulo="O que fica fora?">
            <input
              id="regraRestricoes"
              className={inputCls}
              value={b.regraRestricoes}
              onChange={(e) => mudar({ regraRestricoes: e.target.value })}
              placeholder="Ex.: não vale para lançamentos"
              disabled={!editavel}
            />
          </Campo>
        )}
        {regra("acumula") && (
          <Grupo id="regraAcumula" rotulo="Acumula com outras promoções?">
            <Escolha
              nome="Acumula"
              opcoes={[
                { valor: "sim" as const, rotulo: "Sim" },
                { valor: "nao" as const, rotulo: "Não" },
              ]}
              valor={b.regraAcumula}
              onChange={(v) => mudar({ regraAcumula: v })}
            />
          </Grupo>
        )}
        {regra("outras") && (
          <Campo id="regraOutras" rotulo="Quais outras condições?">
            <textarea id="regraOutras" className={`${inputCls} min-h-24`} value={b.regraOutras} onChange={(e) => mudar({ regraOutras: e.target.value })} disabled={!editavel} />
          </Campo>
        )}

        <Grupo id="validade" rotulo="O benefício tem prazo de validade?">
          <Escolha
            nome="Validade"
            opcoes={[
              { valor: "sem" as const, rotulo: "Sem prazo definido" },
              { valor: "data" as const, rotulo: "Vale até uma data" },
            ]}
            valor={b.validade}
            onChange={(v) => mudar({ validade: v })}
          />
        </Grupo>
        {b.validade === "data" && (
          <Campo id="validadeData" rotulo="Até quando?">
            <input
              id="validadeData"
              type="date"
              className={`${inputCls} max-w-[14rem]`}
              value={b.validadeData}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => mudar({ validadeData: e.target.value })}
              disabled={!editavel}
            />
          </Campo>
        )}

        <CardBeneficioTela b={b} />

        <Caixa
          id="confirmado"
          marcada={b.confirmado}
          onChange={(v) => editavel && mudarBruto({ confirmado: v })}
          erro={erros.confirmado}
        >
          Confirmo que a <strong>{empresa || "empresa"}</strong> autoriza o Clube Sanchez a divulgar este benefício aos membros,
          nas condições acima.
        </Caixa>
      </div>
    </>
  );
}

// ── Etapa 3 ───────────────────────────────────────────────────────────────────

function ItemTela({
  item,
  numero,
  aberto,
  alternar,
  mudar,
  remover,
  servico,
  editavel,
  codigo,
  arquivos,
  onArquivos,
}: {
  item: ItemOferta;
  numero: number;
  aberto: boolean;
  alternar: () => void;
  mudar: (p: Partial<ItemOferta>) => void;
  remover: () => void;
  servico: boolean;
} & Pick<Base<unknown>, "editavel"> &
  ComArquivos) {
  const foto = arquivos.filter((a) => a.tipo === "item" && a.item_id === item.id);
  const resumo = [
    item.precoTipo === "consulta"
      ? "Sob consulta"
      : item.preco
        ? `${item.precoTipo === "apartir" ? "A partir de " : ""}R$ ${item.preco}`
        : "",
    foto.length ? "com foto" : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const videoRuim = item.video && !videoValido(item.video);
  const rotulo = servico ? "Especialidade" : "Produto";

  return (
    <li className="rounded-md border border-grafite/15 bg-white">
      <button
        type="button"
        onClick={alternar}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-semibold text-grafite">
            {item.nome || `${rotulo} ${numero}`}
          </span>
          {resumo && <span className="block text-sm text-grafite-muted">{resumo}</span>}
        </span>
        {aberto ? <ChevronUp className="h-5 w-5 shrink-0 text-grafite-muted" aria-hidden="true" /> : <ChevronDown className="h-5 w-5 shrink-0 text-grafite-muted" aria-hidden="true" />}
      </button>
      {aberto && (
        <div className="flex flex-col gap-5 border-t border-grafite/10 px-4 pb-5 pt-5">
          <Campo id={`item-nome-${item.id}`} rotulo="Nome">
            <input
              id={`item-nome-${item.id}`}
              className={inputCls}
              value={item.nome}
              onChange={(e) => mudar({ nome: e.target.value })}
              placeholder={servico ? "Ex.: Impermeabilização de sofá" : "Ex.: Camiseta de algodão"}
              disabled={!editavel}
            />
          </Campo>
          <Campo id={`item-desc-${item.id}`} rotulo="Descrição curta" opcional ajuda={`${item.descricao.length}/160`}>
            <textarea
              id={`item-desc-${item.id}`}
              className={`${inputCls} min-h-20`}
              value={item.descricao}
              maxLength={160}
              onChange={(e) => mudar({ descricao: e.target.value })}
              disabled={!editavel}
            />
          </Campo>
          <Grupo id={`item-preco-${item.id}`} rotulo="Preço" opcional>
            <Escolha
              nome="Tipo de preço"
              opcoes={opcoesDe(PRECO_TIPO)}
              valor={item.precoTipo}
              onChange={(v) => mudar({ precoTipo: v, preco: v === "consulta" ? "" : item.preco })}
            />
          </Grupo>
          {(item.precoTipo === "fixo" || item.precoTipo === "apartir") && (
            <div className="relative max-w-[12rem]">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-grafite-muted">R$</span>
              <input
                aria-label="Preço em reais"
                className={`${inputCls} pl-11`}
                value={item.preco}
                onChange={(e) => mudar({ preco: e.target.value.replace(/[^\d,]/g, "").slice(0, 10) })}
                inputMode="decimal"
                disabled={!editavel}
              />
            </div>
          )}
          <Campo
            id={`item-video-${item.id}`}
            rotulo="Link de vídeo"
            opcional
            ajuda="YouTube, Instagram, TikTok ou Vimeo."
            erro={videoRuim ? "Esse link não parece de YouTube, Instagram, TikTok ou Vimeo." : null}
          >
            <input
              id={`item-video-${item.id}`}
              className={inputCls}
              value={item.video}
              onChange={(e) => mudar({ video: e.target.value })}
              inputMode="url"
              disabled={!editavel}
            />
          </Campo>
          <div className="flex flex-col gap-2">
            <p className="text-[15px] font-semibold text-grafite">
              Foto <span className="font-normal text-grafite-muted">(opcional)</span>
            </p>
            <Envio
              codigo={codigo}
              tipo="item"
              itemId={item.id}
              arquivos={foto}
              editavel={editavel}
              onMudou={onArquivos}
              accept={ACCEPT_FOTO}
              textoBotao="Escolher foto"
              compacto
            />
          </div>
          {editavel && (
            <button
              type="button"
              onClick={remover}
              className="inline-flex min-h-11 items-center gap-2 self-start text-[15px] font-semibold text-terracota-600"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Remover
            </button>
          )}
        </div>
      )}
    </li>
  );
}

export function EtapaProdutosTela({
  dados: p,
  mudar,
  editavel,
  temMaterial,
  codigo,
  arquivos,
  onArquivos,
}: Base<EtapaProdutos> & ComArquivos & { temMaterial: boolean }) {
  const [aberto, setAberto] = useState<string | null>(null);
  const [desfazer, setDesfazer] = useState<{ item: ItemOferta; pos: number } | null>(null);
  const servico = p.oferta === "servicos";

  function adicionar() {
    const novo: ItemOferta = { id: novoIdItem(), nome: "", descricao: "", precoTipo: "", preco: "", video: "" };
    mudar({ itens: [...p.itens, novo] });
    setAberto(novo.id);
    setDesfazer(null);
  }
  function mudarItem(id: string, patch: Partial<ItemOferta>) {
    mudar({ itens: p.itens.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  }
  function remover(id: string) {
    const pos = p.itens.findIndex((i) => i.id === id);
    setDesfazer({ item: p.itens[pos], pos });
    mudar({ itens: p.itens.filter((i) => i.id !== id) });
  }

  return (
    <>
      <TituloEtapa
        titulo="O que sua empresa oferece?"
        texto="Cadastre os principais produtos ou serviços. O ideal é de 3 a 8, mas pode começar com um."
      />
      <div className="flex flex-col gap-7">
        {temMaterial && (
          <Aviso>Você mandou um site ou catálogo na primeira etapa. Pode pular esta: montamos a lista a partir dele.</Aviso>
        )}
        <Grupo id="oferta" rotulo="Sua empresa vende produtos ou presta serviços?">
          <Escolha nome="Oferta" opcoes={opcoesDe(OFERTA)} valor={p.oferta} onChange={(v) => editavel && mudar({ oferta: v })} />
        </Grupo>

        {p.itens.length > 0 && (
          <ul className="flex flex-col gap-3">
            {p.itens.map((item, i) => (
              <ItemTela
                key={item.id}
                item={item}
                numero={i + 1}
                aberto={aberto === item.id}
                alternar={() => setAberto(aberto === item.id ? null : item.id)}
                mudar={(patch) => mudarItem(item.id, patch)}
                remover={() => remover(item.id)}
                servico={servico}
                editavel={editavel}
                codigo={codigo}
                arquivos={arquivos}
                onArquivos={onArquivos}
              />
            ))}
          </ul>
        )}

        {desfazer && (
          <div className="flex items-center justify-between gap-3 rounded-md bg-grafite px-4 py-3 text-[15px] text-perola">
            <span className="min-w-0 truncate">“{desfazer.item.nome || "Item"}” removido.</span>
            <button
              type="button"
              className="font-semibold text-cobre-light underline underline-offset-4"
              onClick={() => {
                const itens = [...p.itens];
                itens.splice(desfazer.pos, 0, desfazer.item);
                mudar({ itens });
                setDesfazer(null);
              }}
            >
              Desfazer
            </button>
          </div>
        )}

        {editavel && p.itens.length < ITENS_MAX && (
          <button
            type="button"
            onClick={adicionar}
            className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-md border-[1.5px] border-dashed border-cobre-line bg-white px-4 text-[15px] font-semibold text-cobre-deep transition hover:bg-cobre/5"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            {p.itens.length ? `Adicionar outro ${servico ? "serviço" : "produto ou serviço"}` : `Adicionar ${servico ? "um serviço" : "um produto ou serviço"}`}
          </button>
        )}
      </div>
    </>
  );
}

// ── Etapa 4 ───────────────────────────────────────────────────────────────────

function avisoCapa(a: ArquivoTela): string | null {
  if (!a.largura || !a.altura) return null;
  if (a.altura > a.largura) return "Esta foto está em pé. Para a capa, prefira uma foto deitada (horizontal).";
  if (a.largura < 1200) return "Esta foto é pequena e pode ficar sem nitidez. Se tiver uma maior, troque.";
  return null;
}

function avisoLogo(a: ArquivoTela): string | null {
  if (a.largura && a.altura && Math.max(a.largura, a.altura) < 500)
    return "Esse arquivo parece pequeno. Se tiver o original do designer, ele fica melhor.";
  if (a.mime === "image/jpeg") return "Funciona, mas o ideal é PNG sem fundo ou o arquivo do designer.";
  return null;
}

export function EtapaFotosTela({
  dados: f,
  mudar,
  erros,
  editavel,
  temMaterial,
  codigo,
  arquivos,
  onArquivos,
}: Base<EtapaFotos> & ComArquivos & { temMaterial: boolean }) {
  const galeria = arquivos.filter((a) => a.tipo === "galeria");
  return (
    <>
      <TituloEtapa
        titulo="Vamos mostrar sua empresa?"
        texto="Logo, foto principal e algumas fotos da empresa. Pode enviar depois, pelo mesmo link, se não tiver agora."
      />
      <div className="flex flex-col gap-9">
        {temMaterial && <Aviso>Se as fotos estiverem no material que você mandou, pode pular esta etapa.</Aviso>}
        <Grupo
          id="logo"
          rotulo="Logo da empresa"
          ajuda="PNG sem fundo, SVG, PDF ou o arquivo do designer (AI ou EPS). Prints de tela não são recomendados."
        >
          <Envio
            codigo={codigo}
            tipo="logo"
            arquivos={arquivos.filter((a) => a.tipo === "logo")}
            editavel={editavel}
            onMudou={onArquivos}
            accept={ACCEPT_LOGO}
            textoBotao="Enviar logo"
            aviso={avisoLogo}
          />
        </Grupo>
        <Grupo
          id="capa"
          rotulo="Foto principal"
          ajuda="Uma foto deitada (horizontal): fachada, ambiente, equipe ou um serviço sendo feito. Sem arte com texto por cima."
        >
          <Envio
            codigo={codigo}
            tipo="capa"
            arquivos={arquivos.filter((a) => a.tipo === "capa")}
            editavel={editavel}
            onMudou={onArquivos}
            accept={ACCEPT_FOTO}
            textoBotao="Escolher foto principal"
            aviso={avisoCapa}
          />
        </Grupo>
        <Grupo
          id="galeria"
          rotulo="Mais fotos"
          opcional
          ajuda="De 3 a 6 fotos: ambiente, equipe, produtos, serviços, trabalhos prontos. Dá para escolher várias de uma vez."
        >
          <Envio
            codigo={codigo}
            tipo="galeria"
            arquivos={galeria}
            editavel={editavel}
            onMudou={onArquivos}
            accept={ACCEPT_FOTO}
            textoBotao={galeria.length ? "Adicionar mais fotos" : "Escolher fotos"}
          />
        </Grupo>
        <Caixa
          id="autorizacaoImagens"
          marcada={f.autorizacaoImagens}
          onChange={(v) => editavel && mudar({ autorizacaoImagens: v })}
          erro={erros.autorizacaoImagens}
        >
          As imagens são da minha empresa ou tenho autorização para divulgá-las.
        </Caixa>
        <p className="-mt-4 text-sm leading-relaxed text-grafite-muted">
          As fotos são reduzidas no seu aparelho antes de enviar. Isso deixa o envio mais rápido e tira dados escondidos da
          foto, como a localização.
        </p>
      </div>
    </>
  );
}

// ── Etapa 5 ───────────────────────────────────────────────────────────────────

const PRESETS: { rotulo: string; dias: Dia[]; abre: string; fecha: string }[] = [
  { rotulo: "Seg a sex, 9h às 18h", dias: ["seg", "ter", "qua", "qui", "sex"], abre: "09:00", fecha: "18:00" },
  { rotulo: "Sábado, 9h às 13h", dias: ["sab"], abre: "09:00", fecha: "13:00" },
];

function mascaraTelefone(v: string): string {
  const d = v.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function EtapaContatoTela({ dados: c, mudar: mudarBruto, erros, editavel }: Base<EtapaContato>) {
  const mudar = (p: Partial<EtapaContato>) => editavel && mudarBruto(p);
  const [cepEstado, setCepEstado] = useState<"" | "buscando" | "nao_achou">("");
  const presencial = c.modalidades.includes("presencial");
  const atendeFora = c.modalidades.includes("online") || c.modalidades.includes("cliente") || c.modalidades.includes("outro");
  const siteRuim = c.site && !linkValido(c.site);

  async function cep(valor: string) {
    const d = valor.replace(/\D/g, "").slice(0, 8);
    mudar({ cep: d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d });
    if (d.length !== 8) return setCepEstado("");
    setCepEstado("buscando");
    const r = await buscarCep(d);
    if (!r) return setCepEstado("nao_achou");
    setCepEstado("");
    mudar({ rua: r.rua || c.rua, bairro: r.bairro || c.bairro, cidadeEndereco: r.cidade, uf: r.uf });
    document.getElementById("numero")?.focus();
  }

  function preset(p: (typeof PRESETS)[number]) {
    const horarios = { ...c.horarios };
    for (const d of p.dias) horarios[d] = { abre: p.abre, fecha: p.fecha };
    mudar({ horarios });
  }

  return (
    <>
      <TituloEtapa titulo="Como os membros podem encontrar sua empresa?" />
      <div className="flex flex-col gap-7">
        <Grupo id="modalidades" rotulo="Como sua empresa atende?" ajuda="Pode marcar mais de um." erro={erros.modalidades}>
          <Varias opcoes={opcoesDe(MODALIDADES)} valores={c.modalidades} onChange={(v) => mudar({ modalidades: v })} />
        </Grupo>
        {c.modalidades.includes("outro") && (
          <Campo id="modalidadeOutra" rotulo="Como mais?">
            <input id="modalidadeOutra" className={inputCls} value={c.modalidadeOutra} onChange={(e) => mudar({ modalidadeOutra: e.target.value })} disabled={!editavel} />
          </Campo>
        )}

        <Campo id="whatsapp" rotulo="WhatsApp comercial" erro={erros.whatsapp}>
          <input
            id="whatsapp"
            className={inputCls}
            value={c.whatsapp}
            onChange={(e) => mudar({ whatsapp: mascaraTelefone(e.target.value) })}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(11) 90000-0000"
            aria-invalid={!!erros.whatsapp}
            disabled={!editavel}
          />
        </Campo>
        <Campo id="instagram" rotulo="Instagram" opcional>
          <input
            id="instagram"
            className={inputCls}
            value={c.instagram}
            onChange={(e) => mudar({ instagram: e.target.value })}
            onBlur={() => {
              const n = instagramNormalizado(c.instagram);
              if (n && n !== c.instagram) mudar({ instagram: n });
            }}
            placeholder="@suaempresa"
            autoCapitalize="none"
            disabled={!editavel}
          />
        </Campo>
        <Campo id="site" rotulo="Site" opcional erro={siteRuim ? "Confira o endereço do site." : null}>
          <input
            id="site"
            className={inputCls}
            value={c.site}
            onChange={(e) => mudar({ site: e.target.value })}
            inputMode="url"
            autoCapitalize="none"
            placeholder="www.suaempresa.com.br"
            disabled={!editavel}
          />
        </Campo>

        {presencial && (
          <div className="flex flex-col gap-5 rounded-md bg-creme-100 p-5">
            <p className="text-[15px] font-semibold text-grafite">Endereço do atendimento presencial</p>
            <Campo
              id="cep"
              rotulo="CEP"
              ajuda="A rua aparece sozinha."
              erro={cepEstado === "nao_achou" ? "Não achamos esse CEP. Preencha o endereço abaixo." : null}
            >
              <div className="relative max-w-[12rem]">
                <input
                  id="cep"
                  className={inputCls}
                  value={c.cep.length > 5 ? `${c.cep.slice(0, 5)}-${c.cep.slice(5)}` : c.cep}
                  onChange={(e) => cep(e.target.value)}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="08700-000"
                  disabled={!editavel}
                />
                {cepEstado === "buscando" && (
                  <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-cobre-deep" aria-label="Buscando CEP" />
                )}
              </div>
            </Campo>
            <Campo id="rua" rotulo="Rua" erro={erros.rua}>
              <input id="rua" className={inputCls} value={c.rua} onChange={(e) => mudar({ rua: e.target.value })} autoComplete="address-line1" disabled={!editavel} />
            </Campo>
            <div className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3">
              <Campo id="numero" rotulo="Número">
                <input id="numero" className={inputCls} value={c.numero} onChange={(e) => mudar({ numero: e.target.value })} inputMode="numeric" disabled={!editavel} />
              </Campo>
              <Campo id="complemento" rotulo="Complemento" opcional>
                <input id="complemento" className={inputCls} value={c.complemento} onChange={(e) => mudar({ complemento: e.target.value })} disabled={!editavel} />
              </Campo>
            </div>
            <Campo id="bairro" rotulo="Bairro">
              <input id="bairro" className={inputCls} value={c.bairro} onChange={(e) => mudar({ bairro: e.target.value })} disabled={!editavel} />
            </Campo>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,5rem)] gap-3">
              <Campo id="cidadeEndereco" rotulo="Cidade">
                <input id="cidadeEndereco" className={inputCls} value={c.cidadeEndereco} onChange={(e) => mudar({ cidadeEndereco: e.target.value })} disabled={!editavel} />
              </Campo>
              <Campo id="uf" rotulo="UF">
                <input id="uf" className={`${inputCls} uppercase`} value={c.uf} maxLength={2} onChange={(e) => mudar({ uf: e.target.value.toUpperCase() })} disabled={!editavel} />
              </Campo>
            </div>
          </div>
        )}

        {presencial && (
          <Grupo id="horarios" rotulo="Horário de funcionamento" erro={erros.horarios}>
            {editavel && (
              <div className="mb-2 flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.rotulo}
                    type="button"
                    onClick={() => preset(p)}
                    className="min-h-11 rounded-md border border-cobre-line bg-white px-3 text-sm font-semibold text-cobre-deep"
                  >
                    + {p.rotulo}
                  </button>
                ))}
              </div>
            )}
            <ul className="flex flex-col divide-y divide-grafite/10 rounded-md border border-grafite/15 bg-white">
              {(Object.keys(DIAS) as Dia[]).map((d) => {
                const h = c.horarios[d];
                return (
                  <li key={d} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
                    <label className="flex min-w-[8rem] flex-1 items-center gap-3 text-[15px] text-grafite">
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-[#894C36]"
                        checked={!!h}
                        disabled={!editavel}
                        onChange={(e) =>
                          mudar({ horarios: { ...c.horarios, [d]: e.target.checked ? { abre: "09:00", fecha: "18:00" } : null } })
                        }
                      />
                      {DIAS[d]}
                    </label>
                    {h ? (
                      <span className="flex items-center gap-2 text-[15px] text-grafite">
                        <input
                          type="time"
                          aria-label={`${DIAS[d]}, abre`}
                          className="min-h-11 rounded-md border border-grafite/20 bg-white px-2"
                          value={h.abre}
                          disabled={!editavel}
                          onChange={(e) => mudar({ horarios: { ...c.horarios, [d]: { ...h, abre: e.target.value } } })}
                        />
                        às
                        <input
                          type="time"
                          aria-label={`${DIAS[d]}, fecha`}
                          className="min-h-11 rounded-md border border-grafite/20 bg-white px-2"
                          value={h.fecha}
                          disabled={!editavel}
                          onChange={(e) => mudar({ horarios: { ...c.horarios, [d]: { ...h, fecha: e.target.value } } })}
                        />
                      </span>
                    ) : (
                      <span className="text-sm text-grafite-muted">Fechado</span>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-2">
              <Caixa id="horaMarcada" marcada={c.horaMarcada} onChange={(v) => mudar({ horaMarcada: v })}>
                Atendemos só com hora marcada
              </Caixa>
            </div>
            <input
              aria-label="Observação sobre o horário"
              className={`${inputCls} mt-2`}
              value={c.horarioObs}
              onChange={(e) => mudar({ horarioObs: e.target.value })}
              placeholder="Observação (opcional). Ex.: fecha para almoço das 12h às 13h"
              disabled={!editavel}
            />
          </Grupo>
        )}

        {(atendeFora || !presencial) && (
          <Grupo id="regioes" rotulo="Cidades e regiões atendidas" opcional>
            <Varias
              opcoes={REGIOES.map((r) => ({ valor: r, rotulo: r }))}
              valores={c.regioes}
              onChange={(v) => mudar({ regioes: v })}
            />
            <input
              aria-label="Outra região"
              className={`${inputCls} mt-2`}
              value={c.regiaoOutra}
              onChange={(e) => mudar({ regiaoOutra: e.target.value })}
              placeholder="Outra região (opcional)"
              disabled={!editavel}
            />
          </Grupo>
        )}
      </div>
    </>
  );
}

// ── Etapa 6 ───────────────────────────────────────────────────────────────────

export function EtapaOrcamentoTela({ dados: o, mudar: mudarBruto, editavel }: Base<EtapaOrcamento>) {
  const mudar = (p: Partial<EtapaOrcamento>) => editavel && mudarBruto(p);
  return (
    <>
      <TituloEtapa
        titulo="Como funciona o atendimento da sua empresa?"
        texto="Isso ajuda a preparar, mais para frente, um pedido de orçamento na sua página. Não pedimos nenhum documento de cliente agora."
      />
      <div className="flex flex-col gap-7">
        <Grupo id="trabalha" rotulo="Sua empresa trabalha com orçamentos ou cotações?">
          <Escolha
            nome="Trabalha com orçamento"
            opcoes={[
              { valor: "sim" as const, rotulo: "Sim" },
              { valor: "nao" as const, rotulo: "Não" },
            ]}
            valor={o.trabalha}
            onChange={(v) => mudar({ trabalha: v })}
          />
        </Grupo>
        {o.trabalha === "sim" && (
          <>
            <Grupo id="informacoes" rotulo="O que você precisa receber do cliente para fazer um orçamento?" ajuda="Pode marcar mais de um.">
              <Varias opcoes={opcoesDe(INFO_ORCAMENTO)} valores={o.informacoes} onChange={(v) => mudar({ informacoes: v })} />
            </Grupo>
            <Campo id="informacaoOutra" rotulo="Mais alguma informação ou material?" opcional>
              <textarea
                id="informacaoOutra"
                className={`${inputCls} min-h-24`}
                value={o.informacaoOutra}
                onChange={(e) => mudar({ informacaoOutra: e.target.value })}
                disabled={!editavel}
              />
            </Campo>
            <Campo id="documentos" rotulo="Algum documento específico?" opcional>
              <textarea
                id="documentos"
                className={`${inputCls} min-h-20`}
                value={o.documentos}
                onChange={(e) => mudar({ documentos: e.target.value })}
                placeholder="Ex.: CNH e documento do veículo, para seguro auto"
                disabled={!editavel}
              />
            </Campo>
            <Grupo id="canais" rotulo="Como prefere receber os pedidos?">
              <Varias opcoes={opcoesDe(CANAIS_ORCAMENTO)} valores={o.canais} onChange={(v) => mudar({ canais: v })} />
            </Grupo>
            {o.canais.includes("email") && (
              <Campo id="emailOrcamento" rotulo="Qual e-mail?">
                <input
                  id="emailOrcamento"
                  type="email"
                  className={inputCls}
                  value={o.email}
                  onChange={(e) => mudar({ email: e.target.value })}
                  autoComplete="email"
                  disabled={!editavel}
                />
              </Campo>
            )}
          </>
        )}
      </div>
    </>
  );
}
