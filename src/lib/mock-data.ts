import type {
  CorrectionEntry,
  InferredPattern,
  DashboardStats,
  SimulationResult,
  ChartDataPoint,
} from "@/types";

export const mockStats: DashboardStats = {
  totalEntries: 24,
  analyzedEntries: 21,
  averageScore: 7.4,
  inferredPatterns: 18,
  simulationsRun: 9,
  accuracyRate: 84.2,
};

export const mockChartData: ChartDataPoint[] = [
  { label: "Jan", value: 2, secondary: 1 },
  { label: "Fev", value: 3, secondary: 2 },
  { label: "Mar", value: 5, secondary: 4 },
  { label: "Abr", value: 4, secondary: 3 },
  { label: "Mai", value: 7, secondary: 6 },
  { label: "Jun", value: 6, secondary: 5 },
  { label: "Jul", value: 9, secondary: 8 },
];

export const mockScoreDistribution: ChartDataPoint[] = [
  { label: "0-4", value: 2 },
  { label: "4-6", value: 5 },
  { label: "6-8", value: 10 },
  { label: "8-10", value: 7 },
];

export const mockPatterns: InferredPattern[] = [
  {
    id: "pat-001",
    entryId: "entry-001",
    criteria: [
      {
        name: "Fundamentação Teórica",
        weight: 30,
        description: "Uso correto de conceitos teóricos da disciplina",
        detected: true,
      },
      {
        name: "Implementação Técnica",
        weight: 40,
        description: "Qualidade e correção do código ou implementação",
        detected: true,
      },
      {
        name: "Documentação",
        weight: 15,
        description: "Clareza e completude da documentação",
        detected: true,
      },
      {
        name: "Testes e Validação",
        weight: 15,
        description: "Presença e qualidade dos testes",
        detected: false,
      },
    ],
    penalties: [
      {
        name: "Código sem comentários",
        deduction: 1.0,
        description: "Falta de comentários explicativos no código",
      },
      {
        name: "Requisitos não atendidos",
        deduction: 2.0,
        description: "Requisitos obrigatórios ausentes na entrega",
      },
      {
        name: "Erros de execução",
        deduction: 1.5,
        description: "Código com erros que impedem a execução",
      },
    ],
    correctionStyle: {
      tone: "moderate",
      focus: "technical",
      detailLevel: "detailed",
      keywords: [
        "implementação",
        "conceitos",
        "boas práticas",
        "legibilidade",
        "eficiência",
      ],
    },
    pseudoPrompt: `Você é um professor universitário de Engenharia de Software corrigindo uma atividade prática.
Avalie os seguintes critérios com rigor técnico moderado:
1. Fundamentação teórica (30%): Verifique se o aluno compreende e aplica corretamente os conceitos da disciplina
2. Implementação técnica (40%): Avalie a qualidade, correção e eficiência do código
3. Documentação (15%): Verifique a clareza das explicações e documentação
4. Testes (15%): Analise se há validação adequada da solução
Penalize: código sem comentários (-1.0), requisitos não atendidos (-2.0), erros de execução (-1.5)
Forneça feedback construtivo e detalhado, apontando pontos fortes e melhorias necessárias.`,
    confidence: 87,
    keywords: [
      "implementação",
      "eficiência",
      "boas práticas",
      "documentação",
      "testes",
    ],
    createdAt: "2025-04-15T10:30:00Z",
  },
  {
    id: "pat-002",
    entryId: "entry-002",
    criteria: [
      {
        name: "Análise de Requisitos",
        weight: 25,
        description: "Compreensão e análise dos requisitos do problema",
        detected: true,
      },
      {
        name: "Modelagem",
        weight: 35,
        description: "Qualidade dos diagramas e modelagem do sistema",
        detected: true,
      },
      {
        name: "Justificativas",
        weight: 25,
        description: "Embasamento das decisões de design",
        detected: true,
      },
      {
        name: "Formato",
        weight: 15,
        description: "Conformidade com o formato exigido",
        detected: true,
      },
    ],
    penalties: [
      {
        name: "Diagrama incompleto",
        deduction: 2.0,
        description: "Diagramas UML com elementos faltantes",
      },
      {
        name: "Sem justificativa",
        deduction: 1.5,
        description: "Decisões de design sem fundamentação",
      },
    ],
    correctionStyle: {
      tone: "strict",
      focus: "conceptual",
      detailLevel: "exhaustive",
      keywords: [
        "modelagem",
        "requisitos",
        "UML",
        "arquitetura",
        "decisões de design",
      ],
    },
    pseudoPrompt: `Você é um professor rigoroso de Análise e Projeto de Sistemas.
Avalie a atividade com foco em modelagem e análise conceitual:
1. Análise de Requisitos (25%): Verifique se todos os requisitos foram identificados e classificados
2. Modelagem (35%): Avalie a correção e completude dos diagramas UML
3. Justificativas (25%): Cada decisão de design deve ser fundamentada teoricamente
4. Formato (15%): Conformidade com as normas de entrega especificadas
Penalize fortemente diagramas incompletos e falta de justificativas.
Seja detalhado e rigoroso no feedback.`,
    confidence: 92,
    keywords: [
      "UML",
      "modelagem",
      "requisitos",
      "arquitetura",
      "design patterns",
    ],
    createdAt: "2025-04-20T14:15:00Z",
  },
];

