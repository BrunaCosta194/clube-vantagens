// Teste das regras da página do parceiro. Roda no Node 22:
//   node --test supabase/functions/_shared/parceiro-pagina.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  abertoAgora,
  caminhoFotoValido,
  condicoesBeneficio,
  faltaNaPagina,
  fotosDoPerfil,
  horariosTexto,
  limparPerfil,
  linkWhatsApp,
  perfilDasRespostas,
  slugDe,
  telefoneTexto,
} from "./parceiro-pagina.ts";
import { VAZIO, horariosVazios, limparBeneficio } from "./parceiro-cadastro.ts";

const ID = "a0000000-0000-0000-0000-000000000003";
const FOTO = `${ID}/pagina/11111111-1111-1111-1111-111111111111.jpg`;

test("slug a partir do nome", () => {
  assert.equal(slugDe("Ótica São João & Filhos"), "otica-sao-joao-e-filhos");
  assert.equal(slugDe("  --Casa  Aurora!! "), "casa-aurora");
  assert.equal(slugDe("a".repeat(80)).length, 60);
});

test("caminho de foto: só os da pasta da página, do próprio cadastro", () => {
  assert.ok(caminhoFotoValido(FOTO));
  assert.ok(caminhoFotoValido(FOTO, ID));
  assert.ok(!caminhoFotoValido(FOTO, "b0000000-0000-0000-0000-000000000003"));
  assert.ok(!caminhoFotoValido(`${ID}/logo/11111111-1111-1111-1111-111111111111.jpg`));
  assert.ok(!caminhoFotoValido(`${ID}/pagina/11111111-1111-1111-1111-111111111111.svg`));
  assert.ok(!caminhoFotoValido(`../${FOTO}`));
});

test("limparPerfil descarta lixo e foto de fora", () => {
  const p = limparPerfil({
    slug: "Casa Aurora",
    nome: "  Casa   Aurora ",
    logo: "https://site-malicioso/x.png",
    capa: FOTO,
    galeria: [FOTO, FOTO, "x"],
    itens: [{ nome: "Mesa", foto: "nada", video: "https://evil.example/v" }],
    contato: { whatsapp: "11 98765-4321", instagram: "https://instagram.com/CasaAurora", site: "javascript:alert(1)" },
    beneficio: { versao_id: "v1", dados: { tipo: "percentual", percentual: "10" } },
    extra: "não entra",
  });
  assert.equal(p.slug, "");
  assert.equal(p.nome, "Casa Aurora");
  assert.equal(p.logo, null);
  assert.equal(p.capa, FOTO);
  assert.deepEqual(p.galeria, [FOTO]);
  assert.equal(p.itens[0].foto, null);
  assert.equal(p.itens[0].video, "");
  assert.equal(p.contato.whatsapp, "11987654321");
  assert.equal(p.contato.instagram, "@casaaurora");
  assert.equal(p.contato.site, "");
  assert.equal(p.beneficio?.dados.percentual, "10");
  assert.ok(!("extra" in p));
});

test("perfil montado das respostas", () => {
  const contato = {
    ...VAZIO.contato(),
    modalidades: ["presencial", "cliente"],
    whatsapp: "(11) 98765-4321",
    rua: "Rua Dr. Deodato Wertheimer",
    numero: "100",
    bairro: "Centro",
    cidadeEndereco: "Mogi das Cruzes",
    uf: "SP",
    regioes: ["Suzano"],
    regiaoOutra: "Arujá",
  };
  const p = perfilDasRespostas(
    {
      negocio: { ...VAZIO.negocio(), nomeEmpresa: "Casa Aurora", segmento: "Outros", segmentoOutro: "Velas", oQueFaz: "Velas artesanais. Feitas à mão." },
      produtos: {
        oferta: "produtos",
        itens: [
          { id: "abc123", nome: "Vela", descricao: "", precoTipo: "apartir", preco: "80", video: "" },
          { id: "abc124", nome: "", descricao: "", precoTipo: "", preco: "", video: "" },
        ],
      },
      contato,
    },
    "Convite",
  );
  assert.equal(p.slug, "casa-aurora");
  assert.equal(p.categoria, "Velas");
  assert.equal(p.frase, "Velas artesanais.");
  assert.equal(p.itens.length, 1);
  assert.equal(p.itens[0].preco.replace(/\u00a0/g, " "), "A partir de R$ 80");
  assert.equal(p.contato.endereco, "Rua Dr. Deodato Wertheimer, 100, Centro, Mogi das Cruzes/SP");
  assert.deepEqual(p.contato.regioes, ["Suzano", "Arujá"]);
  assert.deepEqual(p.contato.modalidades, ["Presencial", "No endereço do cliente"]);
  assert.deepEqual(faltaNaPagina(p), ["Logo", "Foto principal"]);
});

test("fotos do perfil, sem repetir", () => {
  const p = limparPerfil({ logo: FOTO, capa: FOTO, galeria: [FOTO], itens: [{ nome: "x", foto: FOTO }] });
  assert.deepEqual(fotosDoPerfil(p), [FOTO]);
});

test("horários agrupados", () => {
  const h = horariosVazios();
  for (const d of ["seg", "ter", "qua", "qui", "sex"] as const) h[d] = { abre: "09:00", fecha: "18:00" };
  h.sab = { abre: "09:30", fecha: "13:00" };
  assert.deepEqual(horariosTexto(h), ["Seg a sex: 9h às 18h", "Sáb: 9h30 às 13h"]);
});

test("aberto agora, no horário de Brasília", () => {
  const h = horariosVazios();
  h.seg = { abre: "09:00", fecha: "18:00" };
  // 13/11/2026 é sexta; 16/11/2026 é segunda. 12:00 UTC = 9:00 em Brasília.
  assert.equal(abertoAgora(h, new Date("2026-11-16T12:00:00Z")), true);
  assert.equal(abertoAgora(h, new Date("2026-11-16T11:59:00Z")), false);
  assert.equal(abertoAgora(h, new Date("2026-11-16T21:00:00Z")), false);
  assert.equal(abertoAgora(h, new Date("2026-11-13T15:00:00Z")), false);
  assert.equal(abertoAgora(horariosVazios()), null);
});

test("condições do benefício nunca mostram o código", () => {
  const b = limparBeneficio({
    tipo: "percentual",
    percentual: "10",
    comoUsar: "codigo",
    codigo: "SEGREDO10",
    regras: ["valor_minimo", "acumula"],
    regraValorMinimo: "100",
    regraAcumula: "nao",
    validade: "data",
    validadeData: "2027-03-31",
  });
  const l = condicoesBeneficio(b).map((x) => x.replace(/\u00a0/g, " ")); // R$ usa espaço fixo
  assert.ok(!l.join(" ").includes("SEGREDO10"));
  assert.deepEqual(l, [
    "Use o código do Sanchez Clube na compra.",
    "Compra mínima de R$ 100.",
    "Não acumula com outras promoções.",
    "Válido até 31/03/2027.",
  ]);
});

test("WhatsApp e telefone", () => {
  assert.equal(linkWhatsApp("11 98765-4321", "Oi!"), "https://wa.me/5511987654321?text=Oi!");
  assert.equal(linkWhatsApp("123"), "");
  assert.equal(telefoneTexto("1147221234"), "(11) 4722-1234");
  assert.equal(telefoneTexto("11987654321"), "(11) 98765-4321");
});
