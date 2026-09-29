/* ============================================================
   Papo de Aluguel · Mídia Kit 2026
   Tudo que a produção precisa trocar fica em CONFIG.
   Itens marcados TODO dependem da Yruena.
   ============================================================ */
const CONFIG = {
  links: {
    youtube: "https://www.youtube.com/@papodealuguel",
    instagramPapo: "https://www.instagram.com/papodealuguel/",
    facebook: "https://www.facebook.com/papodealuguel",
    tiktok: "https://www.tiktok.com/@papodealuguel",
    whatsapp: "https://wa.me/5511971796030",
    clube: "https://clube-vantagens.vercel.app/",
    privacidade: "https://clube-vantagens.vercel.app/privacidade#patrocinio",
  },
  whatsappNumero: "5511971796030",

  // Total de visualizações — atualizar quando a Yruena mandar o número novo
  visualizacoes: 74776,

  regioes: [
    { nome: "Alto Tietê e Grande SP", lugares: "Mogi das Cruzes, Suzano, Itaquaquecetuba, Arujá, Poá, Santa Isabel, Guararema e Grande São Paulo" },
    { nome: "Brasil", lugares: "Belém do Pará" },
    { nome: "Mundo", lugares: "Portugal e Paraguai" },
  ],

  // Cada momento do mosaico é clicável. Troque "href" pelo corte/episódio certo.
  mosaico: [
    { img: "/midiakit/img/grid3.jpg", tipo: "Episódio", titulo: "Entrevista na mesa do Papo", href: "youtube" },
    { img: "/midiakit/img/grid4.jpg", tipo: "Corte", titulo: "Yruena conduzindo o debate", href: "instagramPapo" },
    { img: "/midiakit/img/grid1.jpg", tipo: "Bastidor", titulo: "Antes de o microfone ligar", href: "instagramPapo" },
    { img: "/midiakit/img/grid7.jpg", tipo: "Bastidor", titulo: "“Não é papo furado.”", href: "instagramPapo" },
    { img: "/midiakit/img/grid8.jpg", tipo: "Corte", titulo: "A host em cena", href: "instagramPapo" },
    { img: "/midiakit/img/grid2.jpg", tipo: "Comunidade", titulo: "Quem veste a camisa", href: "instagramPapo" },
    { img: "/midiakit/img/grid6.jpg", tipo: "Episódio", titulo: "Debate com convidados", href: "youtube" },
    { img: "/midiakit/img/host-sorriso.jpg", tipo: "Corte", titulo: "Papo leve, conteúdo sério", href: "instagramPapo" },
    { img: "/midiakit/img/grid5.jpg", tipo: "Encontro", titulo: "Conexão que vira parceria", href: "instagramPapo" },
    { img: "/midiakit/img/live.jpg", tipo: "Ao vivo", titulo: "O bate-papo já vai começar", href: "youtube", pos: "18% 50%" },
  ],

  valores: [
    { nome: "Instrução", foto: "/midiakit/img/grid4.jpg", legenda: "Conhecimento é o ponto de partida de tudo." },
    { nome: "Profissionalismo", foto: "/midiakit/img/grid3.jpg", legenda: "Quem senta nessa mesa trata a corretagem como profissão." },
    { nome: "Excelência", foto: "/midiakit/img/estudio.jpg", legenda: "Cenário, produção e conteúdo no mesmo padrão." },
    { nome: "Comprometimento", foto: "/midiakit/img/grid8.jpg", legenda: "Ao vivo, toda semana, com quem faz o mercado." },
    { nome: "Transparência", foto: "/midiakit/img/grid6.jpg", legenda: "Debate aberto, sem papo furado." },
    { nome: "Inovação", foto: "/midiakit/img/host-mic.jpg", legenda: "Novas ideias para um mercado em transformação." },
    { nome: "Respeito à profissão", foto: "/midiakit/img/grid2.jpg", legenda: "Uma bandeira vestida por uma comunidade inteira." },
    { nome: "Desenvolvimento contínuo", foto: "/midiakit/img/grid5.jpg", legenda: "Quem aprende não depende." },
  ],

  cotas: [
    {
      id: "150", nome: "Cota Presença", tag: "Sua marca na mesa.", valor: 150,
      entregas: ["Logotipo (máscara) em todos os episódios", "Marca citada ao vivo durante o podcast"],
    },
    {
      id: "250", nome: "Cota Destaque", tag: "Sua marca na voz da host.", valor: 250, destaque: true,
      entregas: ["Tudo da Cota Presença", "1 story por semana com o corte da host apresentando sua marca"],
    },
    {
      id: "300", nome: "Cota Ecossistema", tag: "Sua marca dentro da comunidade.", valor: 300,
      entregas: [
        "Tudo da Cota Destaque",
        "Entrada no Clube de Vantagens da Comunidade Sanchez",
        "Banner e WhatsApp comercial clicável no site do Clube",
        "Integração ao ecossistema comercial da Sanchez Imóveis",
      ],
      clube: true,
    },
  ],
  prazoMeses: 6,

  // Comparativo (✓ por cota, na ordem 150/250/300)
  comparativo: [
    ["Logotipo (máscara) nos episódios", 1, 1, 1],
    ["Marca citada ao vivo", 1, 1, 1],
    ["Story semanal dedicado", 0, 1, 1],
    ["Corte da host apresentando a marca", 0, 1, 1],
    ["Participação no Clube de Vantagens", 0, 0, 1],
    ["Banner no site do Clube", 0, 0, 1],
    ["WhatsApp comercial clicável", 0, 0, 1],
    ["Ecossistema comercial Sanchez", 0, 0, 1],
    ["Prazo contratual", "6 meses", "6 meses", "6 meses"],
  ],

  pix: { chave: "[CHAVE PIX A DEFINIR]", vencimentoDia: "[●]" }, // TODO
  contratada: { // TODO: dados de quem responde pelo Papo de Aluguel
    razao: "[RAZÃO SOCIAL RESPONSÁVEL PELO PAPO DE ALUGUEL]",
    cnpj: "[●]", sede: "[●]",
  },
  multaRescisao: "[percentual a definir] do saldo remanescente", // TODO: política comercial
  contratoVersao: "v1-2026-09",

  // Onde gravar cada adesão (tabela patrocinio_adesoes, migration 0010 do Clube).
  // Mesmos valores de VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY do .env do Clube.
  // A anon key é pública (a tabela só aceita INSERT). Vazio = só WhatsApp.
  supabase: { url: "", anonKey: "" },
};

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
const brl2 = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const linkOf = (k) => CONFIG.links[k] || k;
const dataBR = (d) => d.toLocaleDateString("pt-BR");
// entregas completas da cota (resolve o "Tudo da Cota X" para o contrato)
const entregasCompletas = (c) => {
  const idx = CONFIG.cotas.indexOf(c);
  return CONFIG.cotas.slice(0, idx + 1).flatMap((k) => k.entregas.filter((e) => !e.startsWith("Tudo da")));
};
const playIcon = '<svg viewBox="0 0 12 14" aria-hidden="true"><path d="M0 0v14l12-7z"/></svg>';

