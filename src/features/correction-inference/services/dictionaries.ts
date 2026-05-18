import type { PenalizacaoDetectada } from "./types";

export interface CriteriaDefinition {
  nome: string;
  descricao: string;
  keywords: string[];
}

export interface PenaltyDefinition {
  nome: string;
  triggers: string[];
  descontoBase: number;
  severidade: PenalizacaoDetectada["severidade"];
  descricao: string;
}

export const CRITERIA_DEFINITIONS: CriteriaDefinition[] = [
  {
    nome: "Atendimento ao enunciado",
    descricao: "A resposta cumpre os requisitos e restricoes descritos na atividade.",
    keywords: ["requisito", "enunciado", "solicitado", "pedido", "atende", "cumpre", "contempla"],
  },
  {
    nome: "Fundamentacao conceitual",
    descricao: "Uso correto de conceitos, definicoes e fundamentos da disciplina.",
    keywords: ["conceito", "teoria", "fundamento", "definicao", "principio", "embasamento"],
  },
  {
    nome: "Qualidade tecnica",
    descricao: "Correcao tecnica, funcionamento, implementacao e consistencia da solucao.",
    keywords: ["codigo", "implementacao", "algoritmo", "funcao", "classe", "execucao", "compila", "solucao"],
  },
  {
    nome: "Estrutura e organizacao",
    descricao: "Organizacao da entrega, modularidade, formato e clareza estrutural.",
    keywords: ["estrutura", "organizacao", "modular", "arquitetura", "formato", "arquivo", "pastas", "separacao"],
  },
  {
    nome: "Clareza e argumentacao",
    descricao: "Capacidade de explicar escolhas, justificar a resposta e manter coesao.",
    keywords: ["clareza", "explicacao", "argumentacao", "justificativa", "coerencia", "objetivo"],
  },
  {
    nome: "Testes e validacao",
    descricao: "Presenca de verificacoes, testes ou evidencias de validacao.",
    keywords: ["teste", "validacao", "verificacao", "assert", "cobertura", "caso de teste"],
  },
  {
    nome: "Documentacao",
    descricao: "Documentacao, comentarios, README ou descricao suficiente da entrega.",
    keywords: ["documentacao", "comentario", "readme", "docstring", "descricao", "instrucoes"],
  },
];

export const PENALTY_DEFINITIONS: PenaltyDefinition[] = [
  {
    nome: "Requisito ausente",
    triggers: ["nao atende", "nao cumpre", "faltou", "ausente", "nao contempla", "nao implementou"],
    descontoBase: 2,
    severidade: "alta",
    descricao: "Parte obrigatoria da atividade parece nao ter sido entregue.",
  },
  {
    nome: "Erro tecnico",
    triggers: ["erro", "falha", "bug", "nao executa", "nao compila", "exception", "quebra"],
    descontoBase: 1.5,
    severidade: "alta",
    descricao: "Ha indicios de problema tecnico que afeta o funcionamento ou a correcao.",
  },
  {
    nome: "Resposta incompleta",
    triggers: ["incompleto", "parcial", "superficial", "faltou completar", "insuficiente"],
    descontoBase: 1.25,
    severidade: "media",
    descricao: "A entrega parece cobrir apenas parte do esperado.",
  },
  {
    nome: "Baixa organizacao",
    triggers: ["desorganizado", "confuso", "mal estruturado", "dificil de ler", "sem organizacao"],
    descontoBase: 0.75,
    severidade: "media",
    descricao: "A estrutura ou apresentacao da resposta reduz a qualidade da entrega.",
  },
  {
    nome: "Pouca documentacao",
    triggers: ["sem documentacao", "falta documentacao", "sem comentario", "pouca explicacao", "nao explicou"],
    descontoBase: 0.75,
    severidade: "baixa",
    descricao: "A resposta oferece pouca explicacao, documentacao ou contexto.",
  },
  {
    nome: "Ausencia de testes",
    triggers: ["sem teste", "falta teste", "nao testou", "ausencia de teste", "nao validou"],
    descontoBase: 1,
    severidade: "media",
    descricao: "Nao ha evidencia suficiente de teste ou validacao.",
  },
];

export const TECHNICAL_KEYWORDS = [
  "codigo",
  "implementacao",
  "algoritmo",
  "funcao",
  "classe",
  "execucao",
  "compila",
  "complexidade",
  "teste",
  "validacao",
];

export const STRUCTURAL_KEYWORDS = [
  "estrutura",
  "organizacao",
  "modular",
  "arquitetura",
  "formato",
  "separacao",
  "clareza",
  "coesao",
  "ordem",
];

