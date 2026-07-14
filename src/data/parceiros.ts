// ─────────────────────────────────────────────────────────────
// PARCEIROS DO CLUBE — array editável.
// Basta adicionar/editar itens aqui; a Vitrine e os modais se atualizam.
// As imagens em src/assets/parceiros/ são PLACEHOLDERS (banners atuais).
// Troque por logos/artes definitivas quando a Yruena aprovar o layout.
// ─────────────────────────────────────────────────────────────

import bioreluz from "@/assets/parceiros/bioreluz-logo.png";
import insuranceSante from "@/assets/parceiros/insurance-sante-logo.jpg";
import mrt from "@/assets/parceiros/mrt-logo.jpg";
import oticasDiniz from "@/assets/parceiros/oticas-diniz.png";
import remalar from "@/assets/parceiros/remalar-logo.jpg";
import renovaLar from "@/assets/parceiros/renova-lar-logo.jpg";

export type Parceiro = {
  slug: string;
  nome: string;
  categoria: string;
  descricaoCurta: string;
  descricao: string;
  /** Destaque do benefício mostrado no card e no modal. */
  voucher: string;
  imagem: string;
  /** Cor de destaque (usada em detalhes do card). Formato HSL. */
  cor: string;
  site?: string; // TODO: preencher com o link real de cada parceiro
  whatsapp?: string; // link completo (wa.me/..., wa.me/qr/..., api.whatsapp.com/message/...)
  tags: string[];
};

export const parceiros: Parceiro[] = [
  {
    slug: "bioreluz",
    nome: "Bioreluz",
    categoria: "Limpeza e Impermeabilização",
    descricaoCurta:
      "Limpeza, impermeabilização e descartáveis com padrão profissional.",
    descricao:
      "A Bioreluz cuida do seu lar e do seu negócio com serviços de limpeza técnica, impermeabilização e uma linha completa de descartáveis. Condições exclusivas para a Comunidade Sanchez.",
    voucher: "Condição exclusiva Sanchez", // TODO: confirmar % / valor
    imagem: bioreluz,
    cor: "hsl(196, 70%, 42%)",
    whatsapp: "https://wa.me/5511930937483?text=Te%20encontrei%20no%20site%20da%20Sanchez!",
    site: "https://www.instagram.com/bioreluz/",
    tags: ["Limpeza", "Impermeabilização", "Descartáveis"],
  },
  {
    slug: "insurance-sante",
    nome: "Insurance & Santé",
    categoria: "Seguros e Planos de Saúde",
    descricaoCurta:
      "Seguros, consórcios e planos de saúde com curadoria e segurança.",
    descricao:
      "Responsabilidade Civil, Consórcio Imobiliário, Seguro Imobiliário, Seguro de Vida e Seguro Auto. A Insurance & Santé protege seu patrimônio e sua família com atendimento consultivo.",
    voucher: "Cotação sem custo + condição de clube", // TODO: confirmar benefício
    imagem: insuranceSante,
    cor: "hsl(184, 55%, 34%)",
    whatsapp: "https://api.whatsapp.com/message/AEEL7PQ7XR67E1?autoload=1&app_absent=0",
    site: "https://www.instagram.com/insurancesante/",
    tags: ["Seguro de Vida", "Seguro Auto", "Consórcio", "Planos de Saúde"],
  },
  {
    slug: "mrt-arquitetura",
    nome: "MRT Arquitetura",
    categoria: "Arquitetura e Negócios Imobiliários",
    descricaoCurta:
      "Regularização de imóveis, projetos, decoração e reforma.",
    descricao:
      "A MRT une arquitetura e negócios imobiliários: regularização de imóveis, projetos arquitetônicos, decoração e reforma. CAU/SP A-39760-1 · CRECI-SP 27088-J.",
    voucher: "Avaliação de projeto sem custo", // TODO: confirmar benefício
    imagem: mrt,
    cor: "hsl(38, 60%, 45%)",
    whatsapp: "https://wa.me/message/GPGU4NZ5T3SQJ1",
    site: "https://www.mrtarquitetura.com.br/",
    tags: ["Regularização", "Projetos", "Reforma", "Decoração"],
  },
  {
    slug: "oticas-diniz",
    nome: "Óticas Diniz · Diniz Prime",
    categoria: "Óticas e Saúde Visual",
    descricaoCurta:
      "R$ 200 de desconto na compra de óculos de grau ou sol.",
    descricao:
      "Você que é cliente Sanchez, leve sua receita e garanta R$ 200 de desconto na compra de um óculos de grau ou sol na Diniz Prime. Basta apresentar seu voucher do clube.",
    voucher: "R$ 200 de desconto",
    imagem: oticasDiniz,
    cor: "hsl(0, 68%, 44%)",
    whatsapp: "https://wa.me/qr/5SPQMUESAQ2ZL1",
    site: "https://www.oticasdiniz.com.br/",
    tags: ["Óculos de grau", "Óculos de sol", "Voucher R$ 200"],
  },
  {
    slug: "remalar",
    nome: "Remalar",
    categoria: "Materiais e Assistência Técnica",
    descricaoCurta:
      "Produtos e serviços — autorizada Lorenzetti, Deca, Hydra e mais.",
    descricao:
      "Produtos e serviços para sua casa, com assistência técnica autorizada Lorenzetti, Deca, Hydra, Fame e Zagonel. Peças, instalação e conserto com garantia.",
    voucher: "Condição exclusiva Sanchez", // TODO: confirmar benefício
    imagem: remalar,
    cor: "hsl(222, 60%, 38%)",
    site: "https://www.instagram.com/remalar_assistencia/",
    tags: ["Lorenzetti", "Deca", "Hydra", "Assistência técnica"],
  },
  {
    slug: "renova-lar",
    nome: "Renova Lar Designer",
    categoria: "Móveis Planejados",
    descricaoCurta:
      "Móveis planejados e projetos personalizados para o seu espaço.",
    descricao:
      "A Renova Lar Designer cria móveis planejados e projetos personalizados sob medida, unindo funcionalidade e design para transformar cada ambiente.",
    voucher: "Projeto 3D sem custo", // TODO: confirmar benefício
    imagem: renovaLar,
    cor: "hsl(43, 74%, 49%)",
    site: "https://renovalardesigner.com.br/",
    tags: ["Móveis planejados", "Projetos sob medida", "Design de interiores"],
  },
];
