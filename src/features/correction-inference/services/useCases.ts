import "server-only";

import { inferCorrectionWithGemini } from "./correctionInferenceService";
import { saveCorrectionCase } from "./correctionCaseRepository";
import { createCorrectionCaseSchema, type CreateCorrectionCaseInput } from "./validation";

export async function createCorrectionCase(input: CreateCorrectionCaseInput) {
  const parsed = createCorrectionCaseSchema.parse(input);
  const inference = await inferCorrectionWithGemini(parsed);
  return saveCorrectionCase({ input: parsed, inference });
}