/* ---------- links clicáveis ---------- */
function wireLinks(root = document) {
  $$("[data-link]", root).forEach((a) => (a.href = linkOf(a.dataset.link)));
}

/* ---------- mosaico ---------- */
function renderMosaico() {
  const box = $("#mosaic");
  box.innerHTML = CONFIG.mosaico.map((m, i) => `
    <a class="tile reveal" style="--d:${(i % 5) * 0.06}s" href="${esc(linkOf(m.href))}" target="_blank" rel="noopener">
      <img src="${esc(m.img)}" alt="${esc(m.titulo)}" loading="lazy"${m.pos ? ` style="object-position:${esc(m.pos)}"` : ""} />
      <span class="tile__cap"><span><small>${esc(m.tipo)}</small>${esc(m.titulo)}</span><i class="tile__play">${playIcon}</i></span>
    </a>`).join("");

  // destaque lento que passeia pelos momentos (pausa com hover / fora da tela)
  const tiles = $$(".tile", box);
  let i = 0, timer = null;
  const step = () => {
    tiles.forEach((t) => t.classList.remove("is-focus"));
    tiles[i % tiles.length].classList.add("is-focus");
    box.classList.add("has-focus");
    i++;
  };
  const start = () => { if (!timer && !matchMedia("(prefers-reduced-motion: reduce)").matches) { step(); timer = setInterval(step, 3200); } };
  const stop = () => { clearInterval(timer); timer = null; box.classList.remove("has-focus"); tiles.forEach((t) => t.classList.remove("is-focus")); };
  box.addEventListener("mouseenter", stop);
  box.addEventListener("mouseleave", start);
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.25 }).observe(box);
}

