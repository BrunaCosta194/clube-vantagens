// Teste das regras da cotação. Roda no Node 22:
//   node --test supabase/functions/_shared/cotacao.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  caminhosDosArquivos,
  DOC_QTD_MAX,
  hashDoIp,
  nomeSeguro,
  pareceRobo,
  resultadoTurnstile,
  telefoneBR,
  tokenTurnstilePlausivel,
  TURNSTILE_TOKEN_MAX,
  turnstileForaDoAr,
  validarCotacao,
} from "./cotacao.ts";

const base = {
  produto: "Seguro de Vida",
  nome: "Ana Souza",
  whatsapp: "(11) 99876-5432",
  aceite: true,
};

test("cotação mínima válida", () => {
  const v = validarCotacao(base);
  assert.equal(v.ok, true);
  if (v.ok) {
    assert.equal(v.cotacao.whatsapp, "11998765432");
    assert.equal(v.cotacao.email, null);
    assert.deepEqual(v.cotacao.arquivos, []);
  }
});

test("sem aceite, sem nome ou WhatsApp errado é recusado", () => {
  const v = validarCotacao({ ...base, aceite: false, nome: "", whatsapp: "123" });
  assert.equal(v.ok, false);
  if (!v.ok) assert.deepEqual(Object.keys(v.erros).sort(), ["aceite", "nome", "whatsapp"]);
});

test("e-mail opcional, mas conferido quando vem", () => {
  assert.equal(validarCotacao({ ...base, email: "" }).ok, true);
  const v = validarCotacao({ ...base, email: "ana@" });
  assert.equal(v.ok, false);
});

test("arquivos: tipo, tamanho e quantidade", () => {
  const pdf = { nome: "rg.pdf", tipo: "application/pdf", tamanho: 1000 };
  assert.equal(validarCotacao({ ...base, arquivos: [pdf] }).ok, true);
  assert.equal(validarCotacao({ ...base, arquivos: [{ ...pdf, tipo: "text/plain" }] }).ok, false);
  assert.equal(validarCotacao({ ...base, arquivos: [{ ...pdf, tamanho: 11 * 1024 * 1024 }] }).ok, false);
  assert.equal(validarCotacao({ ...base, arquivos: Array(DOC_QTD_MAX + 1).fill(pdf) }).ok, false);
});

test("dados: só texto, chaves e valores cortados", () => {
  const v = validarCotacao({ ...base, dados: { idade: 40, obs: "x".repeat(900), vazio: "", lista: [1] } });
  assert.equal(v.ok, true);
  if (v.ok) {
    assert.equal(v.cotacao.dados.idade, "40");
    assert.equal(v.cotacao.dados.obs.length, 500);
    assert.equal("vazio" in v.cotacao.dados, false);
    assert.equal("lista" in v.cotacao.dados, false);
  }
});

test("telefone com 55 e fixo", () => {
  assert.equal(telefoneBR("+55 11 4799-4922"), "1147994922");
  assert.equal(telefoneBR("11 8987-65432"), null);
});

test("nome de arquivo seguro, sem caminho", () => {
  assert.equal(nomeSeguro("../../Comprovante de residência.pdf"), "Comprovante_de_residencia.pdf");
  assert.equal(nomeSeguro("..."), "arquivo");
  assert.deepEqual(
    caminhosDosArquivos("abc", [{ nome: "a b.png", tipo: "image/png", tamanho: 1 }]),
    ["abc/01_a_b.png"],
  );
});

test("campo escondido preenchido = robô", () => {
  assert.equal(pareceRobo({ website: "http://x" }), true);
  assert.equal(pareceRobo({ website: "" }), false);
});

test("Turnstile: recusa, aceita e falha de rede", () => {
  const origens = ["https://clube-vantagens.vercel.app"];
  assert.equal(resultadoTurnstile("", null, origens), "recusado");
  assert.equal(resultadoTurnstile("t", null, origens), "sem_resposta");
  assert.equal(resultadoTurnstile("t", { success: true, hostname: "clube-vantagens.vercel.app" }, origens), "ok");
  assert.equal(resultadoTurnstile("t", { success: true, hostname: "outro.com" }, origens), "recusado");
  assert.equal(resultadoTurnstile("t", { success: false, "error-codes": ["internal-error"] }, origens), "sem_resposta");
  assert.equal(resultadoTurnstile("t", { success: false, "error-codes": ["invalid-input-response"] }, origens), "recusado");
});

test("Turnstile: token fora do tamanho e 4xx da Cloudflare não passam como 'fora do ar'", () => {
  const origens = ["https://clube-vantagens.vercel.app"];
  const gigante = "x".repeat(TURNSTILE_TOKEN_MAX + 1);
  assert.equal(tokenTurnstilePlausivel("x".repeat(TURNSTILE_TOKEN_MAX)), true);
  assert.equal(tokenTurnstilePlausivel(gigante), false);
  assert.equal(tokenTurnstilePlausivel(123), false);
  // sem resposta da Cloudflare, o token gigante é recusado (antes virava "sem_resposta")
  assert.equal(resultadoTurnstile(gigante, null, origens), "recusado");
  assert.equal(turnstileForaDoAr(400), false);
  assert.equal(turnstileForaDoAr(413), false);
  assert.equal(turnstileForaDoAr(502), true);
});

test("hash do IP muda com o dia e não guarda o IP", async () => {
  const a = await hashDoIp("1.2.3.4", "2026-11-12", "sal");
  const b = await hashDoIp("1.2.3.4", "2026-11-13", "sal");
  assert.notEqual(a, b);
  assert.equal(a?.includes("1.2.3.4"), false);
  assert.equal(await hashDoIp(null, "2026-11-12", "sal"), null);
});
