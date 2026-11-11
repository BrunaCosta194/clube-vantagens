// ─────────────────────────────────────────────────────────────
// DEWA — dados da página /parceiro/dewa (DEMO para a reunião de 11/11/2026).
// Fotos, preços, endereço e horários vêm do site da Dewa (usedewa.com.br) em
// 10/11/2026. As fotos são lidas direto do site deles (não estão no repo).
// O BENEFÍCIO É DE EXEMPLO: trocar quando a Dewa e a Yruena fecharem a condição.
// ─────────────────────────────────────────────────────────────

const CDN = "https://usedewa.com.br/cdn/shop/files/";

/** Foto do site da Dewa, já no tamanho pedido (o CDN deles redimensiona). */
export function fotoDewa(arquivo: string, largura = 900): string {
  return `${CDN}${arquivo}&width=${largura}`;
}

export const DEWA_SITE = "https://usedewa.com.br/";
export const DEWA_INSTAGRAM = "https://www.instagram.com/usedewa";
export const DEWA_WHATS =
  "https://wa.me/5511967313407?text=Ol%C3%A1!%20Vim%20pelo%20Sanchez%20Clube.";
export const DEWA_MAPA =
  "https://www.google.com/maps/search/?api=1&query=Av.%20Laurinda%20Cardoso%20Mello%20Freire%2C%20182%2C%20Vila%20Oliveira%2C%20Mogi%20das%20Cruzes";

export const dewaFotos = {
  fachada: "465125018_18471418477040091_2381736402039903242_n.jpg?v=1792503655",
  quintal: "470205479_18472118800040091_6497076558734982448_n.jpg?v=1792503655",
  festa: "468713199_18468946138040091_3218515816350853864_n.jpg?v=1792503914",
  yoga: "653632743_18566897026040091_5682035568197514801_n.jpg?v=1792505488",
  loja: "556220658_24637548189200863_302136238883957856_n.jpg?v=1792503542",
};

/** Benefício do membro. `exemplo: true` mostra o selo "valor de exemplo". */
export const dewaBeneficio = {
  titulo: "10% de desconto",
  detalhe: "na loja da Casa Dewa e no site, em toda a coleção fora de promoção.",
  cupom: "SANCHEZCLUBE",
  exemplo: true,
};

export const dewaHistoria =
  "A Dewa nasceu em 2008, entre amigos, vendendo roupa de algodão de mão em mão. Hoje é marca própria de moda e lifestyle de Mogi das Cruzes, com loja, sala de yoga e um quintal para música e encontros na Vila Oliveira. Peças feitas por eles, com modelagem para corpos diferentes e que duram lavagem após lavagem.";

export type ProdutoDewa = {
  nome: string;
  linha: string;
  preco: string;
  precoPix: string;
  foto: string;
};

// Preços do site em 10/11/2026 (cheio / no Pix). Conferir antes de publicar.
export const dewaProdutos: ProdutoDewa[] = [
  {
    nome: "Camiseta Yoga Surya",
    linha: "Yoga",
    preco: "R$ 159,99",
    precoPix: "R$ 151,99",
    foto: "CamisetaSuryaNamaskarnoJardim.png?v=1794341078",
  },
  {
    nome: "Camiseta Farol",
    linha: "Estampadas",
    preco: "R$ 159,99",
    precoPix: "R$ 151,99",
    foto: "CamisetaBrancacomFarolPretoVintage.png?v=1794340067",
  },
  {
    nome: "Camiseta Fluity Basic",
    linha: "Dewa Sports",
    preco: "R$ 149,99",
    precoPix: "R$ 142,49",
    foto: "Retrato_esportivo_urbano_de_camiseta_azul_cep.png?v=1794342550",
  },
  {
    nome: "Boné Trucker",
    linha: "Acessórios",
    preco: "R$ 149,99",
    precoPix: "R$ 142,49",
    foto: "BoneMauvecomLogodeMaosPretas.png?v=1793995594",
  },
];

export const dewaVantagensLoja = [
  { titulo: "Frete grátis", texto: "em compras acima de R$ 299" },
  { titulo: "5% no Pix", texto: "ou 2x sem juros no cartão" },
  { titulo: "Retire na loja", texto: "sem custo, na Casa Dewa" },
  { titulo: "Troca fácil", texto: "é só levar a peça na loja" },
];

export const dewaCasa = [
  {
    titulo: "A loja",
    texto: "Masculino, feminino, infantil, Dewa Sports e acessórios, com atendimento sem pressa.",
    foto: dewaFotos.loja,
  },
  {
    titulo: "Sala de yoga",
    texto: "Aulas na própria Casa Dewa, de onde vem o espírito da marca.",
    foto: dewaFotos.yoga,
  },
  {
    titulo: "O Quintal",
    texto: "Música, feiras e encontros no fim do dia, debaixo da árvore.",
    foto: dewaFotos.festa,
  },
];
