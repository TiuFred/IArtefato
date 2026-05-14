import "server-only";

import { listCorrectionCases } from "@/features/correction-inference/services";
import { listArtefactCorrectionModels } from "@/features/artefact-correction-model/services/artefactCorrectionModelRepository";
import type { SimulationContextCase } from "@/features/shared/types";
import { calculateSimilarity, type SimilarityInput } from "./similarityService";
import { unique } from "./textUtils";

export interface SearchSemanticMemoryParams {
  text: string;
  subject?: string;
  artefactName?: string;
  projectContextText?: string;
  artefactContextText?: string;
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
    text: [params.text, params.artefactName, params.projectContextText, params.artefactContextText]
      .filter(Boolean)
      .join("\n"),
    tags: unique(params.tags ?? []),
    artefactName: params.artefactName,
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

export async function searchSimilarArtefactModels(params: SearchSemanticMemoryParams) {
  const models = await listArtefactCorrectionModels(params.artefactName);
  const queryText = [params.text, params.projectContextText, params.artefactContextText].filter(Boolean).join("\n");
  const queryTokens = unique(queryText.toLowerCase().split(/\W+/).filter(Boolean));

  return models
    .map((model) => {
      const modelText = [
        model.artefactName,
        model.inferredPrompt,
        model.inferredRules.join(" "),
        model.inferredPatterns.join(" "),
        model.detectedPenalties.join(" "),
      ].join(" ").toLowerCase();
      const shared = queryTokens.filter((token) => modelText.includes(token)).length;
      const artefactBoost = params.artefactName?.toLowerCase() === model.artefactName.toLowerCase() ? 35 : 0;
      return {
        ...model,
        similarity: Math.min(100, Math.round((shared / Math.max(1, queryTokens.length)) * 65 + artefactBoost)),
      };
    })
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, params.limit ?? 5);
}

export async function findMostSimilarMemory(
  params: SearchSemanticMemoryParams
): Promise<SimulationContextCase | null> {
  return (await searchSimilarCorrectionCases({ ...params, limit: 1 }))[0] ?? null;
}