export const mockEntries: CorrectionEntry[] = [
  {
    id: "entry-001",
    subject: "Programação Orientada a Objetos",
    activityTitle: "Implementação de Sistema de Cadastro",
    activityDescription:
      "Desenvolva um sistema de cadastro de clientes utilizando POO em Python. O sistema deve incluir: classe Cliente com atributos e métodos, herança com pelo menos uma subclasse, polimorfismo, e tratamento de exceções.",
    studentResponse:
      "Implementei o sistema usando Python com as classes Cliente, ClientePremium e ClienteCorporativo. Utilizei herança para compartilhar atributos base e sobrescrevi o método calcular_desconto() em cada subclasse (polimorfismo).",
    feedback:
      "Boa implementação da hierarquia de classes. Polimorfismo bem aplicado. Faltou tratamento de exceções adequado e os comentários no código são insuficientes. A implementação poderia ser mais robusta com validações nos setters.",
    score: 7.5,
    maxScore: 10,
    createdAt: "2025-04-15T10:30:00Z",
    inferredPattern: mockPatterns[0],
    status: "analyzed",
  },
  {
    id: "entry-002",
    subject: "Análise e Projeto de Sistemas",
    activityTitle: "Modelagem UML - Sistema de Biblioteca",
    activityDescription:
      "Crie a modelagem completa de um sistema de biblioteca incluindo: Diagrama de Casos de Uso, Diagrama de Classes, Diagrama de Sequência para o processo de empréstimo de livros.",
    studentResponse:
      "Desenvolvi os três diagramas solicitados. O diagrama de casos de uso inclui os atores Bibliotecário e Cliente. O diagrama de classes mostra as entidades Livro, Empréstimo, Cliente e Reserva.",
    feedback:
      "Os diagramas estão tecnicamente corretos. O Diagrama de Sequência para o empréstimo está bem detalhado. Faltaram alguns casos de uso secundários (renovação, reserva) e o relacionamento de herança na classe Cliente não foi explorado.",
    score: 8.0,
    maxScore: 10,
    createdAt: "2025-04-20T14:15:00Z",
    inferredPattern: mockPatterns[1],
    status: "analyzed",
  },
  {
    id: "entry-003",
    subject: "Banco de Dados",
    activityTitle: "Modelagem Relacional e SQL",
    activityDescription:
      "Crie o modelo relacional de um sistema de e-commerce e desenvolva as queries SQL para: listagem de produtos por categoria, relatório de vendas mensais, e consulta de clientes com maior ticket médio.",
    studentResponse:
      "Criei o DER com as tabelas: Produto, Categoria, Cliente, Pedido, ItemPedido. As queries SQL foram desenvolvidas usando JOINs e funções de agregação.",
    feedback:
      "Modelo relacional bem estruturado. As queries estão funcionais mas poderiam ser otimizadas com índices. A query de ticket médio está correta. Faltou normalização adequada na tabela de Produtos (3FN).",
    score: 6.5,
    maxScore: 10,
    createdAt: "2025-05-01T09:00:00Z",
    status: "analyzed",
  },
  {
    id: "entry-004",
    subject: "Engenharia de Software",
    activityTitle: "Documento de Requisitos",
    activityDescription:
      "Elabore o documento de especificação de requisitos (SRS) para um aplicativo de delivery seguindo o padrão IEEE 830.",
    studentResponse:
      "Documento elaborado com introdução, descrição geral do sistema, requisitos funcionais e não-funcionais. Incluí casos de uso textuais e protótipos de tela.",
    feedback:
      "Documento bem estruturado seguindo o padrão IEEE. Os requisitos funcionais são claros e rastreáveis. Os requisitos não-funcionais precisam de mais especificidade (ex: tempo de resposta em ms, não apenas 'rápido').",
    score: 8.5,
    maxScore: 10,
    createdAt: "2025-05-05T16:30:00Z",
    status: "analyzed",
  },
  {
    id: "entry-005",
    subject: "Estruturas de Dados",
    activityTitle: "Implementação de Árvore AVL",
    activityDescription:
      "Implemente uma Árvore AVL em Java com operações de inserção, remoção e busca. Demonstre o balanceamento automático.",
    studentResponse:
      "Implementei a Árvore AVL com os métodos insert(), delete() e search(). O balanceamento é feito através das rotações simples e duplas.",
    feedback:
      "Implementação correta das rotações. A lógica de balanceamento está funcionando. Faltou o cálculo do fator de balanceamento de forma mais explícita e a remoção não trata todos os casos (nó com dois filhos).",
    score: 7.0,
    maxScore: 10,
    createdAt: "2025-05-08T11:00:00Z",
    status: "pending",
  },
];