/* ---------- valores ---------- */
function renderValores() {
  const ol = $("#valores"), img = $("#valorFoto"), cap = $("#valorLegenda");
  ol.innerHTML = CONFIG.valores.map((v, i) => `<li${i === 0 ? ' class="is-on"' : ""}><button type="button" data-i="${i}">${esc(v.nome)}</button></li>`).join("");
  const show = (i) => {
    const v = CONFIG.valores[i];
    $$("li", ol).forEach((li, k) => li.classList.toggle("is-on", k === i));
    cap.innerHTML = `<b>${esc(v.nome)}</b>${esc(v.legenda)}`;
    if (img.getAttribute("src") === v.foto) return;
    img.classList.add("is-swap");
    setTimeout(() => { img.src = v.foto; img.alt = v.nome; img.onload = () => img.classList.remove("is-swap"); }, 260);
  };
  ol.addEventListener("mouseover", (e) => { const b = e.target.closest("button"); if (b) show(+b.dataset.i); });
  ol.addEventListener("focusin", (e) => { const b = e.target.closest("button"); if (b) show(+b.dataset.i); });
  ol.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) show(+b.dataset.i); });
  CONFIG.valores.forEach((v) => { const p = new Image(); p.src = v.foto; });
  show(0);
}

/* ---------- alcance ---------- */
function renderAlcance() {
  $("#regioes").innerHTML = CONFIG.regioes.map((r) => `<div class="regiao"><h3>${esc(r.nome)}</h3><p>${esc(r.lugares)}</p></div>`).join("");
  const el = $("#views"), target = CONFIG.visualizacoes;
  el.textContent = "0";
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    obs.disconnect();
    const t0 = performance.now(), dur = 2200;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * eased).toLocaleString("pt-BR");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { threshold: 0.4 }).observe(el);
}

/* ---------- cotas ---------- */
function renderCotas() {
  $("#planos").innerHTML = CONFIG.cotas.map((c, i) => `
    <article class="plano reveal${c.destaque ? " plano--feat" : ""}" style="--d:${i * 0.1}s">
      ${c.destaque ? '<span class="plano__flag">Mais escolhida</span>' : ""}
      <p class="plano__nome">${esc(c.nome)}</p>
      <p class="plano__tag">${esc(c.tag)}</p>
      <p class="plano__preco"><small>R$</small>${c.valor}<span>/mês</span></p>
      <p class="plano__total">Parceria de ${CONFIG.prazoMeses} meses · ${brl(c.valor * CONFIG.prazoMeses)} no total</p>
      <ul>${c.entregas.map((e) => `<li${e.startsWith("Tudo da") ? ' class="is-plus"' : ""}>${esc(e)}</li>`).join("")}</ul>
      <div class="plano__actions">
        <button class="btn ${c.destaque ? "btn--orange" : "btn--line"}" data-open-flow="${c.id}">Quero esta cota</button>
        ${c.clube ? `<a class="btn btn--line" href="${esc(CONFIG.links.clube)}" target="_blank" rel="noopener">Conhecer o Clube de Vantagens ↗</a>` : ""}
      </div>
    </article>`).join("");

  const head = `<thead><tr><th>Entrega</th>${CONFIG.cotas.map((c) => `<th>${esc(c.nome.replace("Cota ", ""))}<br>R$ ${c.valor}</th>`).join("")}</tr></thead>`;
  const body = CONFIG.comparativo.map(([nome, ...v]) => `<tr><td>${esc(nome)}</td>${v.map((x) => (typeof x === "string" ? `<td>${esc(x)}</td>` : x ? '<td class="y" aria-label="Sim">✓</td>' : '<td class="n" aria-label="Não">—</td>')).join("")}</tr>`).join("");
  $("#compareTable").innerHTML = head + `<tbody>${body}</tbody>`;

  $("#pickCota").innerHTML = CONFIG.cotas.map((c) => `
    <label><input type="radio" name="cota" value="${c.id}" />
      <span class="card"><b>${esc(c.nome)}</b><strong>R$ ${c.valor}<small>/mês</small></strong><span>${esc(c.tag)} ${brl(c.valor * CONFIG.prazoMeses)} em ${CONFIG.prazoMeses} meses.</span></span>
    </label>`).join("");
}

