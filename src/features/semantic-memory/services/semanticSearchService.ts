import "server-only";

import { listCorrectionCases } from "@/features/correction-inference/services";
import type { SimulationContextCase } from "@/features/shared/types";
import { calculateSimilarity, type SimilarityInput } from "./similarityService";
import { unique } from "./textUtils";

export interface SearchSemanticMemoryParams {
  text: string;
  subject?: string;
  tags?: string[];
  limit?: number;
}

export function searchSemanticMemory(
  params: SearchSemanticMemoryParams
): Promise<SimulationContextCase[]> {
  return searchSimilarCorrectionCases(params);
}

export async function searchSimilarCorrectionCases(
  params: SearchSemanticMemoryParams
): Promise<SimulationContextCase[]> {
  const limit = params.limit ?? 5;
  const query: SimilarityInput = {
    text: params.text,
    tags: unique(params.tags ?? []),
  };

  // Filtra pelo subject para que a simulação use apenas o perfil do professor certo
  const cases = await listCorrectionCases(params.subject);

  return cases
    .map((correctionCase) => {
      const similarity = calculateSimilarity(query, correctionCase);
      return {
        ...correctionCase,
        similarity: similarity.score,
        matchedSignals: similarity.reasons,
      };
    })
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, limit);
}

export async function findMostSimilarMemory(
  params: SearchSemanticMemoryParams
): Promise<SimulationContextCase | null> {
  return (await searchSimilarCorrectionCases({ ...params, limit: 1 }))[0] ?? null;
}