export const mockSimulationResult: SimulationResult = {
  id: "sim-001",
  requestId: "req-001",
  predictedScore: 7.2,
  maxScore: 10,
  predictedFeedback: `**Análise Geral:** A implementação demonstra compreensão sólida dos conceitos fundamentais da disciplina. A estrutura do código está bem organizada e segue os princípios de orientação a objetos.

**Pontos Positivos:**
- Hierarquia de classes bem definida e coerente com o problema
- Uso adequado de encapsulamento nos atributos principais
- Lógica principal implementada de forma funcional

**Pontos de Melhoria:**
- O tratamento de exceções precisa ser mais abrangente — cubra casos como entradas inválidas e estados inconsistentes
- A documentação do código está superficial; adicione docstrings explicando a responsabilidade de cada método
- Faltam testes unitários para validar os casos de borda

**Observação Técnica:** A solução atende aos requisitos principais, mas carece de robustez em cenários de erro. Recomenda-se refatorar os métodos mais longos seguindo o princípio da responsabilidade única.`,
  missingRequirements: [
    "Tratamento de exceções para entradas inválidas",
    "Testes unitários (ao menos 3 casos de teste)",
    "Docstrings nos métodos principais",
    "Validação de tipos nos parâmetros",
  ],
  riskAreas: [
    {
      area: "Robustez",
      severity: "high",
      description: "Falta de tratamento para casos de borda e exceções",
      suggestion:
        "Adicione try/except nos métodos críticos e valide as entradas",
    },
    {
      area: "Documentação",
      severity: "medium",
      description: "Comentários e docstrings insuficientes",
      suggestion:
        "Documente cada classe e método com sua responsabilidade e parâmetros",
    },
    {
      area: "Testes",
      severity: "medium",
      description: "Ausência de testes automatizados",
      suggestion:
        "Implemente testes unitários usando pytest para os métodos principais",
    },
    {
      area: "Design",
      severity: "low",
      description: "Alguns métodos com múltiplas responsabilidades",
      suggestion:
        "Refatore seguindo o Princípio da Responsabilidade Única (SRP)",
    },
  ],
  structuralAnalysis: {
    completeness: 72,
    clarity: 68,
    technicalDepth: 75,
    formatAdherence: 85,
    overallQuality: 74,
  },
  similarCases: [
    {
      id: "entry-001",
      title: "Implementação de Sistema de Cadastro",
      similarity: 89,
      score: 7.5,
      subject: "POO",
    },
    {
      id: "entry-005",
      title: "Implementação de Árvore AVL",
      similarity: 71,
      score: 7.0,
      subject: "Estruturas de Dados",
    },
    {
      id: "entry-003",
      title: "Modelagem Relacional e SQL",
      similarity: 45,
      score: 6.5,
      subject: "Banco de Dados",
    },
  ],
  confidence: 81,
  pseudoPromptUsed: mockPatterns[0].pseudoPrompt,
  createdAt: new Date().toISOString(),
};
