// Teste das regras do Portal do Parceiro. Roda no Node 22:
//   node --test supabase/functions/_shared/parceiro-cadastro.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  cardBeneficio,
  caminhoArquivo,
  codigoComFormato,
  editavel,
  etapasCompletas,
  hashCodigo,
  instagramNormalizado,
  limparBeneficio,
  limparContato,
  limparProdutos,
  limparRespostas,
  mimePelaExtensao,
  pendencias,
  problemaArquivo,
  textoBeneficio,
  VAZIO,
  videoValido,
  type Respostas,
} from "./parceiro-cadastro.ts";

const completo: Respostas = {
  negocio: {
    ...VAZIO.negocio(),
    nomeEmpresa: "Casa Aurora",
    responsavel: "Ana",
    segmento: "Moda e acessórios",
    oQueFaz: "Roupas de algodão.",
  },
  beneficio: {
    ...VAZIO.beneficio(),
    tipo: "percentual",
    percentual: "10",
    descricao: "em toda a coleção",
    ondeUsar: ["loja", "site"],
    comoUsar: "codigo",
    codigo: "SANCHEZCLUBE",
    confirmado: true,
  },
  contato: { ...VAZIO.contato(), modalidades: ["online"], whatsapp: "(11) 98765-4321" },
};

test("cadastro mínimo pode ser enviado; logo e capa ficam para a publicação", () => {
  const p = pendencias(completo, []);
  assert.deepEqual(p.envio, []);
  const campos = p.publicacao.map((x) => x.campo);
  assert.ok(campos.includes("logo"));
  assert.ok(campos.includes("capa"));
});

test("sem confirmação do benefício não envia", () => {
  const r = { ...completo, beneficio: { ...completo.beneficio!, confirmado: false } };
  assert.deepEqual(
    pendencias(r, []).envio.map((x) => x.campo),
    ["confirmado"],
  );
});

test("cadastro vazio lista o que falta, por etapa", () => {
  const etapas = new Set(pendencias({}, []).envio.map((x) => x.etapa));
  assert.deepEqual([...etapas].sort(), ["beneficio", "contato", "negocio"]);
});

test("para publicar bastam logo e foto principal; catálogo, endereço e horário são recomendação", () => {
  const r = { ...completo, contato: { ...completo.contato!, modalidades: ["presencial"] } };
  const p = pendencias(r, [{ tipo: "logo" }, { tipo: "capa" }]);
  assert.deepEqual(p.publicacao, []);
  const recomendado = p.recomendado.map((x) => x.campo);
  assert.ok(recomendado.includes("itens"));
  assert.ok(recomendado.includes("rua"));
  assert.ok(recomendado.includes("horarios"));
});

test("segmento Outros pede o nome do segmento", () => {
  const r = { ...completo, negocio: { ...completo.negocio!, segmento: "Outros" } };
  assert.deepEqual(pendencias(r, []).envio.map((x) => x.campo), ["segmentoOutro"]);
});

test("identificação de membro não é mais opção de uso", () => {
  assert.equal(limparBeneficio({ comoUsar: "identificacao" }).comoUsar, "");
});

test("etapas completas", () => {
  assert.deepEqual(etapasCompletas(completo, []), [1, 2, 5]);
  assert.deepEqual(etapasCompletas(completo, [{ tipo: "logo" }, { tipo: "capa" }, { tipo: "referencia" }]), [1, 2, 3, 4, 5]);
});

test("card e texto do benefício", () => {
  const b = completo.beneficio!;
  assert.deepEqual(cardBeneficio(b), {
    titulo: "10% de desconto",
    detalhe: "em toda a coleção · vale em loja física e site",
    codigo: "SANCHEZCLUBE",
  });
  const reais = cardBeneficio({ ...VAZIO.beneficio(), tipo: "reais", valorReais: "50" });
  assert.match(reais.titulo, /^R\$\s?50 de desconto$/);
  const t = textoBeneficio({ ...b, regras: ["acumula"], regraAcumula: "nao", validade: "data", validadeData: "2027-03-31" });
  assert.match(t, /Acumula com outras promoções: não/);
  assert.match(t, /até 31\/03\/2027/);
  // mudar o benefício muda o texto confirmado
  assert.notEqual(textoBeneficio(b), textoBeneficio({ ...b, percentual: "15" }));
});

