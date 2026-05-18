import type { SemanticSearchResult } from "@/features/semantic-memory";
import type { MissingCriterion } from "../types";

export function predictMockScore(params: {
  resposta: string;
  notaMaxima: number;
  similarResults: SemanticSearchResult[];
  missingCriteria: MissingCriterion[];
}): number {
  const weightedBase = getWeightedHistoricalScore(params.similarResults, params.notaMaxima);
  const missingPenalty = params.missingCriteria.reduce(
    (sum, criterion) => sum + criterion.impactoEstimado,
    0
  );
  const lengthAdjustment = params.resposta.length > 900 ? 0.4 : params.resposta.length < 250 ? -0.7 : 0;
  const predicted = weightedBase - missingPenalty + lengthAdjustment;

  return Number(Math.max(0, Math.min(params.notaMaxima, predicted)).toFixed(1));
}

function getWeightedHistoricalScore(
  similarResults: SemanticSearchResult[],
  notaMaxima: number
): number {
  const usefulResults = similarResults.filter((result) => result.similaridade > 0);
  const similaritySum = usefulResults.reduce((sum, result) => sum + result.similaridade, 0);

  if (usefulResults.length === 0 || similaritySum === 0) {
    return notaMaxima * 0.7;
  }

  return usefulResults.reduce((sum, result) => {
    const normalizedScore = result.registro.nota / result.registro.notaMaxima;
    const weight = result.similaridade / similaritySum;
    return sum + normalizedScore * notaMaxima * weight;
  }, 0);
}

