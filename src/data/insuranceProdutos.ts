// ─────────────────────────────────────────────────────────────
// INSURANCE & SANTÉ — catálogo de cotação da página /parceiro/insurance-sante.
// 3 categorias: Seguros · Consórcio · Planos de Saúde.
// Cada produto define os CAMPOS da simulação e os DOCUMENTOS exigidos.
// TODO YRUENA: textos são PLACEHOLDER realista; ajustar produtos/campos/docs.
//   `videoUrl`: null enquanto o vídeo de explicação não chegar.
// ─────────────────────────────────────────────────────────────

export type CampoTipo = "text" | "number" | "select" | "date";

export type CampoCotacao = {
  name: string;
  label: string;
  tipo: CampoTipo;
  /** Para tipo "select". */
  opcoes?: string[];
  placeholder?: string;
  /** Ocupa a linha inteira do grid. */
  full?: boolean;
};

export type ProdutoInsurance = {
  slug: string;
  nome: string;
  descricaoCurta: string;
  descricao: string;
  /** Campos específicos da simulação deste produto (além de nome/WhatsApp/e-mail). */
  campos: CampoCotacao[];
  /** Documentos que a pessoa precisa anexar. */
  docsExigidos: string[];
  videoUrl: string | null;
};

export type CategoriaInsurance = {
  slug: "seguros" | "consorcio" | "planos-saude";
  titulo: string;
  descricao: string;
  produtos: ProdutoInsurance[];
};

// Breve história — máx 4 linhas. PLACEHOLDER.
export const insuranceHistoria =
  "A Insurance & Santé cuida de quem você ama e do que você construiu. " +
  "Atendimento consultivo para escolher a proteção certa — seguros, " +
  "consórcios e planos de saúde — com clareza, segurança e as melhores " +
  "condições para o Sanchez Clube.";

