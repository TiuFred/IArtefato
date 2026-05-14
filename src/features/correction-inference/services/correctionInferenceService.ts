import "server-only";

import { generateGeminiJson } from "@/services/ai/gemini";
import { composeCorrectionInferencePrompt } from "@/features/prompt-composer/services";
import type { CorrectionInferenceInput, CorrectionInferenceOutput } from "@/features/shared/types";
import { correctionInferenceSchema } from "./schemas";

export async function inferCorrectionWithGemini(
  input: CorrectionInferenceInput
): Promise<CorrectionInferenceOutput> {
  const prompt = composeCorrectionInferencePrompt(input);
  const inference = await generateGeminiJson(prompt, correctionInferenceSchema);

  return {
    ...inference,
    criteria: normalizeCriteriaWeights(inference.criteria),
    confidence: Math.round(inference.confidence),
  };
}

function normalizeCriteriaWeights(
  criteria: CorrectionInferenceOutput["criteria"]
): CorrectionInferenceOutput["criteria"] {
  const total = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  if (total <= 0) return criteria;

  const normalized = criteria.map((criterion) => ({
    ...criterion,
    weight: Math.round((criterion.weight / total) * 100),
  }));
  const gap = 100 - normalized.reduce((sum, criterion) => sum + criterion.weight, 0);
  if (normalized[0]) normalized[0].weight += gap;

  return normalized;
}
