import type { SemanticMemoryRecord } from "../types";

export const SEMANTIC_MEMORY_SEED: SemanticMemoryRecord[] = [
  {
    id: "mem-001",
    atividade:
      "Desenvolver sistema de cadastro em Python com POO, heranca, polimorfismo e tratamento de excecoes.",
    resposta:
      "Entrega com classes Cliente, ClientePremium e ClienteCorporativo, usando heranca e polimorfismo para calcular descontos.",
    feedback:
      "Boa implementacao da hierarquia de classes e uso do polimorfismo. Faltou tratamento de excecoes adequado e comentarios suficientes.",
    nota: 7.5,
    notaMaxima: 10,
    pseudoPrompt:
      "Avalie implementacao tecnica, documentacao e boas praticas. Desconte falta de excecoes e comentarios insuficientes.",
    padroesDetectados: ["Qualidade tecnica", "Documentacao", "Boas praticas"],
    tags: ["poo", "python", "documentacao", "excecoes"],
    data: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "mem-002",
    atividade:
      "Criar modelo conceitual de banco de dados com entidades, atributos, relacionamentos e cardinalidades.",
    resposta:
      "Modelo DER com entidades Cliente, Pedido e Produto, incluindo alguns relacionamentos e atributos principais.",
    feedback:
      "A modelagem cobre entidades centrais, mas cardinalidades estao incompletas e ha atributos sem justificativa clara.",
    nota: 8,
    notaMaxima: 10,
    pseudoPrompt:
      "Priorize modelagem, relacionamento entre entidades, cardinalidade e clareza da justificativa.",
    padroesDetectados: ["Modelagem", "Clareza e argumentacao", "Atendimento ao enunciado"],
    tags: ["banco-de-dados", "der", "modelagem", "cardinalidade"],
    data: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "mem-003",
    atividade:
      "Implementar testes unitarios para funcoes de calculo financeiro e validar casos de borda.",
    resposta:
      "Foram criados testes para casos comuns de juros compostos, mas sem cobrir entradas invalidas ou limites.",
    feedback:
      "Os testes cobrem o fluxo principal, porem faltam casos de borda e validacao de entradas invalidas.",
    nota: 6.8,
    notaMaxima: 10,
    pseudoPrompt:
      "Avalie cobertura de testes, validacao de entradas, casos de borda e completude da solucao.",
    padroesDetectados: ["Testes e validacao", "Resposta incompleta", "Qualidade tecnica"],
    tags: ["testes", "validacao", "casos-de-borda", "financeiro"],
    data: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

