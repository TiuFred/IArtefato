import type { EvaluationRisk, MissingCriterion } from "../types";

export function generateMockFeedback(params: {
  notaPrevista: number;
  notaMaxima: number;
  criteriosFaltantes: MissingCriterion[];
  riscos: EvaluationRisk[];
  similarCount: number;
}): string {
  const scoreRatio = params.notaPrevista / params.notaMaxima;
  const opening =
    scoreRatio >= 0.8
      ? "A resposta tende a ser bem avaliada pela memoria mockada, com boa aderencia aos casos anteriores."
      : scoreRatio >= 0.6
      ? "A resposta parece parcialmente aderente aos padroes historicos, mas ainda tem pontos que podem reduzir a nota."
      : "A resposta apresenta risco alto de perda de pontos quando comparada aos padroes similares da base mockada.";

  const missingText = params.criteriosFaltantes.length
    ? `Criterios com pouca evidencia: ${params.criteriosFaltantes
        .map((criterion) => criterion.criterio)
        .join(", ")}.`
    : "Nao foram detectados criterios historicos claramente ausentes.";

  const riskText = params.riscos.length
    ? `Principais riscos: ${params.riscos.map((risk) => risk.area).join(", ")}.`
    : "Nao ha riscos relevantes alem das limitacoes naturais da simulacao.";

  return `${opening}

Foram usados ${params.similarCount} registro(s) similar(es) da memoria semantica mockada para combinar pseudo-prompts anteriores e estimar a correcao.

${missingText}

${riskText}

Esta previsao nao usa IA real; ela combina heuristicas de similaridade, historico de notas, tags, padroes detectados e tamanho da resposta.`;
}

