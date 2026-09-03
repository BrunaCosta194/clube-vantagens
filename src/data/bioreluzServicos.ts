// ─────────────────────────────────────────────────────────────
// SERVIÇOS DA BIORELUZ — catálogo clicável da página /parceiro/bioreluz.
// TODO YRUENA: textos são PLACEHOLDER realista. Trocar por descrições reais.
//   - `foto`: null enquanto não houver imagem → cai no bloco de marca.
//   - `videoUrl`: null enquanto o vídeo do serviço não chegar → "vídeo em breve".
// Ela vai mandar fotos + vídeos de cada serviço.
// ─────────────────────────────────────────────────────────────

export type ServicoBioreluz = {
  slug: string;
  nome: string;
  /** Linha curta que aparece no card (ex: o método/equipamento). */
  destaque: string;
  /** Descrição completa mostrada ao abrir "Saiba mais". */
  descricao: string;
  /** Foto do serviço. null = usa bloco de marca como placeholder. */
  foto: string | null;
  /** URL do vídeo (YouTube/embed) do serviço. null = "vídeo em breve". */
  videoUrl: string | null;
};

// Breve história — MÁXIMO 4 linhas (pedido da Yruena). PLACEHOLDER.
export const bioreluzHistoria =
  "A Bioreluz nasceu do cuidado com cada detalhe. Uma equipe técnica que " +
  "trata limpeza e impermeabilização como padrão profissional, com " +
  "equipamentos de ponta e produtos certos para cada superfície. Hoje atende " +
  "lares e negócios com a confiança que a Sanchez indica.";

export const bioreluzServicos: ServicoBioreluz[] = [
  {
    slug: "limpeza-fachada",
    nome: "Limpeza de fachada",
    destaque: "Máquina Tucker — alcance e pressão controlada",
    descricao:
      "Limpeza técnica de fachadas com a máquina Tucker: água purificada e " +
      "hastes telescópicas que alcançam grandes alturas sem andaime, com " +
      "pressão controlada que preserva revestimento, vidro e pintura. " +
      "Resultado uniforme, sem risco e sem sujeira no entorno.",
    foto: null,
    videoUrl: null,
  },
  {
    slug: "impermeabilizacao",
    nome: "Impermeabilização",
    destaque: "Proteção duradoura contra umidade e infiltração",
    descricao:
      "Impermeabilização de superfícies para bloquear umidade e infiltração " +
      "antes que o problema apareça. Produtos aplicados na medida certa para " +
      "cada material, prolongando a vida do imóvel.",
    foto: null,
    videoUrl: null,
  },
  {
    slug: "limpeza-pos-obra",
    nome: "Limpeza pós-obra",
    destaque: "Entrega o ambiente pronto pra usar",
    descricao:
      "Remoção de resíduos de obra, respingos de tinta, poeira fina e " +
      "sujeira pesada. O ambiente sai limpo e pronto para ocupação.",
    foto: null,
    videoUrl: null,
  },
  {
    slug: "vidros-altura",
    nome: "Vidros e altura",
    destaque: "Limpeza de vidros com segurança em altura",
    descricao:
      "Limpeza de vidros, box e superfícies em altura com equipamento " +
      "adequado e equipe treinada. Brilho sem marcas e trabalho seguro.",
    foto: null,
    videoUrl: null,
  },
  {
    slug: "estofados",
    nome: "Higienização de estofados",
    destaque: "Sofás, poltronas e colchões como novos",
    descricao:
      "Higienização profunda de estofados e colchões, removendo ácaros, " +
      "manchas e odores. Secagem rápida e ambiente mais saudável.",
    foto: null,
    videoUrl: null,
  },
  {
    slug: "descartaveis",
    nome: "Linha de descartáveis",
    destaque: "Reposição prática para casa e negócio",
    descricao:
      "Linha completa de descartáveis para o dia a dia de lares e empresas, " +
      "com condição exclusiva para o Sanchez Clube.",
    foto: null,
    videoUrl: null,
  },
];