export const insuranceCategorias: CategoriaInsurance[] = [
  {
    slug: "seguros",
    titulo: "Seguros",
    descricao: "Proteção para sua vida, seu carro, seu imóvel e seu negócio.",
    produtos: [
      {
        slug: "seguro-vida",
        nome: "Seguro de Vida",
        descricaoCurta: "Tranquilidade para quem você ama.",
        descricao:
          "Proteção financeira para sua família em caso de imprevistos, com " +
          "coberturas que você escolhe e assistências que fazem diferença no dia a dia.",
        campos: [
          { name: "nascimento", label: "Data de nascimento", tipo: "date" },
          {
            name: "profissao",
            label: "Profissão",
            tipo: "text",
            placeholder: "Ex: autônomo, CLT...",
          },
          {
            name: "fumante",
            label: "Fumante?",
            tipo: "select",
            opcoes: ["Não", "Sim"],
          },
          {
            name: "capital",
            label: "Capital segurado desejado",
            tipo: "select",
            opcoes: ["Até R$ 100 mil", "R$ 100–300 mil", "R$ 300 mil+", "Não sei"],
          },
        ],
        docsExigidos: ["RG ou CNH", "CPF", "Comprovante de residência"],
        videoUrl: null,
      },
      {
        slug: "seguro-auto",
        nome: "Seguro Auto",
        descricaoCurta: "Seu carro protegido com a melhor cotação.",
        descricao:
          "Cobertura contra colisão, roubo, furto e terceiros, com assistência " +
          "24h. Comparamos as seguradoras pra você e trazemos a melhor condição.",
        campos: [
          {
            name: "veiculo",
            label: "Veículo (marca/modelo/ano)",
            tipo: "text",
            placeholder: "Ex: Honda Civic 2020",
            full: true,
          },
          { name: "placa", label: "Placa", tipo: "text", placeholder: "ABC1D23" },
          { name: "cep", label: "CEP de pernoite", tipo: "text", placeholder: "00000-000" },
          {
            name: "uso",
            label: "Uso do veículo",
            tipo: "select",
            opcoes: ["Particular", "Trabalho/App", "Comercial"],
          },
        ],
        docsExigidos: ["CNH do condutor principal", "Documento do veículo (CRLV)"],
        videoUrl: null,
      },
      {
        slug: "seguro-imovel",
        nome: "Seguro Imobiliário",
        descricaoCurta: "Seu imóvel seguro contra imprevistos.",
        descricao:
          "Proteção para residência ou imóvel alugado: incêndio, danos " +
          "elétricos, vendaval, roubo e responsabilidade civil.",
        campos: [
          {
            name: "tipoImovel",
            label: "Tipo de imóvel",
            tipo: "select",
            opcoes: ["Casa", "Apartamento", "Comercial"],
          },
          {
            name: "situacao",
            label: "Situação",
            tipo: "select",
            opcoes: ["Próprio", "Alugado", "Financiado"],
          },
          { name: "cepImovel", label: "CEP do imóvel", tipo: "text", placeholder: "00000-000" },
        ],
        docsExigidos: ["RG ou CNH", "Comprovante de endereço do imóvel"],
        videoUrl: null,
      },
      {
        slug: "responsabilidade-civil",
        nome: "Responsabilidade Civil",
        descricaoCurta: "Proteção para o seu negócio e sua profissão.",
        descricao:
          "Cobertura para danos causados a terceiros no exercício da atividade " +
          "profissional ou empresarial. Segurança pra você trabalhar tranquilo.",
        campos: [
          { name: "atividade", label: "Atividade/Ramo", tipo: "text", full: true },
          {
            name: "porte",
            label: "Porte",
            tipo: "select",
            opcoes: ["MEI", "Pequeno", "Médio", "Grande"],
          },
        ],
        docsExigidos: ["CNPJ (se houver)", "RG ou CNH do responsável"],
        videoUrl: null,
      },
    ],
  },
  {
    slug: "consorcio",
    titulo: "Consórcio",
    descricao: "Conquiste seu imóvel ou veículo sem juros, no seu ritmo.",
    produtos: [
      {
        slug: "consorcio-imovel",
        nome: "Consórcio Imobiliário",
        descricaoCurta: "Seu imóvel sem juros, com parcela que cabe.",
        descricao:
          "Planeje a compra do seu imóvel sem os juros do financiamento. " +
          "Escolha o valor da carta de crédito e o prazo que faz sentido pra você.",
        campos: [
          {
            name: "credito",
            label: "Valor da carta de crédito",
            tipo: "select",
            opcoes: ["Até R$ 200 mil", "R$ 200–400 mil", "R$ 400–600 mil", "R$ 600 mil+"],
          },
          {
            name: "prazo",
            label: "Prazo desejado",
            tipo: "select",
            opcoes: ["Até 120 meses", "120–180 meses", "180–240 meses"],
          },
        ],
        docsExigidos: ["RG ou CNH", "CPF", "Comprovante de renda"],
        videoUrl: null,
      },
      {
        slug: "consorcio-veiculo",
        nome: "Consórcio de Veículo",
        descricaoCurta: "Carro ou moto novo, sem juros.",
        descricao:
          "Adquira seu veículo com parcelas sem juros e a flexibilidade de dar " +
          "lance pra antecipar a contemplação.",
        campos: [
          {
            name: "tipo",
            label: "Tipo",
            tipo: "select",
            opcoes: ["Carro", "Moto", "Utilitário"],
          },
          {
            name: "credito",
            label: "Valor da carta de crédito",
            tipo: "select",
            opcoes: ["Até R$ 50 mil", "R$ 50–100 mil", "R$ 100 mil+"],
          },
        ],
        docsExigidos: ["RG ou CNH", "CPF", "Comprovante de renda"],
        videoUrl: null,
      },
    ],
  },
  {
    slug: "planos-saude",
    titulo: "Planos de Saúde",
    descricao: "Saúde pra você, sua família ou sua empresa.",
    produtos: [
      {
        slug: "saude-familiar",
        nome: "Plano Individual / Familiar",
        descricaoCurta: "Cobertura para você e sua família.",
        descricao:
          "Planos de saúde individuais e familiares com rede credenciada de " +
          "qualidade. Comparamos operadoras pra achar o melhor custo-benefício.",
        campos: [
          {
            name: "vidas",
            label: "Quantas pessoas",
            tipo: "number",
            placeholder: "Ex: 3",
          },
          {
            name: "idades",
            label: "Idades (separadas por vírgula)",
            tipo: "text",
            placeholder: "Ex: 34, 32, 5",
            full: true,
          },
          { name: "cidade", label: "Cidade", tipo: "text" },
          {
            name: "acomodacao",
            label: "Acomodação",
            tipo: "select",
            opcoes: ["Enfermaria", "Apartamento", "Tanto faz"],
          },
        ],
        docsExigidos: ["RG ou CNH", "CPF dos beneficiários"],
        videoUrl: null,
      },
      {
        slug: "saude-empresarial",
        nome: "Plano Empresarial",
        descricaoCurta: "Saúde para o seu time.",
        descricao:
          "Planos empresariais a partir de poucas vidas, com condições melhores " +
          "que o individual. Ideal pra MEI e pequenas empresas.",
        campos: [
          {
            name: "vidas",
            label: "Número de vidas",
            tipo: "number",
            placeholder: "Ex: 5",
          },
          { name: "cnpj", label: "CNPJ", tipo: "text", placeholder: "00.000.000/0001-00" },
          { name: "cidade", label: "Cidade", tipo: "text" },
        ],
        docsExigidos: ["Cartão CNPJ", "RG ou CNH do responsável", "Relação de beneficiários"],
        videoUrl: null,
      },
      {
        slug: "odontologico",
        nome: "Plano Odontológico",
        descricaoCurta: "Sorriso cuidado por menos do que imagina.",
        descricao:
          "Cobertura odontológica com rede credenciada ampla, limpeza, " +
          "tratamentos e urgências. Mensalidade acessível.",
        campos: [
          {
            name: "vidas",
            label: "Quantas pessoas",
            tipo: "number",
            placeholder: "Ex: 2",
          },
          { name: "cidade", label: "Cidade", tipo: "text" },
        ],
        docsExigidos: ["RG ou CNH", "CPF"],
        videoUrl: null,
      },
    ],
  },
];

// Achata todos os produtos (útil pro rodapé de vídeos).
export const insuranceProdutosFlat = insuranceCategorias.flatMap(
  (c) => c.produtos,
);
