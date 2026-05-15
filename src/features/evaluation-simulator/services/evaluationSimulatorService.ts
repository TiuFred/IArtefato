import "server-only";

import { generateGeminiJson } from "@/services/ai/gemini";
import { getDefaultAcademicContext } from "@/features/academic-context-engine/baseline/defaultAcademicContext";
import { composeEvaluationSimulationPrompt } from "@/features/prompt-composer/services";
import { searchSimilarCorrectionCases } from "@/features/semantic-memory/services";
import { getLatestModelByArtefactName } from "@/features/artefact-correction-model/services";
import type {
  EvaluationSimulationInput,
  EvaluationSimulationOutput,
  SimilarCaseView,
  SimulationContextCase,
} from "@/features/shared/types";
import { extractSemanticTags } from "./inputAnalyzer";
import { combinePseudoPrompts } from "./pseudoPromptCombiner";
import { evaluationSimulationSchema } from "./schemas";

export async function simulateEvaluationWithGemini(
  input: EvaluationSimulationInput,
  options?: { projectContextId?: string }
): Promise<{
  output: EvaluationSimulationOutput;
  similarCases: SimulationContextCase[];
  combinedPseudoPrompt: string;
}> {
  const notaMaxima = input.maxScore;
  const semanticText = `${input.activityDescription}\n${input.studentResponse}`;
  const tags = extractSemanticTags(semanticText);

  // Fetch similar cases and artefact-specific model in parallel
  const [similarCases, artefactModel] = await Promise.all([
    searchSimilarCorrectionCases({
      text: semanticText,
      subject: input.subject,
      artefactName: input.artefactName,
      tags,
      limit: 4,
    }),
    input.artefactName
      ? getLatestModelByArtefactName(input.artefactName, options?.projectContextId)
      : Promise.resolve(null),
  ]);

  const combined = combinePseudoPrompts(similarCases);
  const prompt = composeEvaluationSimulationPrompt({
    input,
    contextCases: similarCases,
    combinedPseudoPrompt: combined.texto,
    artefactModel,
    baselineContext: getDefaultAcademicContext(),
  });

  const output = await generateGeminiJson(prompt, evaluationSimulationSchema);

  return {
    output: {
      ...output,
      maxScore: notaMaxima,
      predictedScore: Number(Math.max(0, Math.min(notaMaxima, output.predictedScore)).toFixed(1)),
      confidence: Math.round(output.confidence),
    },
    similarCases,
    combinedPseudoPrompt: combined.texto,
  };
}

export function mapSimilarCase(caseItem: SimulationContextCase): SimilarCaseView {
  return {
    id: caseItem.id,
    activityDescription: caseItem.activityDescription,
    score: caseItem.score,
    maxScore: caseItem.maxScore,
    similarity: caseItem.similarity,
    matchedSignals: caseItem.matchedSignals,
  };
}
