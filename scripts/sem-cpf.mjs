// Falha se aparecer um CPF válido (11 dígitos com dígito verificador certo) no código.
// Nunca imprime o número: só o arquivo e a linha. Este repositório é público.
// Linha com o marcador `cpf-permitido` é ignorada (só para pendência já conhecida e com prazo).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const PASTAS = ["public", "src", "supabase", "index.html"];
const EXT = new Set([".js", ".mjs", ".ts", ".tsx", ".jsx", ".html", ".json", ".sql", ".css", ".md", ".txt"]);

export function cpfValido(d) {
  if (!/^\d{11}$/.test(d) || /^(\d)\1{10}$/.test(d)) return false;
  const dv = (n) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += Number(d[i]) * (n + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10]);
}

export function achados(texto) {
  const linhas = [];
  texto.split("\n").forEach((l, i) => {
    if (l.includes("cpf-permitido")) return;
    for (const m of l.matchAll(/(?<![\d.])(\d{3})\.?(\d{3})\.?(\d{3})-?(\d{2})(?![\d])/g)) {
      if (cpfValido(m[1] + m[2] + m[3] + m[4])) { linhas.push(i + 1); break; }
    }
  });
  return linhas;
}

function arquivos(p) {
  let st;
  try { st = statSync(p); } catch { return []; }
  if (st.isFile()) return EXT.has(extname(p)) ? [p] : [];
  return readdirSync(p).flatMap((n) => (n === "node_modules" ? [] : arquivos(join(p, n))));
}

const erros = [];
for (const a of PASTAS.flatMap(arquivos)) {
  for (const n of achados(readFileSync(a, "utf8"))) erros.push(`${a}:${n}`);
}
if (erros.length) {
  console.error("Número com cara de CPF no código (o número não é mostrado):");
  for (const e of erros) console.error("  " + e);
  process.exit(1);
}
console.log("Nenhum CPF no código.");