/* ---------- reveal + nav ---------- */
function motion() {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove("pre"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach((el) => { if (el.closest(".hero") || el.getBoundingClientRect().top < innerHeight) return; el.classList.add("pre"); io.observe(el); });
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-solid", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ============================================================
   FLUXO DE ADESÃO
   cota → dados → resumo + contrato + aceite → pagamento
   ============================================================ */
const flow = { step: 1, registro: null };

const onlyDigits = (s) => (s || "").replace(/\D/g, "");
const masks = {
  cpf: (v) => onlyDigits(v).slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"),
  cnpj: (v) => onlyDigits(v).slice(0, 14).replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2"),
  tel: (v) => { const d = onlyDigits(v).slice(0, 11); return d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3") : d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/[-(\s)]+$/, ""); },
};
function cpfOk(v) {
  const d = onlyDigits(v); if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  for (let t = 9; t < 11; t++) { let s = 0; for (let i = 0; i < t; i++) s += d[i] * (t + 1 - i); if (((s * 10) % 11) % 10 != d[t]) return false; }
  return true;
}
function cnpjOk(v) {
  const d = onlyDigits(v); if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const calc = (n) => { let s = 0, p = n - 7; for (let i = 0; i < n; i++) { s += d[i] * p--; if (p < 2) p = 9; } const r = s % 11; return r < 2 ? 0 : 11 - r; };
  return calc(12) == d[12] && calc(13) == d[13];
}

function formData() {
  const f = $("#flowForm"), g = (n) => (f.elements[n]?.value || "").trim();
  const tipo = f.elements.tipo.value;
  const cota = CONFIG.cotas.find((c) => c.id === (f.elements.cota.value || ""));
  return {
    tipo, cota,
    nome: tipo === "PJ" ? g("razao") : g("nomePF"),
    fantasia: g("fantasia"),
    documento: tipo === "PJ" ? g("cnpj") : g("cpfPF"),
    representante: tipo === "PJ" ? g("representante") : g("nomePF"),
    cpfRep: tipo === "PJ" ? g("cpfRep") : g("cpfPF"),
    endereco: g("endereco"), email: g("email"), telefone: g("telefone"),
    nomeComercial: g("nomeComercial") || g("fantasia") || (tipo === "PJ" ? g("razao") : g("nomePF")),
    segmento: g("segmento"), instagram: g("instagram"), site: g("site"), whatsComercial: g("whatsComercial"),
    descricao: g("descricao"), oferta: g("oferta"),
  };
}

function periodo() {
  const ini = new Date(); ini.setHours(0, 0, 0, 0);
  const fim = new Date(ini); fim.setMonth(fim.getMonth() + CONFIG.prazoMeses); fim.setDate(fim.getDate() - 1);
  return { ini, fim };
}

function contratoHTML(d) {
  const { ini, fim } = periodo(), c = d.cota, total = c.valor * CONFIG.prazoMeses, k = CONFIG.contratada;
  const m = (s) => `<mark>${esc(s || "[●]")}</mark>`;
  const docLabel = d.tipo === "PJ" ? "CNPJ" : "CPF";
  const rep = d.tipo === "PJ" ? `, neste ato representada por ${m(d.representante)}, CPF nº ${m(d.cpfRep)}` : "";
  return `
    <h4>Contrato de Participação Publicitária e Patrocínio — Papo de Aluguel</h4>
    <p><b>CONTRATANTE:</b> ${m(d.nome)}, inscrito(a) no ${docLabel} nº ${m(d.documento)}, com endereço em ${m(d.endereco)}${rep}, e-mail ${m(d.email)} e telefone ${m(d.telefone)}.</p>
    <p><b>CONTRATADA:</b> ${m(k.razao)}, inscrita no CNPJ nº ${m(k.cnpj)}, com sede em ${m(k.sede)}, responsável pela marca e pelo projeto Papo de Aluguel.</p>
    <p><b>1. OBJETO.</b> Participação da CONTRATANTE como patrocinadora do Papo de Aluguel, conforme a cota selecionada eletronicamente e as entregas descritas no respectivo plano.</p>
    <p><b>2. COTA CONTRATADA.</b> ${m(c.nome + " — " + brl2(c.valor) + " mensais")}, com as seguintes entregas: ${m(entregasCompletas(c).join("; "))}. As condições apresentadas no Mídia Kit e no resumo da contratação integram este instrumento.</p>
    <p><b>3. PRAZO.</b> Prazo determinado de ${CONFIG.prazoMeses} (seis) meses, de ${m(dataBR(ini))} a ${m(dataBR(fim))}. O pagamento mensal não se confunde com contratação mensal ou por prazo indeterminado.</p>
    <p><b>4. VALOR.</b> Valor total de ${m(brl2(total))}, em ${CONFIG.prazoMeses} parcelas mensais de ${m(brl2(c.valor))}, via PIX para a chave ${m(CONFIG.pix.chave)}, com vencimento todo dia ${m(CONFIG.pix.vencimentoDia)}.</p>
    <p><b>4.1.</b> O parcelamento mensal é exclusivamente forma de pagamento do valor total contratado e não confere à CONTRATANTE direito de cancelamento imotivado mês a mês.</p>
    <p><b>5. RESCISÃO ANTECIPADA.</b> A desistência imotivada da CONTRATANTE antes do término do prazo sujeita-a ao pagamento de multa equivalente a ${m(CONFIG.multaRescisao)}, sem prejuízo das parcelas vencidas.</p>
    <p><b>6. ENTREGAS.</b> As entregas da CONTRATADA são as correspondentes à cota selecionada, conforme quadro comercial vigente aceito na contratação.</p>
    <p><b>7. MATERIAIS DA MARCA.</b> A CONTRATANTE fornecerá logotipo, identidade visual, links e informações comerciais necessários às divulgações, responsabilizando-se por sua titularidade, veracidade e regularidade.</p>
    <p><b>8. USO DE MARCA.</b> Durante a vigência, a CONTRATANTE autoriza o uso de sua marca, nome comercial e materiais fornecidos exclusivamente para execução deste contrato e divulgação da parceria.</p>
    <p><b>9. CONTEÚDO EDITORIAL.</b> O patrocínio não confere à CONTRATANTE ingerência sobre a condução editorial do Papo de Aluguel, escolha de convidados, opiniões de terceiros ou conteúdo dos episódios, ressalvadas as entregas publicitárias contratadas.</p>
    <p><b>10. DADOS PESSOAIS.</b> Os dados fornecidos serão tratados para cadastro, formalização, execução, cobrança, comunicação e gestão desta relação contratual, nos termos da Lei nº 13.709/2018 (LGPD).</p>
    <p><b>11. ACEITE ELETRÔNICO.</b> As partes reconhecem como válida a celebração deste instrumento por meio eletrônico, com registro de identificação, data e hora do aceite, nos termos da MP nº 2.200-2/2001.</p>
    <p><b>12. FORO.</b> Fica eleito o foro da Comarca de Mogi das Cruzes/SP, ressalvadas as hipóteses legais de competência obrigatória.</p>
    <p>Mogi das Cruzes, ${m(dataBR(new Date()))}. · Versão do contrato: ${esc(CONFIG.contratoVersao)}</p>`;
}

function renderResumo(d) {
  const c = d.cota;
  $("#resumo").innerHTML = `
    <div><small>Cota</small><strong>${esc(c.nome.replace("Cota ", ""))}</strong></div>
    <div><small>Mensal</small><strong>${brl(c.valor)}</strong></div>
    <div><small>Prazo</small><strong>${CONFIG.prazoMeses} meses</strong></div>
    <div class="total"><small>Valor contratual</small><strong>${brl(c.valor * CONFIG.prazoMeses)}</strong></div>`;
  $("#contrato").innerHTML = contratoHTML(d);
}

function validarDados(d) {
  const f = $("#flowForm"), bad = [];
  const req = d.tipo === "PJ" ? ["razao", "cnpj", "representante", "cpfRep"] : ["nomePF", "cpfPF"];
  [...req, "endereco", "email", "telefone"].forEach((n) => { if (!f.elements[n].value.trim()) bad.push(n); });
  if (d.tipo === "PJ" && f.elements.cnpj.value && !cnpjOk(f.elements.cnpj.value)) bad.push("cnpj");
  const cpfField = d.tipo === "PJ" ? "cpfRep" : "cpfPF";
  if (f.elements[cpfField].value && !cpfOk(f.elements[cpfField].value)) bad.push(cpfField);
  if (f.elements.email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.elements.email.value)) bad.push("email");
  if (onlyDigits(f.elements.telefone.value).length && onlyDigits(f.elements.telefone.value).length < 10) bad.push("telefone");
  $$("input", f).forEach((i) => i.classList.toggle("is-bad", bad.includes(i.name)));
  if (bad.length) { f.elements[bad[0]].focus(); }
  return bad.length ? "Confira os campos destacados — preencha todos e verifique CPF, CNPJ, e-mail e telefone." : "";
}

function setStep(n) {
  flow.step = n;
  $$(".step").forEach((s) => s.classList.toggle("is-on", +s.dataset.step === n));
  $$(".steps li").forEach((li, i) => { li.classList.toggle("is-on", i + 1 === n); li.classList.toggle("is-done", i + 1 < n); });
  const titles = { 1: "Escolha como sua marca quer participar", 2: "Quem vai sentar à mesa com a gente", 3: "Resumo da contratação", 4: "Pagamento" };
  $("#flowTitle").textContent = titles[n];
  $("#back").style.visibility = n === 1 || n === 4 ? "hidden" : "visible";
  $("#next").textContent = n === 3 ? "Li e quero formalizar minha participação" : n === 4 ? "Concluir" : "Continuar";
  $(".flow__body").scrollTop = 0;
}

async function registrar(d) {
  const agora = new Date(), { ini, fim } = periodo();
  const reg = {
    criadoEm: agora.toISOString(), contratoVersao: CONFIG.contratoVersao,
    cota: d.cota.id, valorMensal: d.cota.valor, valorTotal: d.cota.valor * CONFIG.prazoMeses,
    inicio: ini.toISOString().slice(0, 10), termino: fim.toISOString().slice(0, 10),
    status: "contrato_aceito_aguardando_pagamento",
    patrocinador: { ...d, cota: undefined }, userAgent: navigator.userAgent,
  };
  flow.registro = reg;
  const sb = CONFIG.supabase;
  if (sb.url && sb.anonKey) {
    const linha = {
      cota: reg.cota, valor_mensal: reg.valorMensal, valor_total: reg.valorTotal, prazo_meses: CONFIG.prazoMeses,
      inicio: reg.inicio, termino: reg.termino,
      tipo: d.tipo, nome: d.nome, fantasia: d.fantasia || null, documento: d.documento,
      representante: d.tipo === "PJ" ? d.representante : null, cpf_representante: d.tipo === "PJ" ? d.cpfRep : null,
      endereco: d.endereco, email: d.email, telefone: d.telefone,
      nome_comercial: d.nomeComercial || null, segmento: d.segmento || null, instagram: d.instagram || null,
      site: d.site || null, whats_comercial: d.whatsComercial || null, descricao: d.descricao || null, oferta: d.oferta || null,
      contrato_versao: CONFIG.contratoVersao, contrato_texto: $("#contrato").innerText.slice(0, 30000),
      aceite_contrato: true, aceite_lgpd: true, aceite_em: reg.criadoEm, user_agent: navigator.userAgent.slice(0, 500),
    };
    try {
      const r = await fetch(`${sb.url}/rest/v1/patrocinio_adesoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: sb.anonKey, Authorization: `Bearer ${sb.anonKey}`, Prefer: "return=minimal" },
        body: JSON.stringify(linha),
      });
      if (!r.ok) console.warn("Adesão não gravada:", r.status, await r.text());
    } catch (e) { console.warn("Falha ao enviar adesão:", e); }
  } else {
    console.info("Adesão (Supabase não configurado):", reg);
  }
  return reg;
}

function prepararPagamento(d, reg) {
  $("#doneNome").textContent = d.nomeComercial || d.nome;
  $("#doneData").textContent = new Date(reg.criadoEm).toLocaleString("pt-BR");
  $("#pixValor").textContent = brl2(d.cota.valor);
  $("#pixChave").textContent = CONFIG.pix.chave;
  const msg = [
    "Olá, produção do Papo de Aluguel! Acabei de aderir ao patrocínio.",
    `Cota: ${d.cota.nome} (${brl(d.cota.valor)}/mês · ${CONFIG.prazoMeses} meses · total ${brl(reg.valorTotal)})`,
    `${d.tipo === "PJ" ? "Empresa" : "Nome"}: ${d.nome}`,
    `${d.tipo === "PJ" ? "CNPJ" : "CPF"}: ${d.documento}`,
    d.tipo === "PJ" ? `Representante: ${d.representante}` : "",
    `E-mail: ${d.email} · Tel: ${d.telefone}`,
    `Marca mencionada: ${d.nomeComercial}`,
    `Aceite do contrato ${CONFIG.contratoVersao} em ${new Date(reg.criadoEm).toLocaleString("pt-BR")}.`,
    "Vou enviar o comprovante do Pix e o logotipo por aqui.",
  ].filter(Boolean).join("\n");
  $("#sendWhats").href = `https://wa.me/${CONFIG.whatsappNumero}?text=${encodeURIComponent(msg)}`;
}

function initFlow() {
  const dlg = $("#flow"), f = $("#flowForm");

  const open = (cota) => {
    if (cota) { const r = f.querySelector(`input[name=cota][value="${cota}"]`); if (r) r.checked = true; }
    setStep(1);
    syncCota();
    dlg.showModal();
    document.documentElement.style.overflow = "hidden";
  };
  const close = () => { dlg.close(); };
  dlg.addEventListener("close", () => { document.documentElement.style.overflow = ""; if (flow.step === 4) { f.reset(); flow.registro = null; } });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open-flow]"); if (b) { e.preventDefault(); open(b.dataset.openFlow); }
    if (e.target.closest("[data-close-flow]")) close();
  });

  // PF / PJ
  const syncTipo = () => { const t = f.elements.tipo.value; $$("[data-only]", f).forEach((el) => (el.hidden = el.dataset.only !== t)); };
  const syncCota = () => { $$("[data-only-cota]", f).forEach((el) => (el.hidden = el.dataset.onlyCota !== f.elements.cota.value)); };
  f.addEventListener("change", (e) => { if (e.target.name === "tipo") syncTipo(); if (e.target.name === "cota") syncCota(); });
  syncTipo();

  // máscaras
  f.addEventListener("input", (e) => { const m = e.target.dataset.mask; if (m) e.target.value = masks[m](e.target.value); e.target.classList.remove("is-bad"); });

  $("#back").addEventListener("click", () => setStep(Math.max(1, flow.step - 1)));
  $("#next").addEventListener("click", async () => {
    const d = formData();
    if (flow.step === 1) {
      if (!d.cota) { $("#pickCota input").focus(); $(".hint", $("[data-step='1']")).innerHTML = "<strong style='color:#b3261e'>Escolha uma cota para continuar.</strong>"; return; }
      return setStep(2);
    }
    if (flow.step === 2) {
      const err = validarDados(d); $("#errDados").textContent = err; if (err) return;
      renderResumo(d); return setStep(3);
    }
    if (flow.step === 3) {
      if (!f.elements.aceiteContrato.checked || !f.elements.aceiteLgpd.checked) { $("#errAceite").textContent = "Para formalizar, marque as duas confirmações."; return; }
      $("#errAceite").textContent = "";
      const btn = $("#next"); btn.disabled = true;
      const reg = await registrar(d);
      btn.disabled = false;
      prepararPagamento(d, reg);
      return setStep(4);
    }
    close();
  });

  $("#copyPix").addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText(CONFIG.pix.chave); e.target.textContent = "Chave copiada ✓"; setTimeout(() => (e.target.textContent = "Copiar chave"), 2200); }
    catch { const r = document.createRange(); r.selectNodeContents($("#pixChave")); getSelection().removeAllRanges(); getSelection().addRange(r); }
  });
  $("#printContrato").addEventListener("click", () => {
    const d = formData();
    $("#printArea").innerHTML = contratoHTML(d) + `<p style="margin-top:40px">Aceite eletrônico registrado em ${esc(new Date(flow.registro?.criadoEm || Date.now()).toLocaleString("pt-BR"))}.</p><p style="margin-top:50px">CONTRATANTE: ______________________</p><p>CONTRATADA: ______________________</p>`;
    window.print();
  });
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $("#ano").textContent = new Date().getFullYear();
  renderMosaico();
  renderValores();
  renderAlcance();
  renderCotas();
  wireLinks();
  motion();
  initFlow();
});