test("limpeza do benefício: percentual fora da faixa e campos desconhecidos", () => {
  const b = limparBeneficio({ tipo: "percentual", percentual: "150", ondeUsar: ["loja", "lua"], hack: 1 });
  assert.equal(b.percentual, "");
  assert.deepEqual(b.ondeUsar, ["loja"]);
  assert.equal((b as unknown as Record<string, unknown>).hack, undefined);
  assert.equal(limparBeneficio({ tipo: "xyz" }).tipo, "");
});

test("produtos: no máximo 8, id válido e sem repetir", () => {
  const itens = Array.from({ length: 12 }, (_, i) => ({ id: `item${i}aa`, nome: `P${i}` }));
  assert.equal(limparProdutos({ itens }).itens.length, 8);
  assert.equal(limparProdutos({ itens: [{ id: "x", nome: "a" }] }).itens.length, 0);
  assert.equal(limparProdutos({ itens: [{ id: "abcdef", nome: "a" }, { id: "abcdef", nome: "b" }] }).itens.length, 1);
});

test("contato: horário inválido vira fechado; Instagram normalizado", () => {
  const c = limparContato({ horarios: { seg: { abre: "09:00", fecha: "18:00" }, ter: { abre: "25:00", fecha: "18:00" } } });
  assert.deepEqual(c.horarios.seg, { abre: "09:00", fecha: "18:00" });
  assert.equal(c.horarios.ter, null);
  assert.equal(instagramNormalizado("https://www.instagram.com/UseDewa/?hl=pt"), "@usedewa");
  assert.equal(instagramNormalizado("@studiio.lumine"), "@studiio.lumine");
  assert.equal(instagramNormalizado("não sei"), "");
});

test("respostas do banco passam pela mesma limpeza", () => {
  const r = limparRespostas({ negocio: { nomeEmpresa: "  Dewa  " }, lixo: { a: 1 } });
  assert.equal(r.negocio?.nomeEmpresa, "Dewa");
  assert.equal((r as Record<string, unknown>).lixo, undefined);
});

test("vídeo: só plataformas conhecidas", () => {
  assert.equal(videoValido("youtu.be/abc"), true);
  assert.equal(videoValido("https://www.instagram.com/reel/xyz"), true);
  assert.equal(videoValido("https://exemplo.com/video"), false);
});

test("arquivos: tipo e tamanho por categoria", () => {
  assert.equal(problemaArquivo("logo", "logo.ai", mimePelaExtensao("logo.ai", ""), 1000), null);
  assert.equal(problemaArquivo("logo", "logo.svg", "image/svg+xml", 1000), null);
  assert.ok(problemaArquivo("capa", "capa.pdf", "application/pdf", 1000));
  assert.ok(problemaArquivo("galeria", "f.jpg", "image/jpeg", 16 * 1024 * 1024));
  assert.equal(problemaArquivo("referencia", "cat.pdf", "application/pdf", 20 * 1024 * 1024), null);
  assert.ok(problemaArquivo("referencia", "cat.jpg", "image/jpeg", 1000));
  assert.equal(caminhoArquivo("cad", "galeria", "id1", "../Foto Fachada.JPG"), "cad/galeria/id1_Foto_Fachada.JPG");
});

test("código do link: formato e hash igual ao do Postgres", async () => {
  const codigo = "a".repeat(64);
  assert.equal(codigoComFormato(codigo), true);
  assert.equal(codigoComFormato("A".repeat(64)), false);
  assert.equal(codigoComFormato("abc"), false);
  assert.equal(await hashCodigo(codigo), createHash("sha256").update(codigo).digest("hex"));
});

test("status em que o parceiro edita", () => {
  assert.equal(editavel("cadastro_iniciado"), true);
  assert.equal(editavel("informacoes_incompletas"), true);
  assert.equal(editavel("cadastro_recebido"), true);
  assert.equal(editavel("em_preparacao"), false);
  assert.equal(editavel("publicado"), false);
});
