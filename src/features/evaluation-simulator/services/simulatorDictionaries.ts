export const CRITERION_KEYWORDS: Record<string, string[]> = {
  "Qualidade tecnica": ["codigo", "implementacao", "funcao", "classe", "algoritmo", "execucao"],
  "Documentacao": ["documentacao", "comentario", "readme", "explicacao", "instrucoes"],
  "Boas praticas": ["validacao", "robustez", "padrao", "nomenclatura", "organizacao"],
  "Modelagem": ["entidade", "relacionamento", "cardinalidade", "der", "modelo"],
  "Clareza e argumentacao": ["justificativa", "clareza", "explica", "argumenta", "coerencia"],
  "Atendimento ao enunciado": ["requisito", "solicitado", "entregue", "implementado", "contempla"],
  "Testes e validacao": ["teste", "validacao", "verificacao", "caso de borda", "assert"],
  "Resposta incompleta": ["completo", "finalizado", "todos", "cobre", "inclui"],
};

export const TAG_HINTS: Record<string, string[]> = {
  poo: ["classe", "heranca", "polimorfismo", "objeto", "python"],
  python: ["python", "classe", "def", "exception"],
  documentacao: ["comentario", "readme", "documentacao", "explicacao"],
  excecoes: ["excecao", "exception", "erro", "try", "catch"],
  "banco-de-dados": ["banco", "dados", "sql", "der", "entidade"],
  der: ["der", "entidade", "relacionamento", "cardinalidade"],
  modelagem: ["modelo", "modelagem", "entidade", "atributo"],
  testes: ["teste", "testes", "assert", "unitario"],
  validacao: ["validacao", "validar", "entrada", "verificacao"],
  "casos-de-borda": ["borda", "limite", "entrada invalida", "caso"],
};

