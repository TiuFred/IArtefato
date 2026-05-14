import "server-only";

import { mapSimilarCase, simulateEvaluationWithGemini } from "./evaluationSimulatorService";
import { saveSimulation } from "./simulationRepository";
import { createSimulationSchema, type CreateSimulationInput } from "./validation";

export async function createEvaluationSimulation(
  input: CreateSimulationInput,
  options?: { projectContextId?: string }
) {
  const parsed = createSimulationSchema.parse(input);
  const result = await simulateEvaluationWithGemini(parsed, options);
  const similarCases = result.similarCases.map(mapSimilarCase);

  return saveSimulation({
    input: parsed,
    output: result.output,
    combinedPseudoPrompt: result.combinedPseudoPrompt,
    similarCases,
  });
}

